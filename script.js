(function() {
  const htmlEl = document.documentElement;
  const bodyEl = document.body;
  const btnEn = document.getElementById('btn-lang-en');
  const btnHe = document.getElementById('btn-lang-he');
  const yearEl = document.getElementById('year');
  const yearHeEl = document.getElementById('year-he');
  const supportWarning = document.getElementById('tts-support-warning');
  const demoVideo = document.getElementById('demoVideo');
  const demoWrap = document.getElementById('demoVideoWrap');
  const btnFs = document.getElementById('btnDemoFullscreen');

  const voiceSelect = null; // API/controls removed
  const rateInput = null;
  const pitchInput = null;
  // Inference/API removed - text is now static

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
    // voices removed - no text input to update
  }

  btnEn.addEventListener('click', () => applyLang('en'));
  btnHe.addEventListener('click', () => applyLang('he'));

  function noop() { /* removed */ }

  // Initialize
  const initial = detectInitialLang();
  applyLang(initial);
  // API/Inference removed

  // Demo fullscreen behavior
  function isFullscreen() { return Boolean(document.fullscreenElement); }
  function updateFsUi() {
    if (!btnFs) return;
    const active = isFullscreen();
    btnFs.textContent = active ? '⤡' : '⤢';
    btnFs.setAttribute('aria-pressed', String(active));
    btnFs.setAttribute('title', active ? 'Exit fullscreen' : 'Enter fullscreen');
  }
  function toggleFullscreen() {
    const container = demoWrap || demoVideo;
    if (!container) return;
    const doc = document;
    if (!isFullscreen()) {
      (container.requestFullscreen && container.requestFullscreen());
    } else {
      (doc.exitFullscreen && doc.exitFullscreen());
    }
  }
  if (btnFs) btnFs.addEventListener('click', toggleFullscreen);
  if (demoVideo) demoVideo.addEventListener('dblclick', toggleFullscreen);
  document.addEventListener('fullscreenchange', updateFsUi);

  // Voice conversion table builder
  async function urlExists(url) {
    try {
      const res = await fetch(url, { method: 'HEAD', cache: 'no-cache' });
      return res.ok;
    } catch (e) {
      return false;
    }
  }

  async function pickFirstExisting(candidates) {
    for (const url of candidates) {
      if (await urlExists(url)) return url;
    }
    return null;
  }

  async function buildVcRows() {
    const body = document.getElementById('vc-body');
    if (!body) return;
    body.innerHTML = '';

    // Static text examples with predefined content
    const examples = [
      {
        en: "ברוכים הבאים. כל מילה שאתם שומעים עכשיו—נוצרה על-ידי מודל שהופך טקסט לדיבור שפיתחתי. לראשונה, דיבור שנשמע באמת אנושי: מנגינה, הדגשות ונשימות—תחושה טבעית לחלוטין. והבשורה הגדולה: אתם קובעים איך זה יישמע. תנו למודל דוגמת קול—והוא ידמה אותה בדיוק מרשים, מהטון העמוק והרציני ועד הקליל והמחויך. אין עוד צורך לבחור קול כללי מתוך ספרייה. מעכשיו זה קול שנתפר בדיוק לעסק, למוצר ולסיפור שלכם. האזנה נעימה—ובואו נגלה יחד מה עוד אפשר ליצור עם הקול החדש שלכם.",
        he: "ברוכים הבאים. כל מילה שאתם שומעים עכשיו—נוצרה על-ידי מודל שהופך טקסט לדיבור שפיתחתי. לראשונה, דיבור שנשמע באמת אנושי: מנגינה, הדגשות ונשימות—תחושה טבעית לחלוטין. והבשורה הגדולה: אתם קובעים איך זה יישמע. תנו למודל דוגמת קול—והוא ידמה אותה בדיוק מרשים, מהטון העמוק והרציני ועד הקליל והמחויך. אין עוד צורך לבחור קול כללי מתוך ספרייה. מעכשיו זה קול שנתפר בדיוק לעסק, למוצר ולסיפור שלכם. האזנה נעימה—ובואו נגלה יחד מה עוד אפשר ליצור עם הקול החדש שלכם."
      },
      {
        en: "The quality of voice synthesis has improved dramatically with deep learning.",
        he: "איכות סינתזת הקול השתפרה באופן דרמטי עם למידה עמוקה."
      },
      {
        en: "Natural language processing enables better understanding of text.",
        he: "עיבוד שפה טבעית מאפשר הבנה טובה יותר של טקסט."
      }
    ];

    // First row: main example with the long Hebrew text (using 1_target and 1_prediction)
    const firstTargetCandidates = [
      'recordings/1_target.mp3',
      'recordings/1_target.wav',
      'recordings/1_target.m4a',
      'recordings/1_target.ogg',
    ];
    const firstPredCandidates = [
      'recordings/1_prediction.mp3',
      'recordings/1_prediction.wav',
      'recordings/1_prediction.m4a',
      'recordings/1_prediction.ogg',
    ];

    const firstTargetUrl = await pickFirstExisting(firstTargetCandidates);
    const firstPredUrl = await pickFirstExisting(firstPredCandidates);
    
    if (firstTargetUrl && firstPredUrl) {
      const freeRow = document.createElement('div');
      freeRow.className = 'vc-row';
      freeRow.innerHTML = `
        <div class="vc-cell">
          <div class="static-text lang-en">${examples[0].en}</div>
          <div class="static-text lang-he" lang="he">${examples[0].he}</div>
        </div>
        <div class="vc-cell"><audio controls><source src="${firstTargetUrl}"></audio></div>
        <div class="vc-cell"><audio controls><source src="${firstPredUrl}"></audio></div>
      `;
      body.appendChild(freeRow);
    }

    // Numbered examples if present (starting from 2 since 1 is used above)
    const maxExamples = 20;
    for (let i = 2; i <= maxExamples; i++) {
      const targetCandidates = [
        `recordings/${i}_target.mp3`,
        `recordings/${i}_target.wav`,
        `recordings/${i}_target.m4a`,
        `recordings/${i}_target.ogg`,
      ];
      const predCandidates = [
        `recordings/${i}_prediction.mp3`,
        `recordings/${i}_prediction.wav`,
        `recordings/${i}_prediction.m4a`,
        `recordings/${i}_prediction.ogg`,
      ];

      const targetUrl = await pickFirstExisting(targetCandidates);
      const predUrl = await pickFirstExisting(predCandidates);
      if (!targetUrl || !predUrl) continue;

      // Use predefined text examples or fallback to generic text
      // Start from index 1 since index 0 is used for the main example above
      const exampleIndex = Math.min(i, examples.length - 1);
      const textContent = (i < examples.length) ? examples[i] : {
        en: `Example ${i}: Demonstrating voice conversion capabilities.`,
        he: `דוגמה ${i}: הדגמת יכולות המרת קול.`
      };

      const row = document.createElement('div');
      row.className = 'vc-row';
      row.innerHTML = `
        <div class="vc-cell">
          <div class="static-text lang-en">${textContent.en}</div>
          <div class="static-text lang-he" lang="he">${textContent.he}</div>
        </div>
        <div class="vc-cell"><audio controls><source src="${targetUrl}"></audio></div>
        <div class="vc-cell"><audio controls><source src="${predUrl}"></audio></div>
      `;
      body.appendChild(row);
    }
  }

  buildVcRows().then(() => updateFsUi());
})();


