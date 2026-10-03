// URL Shortener Logic & Interactive Pastel Theme App
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const urlInput = document.getElementById('urlInput');
  const shortenBtn = document.getElementById('shortenBtn');
  const clearBtn = document.getElementById('clearBtn');
  const shortenForm = document.getElementById('shortenForm');
  const loadingBox = document.getElementById('loadingBox');
  const resultBox = document.getElementById('resultBox');
  const shortUrlOutput = document.getElementById('shortUrlOutput');
  const copyBtn = document.getElementById('copyBtn');
  const copyBtnText = document.getElementById('copyBtnText');
  const openShortUrlBtn = document.getElementById('openShortUrlBtn');
  const historySection = document.getElementById('historySection');
  const historyList = document.getElementById('historyList');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');

  // Input Validation & Disabled State Management
  function updateInputState() {
    const val = urlInput.value.trim();
    if (val.length > 0) {
      shortenBtn.disabled = false;
      clearBtn.style.display = 'flex';
    } else {
      shortenBtn.disabled = true;
      clearBtn.style.display = 'none';
    }
  }

  urlInput.addEventListener('input', updateInputState);

  clearBtn.addEventListener('click', () => {
    urlInput.value = '';
    updateInputState();
    urlInput.focus();
    resultBox.style.display = 'none';
  });

  /**
   * Cleans preview prefix/params from short URL to ensure direct redirect URL (https://tinyurl.com/[code])
   */
  function cleanShortUrl(url) {
    if (!url) return '';
    let cleaned = url.trim();

    // 1. Convert preview.tinyurl.com -> tinyurl.com
    cleaned = cleaned.replace(/^https?:\/\/preview\.tinyurl\.com\//i, 'https://tinyurl.com/');

    // 2. Strip any remaining preview. from hostname
    cleaned = cleaned.replace(/(https?:\/\/)preview\./i, '$1');

    // 3. Remove preview option in path or query parameters (e.g., ?preview=1, /preview.php?num=xxx)
    cleaned = cleaned.replace(/[\?&]preview(=[^&]*)?/gi, '');
    if (cleaned.includes('/preview.php')) {
      const match = cleaned.match(/num=([^&]+)/);
      if (match && match[1]) {
        cleaned = `https://tinyurl.com/${match[1]}`;
      }
    }

    // 4. Ensure standard protocol
    if (!/^https?:\/\//i.test(cleaned)) {
      cleaned = 'https://' + cleaned;
    }

    return cleaned;
  }

  /**
   * 입력값 보정 함수:
   * 1. 양 끝 공백 및 괄호 () 자동 제거
   * 2. http:// 또는 https:// 누락 시 자동으로 'https://' 부착
   */
  function formatInputUrl(rawUrl) {
    if (!rawUrl) return '';
    let cleaned = rawUrl.trim().replace(/[\(\)]/g, '');
    if (!/^https?:\/\//i.test(cleaned)) {
      cleaned = 'https://' + cleaned;
    }
    return cleaned;
  }

  /**
   * 서울디지털대학교(https://www.sdu.ac.kr/) 포함 모든 도메인 0초 직행 다이렉트 단축 (7초 프리뷰/광고 대기창 0%)
   * 1차: CleanURI API (https://cleanuri.com/api/v1/shorten) -> 0초 직행 301 다이렉트
   * 2차: spoo.me API (https://spoo.me/) -> 0초 직행 301 다이렉트
   * 3차: AllOrigins CORS 프록시 백업
   */
  async function shortenUrl(rawUrl) {
    const longUrl = formatInputUrl(rawUrl);
    if (!longUrl) throw new Error('유효한 URL을 입력해 주세요.');

    // 1차 시도: CleanURI API (0초 직행 301 다이렉트 단축, 대기창 0%)
    try {
      const res = await fetch('https://cleanuri.com/api/v1/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `url=${encodeURIComponent(longUrl)}`
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.result_url) {
          return { shortUrl: data.result_url.trim(), originalUrl: longUrl };
        }
      }
    } catch (err) {
      console.warn('1차 CleanURI API 호출 실패, 2차 spoo.me 시도...', err);
    }

    // 2차 시도: spoo.me API (0초 직행 301 다이렉트 단축, CORS 지원)
    try {
      const res = await fetch('https://spoo.me/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: `url=${encodeURIComponent(longUrl)}`
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.short_url) {
          return { shortUrl: data.short_url.trim(), originalUrl: longUrl };
        }
      }
    } catch (err) {
      console.warn('2차 spoo.me API 호출 실패, 3차 AllOrigins 시도...', err);
    }

    // 3차 시도: AllOrigins 프록시
    try {
      const tinyTarget = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`;
      const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(tinyTarget)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.contents) {
          const shortUrl = cleanShortUrl(data.contents.trim());
          if (shortUrl && shortUrl.startsWith('http')) {
            return { shortUrl, originalUrl: longUrl };
          }
        }
      }
    } catch (err) {
      console.warn('3차 AllOrigins 호출 실패...', err);
    }

    throw new Error('모든 단축 API 응답 실패');
  }

  // Alias
  const getShortUrl = shortenUrl;

  // Form Submission Handler
  shortenForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const rawUrl = urlInput.value;
    if (!rawUrl || !rawUrl.trim()) return;

    // Show loading: Disable button & change text to "단축 중..."
    shortenBtn.disabled = true;
    shortenBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>단축 중...</span>`;
    resultBox.style.display = 'none';
    loadingBox.style.display = 'flex';

    try {
      const { shortUrl, originalUrl } = await shortenUrl(rawUrl);
      const cleanUrl = cleanShortUrl(shortUrl.trim());

      // Display result
      shortUrlOutput.value = cleanUrl;
      openShortUrlBtn.href = cleanUrl;
      resultBox.style.display = 'block';

      // Save to history
      saveToHistory(originalUrl, cleanUrl);
      renderHistory();
    } catch (error) {
      console.error('URL 단축 오류:', error);
      alert(`URL 단축 생성 실패: ${error.message || '잠시 후 다시 시도해 주세요.'}`);
    } finally {
      // Restore loading state and button text cleanly
      loadingBox.style.display = 'none';
      shortenBtn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> <span>단축하기</span>`;
      shortenBtn.disabled = false;
    }
  });

  // Copy to Clipboard (Requirement: "복사하였습니다" alert notification)
  copyBtn.addEventListener('click', async () => {
    const textToCopy = shortUrlOutput.value;
    if (!textToCopy) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        shortUrlOutput.select();
        document.execCommand('copy');
      }

      // Visual Feedback
      copyBtnText.textContent = '복사 완료!';
      setTimeout(() => {
        copyBtnText.textContent = '복사';
      }, 2000);

      // Alert Notification
      alert('복사하였습니다');

    } catch (err) {
      shortUrlOutput.select();
      document.execCommand('copy');
      alert('복사하였습니다');
    }
  });

  // Local Storage History Management
  const STORAGE_KEY = 'smart_toolbox_short_urls';

  function getHistory() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveToHistory(original, short) {
    let list = getHistory();
    list = list.filter(item => item.short !== short);
    list.unshift({ original, short, date: new Date().toLocaleDateString() });
    if (list.length > 5) list = list.slice(0, 5);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function renderHistory() {
    const list = getHistory();
    if (list.length === 0) {
      historySection.style.display = 'none';
      return;
    }

    historySection.style.display = 'block';
    historyList.innerHTML = list.map((item) => `
      <li class="history-item">
        <div class="history-item-left">
          <a href="${item.short}" target="_blank" class="history-short-url">${item.short}</a>
          <span class="history-long-url" title="${item.original}">${item.original}</span>
        </div>
        <button class="history-item-copy" onclick="copyHistoryUrl('${item.short}')">
          <i class="fa-regular fa-copy"></i> 복사
        </button>
      </li>
    `).join('');
  }

  window.copyHistoryUrl = (shortUrl) => {
    navigator.clipboard.writeText(shortUrl);
    alert('복사하였습니다');
  };

  clearHistoryBtn.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    renderHistory();
  });

  // Initial setup
  renderHistory();
  updateInputState();

  // Dynamic Mouse Aura Effect
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentX = mouseX;
  let currentY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateBg() {
    currentX += (mouseX - currentX) * 0.05;
    currentY += (mouseY - currentY) * 0.05;

    const xPct = (currentX / window.innerWidth) * 100;
    const yPct = (currentY / window.innerHeight) * 100;

    const angle = Math.atan2(currentY - window.innerHeight / 2, currentX - window.innerWidth / 2) * (180 / Math.PI);
    const hue = (xPct + yPct) * 1.8;

    document.documentElement.style.setProperty('--mouse-x-pct', `${xPct.toFixed(2)}%`);
    document.documentElement.style.setProperty('--mouse-y-pct', `${yPct.toFixed(2)}%`);
    document.documentElement.style.setProperty('--mouse-angle', `${angle.toFixed(1)}deg`);
    document.documentElement.style.setProperty('--hue-deg', `${hue.toFixed(1)}deg`);

    requestAnimationFrame(animateBg);
  }

  animateBg();
});
