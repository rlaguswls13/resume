// 분리된 JSON 로드 및 렌더링
let resumeData = {};

let summarySections = [];
let domainKnowledge = {};
let refreshDockMode = function() {};

let currentSummaryTab = '1';

function initDockModeDetection() {
    const stageEl = document.querySelector('.page-stage');

    if (!stageEl) {
        return;
    }

    const detectDockMode = function() {
        const activeLayout = document.querySelector('#resumePage.active .container, #summaryPage.active .summary-wrapper, #domainPage.active .domain-wrapper');
        if (!activeLayout) {
            return;
        }

        const layoutRect = activeLayout.getBoundingClientRect();
        const rightGap = window.innerWidth - layoutRect.right;
        const shouldDock = rightGap < 120;

        document.body.classList.toggle('dock-mode', shouldDock);
    };

    refreshDockMode = detectDockMode;

    window.addEventListener('resize', detectDockMode);
    stageEl.addEventListener('scroll', detectDockMode, { passive: true });

    detectDockMode();
    setTimeout(detectDockMode, 250);
}

// 데이터 로드
async function loadData() {
    try {
        const [profileResponse, projectResponse, domainResponse] = await Promise.all([
            fetch('data/profile-data.json'),
            fetch('data/project-data.json'),
            fetch('data/domain-knowledge.json')
        ]);

        const [profileData, projectData, domainData] = await Promise.all([
            profileResponse.json(),
            projectResponse.json(),
            domainResponse.json()
        ]);

        resumeData = {
            ...profileData,
            ...projectData
        };

        summarySections = projectData.summarySections || [];
        domainKnowledge = domainData || {};

        renderContent();
        renderSummaryContent();
        renderDomainContent();
    } catch (error) {
        console.error('데이터 로드 실패:', error);
    }
}

// 프로필 렌더링
function renderProfile() {
    const profileEl = document.getElementById('profile');
    const { profile } = resumeData;
    
    profileEl.innerHTML = `
        <div class="profile-image">
            <img src="${profile.image}" alt="${profile.name} 프로필 사진">
        </div>
        <h1 class="name">${profile.name}</h1>
        <p class="job-title">${profile.jobTitle}</p>
    `;
}

// 연락처 렌더링
function renderContact() {
    const contactEl = document.getElementById('contact');
    const { contact } = resumeData;
    
    const contactHTML = `
        <h3>연락처</h3>
        <ul>
            ${contact.map(item => {
                if (item.isLink) {
                    const target = item.target ? `target="${item.target}"` : '';
                    return `<li><span>${item.icon}</span> <a href="${item.href}" ${target}>${item.value}</a></li>`;
                } else {
                    return `<li><span>${item.icon}</span> <span>${item.value}</span></li>`;
                }
            }).join('')}
        </ul>
    `;
    
    contactEl.innerHTML = contactHTML;
}

// 기술 렌더링
function renderSkills() {
    const skillsEl = document.getElementById('skills');
    const { skills } = resumeData;
    
    const skillsHTML = `
        <h3>기술</h3>
        <div class="skill-categories">
            ${Object.entries(skills).map(([category, tags]) => `
                <div class="skill-category">
                    <h4>${category}</h4>
                    <div class="skill-tags">
                        ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    skillsEl.innerHTML = skillsHTML;
}

// 학력 렌더링
function renderEducation() {
    const educationEl = document.getElementById('education');
    const { education } = resumeData;
    
    const educationHTML = `
        <h3>학력</h3>
        <div class="education-items">
            ${education.map(item => `
                <div class="education-item">
                    <h4>${item.school}</h4>
                    <p class="degree">${item.degree}</p>
                    <p class="year">${item.period}</p>
                </div>
            `).join('')}
        </div>
    `;
    
    educationEl.innerHTML = educationHTML;
}

// 자기소개 렌더링
function renderIntroduction() {
    const introSubtitleEl = document.getElementById('introSubtitle');
    const cardsGridEl = document.getElementById('cardsGrid');
    const { introduction } = resumeData;
    
    introSubtitleEl.textContent = introduction.subtitle;
    
    const cardsHTML = introduction.cards.map(card => `
        <div class="card">
            <span class="card-number">${card.number}</span>
            <h3>${card.title}</h3>
            <p>${card.description}</p>
        </div>
    `).join('');
    
    cardsGridEl.innerHTML = cardsHTML;
}

