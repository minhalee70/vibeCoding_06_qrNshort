// Smart Toolbox Main Gateway Mouse Aura Effect
document.addEventListener('DOMContentLoaded', () => {
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
