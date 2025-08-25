(function() {
  const htmlEl = document.documentElement;
  const bodyEl = document.body;
  const btnEn = document.getElementById('btn-lang-en');
  const btnHe = document.getElementById('btn-lang-he');
  const yearEl = document.getElementById('year');
  const yearHeEl = document.getElementById('year-he');
  const supportWarning = document.getElementById('tts-support-warning');

  const voiceSelect = null; // API/controls removed
  const rateInput = null;
  const pitchInput = null;
  const textInput = document.getElementById('ttsText');
  const btnPlay = null;
  const btnStop = null;
  // Inference/API removed

  const currentYear = new Date().getFullYear();
  if (yearEl) yearEl.textContent = String(currentYear);
  if (yearHeEl) yearHeEl.textContent = String(currentYear);

  // Language handling
  function detectInitialLang() {
    const saved = localStorage.getItem('mamre_lang');
    if (saved === 'he' || saved === 'en') return saved;
    return (navigator.language || '').toLowerCase().startsWith('he') ? 'he' : 'en';
  }

  function applyLang(lang) {
    bodyEl.setAttribute('data-lang', lang);
    htmlEl.setAttribute('lang', lang === 'he' ? 'he' : 'en');
    htmlEl.setAttribute('dir', lang === 'he' ? 'rtl' : 'ltr');
    btnEn.classList.toggle('active', lang === 'en');
    btnEn.setAttribute('aria-pressed', String(lang === 'en'));
    btnHe.classList.toggle('active', lang === 'he');
    btnHe.setAttribute('aria-pressed', String(lang === 'he'));
    localStorage.setItem('mamre_lang', lang);
    setDefaultText(lang);
    preferVoiceForLang(lang);
  }

  btnEn.addEventListener('click', () => applyLang('en'));
  btnHe.addEventListener('click', () => applyLang('he'));

  // No API mode

  function setDefaultText(lang) {
    if (!textInput) return;
    if (textInput.value.trim().length > 0) return; // don't override user text
    if (lang === 'he') {
      textInput.placeholder = 'הקלידו טקסט להשמעה...';
      textInput.value = 'שלום, זהו MamreVoice — דיבור פשוט, ברור ואנושי.';
    } else {
      textInput.placeholder = 'Type text to speak...';
      textInput.value = 'Hello from MamreVoice — making speech simple, clear, and human.';
    }
  }

  function noop() { /* removed */ }

  // Initialize
  const initial = detectInitialLang();
  applyLang(initial);
  // API/Inference removed
})();


