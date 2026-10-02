/**
 * QR Craft - Main Application JavaScript (Bright Theme + Dynamic Mouse Cursor Gradient)
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const body = document.body;
  const qrForm = document.getElementById('qrForm');
  const urlInput = document.getElementById('urlInput');
  const clearBtn = document.getElementById('clearBtn');
  const submitBtn = document.getElementById('submitBtn');
  const validationMsg = document.getElementById('validationMsg');
  
  const qrDisplaySection = document.getElementById('qrDisplaySection');
  const qrcodeCanvas = document.getElementById('qrcodeCanvas');
  const qrBox = document.getElementById('qrBox');
  const displayUrlText = document.getElementById('displayUrlText');
  
  const downloadJpgBtn = document.getElementById('downloadJpgBtn');
  const copyImageBtn = document.getElementById('copyImageBtn');
  const openUrlBtn = document.getElementById('openUrlBtn');
  const resetBtn = document.getElementById('resetBtn');
  const tagBtns = document.querySelectorAll('.tag-btn');

  let qrcodeInstance = null;
  let currentRawUrl = '';
  let formattedUrl = '';

  // ==========================================================================
  // Mouse Cursor Gradient Tracking System
  // ==========================================================================
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let targetX = mouseX;
  let targetY = mouseY;

  window.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
  });

  // Smooth lerp animation loop for 60fps cursor gradient reactive physics
  function updateMouseGradients() {
    mouseX += (targetX - mouseX) * 0.08;
    mouseY += (targetY - mouseY) * 0.08;

    const xPct = ((mouseX / window.innerWidth) * 100).toFixed(2);
    const yPct = ((mouseY / window.innerHeight) * 100).toFixed(2);

    // Calculate dynamic hue shift (ranging between ~200deg to ~320deg)
    const hue = (200 + (mouseX / window.innerWidth) * 120).toFixed(1);
    const angle = (100 + (mouseX / window.innerWidth) * 70 + (mouseY / window.innerHeight) * 50).toFixed(1);

    document.documentElement.style.setProperty('--mouse-x-pct', `${xPct}%`);
    document.documentElement.style.setProperty('--mouse-y-pct', `${yPct}%`);
    document.documentElement.style.setProperty('--hue-deg', `${hue}deg`);
    document.documentElement.style.setProperty('--mouse-angle', `${angle}deg`);

    requestAnimationFrame(updateMouseGradients);
  }
  requestAnimationFrame(updateMouseGradients);

  // ==========================================================================
  // 1. Input Event Listeners
  // ==========================================================================
  urlInput.addEventListener('input', () => {
    if (urlInput.value.trim().length > 0) {
      clearBtn.classList.add('visible');
      validationMsg.textContent = '';
    } else {
      clearBtn.classList.remove('visible');
    }
  });

  clearBtn.addEventListener('click', () => {
    urlInput.value = '';
    clearBtn.classList.remove('visible');
    validationMsg.textContent = '';
    urlInput.focus();
  });

  // Quick URL Suggestion Tags
  tagBtns.forEach(tag => {
    tag.addEventListener('click', () => {
      const suggestUrl = tag.getAttribute('data-url');
      urlInput.value = suggestUrl;
      clearBtn.classList.add('visible');
      processUrlAndGenerate(suggestUrl);
    });
  });

  // Form Submit Handler
  qrForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const rawVal = urlInput.value.trim();
    if (!rawVal) {
      showValidation('URL을 입력해주세요.');
      urlInput.focus();
      return;
    }
    processUrlAndGenerate(rawVal);
  });

  // Reset Button (Header)
  resetBtn.addEventListener('click', () => {
    body.classList.remove('state-generated');
    resetBtn.style.display = 'none';
    urlInput.value = '';
    clearBtn.classList.remove('visible');
    validationMsg.textContent = '';
    setTimeout(() => {
      urlInput.focus();
    }, 400);
  });

  // ==========================================================================
  // 2. URL Processing & QR Code Generation
  // ==========================================================================
  function processUrlAndGenerate(inputUrl) {
    currentRawUrl = inputUrl;
    formattedUrl = formatUrl(inputUrl);

    // Clear previous QR code canvas
    qrcodeCanvas.innerHTML = '';

    // Render QR Code using qrcode.js
    try {
      qrcodeInstance = new QRCode(qrcodeCanvas, {
        text: formattedUrl,
        width: 300,
        height: 300,
        colorDark: "#0f172a",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      });

      // Update UI Display Text
      displayUrlText.textContent = formattedUrl;
      openUrlBtn.setAttribute('data-target', formattedUrl);

      // Trigger Layout State Change (URL bar shifts down, QR Code centered)
      body.classList.add('state-generated');
      resetBtn.style.display = 'inline-flex';

      showToast('QR 코드가 정중앙에 생성되었습니다!', 'success');

    } catch (err) {
      console.error('QR Code Generation Error:', err);
      showValidation('QR 코드 생성 중 오류가 발생했습니다.');
    }
  }

  // Format URL helper (Add protocol if missing)
  function formatUrl(url) {
    if (!url) return '';
    if (!/^https?:\/\//i.test(url) && !/^(mailto|tel|ftp):/i.test(url)) {
      return 'https://' + url;
    }
    return url;
  }

  function showValidation(msg) {
    validationMsg.textContent = msg;
  }

  // ==========================================================================
  // 3. QR CODE CLICK -> DOWNLOAD JPG
  // ==========================================================================
  qrBox.addEventListener('click', (e) => {
    e.preventDefault();
    downloadQrAsJpg();
  });

  downloadJpgBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    downloadQrAsJpg();
  });

  // Open URL button
  openUrlBtn.addEventListener('click', () => {
    const target = openUrlBtn.getAttribute('data-target');
    if (target) {
      window.open(target, '_blank', 'noopener,noreferrer');
    }
  });

  // Copy Image button
  copyImageBtn.addEventListener('click', async () => {
    const canvas = getQrCanvasElement();
    if (!canvas) return;

    try {
      const exportCanvas = createExportCanvas(canvas);
      exportCanvas.toBlob(async (blob) => {
        if (!blob) {
          showToast('이미지 복사에 실패했습니다.', 'error');
          return;
        }
        try {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          showToast('클립보드에 QR 코드가 복사되었습니다!', 'success');
        } catch (clipErr) {
          console.warn('Clipboard API error:', clipErr);
          showToast('클립보드 복사를 지원하지 않는 브라우저입니다.', 'error');
        }
      }, 'image/png');
    } catch (err) {
      console.error('Copy error:', err);
    }
  });

  // ==========================================================================
  // 4. JPG High-Resolution Downloader
  // ==========================================================================
  function downloadQrAsJpg() {
    const canvas = getQrCanvasElement();
    if (!canvas) {
      showToast('QR 코드 이미지를 찾을 수 없습니다.', 'error');
      return;
    }

    const exportCanvas = createExportCanvas(canvas, 1000);
    const dataUrl = exportCanvas.toDataURL('image/jpeg', 0.95);

    let domainName = 'qrcode';
    try {
      const parsed = new URL(formattedUrl);
      domainName = parsed.hostname.replace(/[^a-zA-Z0-9]/g, '_');
    } catch (e) {
      domainName = 'qrcode_' + Date.now();
    }
    const filename = `${domainName}.jpg`;

    const downloadLink = document.createElement('a');
    downloadLink.href = dataUrl;
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    showToast(`'${filename}' JPG 파일로 다운로드되었습니다!`, 'success');
  }

  function getQrCanvasElement() {
    return qrcodeCanvas.querySelector('canvas') || qrcodeCanvas.querySelector('img');
  }

  function createExportCanvas(sourceElement, targetSize = 1000) {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = targetSize;
    exportCanvas.height = targetSize;
    const ctx = exportCanvas.getContext('2d');

    // Fill solid white background for clean JPG format
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetSize, targetSize);

    const padding = Math.round(targetSize * 0.08);
    const qrDrawSize = targetSize - (padding * 2);

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(sourceElement, padding, padding, qrDrawSize, qrDrawSize);

    return exportCanvas;
  }

  // ==========================================================================
  // 5. Toast Notification Manager
  // ==========================================================================
  function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const iconClass = type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-triangle-exclamation';
    toast.innerHTML = `
      <i class="${iconClass}"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-out');
      toast.addEventListener('animationend', () => {
        toast.remove();
      });
    }, 3500);
  }

  // Auto-generate QR code if URL parameter is present in Query String
  const urlParams = new URLSearchParams(window.location.search);
  const paramUrl = urlParams.get('url');
  if (paramUrl) {
    urlInput.value = paramUrl;
    clearBtn.classList.add('visible');
    processUrlAndGenerate(paramUrl);
  }
});
