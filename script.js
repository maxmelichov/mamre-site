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

  // Demo fullscreen behavior with iOS support
  function isFullscreen() { return Boolean(document.fullscreenElement || document.webkitFullscreenElement); }
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
      // Try different fullscreen methods for better browser support
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      } else if (container.mozRequestFullScreen) {
        container.mozRequestFullScreen();
      } else if (container.msRequestFullscreen) {
        container.msRequestFullscreen();
      }
    } else {
      if (doc.exitFullscreen) {
        doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
    }
  }
  if (btnFs) btnFs.addEventListener('click', toggleFullscreen);
  if (demoVideo) {
    // Prevent double-tap zoom on iOS
    let lastTouchEnd = 0;
    demoVideo.addEventListener('touchend', function (event) {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
        toggleFullscreen();
      }
      lastTouchEnd = now;
    }, false);
  }
  document.addEventListener('fullscreenchange', updateFsUi);
  document.addEventListener('webkitfullscreenchange', updateFsUi);

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
        en: "ברוכים הבאים. כל מילה שאתם שומעים עכשיו נוצרה על-ידי מודל קול שפיתחתי שהופך טקסט לדיבור. לראשונה, דיבור שנשמע באמת אנושי: מהנגינה, ההדגשות ונשימות תחושה טבעית לחלוטין. והבשורה הגדולה היא שאתם קובעים איך זה יישמע. תנו למודל דוגמת קול קצרה של מספר שניות והוא ידמה אותה בצורה בדיוקת ומרשימה, מהטון העמוק והרציני ועד הקליל והמחויך. אין עוד צורך לבחור קול כללי מתוך סיפרייה. מעכשיו זה קול שנתפר בדיוק לעסק, למוצר ולסיפור שלכם. האזנה נעימה ובואו נגלה יחד מה עוד אפשר ליצור עם הקול החדש שלכם.",
        he: "ברוכים הבאים. כל מילה שאתם שומעים עכשיו נוצרה על-ידי מודל קול שפיתחתי שהופך טקסט לדיבור. לראשונה, דיבור שנשמע באמת אנושי: מהנגינה, ההדגשות ונשימות תחושה טבעית לחלוטין. והבשורה הגדולה היא שאתם קובעים איך זה יישמע. תנו למודל דוגמת קול קצרה של מספר שניות והוא ידמה אותה בצורה בדיוקת ומרשימה, מהטון העמוק והרציני ועד הקליל והמחויך. אין עוד צורך לבחור קול כללי מתוך סיפרייה. מעכשיו זה קול שנתפר בדיוק לעסק, למוצר ולסיפור שלכם. האזנה נעימה ובואו נגלה יחד מה עוד אפשר ליצור עם הקול החדש שלכם."
      },
      {
        en: "!אם אתם או אתן שואלים או שואלות אם המודל עובד עבור קולות של נשים, אז התשובה היא כן",
        he: "!אם אתם או אתן שואלים או שואלות אם המודל עובד עבור קולות של נשים, אז התשובה היא כן",
      },
      {
        en: "ʔomʁˈim ʃeʃo'wa'ʁma bebeʔˈeʁ ʃˈeva haχˈi teʔimˈa, mˈa hasˈod ʃelaχˈem",
        he: "ʔomʁˈim ʃeʃo'wa'ʁma bebeʔˈeʁ ʃˈeva haχˈi teʔimˈa, mˈa hasˈod ʃelaχˈem"
      },
      {
        en: "jeʁuʃalˈajim hˈi ʔˈiʁ ʔatikˈa vaχaʃuvˈa bimjuχˈad, ʃemeχilˈa betoχˈa ʃχavˈot ʁabˈot ʃˈel histˈoʁja, taʁbˈut veʁuχanijˈut ʃenimʃaχˈot ʔalfˈej ʃanˈim, vehˈi mehavˈa mokˈed meʁkazˈi liʃlˈoʃet hadatˈot haɡdolˈot, jahadˈut, natsʁˈut veʔislˈam. ʃemitχabʁˈot jˈaχad bemakˈom ʔeχˈad jiχudˈi, malˈe ʔenˈeʁɡija umuʁkavˈut, ʃˈam ʔefʃˈaʁ limtsˈo ʔataʁˈim kdoʃˈim, ʃχunˈot ʔatikˈot, veʃvakˈim tsivʔonijˈim, vekˈol pinˈa mesapˈeʁet sipˈuʁ ʃˈel tkufˈot ʃonˈot, ʔanaʃˈim ʃonˈim veʔejʁuʔˈim ʃehiʃpˈiʔu ʔˈal hahistˈoʁja ʃˈel haʔolˈam kulˈo, mˈa ʃehofˈeχ ʔet jeʁuʃalˈajim lˈo ʁˈak leʔˈiʁ ɡeʔoɡʁˈafit ʔˈela ɡˈam lemeʁkˈaz ʃˈel zehˈut, ʔemunˈa vezikaʁˈon kolektˈivi ʃemamʃˈiχ leʔoʁˈeʁ haʃʁaʔˈa ulχabˈeʁ bˈen ʔanaʃˈim meʁˈeka ʃonˈe mikˈol kitsvˈot tevˈel. namʃˈiχ lehakʁˈi ʔˈet hatˈekst lidvaʁˈim ktsˈat jotˈeʁ muʁkavˈim. lemaʃˈal tsfaʁdea ʃets'afa baemajˈim ʔoχˈelet tˈeʁed bizmˈan ʃehˈu tsafˈa besˈeʁet tˈov. ʔimˈa ʃelˈo ʔamʁˈa bˈo teʁˈed lehavˈi χatˈif tʃitˈus mahˈeʁ kˈi ʔaχotˈo ʁˈatsa meʔˈod mahˈeʁ",
        he: "jeʁuʃalˈajim hˈi ʔˈiʁ ʔatikˈa vaχaʃuvˈa bimjuχˈad, ʃemeχilˈa betoχˈa ʃχavˈot ʁabˈot ʃˈel histˈoʁja, taʁbˈut veʁuχanijˈut ʃenimʃaχˈot ʔalfˈej ʃanˈim, vehˈi mehavˈa mokˈed meʁkazˈi liʃlˈoʃet hadatˈot haɡdolˈot, jahadˈut, natsʁˈut veʔislˈam. ʃemitχabʁˈot jˈaχad bemakˈom ʔeχˈad jiχudˈi, malˈe ʔenˈeʁɡija umuʁkavˈut, ʃˈam ʔefʃˈaʁ limtsˈo ʔataʁˈim kdoʃˈim, ʃχunˈot ʔatikˈot, veʃvakˈim tsivʔonijˈim, vekˈol pinˈa mesapˈeʁet sipˈuʁ ʃˈel tkufˈot ʃonˈot, ʔanaʃˈim ʃonˈim veʔejʁuʔˈim ʃehiʃpˈiʔu ʔˈal hahistˈoʁja ʃˈel haʔolˈam kulˈo, mˈa ʃehofˈeχ ʔet jeʁuʃalˈajim lˈo ʁˈak leʔˈiʁ ɡeʔoɡʁˈafit ʔˈela ɡˈam lemeʁkˈaz ʃˈel zehˈut, ʔemunˈa vezikaʁˈon kolektˈivi ʃemamʃˈiχ leʔoʁˈeʁ haʃʁaʔˈa ulχabˈeʁ bˈen ʔanaʃˈim meʁˈeka ʃonˈe mikˈol kitsvˈot tevˈel. namʃˈiχ lehakʁˈi ʔˈet hatˈekst lidvaʁˈim ktsˈat jotˈeʁ muʁkavˈim. lemaʃˈal tsfaʁdea ʃets'afa baemajˈim ʔoχˈelet tˈeʁed bizmˈan ʃehˈu tsafˈa besˈeʁet tˈov. ʔimˈa ʃelˈo ʔamʁˈa bˈo teʁˈed lehavˈi χatˈif tʃitˈus mahˈeʁ kˈi ʔaχotˈo ʁˈatsa meʔˈod mahˈeʁ",
      },
      {
        en: "jeʁuʃalˈajim hˈi ʔˈiʁ ʔatikˈa vaχaʃuvˈa bimjuχˈad, ʃemeχilˈa betoχˈa ʃχavˈot ʁabˈot ʃˈel histˈoʁja, taʁbˈut veʁuχanijˈut ʃenimʃaχˈot ʔalfˈej ʃanˈim, vehˈi mehavˈa mokˈed meʁkazˈi liʃlˈoʃet hadatˈot haɡdolˈot, jahadˈut, natsʁˈut veʔislˈam. ʃemitχabʁˈot jˈaχad bemakˈom ʔeχˈad jiχudˈi, malˈe ʔenˈeʁɡija umuʁkavˈut, ʃˈam ʔefʃˈaʁ limtsˈo ʔataʁˈim kdoʃˈim, ʃχunˈot ʔatikˈot, veʃvakˈim tsivʔonijˈim, vekˈol pinˈa mesapˈeʁet sipˈuʁ ʃˈel tkufˈot ʃonˈot, ʔanaʃˈim ʃonˈim veʔejʁuʔˈim ʃehiʃpˈiʔu ʔˈal hahistˈoʁja ʃˈel haʔolˈam kulˈo, mˈa ʃehofˈeχ ʔet jeʁuʃalˈajim lˈo ʁˈak leʔˈiʁ ɡeʔoɡʁˈafit ʔˈela ɡˈam lemeʁkˈaz ʃˈel zehˈut, ʔemunˈa vezikaʁˈon kolektˈivi ʃemamʃˈiχ leʔoʁˈeʁ haʃʁaʔˈa ulχabˈeʁ bˈen ʔanaʃˈim meʁˈeka ʃonˈe mikˈol kitsvˈot tevˈel. namʃˈiχ lehakʁˈi ʔˈet hatˈekst lidvaʁˈim ktsˈat jotˈeʁ muʁkavˈim. lemaʃˈal tsfaʁdea ʃets'afa baemajˈim ʔoχˈelet tˈeʁed bizmˈan ʃehˈu tsafˈa besˈeʁet tˈov. ʔimˈa ʃelˈo ʔamʁˈa bˈo teʁˈed lehavˈi χatˈif tʃitˈus mahˈeʁ kˈi ʔaχotˈo ʁˈatsa meʔˈod mahˈeʁ",
        he: "jeʁuʃalˈajim hˈi ʔˈiʁ ʔatikˈa vaχaʃuvˈa bimjuχˈad, ʃemeχilˈa betoχˈa ʃχavˈot ʁabˈot ʃˈel histˈoʁja, taʁbˈut veʁuχanijˈut ʃenimʃaχˈot ʔalfˈej ʃanˈim, vehˈi mehavˈa mokˈed meʁkazˈi liʃlˈoʃet hadatˈot haɡdolˈot, jahadˈut, natsʁˈut veʔislˈam. ʃemitχabʁˈot jˈaχad bemakˈom ʔeχˈad jiχudˈi, malˈe ʔenˈeʁɡija umuʁkavˈut, ʃˈam ʔefʃˈaʁ limtsˈo ʔataʁˈim kdoʃˈim, ʃχunˈot ʔatikˈot, veʃvakˈim tsivʔonijˈim, vekˈol pinˈa mesapˈeʁet sipˈuʁ ʃˈel tkufˈot ʃonˈot, ʔanaʃˈim ʃonˈim veʔejʁuʔˈim ʃehiʃpˈiʔu ʔˈal hahistˈoʁja ʃˈel haʔolˈam kulˈo, mˈa ʃehofˈeχ ʔet jeʁuʃalˈajim lˈo ʁˈak leʔˈiʁ ɡeʔoɡʁˈafit ʔˈela ɡˈam lemeʁkˈaz ʃˈel zehˈut, ʔemunˈa vezikaʁˈon kolektˈivi ʃemamʃˈiχ leʔoʁˈeʁ haʃʁaʔˈa ulχabˈeʁ bˈen ʔanaʃˈim meʁˈeka ʃonˈe mikˈol kitsvˈot tevˈel. namʃˈiχ lehakʁˈi ʔˈet hatˈekst lidvaʁˈim ktsˈat jotˈeʁ muʁkavˈim. lemaʃˈal tsfaʁdea ʃets'afa baemajˈim ʔoχˈelet tˈeʁed bizmˈan ʃehˈu tsafˈa besˈeʁet tˈov. ʔimˈa ʃelˈo ʔamʁˈa bˈo teʁˈed lehavˈi χatˈif tʃitˈus mahˈeʁ kˈi ʔaχotˈo ʁˈatsa meʔˈod mahˈeʁ",
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
    
    // Debug: log what files were found
    console.log('First target URL:', firstTargetUrl);
    console.log('First pred URL:', firstPredUrl);
    
    if (firstTargetUrl && firstPredUrl) {
      const freeRow = document.createElement('div');
      freeRow.className = 'vc-row';
      freeRow.innerHTML = `
        <div class="vc-cell">
          <div class="static-text lang-en">${examples[0].en}</div>
          <div class="static-text lang-he" lang="he">${examples[0].he}</div>
        </div>
        <div class="vc-cell"><audio controls preload="none" controlslist="nodownload"><source src="${firstTargetUrl}"></audio></div>
        <div class="vc-cell"><audio controls preload="none" controlslist="nodownload"><source src="${firstPredUrl}"></audio></div>
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
      
      // Debug: log what files were found for each example
      console.log(`Example ${i} - Target URL:`, targetUrl, 'Pred URL:', predUrl);
      
      if (!targetUrl || !predUrl) continue;

      // Use predefined text examples or fallback to generic text
      // Start from index 1 since index 0 is used for the main example above
      const exampleIndex = i - 1; // Map i=2 to examples[1], i=3 to examples[2], etc.
      const textContent = (exampleIndex < examples.length) ? examples[exampleIndex] : {
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
        <div class="vc-cell"><audio controls preload="none" controlslist="nodownload"><source src="${targetUrl}"></audio></div>
        <div class="vc-cell"><audio controls preload="none" controlslist="nodownload"><source src="${predUrl}"></audio></div>
      `;
      body.appendChild(row);
    }
  }

  // Mobile performance optimizations
  function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  // Optimize for mobile
  if (isMobile()) {
    // Reduce animation complexity on mobile
    document.documentElement.style.setProperty('--animation-reduce', '1');
    
    // Add passive event listeners for better scrolling performance
    document.addEventListener('touchstart', function() {}, { passive: true });
    document.addEventListener('touchmove', function() {}, { passive: true });
    
    // Improve audio initialization for iOS
    const iosAudioInit = () => {
      // Create silent audio context to unlock audio on iOS
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      gainNode.gain.value = 0;
      oscillator.start();
      oscillator.stop();
      
      // Remove listener after first touch
      document.removeEventListener('touchstart', iosAudioInit);
    };
    
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      document.addEventListener('touchstart', iosAudioInit, { once: true });
    }
  }

  // Enhanced UX features
  function addAudioPlayIndicators() {
    document.querySelectorAll('audio').forEach(audio => {
      const container = audio.parentElement;
      
      // Add playing indicator
      const indicator = document.createElement('div');
      indicator.className = 'audio-indicator';
      indicator.innerHTML = '🔊';
      indicator.style.cssText = `
        position: absolute;
        top: 8px;
        right: 8px;
        background: var(--brand);
        color: #041520;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: none;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        z-index: 1;
      `;
      
      // Make container relative if not already
      if (getComputedStyle(container).position === 'static') {
        container.style.position = 'relative';
      }
      
      container.appendChild(indicator);
      
      // Add event listeners
      audio.addEventListener('play', () => {
        // Hide all other indicators
        document.querySelectorAll('.audio-indicator').forEach(ind => {
          if (ind !== indicator) ind.style.display = 'none';
        });
        indicator.style.display = 'flex';
      });
      
      audio.addEventListener('pause', () => {
        indicator.style.display = 'none';
      });
      
      audio.addEventListener('ended', () => {
        indicator.style.display = 'none';
      });
    });
  }

  // Smooth scroll to sections with offset for header
  function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          const headerOffset = 80;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  // Intersection Observer for scroll animations
  function initScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    // Observe elements that should animate on scroll
    document.querySelectorAll('.phonikud-example, .vc-row:not(.vc-header)').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });
  }

  // Audio loading optimization
  function optimizeAudioLoading() {
    const audioElements = document.querySelectorAll('audio');
    
    // Use Intersection Observer to load audio when it's near viewport
    const audioObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const audio = entry.target;
          if (!audio.hasAttribute('data-loaded')) {
            audio.load();
            audio.setAttribute('data-loaded', 'true');
          }
        }
      });
    }, { rootMargin: '100px' });

    audioElements.forEach(audio => audioObserver.observe(audio));
  }

  // Keyboard navigation improvements
  function improveKeyboardNav() {
    // Add keyboard support for language buttons
    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.key === 'l') {
        e.preventDefault();
        const currentLang = bodyEl.getAttribute('data-lang');
        const newLang = currentLang === 'en' ? 'he' : 'en';
        applyLang(newLang);
      }
    });

    // Add focus indicators for audio elements
    document.querySelectorAll('audio').forEach(audio => {
      audio.addEventListener('focus', () => {
        audio.style.outline = '2px solid var(--brand)';
        audio.style.outlineOffset = '2px';
      });
      
      audio.addEventListener('blur', () => {
        audio.style.outline = 'none';
      });
    });
  }

  // Add loading states for better UX
  function addLoadingStates() {
    document.querySelectorAll('audio').forEach(audio => {
      const container = audio.parentElement;
      
      audio.addEventListener('loadstart', () => {
        container.style.opacity = '0.7';
      });
      
      audio.addEventListener('canplay', () => {
        container.style.opacity = '1';
      });
      
      audio.addEventListener('error', () => {
        container.style.opacity = '0.5';
        container.style.filter = 'grayscale(1)';
      });
    });
  }

  // Initialize all UX enhancements
  function initUXEnhancements() {
    addAudioPlayIndicators();
    initSmoothScrolling();
    initScrollAnimations();
    optimizeAudioLoading();
    improveKeyboardNav();
    addLoadingStates();
  }

  buildVcRows().then(() => {
    updateFsUi();
    // Wait a bit for DOM to settle, then initialize UX features
    setTimeout(initUXEnhancements, 100);
  });
})();


