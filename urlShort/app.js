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
   * Reliable URL Shortener API Handler
   * 1. Auto prepends https:// if missing
   * 2. Uses CORS-friendly is.gd API first, falls back to TinyURL
   * 3. Throws explicit errors if API fails without mock 404 URLs
   */
  async function getShortUrl(rawUrl) {
    let formattedUrl = rawUrl.trim();
    
    // Auto prepend https:// if http:// or https:// is missing
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    // Attempt 1: is.gd Free Open API (CORS friendly via Access-Control-Allow-Origin: *)
    try {
      const isGdApi = `https://is.gd/create.php?format=json&url=${encodeURIComponent(formattedUrl)}`;
      const response = await fetch(isGdApi);
      if (response.ok) {
        const data = await response.json();
        if (data.shorturl) {
          return { shortUrl: data.shorturl, originalUrl: formattedUrl };
        } else if (data.errormessage) {
          console.warn('is.gd error:', data.errormessage);
        }
      }
    } catch (err) {
      console.warn('is.gd fetch error, attempting TinyURL fallback...', err);
    }

    // Attempt 2: TinyURL direct endpoint
    try {
      const tinyUrlApi = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(formattedUrl)}`;
      const response = await fetch(tinyUrlApi);
      if (response.ok) {
        const text = await response.text();
        if (text && text.startsWith('http')) {
          return { shortUrl: text.trim(), originalUrl: formattedUrl };
        }
      }
    } catch (err) {
      console.warn('TinyURL fetch error...', err);
    }

    // Fail gracefully with explicit Exception
    throw new Error('모든 단축 URL 생성 API 응답 실패');
  }

  // Form Submission
  shortenForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const rawUrl = urlInput.value.trim();
    if (!rawUrl) return;

    // Show loading: Disable button & change text to "단축 중..."
    shortenBtn.disabled = true;
    shortenBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>단축 중...</span>`;
    resultBox.style.display = 'none';
    loadingBox.style.display = 'flex';

    try {
      const { shortUrl, originalUrl } = await getShortUrl(rawUrl);

      // Display result
      shortUrlOutput.value = shortUrl;
      openShortUrlBtn.href = shortUrl;
      resultBox.style.display = 'block';

      // Save to history
      saveToHistory(originalUrl, shortUrl);
      renderHistory();
    } catch (error) {
      alert('URL 단축 생성에 실패했습니다. 올바른 주소(도메인)인지 확인하거나 잠시 후 다시 시도해 주세요.');
    } finally {
      // Restore loading state and button text
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
