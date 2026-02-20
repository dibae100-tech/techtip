/* ================================================================
   TTS Test Console - Application Logic
   ================================================================ */

// ── 상태 ──
let currentEngine = 'edge';
let currentAudioBlob = null;
let currentAudioUrl = null;
let isGenerating = false;
let elapsedInterval = null;
let startTimestamp = 0;

// ── 서버 URL ──
function getBaseUrl() {
    const custom = document.getElementById('serverUrl').value.trim();
    if (custom) return custom;
    return window.location.origin;
}

// ================================================================
// 로그
// ================================================================
function log(message, level = 'info') {
    const panel = document.getElementById('logPanel');
    const now = new Date().toLocaleTimeString('ko-KR', { hour12: false });
    panel.innerHTML += `<div class="log-entry"><span class="log-time">${now}</span> <span class="log-level-${level}">[${level.toUpperCase()}]</span> ${message}</div>`;
    panel.scrollTop = panel.scrollHeight;
}

function toggleLog() {
    document.getElementById('logPanel').classList.toggle('hidden');
}

// ================================================================
// ★ 경과 시간 타이머 ★
// ================================================================
function startElapsedTimer() {
    const timer = document.getElementById('elapsedTimer');
    const value = document.getElementById('elapsedValue');

    startTimestamp = performance.now();
    timer.className = 'elapsed-timer active';
    value.textContent = '0.0s';

    // 100ms마다 업데이트
    elapsedInterval = setInterval(() => {
        const elapsed = (performance.now() - startTimestamp) / 1000;
        value.textContent = elapsed.toFixed(1) + 's';
    }, 100);
}

function stopElapsedTimer(finalTime) {
    clearInterval(elapsedInterval);
    elapsedInterval = null;

    const timer = document.getElementById('elapsedTimer');
    const value = document.getElementById('elapsedValue');

    timer.className = 'elapsed-timer done';
    value.textContent = finalTime + 's';

    // 5초 후 숨김
    setTimeout(() => {
        timer.className = 'elapsed-timer';
    }, 8000);
}

function hideElapsedTimer() {
    clearInterval(elapsedInterval);
    elapsedInterval = null;
    document.getElementById('elapsedTimer').className = 'elapsed-timer';
}

// ================================================================
// ★ 결과 배너 업데이트 ★
// ================================================================
function showResultBanner(engineLabel, elapsed, sizeKB, charCount) {
    document.getElementById('resultEngine').textContent = engineLabel;
    document.getElementById('resultTime').textContent = elapsed + 's';
    document.getElementById('resultSize').textContent = sizeKB + 'KB';
    document.getElementById('resultChars').textContent = charCount + '자';
    document.getElementById('resultBanner').classList.add('visible');
}

// ================================================================
// 서버 연결 확인
// ================================================================
async function checkServer() {
    const url = getBaseUrl();
    const dot = document.getElementById('statusDot');
    const text = document.getElementById('statusText');

    dot.className = 'status-dot checking';
    text.textContent = '확인 중...';
    log(`서버 연결 확인: ${url}/health`);

    try {
        const res = await fetch(`${url}/health`, { signal: AbortSignal.timeout(5000) });
        const data = await res.json();

        dot.className = 'status-dot online';
        const qwenStatus = data.qwen_model_loaded ? 'On-Promise ✓' : 'On-Promise ✗';
        text.textContent = `연결됨 (${qwenStatus} | Edge ✓)`;
        log(`서버 연결 성공 - ${qwenStatus}, Device: ${data.device}`, 'info');

        if (!data.qwen_model_loaded) {
            log('⚠ On-Promise 모델 미로드 → Edge-TTS만 사용 가능', 'warn');
        }
    } catch (err) {
        dot.className = 'status-dot offline';
        text.textContent = '연결 실패';
        log(`서버 연결 실패: ${err.message}`, 'error');
    }
}

// ================================================================
// 엔진 선택
// ================================================================
function selectEngine(engine) {
    currentEngine = engine;
    document.querySelectorAll('.engine-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.engine === engine);
    });
    document.getElementById('edgeOptions').classList.toggle('active', engine === 'edge');
    document.getElementById('qwenOptions').classList.toggle('active', engine === 'qwen');
    log(`엔진 변경: ${engine === 'edge' ? 'Edge-TTS (빠름)' : 'OnPromise-TTS (고품질)'}`);
}

