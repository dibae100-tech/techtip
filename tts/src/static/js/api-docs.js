/* ================================================================
   TTS Test Console - API Docs Page Logic
   ================================================================ */

// ================================================================
// 사이드 네비게이션 스크롤
// ================================================================
function scrollToSection(event, id) {
    event.preventDefault();
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });

    // 활성 링크 변경
    document.querySelectorAll('.docs-nav-link').forEach(function (link) {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
}

// ================================================================
// 스크롤 시 활성 링크 자동 변경
// ================================================================
function initScrollSpy() {
    var docsContent = document.querySelector('.docs-content');
    var sections = document.querySelectorAll('.docs-section');
    var navLinks = document.querySelectorAll('.docs-nav-link');

    if (!docsContent) return;

    docsContent.addEventListener('scroll', function () {
        var current = '';

        sections.forEach(function (section) {
            var rect = section.getBoundingClientRect();
            if (rect.top <= 150) {
                current = section.id;
            }
        });

        navLinks.forEach(function (link) {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });
}

// ================================================================
// 코드 블록 복사 기능
// ================================================================
function initCodeCopy() {
    var codeBlocks = document.querySelectorAll('.docs-code-block');

    codeBlocks.forEach(function (block) {
        var header = block.querySelector('.docs-code-header');
        var code = block.querySelector('.docs-code');

        if (!header || !code) return;

        // 복사 버튼 생성
        var copyBtn = document.createElement('button');
        copyBtn.className = 'code-copy-btn';
        copyBtn.textContent = '복사';
        copyBtn.addEventListener('click', function () {
            var text = code.textContent;
            navigator.clipboard.writeText(text).then(function () {
                copyBtn.textContent = '✓ 복사됨';
                copyBtn.classList.add('copied');
                setTimeout(function () {
                    copyBtn.textContent = '복사';
                    copyBtn.classList.remove('copied');
                }, 2000);
            });
        });

        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.appendChild(copyBtn);
    });
}

// ================================================================
// 서버 상태 확인
// ================================================================
async function checkHealth() {
    var dot = document.getElementById('statusDot');
    var text = document.getElementById('statusText');

    if (!dot || !text) return;

    try {
        var res = await fetch('/health', { signal: AbortSignal.timeout(3000) });
        var data = await res.json();
        dot.className = 'status-dot online';
        var qwenStatus = data.qwen_model_loaded ? 'Qwen ✓' : 'Qwen ✗';
        text.textContent = '연결됨 (' + qwenStatus + ' | Edge ✓)';
    } catch (err) {
        dot.className = 'status-dot offline';
        text.textContent = '연결 실패';
    }
}

// ================================================================
// 초기화
// ================================================================
document.addEventListener('DOMContentLoaded', function () {
    initScrollSpy();
    initCodeCopy();
    setTimeout(checkHealth, 300);
});
