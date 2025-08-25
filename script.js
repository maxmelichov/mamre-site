(function() {
  const htmlEl = document.documentElement;
  const bodyEl = document.body;
  const btnEn = document.getElementById('btn-lang-en');
  const btnHe = document.getElementById('btn-lang-he');
  const yearEl = document.getElementById('year');
  const yearHeEl = document.getElementById('year-he');
  const supportWarning = document.getElementById('tts-support-warning');

  const voiceSelect = document.getElementById('voiceSelect');
  const rateInput = document.getElementById('rate');
  const pitchInput = document.getElementById('pitch');
  const textInput = document.getElementById('ttsText');
  const btnPlay = document.getElementById('btnPlay');
  const btnStop = document.getElementById('btnStop');
  const apiAudio = document.getElementById('apiAudio');
  const apiStatus = document.getElementById('apiStatus');
  const modeRadios = Array.from(document.querySelectorAll('input[name="synthMode"]'));

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

  // Config & mode
  let appConfig = null;
  let currentMode = 'browser'; // 'browser' | 'api'

  async function loadConfig() {
    try {
      const res = await fetch('config.json', { cache: 'no-store' });
      if (!res.ok) return;
      appConfig = await res.json();
      setApiStatus('Config loaded');
    } catch (_) {
      // No config is fine; UI will still work in browser mode
    }
  }

  function setApiStatus(message, isError = false) {
    if (!apiStatus) return;
    apiStatus.textContent = message || '';
    apiStatus.style.color = isError ? '#ff9aa2' : '';
  }

  function applyMode(mode) {
    currentMode = mode;
    const isBrowser = mode === 'browser';
    [voiceSelect, rateInput, pitchInput].forEach(el => { if (el) el.disabled = !isBrowser; });
    if (apiAudio) {
      apiAudio.style.display = mode === 'api' ? 'block' : 'none';
      if (mode === 'browser') { apiAudio.pause(); apiAudio.removeAttribute('src'); apiAudio.load(); }
    }
    if (mode === 'api') setApiStatus('API mode — configure config.json'); else setApiStatus('');
  }

  modeRadios.forEach(r => r.addEventListener('change', (e) => {
    const value = e.target.value;
    applyMode(value);
  }));

  // TTS logic
  let voices = [];
  let utterance = null;

  const supportsSpeech = typeof window.speechSynthesis !== 'undefined' && typeof window.SpeechSynthesisUtterance !== 'undefined';
  if (!supportsSpeech) {
    supportWarning?.classList.remove('hidden');
  }

  function loadVoices() {
    if (!supportsSpeech) return;
    voices = window.speechSynthesis.getVoices();
    populateVoiceSelect();
    const lang = bodyEl.getAttribute('data-lang') || 'en';
    preferVoiceForLang(lang);
  }

  function populateVoiceSelect() {
    if (!voiceSelect) return;
    const previouslySelected = voiceSelect.value;
    voiceSelect.innerHTML = '';
    voices
      .filter((v, idx, arr) => arr.findIndex(x => x.name === v.name && x.lang === v.lang) === idx)
      .sort((a, b) => (a.lang || '').localeCompare(b.lang || '') || a.name.localeCompare(b.name))
      .forEach(v => {
        const opt = document.createElement('option');
        opt.value = `${v.name}__${v.lang}`;
        opt.textContent = `${v.name} — ${v.lang}${v.default ? ' (default)' : ''}`;
        voiceSelect.appendChild(opt);
      });
    if (previouslySelected) {
      const exists = Array.from(voiceSelect.options).some(o => o.value === previouslySelected);
      if (exists) voiceSelect.value = previouslySelected;
    }
  }

  function findVoiceByValue(value) {
    const [name, lang] = String(value).split('__');
    return voices.find(v => v.name === name && v.lang === lang) || null;
  }

  function preferVoiceForLang(lang) {
    if (!supportsSpeech) return;
    const preferred = voices.find(v => (lang === 'he' ? v.lang.toLowerCase().startsWith('he') : v.lang.toLowerCase().startsWith('en')));
    if (preferred && voiceSelect) {
      voiceSelect.value = `${preferred.name}__${preferred.lang}`;
    }
  }

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

  async function play() {
    const text = (textInput?.value || '').trim();
    if (!text) return;
    if (currentMode === 'api') {
      await playViaApi(text);
      return;
    }
    if (!supportsSpeech) return;
    window.speechSynthesis.cancel();
    utterance = new SpeechSynthesisUtterance(text);
    const selected = findVoiceByValue(voiceSelect?.value);
    if (selected) {
      utterance.voice = selected;
      utterance.lang = selected.lang;
    } else {
      utterance.lang = (bodyEl.getAttribute('data-lang') || 'en');
    }
    utterance.rate = parseFloat(rateInput?.value || '1');
    utterance.pitch = parseFloat(pitchInput?.value || '1');
    window.speechSynthesis.speak(utterance);
  }

  function stop() {
    if (!supportsSpeech) return;
    window.speechSynthesis.cancel();
    utterance = null;
  }

  btnPlay?.addEventListener('click', play);
  btnStop?.addEventListener('click', stop);

  if (supportsSpeech) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
    // Some browsers need an initial call to populate voices
    setTimeout(loadVoices, 50);
  }

  // Initialize
  const initial = detectInitialLang();
  applyLang(initial);
  applyMode('browser');
  loadConfig();

  // API synthesis
  async function playViaApi(text) {
    if (!appConfig || !appConfig.api || !appConfig.api.baseUrl) {
      setApiStatus('Missing config.json or api.baseUrl', true);
      return;
    }
    try {
      setApiStatus('Requesting audio...');
      const url = new URL((appConfig.api.ttsPath || '/v1/tts'), appConfig.api.baseUrl).toString();
      const headers = { 'Content-Type': 'application/json' };
      if (appConfig.api.authHeader && appConfig.api.authToken) {
        headers[appConfig.api.authHeader] = appConfig.api.authToken;
      }
      const body = {
        text,
        voice: voiceSelect?.value || null,
        rate: parseFloat(rateInput?.value || '1'),
        pitch: parseFloat(pitchInput?.value || '1'),
        lang: bodyEl.getAttribute('data-lang') || 'en'
      };
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const maybeText = await res.text().catch(() => '');
        throw new Error(`API error ${res.status}: ${maybeText.slice(0,200)}`);
      }
      const ct = res.headers.get('Content-Type') || '';
      if (ct.startsWith('audio/')) {
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        apiAudio.src = objectUrl;
        await apiAudio.play();
        setApiStatus('');
        return;
      }
      if (ct.includes('application/json')) {
        const data = await res.json();
        if (data.audioUrl) {
          apiAudio.src = data.audioUrl;
          await apiAudio.play();
          setApiStatus('');
          return;
        }
        throw new Error('JSON response missing audioUrl');
      }
      throw new Error(`Unexpected content type: ${ct}`);
    } catch (err) {
      setApiStatus(err.message || String(err), true);
    }
  }
})();