// 경력 렌더링
function renderExperience() {
    const experienceEl = document.getElementById('experience');
    const { experience } = resumeData;
    
    const experienceHTML = `
        <h2>경력</h2>
        ${experience.map(exp => `
            <div class="experience-item">
                <div class="exp-header">
                    <div>
                        <h3>${exp.company}</h3>
                        <p class="position">${exp.position}</p>
                    </div>
                    <span class="date">${exp.period}</span>
                </div>
                <ul class="responsibilities">
                    ${exp.responsibilities.map(resp => `<li>${resp}</li>`).join('')}
                </ul>
            </div>
        `).join('')}
    `;
    
    experienceEl.innerHTML = experienceHTML;
}

// 자격증 렌더링
function renderCertifications() {
    const certificationsEl = document.getElementById('certifications');
    const { certifications } = resumeData;
    
    const certificationsHTML = `
        <h2>자격증</h2>
        ${certifications.map(cert => `
            <div class="project-item">
                <div class="project-header">
                    <h3>${cert.title}</h3>
                    <span class="date">${cert.date}</span>
                </div>
                <p class="project-description">${cert.description}</p>
                ${cert.details ? `
                    <ul class="project-details">
                        ${cert.details.map(detail => `<li>${detail}</li>`).join('')}
                    </ul>
                ` : ''}
            </div>
        `).join('')}
    `;
    
    certificationsEl.innerHTML = certificationsHTML;
}

// 전체 콘텐츠 렌더링
function renderContent() {
    renderProfile();
    renderContact();
    renderSkills();
    renderEducation();
    renderIntroduction();
    renderExperience();
    renderCertifications();
    
    // 인터랙티브 기능 초기화
    initInteractiveFeatures();
    // Intersection Observer 초기화
    initIntersectionObserver();
}

// Intersection Observer 초기화
function initIntersectionObserver() {
    const options = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeIn 0.6s ease forwards';
                observer.unobserve(entry.target);
            }
        });
    }, options);

    document.querySelectorAll('.experience-item, .project-item').forEach(el => {
        observer.observe(el);
    });
}

// 인터랙티브 기능
function initInteractiveFeatures() {
    // 태그 호버 효과
    const tags = document.querySelectorAll('.tag');
    tags.forEach(tag => {
        tag.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        tag.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // 항목 호버 효과
    const items = document.querySelectorAll('.experience-item, .project-item');
    items.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.background = '#f9f9f9';
            this.style.borderRadius = '8px';
            this.style.padding = '15px';
            this.style.transition = 'all 0.3s ease';
        });
        item.addEventListener('mouseleave', function() {
            this.style.background = 'transparent';
            this.style.padding = '0';
        });
    });
}

// 인쇄 기능
function printResume() {
    // 인쇄 시 페이지 스테이지가 스크롤된 상태로 잘려 출력되는 것을 방지
    const stageEl = document.querySelector('.page-stage');
    if (stageEl) {
        stageEl.scrollTop = 0;
    }
    window.scrollTo(0, 0);
    window.print();
}

// 테마 설정
function setTheme(themeName) {
    const html = document.documentElement;

    if (themeName === 'gold') {
        html.removeAttribute('data-theme');
    } else {
        html.setAttribute('data-theme', themeName);
    }

    localStorage.setItem('theme', themeName);

    // 버튼 active 상태 업데이트
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === themeName);
    });
}

// 저장된 테마 복원
function restoreSavedTheme() {
    const savedTheme = localStorage.getItem('theme') || 'gold';
    setTheme(savedTheme);
}

