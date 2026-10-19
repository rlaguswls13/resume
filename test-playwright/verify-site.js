// 정적 사이트 회귀 점검: node test-playwright/verify-site.js
// 확인 항목: 3개 뷰 렌더링, 경력 데이터, 기업 맞춤(?company=) 폴백, 블로그 딥링크 형식, 인쇄 레이아웃.
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.jpg': 'image/jpeg',
    '.png': 'image/png',
    '.svg': 'image/svg+xml'
};

function serve() {
    const server = http.createServer((req, res) => {
        const urlPath = decodeURIComponent(req.url.split('?')[0]);
        const file = path.join(ROOT, urlPath === '/' ? 'index.html' : urlPath);
        if (!file.startsWith(ROOT)) {
            res.writeHead(403);
            res.end();
            return;
        }
        fs.readFile(file, (err, body) => {
            if (err) {
                res.writeHead(404);
                res.end('not found');
                return;
            }
            res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
            res.end(body);
        });
    });
    return new Promise((resolve) => server.listen(0, () => resolve(server)));
}

// playwright가 기대하는 브라우저가 없으면 설치된 chromium-* 중 가장 최신을 쓴다.
async function launchBrowser() {
    try {
        return await chromium.launch();
    } catch (err) {
        const base = path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'), 'ms-playwright');
        const dirs = fs.existsSync(base) ? fs.readdirSync(base).filter((d) => /^chromium-\d+$/.test(d)).sort() : [];
        for (const dir of dirs.reverse()) {
            const exe = path.join(base, dir, 'chrome-win64', 'chrome.exe');
            if (fs.existsSync(exe)) {
                return chromium.launch({ executablePath: exe });
            }
        }
        throw err;
    }
}

const results = [];
function check(name, ok, detail) {
    results.push({ name, ok: Boolean(ok), detail });
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
}

async function openPage(browser, url, errors) {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(url, { waitUntil: 'networkidle' });
    return page;
}

(async () => {
    const server = await serve();
    const base = `http://localhost:${server.address().port}`;
    const browser = await launchBrowser();
    const errors = [];

    try {
        const page = await openPage(browser, `${base}/`, errors);

        const profile = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/profile-data.json'), 'utf8'));
        const project = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/project-data.json'), 'utf8'));

        const name = await page.$eval('#profile', (e) => e.textContent);
        check('이력서 뷰: 이름 렌더링', name.includes(profile.profile.name));

        const experience = await page.$$eval('#experience .experience-item', (els) => els.map((e) => e.querySelector('h3').textContent.trim()));
        check('이력서 뷰: 경력 항목 수가 데이터와 일치', experience.length === project.experience.length, `${experience.length}/${project.experience.length}`);
        check('이력서 뷰: 첫 경력이 데이터의 첫 항목', experience[0] === project.experience[0].company, experience[0]);

        const certs = await page.$$eval('#certifications .project-item', (e) => e.length);
        check('이력서 뷰: 자격증 렌더링', certs > 0, String(certs));

        // 3개 뷰 순회
        await page.click('#goNextBtn');
        await page.waitForSelector('#summaryPage.active:not(.animating)');
        const tabs = await page.$$eval('#summaryTabs > *', (e) => e.length);
        check('요약 뷰: 탭 렌더링', tabs === project.summarySections.length, `${tabs}/${project.summarySections.length}`);

        const hrefs = await page.$$eval('#summaryContent .project-report-link', (els) => els.map((a) => ({ href: a.href, target: a.target, rel: a.rel })));
        const expectedLinks = project.summarySections.flatMap((s) => s.links || []);
        check('요약 뷰: 블로그 링크가 데이터와 같은 수이고 모두 새 탭·noopener', hrefs.length === expectedLinks.length && hrefs.every((h) => h.target === '_blank' && /noopener/.test(h.rel)), `${hrefs.length}개`);

        await page.click('#goNextBtn');
        await page.waitForSelector('#domainPage.active:not(.animating)');
        const domain = await page.$eval('#domainContent', (e) => e.textContent.trim().length);
        check('도메인 뷰: 내용 렌더링', domain > 0);

        // 모든 블로그 링크는 blogBaseUrl 기준 절대경로
        const badLinks = project.summarySections.flatMap((s) => s.links || []).filter((l) => !(/^https?:\/\//.test(l.path) || l.path.startsWith('/')));
        check('데이터: 블로그 링크 path 형식', badLinks.length === 0, badLinks.map((l) => l.path).join(','));
        check('데이터: blogBaseUrl 존재', /^https:\/\//.test(project.blogBaseUrl || ''), project.blogBaseUrl);

        // 인쇄 레이아웃
        await page.emulateMedia({ media: 'print' });
        const printState = await page.evaluate(() => {
            const hidden = (sel) => [...document.querySelectorAll(sel)].every((e) => getComputedStyle(e).display === 'none');
            const views = [...document.querySelectorAll('.view-page')].map((e) => getComputedStyle(e).display !== 'none');
            return {
                linksHidden: hidden('.project-report-links'),
                buttonsHidden: hidden('.theme-switcher, .print-btn, .page-nav-btn'),
                allViewsVisible: views.length === 3 && views.every(Boolean)
            };
        });
        check('인쇄: 블로그 링크·웹 전용 버튼 숨김', printState.linksHidden && printState.buttonsHidden);
        check('인쇄: 3개 뷰 모두 출력', printState.allViewsVisible);

        const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });
        const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page(?!s)/g) || []).length;
        const expectedPages = 2 + project.summarySections.length;
        check('인쇄: 이력서 1 + 요약 섹션당 1 + 도메인 1페이지', pages === expectedPages, `${pages}/${expectedPages}페이지 (메모리에서만 생성, 저장 안 함)`);
        await page.close();

        // 기업 맞춤 데이터가 없을 때 기본 이력서로 폴백
        const missing = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
        const missingErrors = [];
        missing.on('pageerror', (e) => missingErrors.push(e.message));
        await missing.goto(`${base}/?company=__no_such_company__`, { waitUntil: 'networkidle' });
        const fallbackItems = await missing.$$eval('#experience .experience-item', (e) => e.length);
        const bannerVisible = await missing.$eval('#companyTailoredBanner', (e) => getComputedStyle(e).display !== 'none');
        check('기업 맞춤 폴백: 없는 회사는 기본 경력 표시', fallbackItems === project.experience.length, `${fallbackItems}`);
        check('기업 맞춤 폴백: 배너 숨김, 스크립트 오류 없음', !bannerVisible && missingErrors.length === 0);
        await missing.close();

        const dataCompanies = fs.existsSync(path.join(ROOT, 'data/companies'))
            ? fs.readdirSync(path.join(ROOT, 'data/companies')).filter((f) => f.endsWith('.json'))
            : [];
        check('배포 경로 data/companies/에 기업 맞춤 JSON이 없음(.gitignore 대상)', dataCompanies.length === 0, dataCompanies.join(','));

        check('페이지 스크립트 오류 없음', errors.length === 0, errors.join(' | '));
    } finally {
        await browser.close();
        server.close();
    }

    const failed = results.filter((r) => !r.ok);
    console.log(`\n${results.length - failed.length}/${results.length} 통과`);
    process.exit(failed.length ? 1 : 0);
})().catch((err) => {
    console.error(err);
    process.exit(2);
});