// ================================================================
// ★ TTS 생성 (타이머 연동) ★
// ================================================================
async function generateTTS() {
    const text = document.getElementById('inputText').value.trim();
    if (!text) {
        log('텍스트를 입력해주세요.', 'warn');
        return;
    }
    if (isGenerating) return;

    isGenerating = true;
    const btn = document.getElementById('generateBtn');
    const btnIcon = document.getElementById('btnIcon');
    const btnText = document.getElementById('btnText');

    btn.disabled = true;
    btn.classList.add('loading');
    btnIcon.innerHTML = '<span class="spinner"></span>';
    btnText.textContent = '생성 중...';

    // ★ 타이머 시작
    startElapsedTimer();

    const baseUrl = getBaseUrl();
    const requestStart = performance.now();
    let url, bodyData, engineLabel;

    try {
        if (currentEngine === 'edge') {
            const voice = document.getElementById('edgeVoice').value;
            url = `${baseUrl}/tts/edge`;
            bodyData = { text, voice };
            engineLabel = `Edge (${voice})`;
            log(`[Edge-TTS] 요청: voice=${voice}, text="${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
        } else {
            const language = document.getElementById('qwenLanguage').value;
            const speaker = document.getElementById('qwenSpeaker').value;
            url = `${baseUrl}/tts/instant`;
            bodyData = { text, language, speaker };
            engineLabel = `On-Promise (${speaker}/${language})`;
            log(`[On-Promise-TTS] 요청: lang=${language}, speaker=${speaker}, text="${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
        }

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyData)
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
            throw new Error(errData.error || `HTTP ${res.status}`);
        }

        const blob = await res.blob();
        const elapsed = ((performance.now() - requestStart) / 1000).toFixed(2);
        const sizeKB = (blob.size / 1024).toFixed(1);

        // ★ 타이머 완료
        stopElapsedTimer(elapsed);

        // ★ 결과 배너 표시
        showResultBanner(engineLabel, elapsed, sizeKB, text.length);

        log(`✓ 음성 생성 완료: ${sizeKB}KB, ${elapsed}초 (${engineLabel})`, 'info');

        // 오디오 설정
        if (currentAudioUrl) URL.revokeObjectURL(currentAudioUrl);
        currentAudioBlob = blob;
        currentAudioUrl = URL.createObjectURL(blob);

        const player = document.getElementById('audioPlayer');
        player.src = currentAudioUrl;
        document.getElementById('audioMeta').textContent = `${engineLabel} | ${sizeKB}KB | ${elapsed}초 | WAV 16bit 24kHz`;
        document.getElementById('audioSection').classList.add('visible');

        player.play().catch(() => {});

        // 히스토리 추가
        addHistory(text, currentEngine, elapsed, sizeKB, currentAudioUrl, engineLabel);

    } catch (err) {
        // ★ 타이머 에러 시 숨김
        hideElapsedTimer();
        log(`❌ 생성 실패: ${err.message}`, 'error');
    } finally {
        isGenerating = false;
        btn.disabled = false;
        btn.classList.remove('loading');
        btnIcon.textContent = '🔊';
        btnText.textContent = '음성 생성';
    }
}

// ================================================================
// 히스토리
// ================================================================
function addHistory(text, engine, elapsed, size, audioUrl, label) {
    const list = document.getElementById('historyList');
    const div = document.createElement('div');
    div.className = 'history-item';

    const playBtn = document.createElement('button');
    playBtn.className = 'history-play';
    playBtn.textContent = '▶';
    playBtn.addEventListener('click', () => playHistoryAudio(audioUrl));

    const textSpan = document.createElement('span');
    textSpan.className = 'history-text';
    textSpan.title = text;
    textSpan.textContent = text;

    // ★ 엔진 표시명 변경: qwen → On-Premise
    const engineDisplay = engine === 'qwen' ? 'On-Premise' : 'Edge';
    const engineClass = engine === 'qwen' ? 'onpremise' : 'edge';

    const engineSpan = document.createElement('span');
    engineSpan.className = `history-engine ${engineClass}`;
    engineSpan.textContent = engineDisplay;

    const metaSpan = document.createElement('span');
    metaSpan.className = 'history-meta';
    metaSpan.textContent = `${elapsed}s · ${size}KB`;

    div.appendChild(playBtn);
    div.appendChild(textSpan);
    div.appendChild(engineSpan);
    div.appendChild(metaSpan);

    list.insertBefore(div, list.firstChild);
}

function playHistoryAudio(url) {
    const player = document.getElementById('audioPlayer');
    player.src = url;
    player.play().catch(() => {});
    document.getElementById('audioSection').classList.add('visible');
}

// ================================================================
// 오디오 컨트롤
// ================================================================
function toggleMainPlay() {
    const player = document.getElementById('audioPlayer');
    player.paused ? player.play() : player.pause();
}

function replayAudio() {
    const player = document.getElementById('audioPlayer');
    player.currentTime = 0;
    player.play();
}

function downloadAudio() {
    if (!currentAudioBlob) return;
    const a = document.createElement('a');
    a.href = currentAudioUrl;
    a.download = `tts_${currentEngine}_${Date.now()}.wav`;
    a.click();
    log('💾 WAV 파일 다운로드');
}

// ================================================================
// 유틸리티
// ================================================================
function clearInput() {
    document.getElementById('inputText').value = '';
    updateCharCount();
}

function updateCharCount() {
    document.getElementById('charCount').textContent = `${document.getElementById('inputText').value.length}자`;
}

function setPreset(text) {
    document.getElementById('inputText').value = text;
    updateCharCount();
    log(`프리셋 적용: "${text}"`);
}

// ================================================================
// 키보드 단축키
// ================================================================
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        generateTTS();
    }
});

// ================================================================
// 초기화
// ================================================================
log('🚀 TTS 테스트 콘솔 로드 완료');
log('💡 Ctrl + Enter → 빠른 음성 생성');

setTimeout(checkServer, 500);