function renderProjectGrid(section) {
    const highlight = section.highlight || {};

    const renderPoints = function(points) {
        const list = points || [];
        return list.map((point, index) => `
            <li class="${index === list.length - 1 ? 'project-report-item--final' : ''}">
                <span class="project-report-step" aria-hidden="true">${index + 1}</span>
                <span class="project-report-item-content">
                    <span class="project-report-keyword">${point.keyword || ''}</span>
                    <span class="project-report-desc">${point.text || point}</span>
                </span>
            </li>
        `).join('');
    };

    return `
        <section class="project-report">
            <header class="project-report-head">
                <h2>${section.title}</h2>
                ${highlight.value ? `
                    <div class="project-report-highlight">
                        <strong>${highlight.value}</strong>
                        <span>${highlight.label || ''}</span>
                    </div>
                ` : ''}
            </header>

            <div class="project-report-grid">
                <article class="project-report-card project-report-card--problem">
                    <h3>
                        <span class="project-report-badge">!</span>
                        <span class="project-report-card-text">
                            <em>문제 진단</em>
                            ${section.problemTitle || '문제점 / 조건'}
                        </span>
                    </h3>
                    <ul>
                        ${renderPoints(section.problem)}
                    </ul>
                </article>

                <article class="project-report-card project-report-card--solution">
                    <h3>
                        <span class="project-report-badge">⚙</span>
                        <span class="project-report-card-text">
                            <em>해결 전략</em>
                            ${section.solutionTitle || '개선사항 / 해결방법'}
                        </span>
                    </h3>
                    <ul>
                        ${renderPoints(section.solution)}
                    </ul>
                </article>

                <article class="project-report-card project-report-card--result">
                    <h3>
                        <span class="project-report-badge">✓</span>
                        <span class="project-report-card-text">
                            <em>핵심 성과</em>
                            ${section.resultTitle || '결과 / 기타사항'}
                        </span>
                    </h3>
                    <ul>
                        ${renderPoints(section.result)}
                    </ul>
                </article>
            </div>
        </section>
    `;
}

