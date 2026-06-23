// data.json 로드 및 렌더링
let resumeData = {};

// 데이터 로드
async function loadData() {
    try {
        const response = await fetch('data.json');
        resumeData = await response.json();
        renderContent();
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
    loadData();
});

console.log('Portfolio Resume 페이지가 로드되었습니다.');
console.log('사용 가능한 함수:');
console.log('- printResume(): 이력서 인쇄');
console.log('- toggleTheme(): 테마 전환');
console.log('- addExperienceItem(company, position, period, responsibilities)');
console.log('- addCertificationItem(title, date, description, details)');