function renderDomainContent() {
    const domainEl = document.getElementById('domainContent');

    if (!domainEl) {
        return;
    }

    if (!domainKnowledge || !domainKnowledge.categories || !domainKnowledge.categories.length) {
        domainEl.innerHTML = '<h2 class="summary-section-title">도메인 데이터 준비 중</h2><p class="summary-description">domain-knowledge.json에 내용을 추가하면 자동 반영됩니다.</p>';
        return;
    }

    const interests = domainKnowledge.interests || {};

    domainEl.innerHTML = `
        <div class="domain-page-panel">
            <div class="domain-header">
                <h2>${domainKnowledge.title || ''} <span>(${domainKnowledge.titleEn || ''})</span></h2>
                <p class="domain-subtitle">${domainKnowledge.subtitle || ''}</p>
            </div>

            <div class="domain-grid">
                ${domainKnowledge.categories.map(category => `
                    <article class="domain-card">
                        <div class="domain-card-head">
                            <span class="domain-icon" aria-hidden="true">${category.icon || ''}</span>
                            <div>
                                <h3>${category.title}</h3>
                                <p class="domain-card-title-en">${category.titleEn || ''}</p>
                            </div>
                        </div>
                        <ul class="domain-item-list">
                            ${(category.items || []).map(item => `<li>${item.kr} <span>(${item.en})</span></li>`).join('')}
                        </ul>
                    </article>
                `).join('')}
            </div>

            ${interests.items && interests.items.length ? `
                <div class="domain-interests">
                    <div class="domain-interests-label">
                        <span class="domain-interests-star" aria-hidden="true">★</span>
                        <div>
                            <strong>${interests.title || ''}</strong>
                            <span>${interests.titleEn || ''}</span>
                        </div>
                    </div>
                    <div class="domain-interests-tags">
                        ${interests.items.map(item => `<span class="domain-interest-tag">${item.kr} <em>(${item.en})</em></span>`).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

function renderSummaryContent() {
    const tabContainer = document.getElementById('summaryTabs');
    const contentContainer = document.getElementById('summaryContent');

    if (!tabContainer || !contentContainer) {
        return;
    }

    if (!summarySections.length) {
        tabContainer.innerHTML = '';
        contentContainer.innerHTML = '<h2 class="summary-section-title">요약 데이터 준비 중</h2><p class="summary-description">project-data.json 또는 domain-knowledge.json에 내용을 추가하면 탭이 자동 반영됩니다.</p>';
        return;
    }

    tabContainer.innerHTML = summarySections.map(section => `
        <button
            type="button"
            class="summary-bookmark ${section.id === currentSummaryTab ? 'active' : ''}"
            data-summary-tab="${section.id}"
            role="tab"
            aria-selected="${section.id === currentSummaryTab}"
        >${section.id}</button>
    `).join('');

    contentContainer.classList.add('summary-panel--report');
    contentContainer.innerHTML = summarySections.map(section => `
        <div
            class="summary-panel-item ${section.id === currentSummaryTab ? 'active' : ''}"
            data-summary-tab="${section.id}"
        >${renderProjectGrid(section)}</div>
    `).join('');

    tabContainer.querySelectorAll('.summary-bookmark').forEach(button => {
        button.addEventListener('click', function() {
            currentSummaryTab = this.dataset.summaryTab;
            renderSummaryContent();
        });
    });
}

function initPageNavigation() {
    const pages = [
        document.getElementById('resumePage'),
        document.getElementById('summaryPage'),
        document.getElementById('domainPage')
    ];
    const goNextBtn = document.getElementById('goNextBtn');
    const goPrevBtn = document.getElementById('goPrevBtn');
    const stageEl = document.querySelector('.page-stage');

    if (pages.some(page => !page) || !goNextBtn || !goPrevBtn) {
        return;
    }

    let currentIndex = 0;
    let isPageAnimating = false;

    const togglePageButtons = function() {
        goPrevBtn.disabled = currentIndex <= 0;
        goNextBtn.disabled = currentIndex >= pages.length - 1;
        refreshDockMode();
    };

    const switchPage = function(fromPage, toPage, direction) {
        if (isPageAnimating) {
            return;
        }

        isPageAnimating = true;

        const outClass = direction === 'next' ? 'slide-out-left' : 'slide-out-right';
        const inClass = direction === 'next' ? 'slide-in-right' : 'slide-in-left';

        fromPage.classList.add('animating', outClass);
        toPage.classList.add('active', 'animating', inClass);

        toPage.addEventListener('animationend', function onAnimationEnd(event) {
            if (event.animationName !== 'slideInFromRight' && event.animationName !== 'slideInFromLeft') {
                return;
            }

            toPage.removeEventListener('animationend', onAnimationEnd);

            fromPage.classList.remove('active', 'animating', outClass);
            toPage.classList.remove('animating', inClass);
            isPageAnimating = false;
            refreshDockMode();
        });
    };

    const goToIndex = function(nextIndex, direction) {
        if (isPageAnimating || nextIndex < 0 || nextIndex >= pages.length || nextIndex === currentIndex) {
            return;
        }

        switchPage(pages[currentIndex], pages[nextIndex], direction);
        currentIndex = nextIndex;
        togglePageButtons();

        if (stageEl) {
            stageEl.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    goNextBtn.addEventListener('click', function() {
        if (goNextBtn.disabled) {
            return;
        }

        goToIndex(currentIndex + 1, 'next');
    });

    goPrevBtn.addEventListener('click', function() {
        if (goPrevBtn.disabled) {
            return;
        }

        goToIndex(currentIndex - 1, 'prev');
    });

    togglePageButtons();
}

// 경력 항목 추가
function addExperienceItem(company, position, period, responsibilities) {
    resumeData.experience.push({
        company,
        position,
        period,
        responsibilities
    });
    renderExperience();
}

// 자격증 항목 추가
function addCertificationItem(title, date, description, details = []) {
    resumeData.certifications.push({
        title,
        date,
        description,
        details
    });
    renderCertifications();
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    restoreSavedTheme();
    initDockModeDetection();
    loadData();
    initPageNavigation();
});

console.log('Portfolio Resume 페이지가 로드되었습니다.');
console.log('사용 가능한 함수:');
console.log('- printResume(): 이력서 인쇄');
console.log('- setTheme(themeName): 테마 전환');
console.log('- addExperienceItem(company, position, period, responsibilities)');
console.log('- addCertificationItem(title, date, description, details)');

