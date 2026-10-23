// ==========================================================================
// Maya Kalen — Maya Magic Portfolio
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

  // ---- Footer year ----
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---- Mobile nav toggle ----
  const navToggle = document.getElementById('nav-toggle');
  const siteNav = document.getElementById('site-nav');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = siteNav.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    siteNav.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        siteNav.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ---- Scroll progress bar ----
  const progressBar = document.getElementById('scroll-progress-bar');
  if (progressBar) {
    const updateProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      progressBar.style.width = `${Math.min(100, Math.max(0, pct)).toFixed(1)}%`;
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    updateProgress();
  }

  // ---- Scroll-reveal animation ----
  const animatedEls = document.querySelectorAll('[data-animate]');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    animatedEls.forEach((el) => observer.observe(el));

    // Elements already inside the viewport on load (e.g. a direct link to
    // #services) can end up with an observer entry that never reports
    // intersecting if layout settles a beat late — force those visible.
    window.requestAnimationFrame(() => {
      animatedEls.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('in-view');
      });
    });
  } else {
    animatedEls.forEach((el) => el.classList.add('in-view'));
  }

  // ---- Process journey: draw the trail through the real badge positions ----
  const journey = document.getElementById('journey');
  if (journey) {
    const svgLine = journey.querySelector('.journey-line');
    const glow = journey.querySelector('.journey-glow');
    const trail = journey.querySelector('.journey-trail');
    const spark = journey.querySelector('.journey-spark');
    const badges = [...journey.querySelectorAll('.journey-badge')];
    const reduceJourneyMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let drawn = false;

    const drawTrail = () => {
      const box = journey.getBoundingClientRect();
      const pts = badges.map((badge) => {
        const r = badge.getBoundingClientRect();
        return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 };
      });
      const horizontal = Math.abs(pts[1].x - pts[0].x) > 20;
      let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
      for (let i = 1; i < pts.length; i += 1) {
        const a = pts[i - 1];
        const b = pts[i];
        const c1 = horizontal ? [a.x + (b.x - a.x) / 2, a.y] : [a.x, a.y + (b.y - a.y) / 2];
        const c2 = horizontal ? [b.x - (b.x - a.x) / 2, b.y] : [b.x, b.y - (b.y - a.y) / 2];
        d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)}`;
      }

      svgLine.setAttribute('viewBox', `0 0 ${box.width.toFixed(0)} ${box.height.toFixed(0)}`);
      glow.setAttribute('d', d);
      trail.setAttribute('d', d);
      if (spark) spark.style.offsetPath = `path('${d}')`;

      const length = glow.getTotalLength();
      glow.style.transition = 'none';
      glow.style.strokeDasharray = `${length}`;
      glow.style.strokeDashoffset = drawn || reduceJourneyMotion ? '0' : `${length}`;
      void glow.getBoundingClientRect();
      glow.style.transition = '';
    };

    drawTrail();
    if ('ResizeObserver' in window) new ResizeObserver(drawTrail).observe(journey);
    window.addEventListener('load', drawTrail);

    const revealTrail = () => {
      drawn = true;
      glow.style.strokeDashoffset = '0';
      journey.classList.add('is-drawn');
    };
    if (reduceJourneyMotion || !('IntersectionObserver' in window)) {
      revealTrail();
    } else {
      new IntersectionObserver((entries, obs) => {
        if (entries[0].isIntersecting) { revealTrail(); obs.disconnect(); }
      }, { threshold: 0.25 }).observe(journey);
    }
  }

  // ---- Portfolio bookcase: hero stats always match the real shelves ----
  const shelfBooks = document.querySelectorAll('.bookcase .book');
  if (shelfBooks.length) {
    const setText = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
    setText('project-total', shelfBooks.length);
    setText('platform-total', document.querySelectorAll('.bookcase .shelf').length);
  }

  // ---- Portfolio bookcase: pull a book off the shelf to see its cover ----
  const cover = document.getElementById('book-cover');
  const coverBackdrop = document.getElementById('cover-backdrop');

  if (cover && shelfBooks.length) {
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const coverReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coverEls = {
      platform: document.getElementById('cover-platform'),
      emblem: document.getElementById('cover-emblem'),
      title: document.getElementById('cover-title'),
      host: document.getElementById('cover-host'),
      cta: document.getElementById('cover-cta'),
      close: document.getElementById('cover-close'),
    };
    let activeBook = null;
    let showTimer = null;
    let hideTimer = null;

    const fillCover = (book) => {
      const shelf = book.closest('.shelf');
      const plaque = shelf.querySelector('.shelf-plaque').cloneNode(true);
      plaque.querySelectorAll('span, em').forEach((el) => el.remove());
      coverEls.platform.textContent = plaque.textContent.trim();
      coverEls.emblem.textContent = book.querySelector('.book-mono').textContent;
      coverEls.title.textContent = book.querySelector('.book-title').textContent;
      coverEls.host.textContent = book.querySelector('.book-tag').textContent.replace('↗', '').trim();
      coverEls.cta.href = book.href;
      const palette = [...book.classList].find((c) => /^p[1-6]$/.test(c)) || 'p1';
      cover.className = `book-cover ${palette}`;
      cover.style.setProperty('--cat', getComputedStyle(shelf).getPropertyValue('--cat'));
    };

    const placeCover = (book, modal) => {
      const w = cover.offsetWidth;
      const h = cover.offsetHeight;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let left;
      let top;
      if (modal) {
        left = (vw - w) / 2;
        top = (vh - h) / 2;
      } else {
        // rise up out of the shelf, centred on the book, overlapping its top a little
        const r = book.getBoundingClientRect();
        left = r.left + r.width / 2 - w / 2;
        top = r.top - h + 24;
        if (top < 96) top = r.bottom - 24; // not enough room above: drop below instead
        if (top + h > vh - 12) top = Math.max(96, vh - h - 12);
      }
      left = Math.min(Math.max(12, left), vw - w - 12);
      cover.style.left = `${Math.round(left)}px`;
      cover.style.top = `${Math.round(top)}px`;
    };

    const openCover = (book, modal = false) => {
      clearTimeout(hideTimer);
      if (activeBook && activeBook !== book) activeBook.classList.remove('is-out');
      activeBook = book;
      fillCover(book);
      cover.classList.toggle('is-modal', modal);
      placeCover(book, modal);
      book.classList.add('is-out');
      document.dispatchEvent(new CustomEvent('magic:book'));
      void cover.offsetWidth;
      cover.classList.add('open');
      if (modal && coverBackdrop) coverBackdrop.classList.add('open');
      if (!coverReduceMotion && typeof spawnCardSparkle === 'function') spawnCardSparkle(cover.querySelector('.cover-face'), 5);
    };

    const closeCover = () => {
      clearTimeout(showTimer);
      cover.classList.remove('open');
      if (coverBackdrop) coverBackdrop.classList.remove('open');
      if (activeBook) activeBook.classList.remove('is-out');
      activeBook = null;
    };
    const scheduleClose = () => {
      clearTimeout(hideTimer);
      hideTimer = setTimeout(closeCover, 220);
    };

    shelfBooks.forEach((book) => {
      if (canHover) {
        book.addEventListener('mouseenter', () => {
          clearTimeout(hideTimer);
          clearTimeout(showTimer);
          showTimer = setTimeout(() => openCover(book), activeBook ? 0 : 110);
        });
        book.addEventListener('mouseleave', () => { clearTimeout(showTimer); scheduleClose(); });
      } else {
        // touch: the first tap takes the book off the shelf, the button opens the site
        book.addEventListener('click', (e) => {
          e.preventDefault();
          openCover(book, true);
        });
      }
      book.addEventListener('focus', () => { if (canHover) openCover(book); });
      book.addEventListener('blur', () => { if (canHover) scheduleClose(); });
    });

    cover.addEventListener('mouseenter', () => clearTimeout(hideTimer));
    cover.addEventListener('mouseleave', () => { if (!cover.classList.contains('is-modal')) scheduleClose(); });
    coverEls.close.addEventListener('click', closeCover);
    if (coverBackdrop) coverBackdrop.addEventListener('click', closeCover);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && activeBook) closeCover(); });
    window.addEventListener('scroll', () => {
      if (activeBook && !cover.classList.contains('is-modal')) placeCover(activeBook, false);
    }, { passive: true });
    window.addEventListener('resize', () => { if (activeBook) placeCover(activeBook, cover.classList.contains('is-modal')); });
  }



  // ---- Toolkit: click the cabinet doors to swing them open ----
  const cabinet = document.getElementById('cabinet');
  const cabinetDoors = document.getElementById('cabinet-doors');
  if (cabinet && cabinetDoors) {
    cabinetDoors.addEventListener('click', () => {
      if (cabinet.classList.contains('open')) return;
      cabinet.classList.add('open');
      if (!prefersReducedMotion) {
        const rect = cabinet.getBoundingClientRect();
        for (let i = 0; i < 10; i += 1) {
          setTimeout(() => spawnViewportStar(
            rect.left + rect.width / 2 + (Math.random() - 0.5) * rect.width * 0.5,
            rect.top + rect.height / 2 + (Math.random() - 0.5) * 40,
          ), i * 30);
        }
      }
    });
  }

  // ---- Toolkit accordion ----
  const accordionItems = document.querySelectorAll('.accordion-item');
  accordionItems.forEach((item) => {
    const head = item.querySelector('.accordion-head');
    if (!head) return;
    head.addEventListener('click', () => {
      const willOpen = !item.classList.contains('open');
      accordionItems.forEach((other) => {
        other.classList.remove('open');
        other.querySelector('.accordion-head')?.setAttribute('aria-expanded', 'false');
      });
      if (willOpen) {
        item.classList.add('open');
        head.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ---- Toolkit cauldron: tap ingredients to drop them in, then email the recipe ----
  const cauldron = document.getElementById('cauldron');
  const toolChips = document.querySelectorAll('.accordion button.chip');

  if (cauldron && toolChips.length) {
    const pot = document.getElementById('cauldron-pot');
    const picksList = document.getElementById('cauldron-picks');
    const sendLink = document.getElementById('cauldron-send');
    const clearBtn = document.getElementById('cauldron-clear');
    const hint = document.getElementById('cauldron-hint');
    const defaultHint = hint ? hint.textContent : '';
    const picks = new Set();
    const MAX_PICKS = 12;

    const ingredientCount = document.getElementById('ingredient-count');
    const shelfCount = document.getElementById('shelf-count');
    if (ingredientCount) ingredientCount.textContent = toolChips.length;
    if (shelfCount) shelfCount.textContent = document.querySelectorAll('.accordion-item').length;

    toolChips.forEach((chip) => chip.setAttribute('aria-pressed', 'false'));

    const cauldronToast = (text) => {
      if (!toast) return;
      const rect = cauldron.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) return;
      toast.textContent = text;
      toast.classList.add('show');
      clearTimeout(cauldronToast.timer);
      cauldronToast.timer = setTimeout(() => toast.classList.remove('show'), 1600);
    };

    const render = () => {
      picksList.innerHTML = '';
      picks.forEach((name) => {
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.setAttribute('aria-label', `Remove ${name} from the cauldron`);
        btn.innerHTML = '<span aria-hidden="true">×</span>';
        btn.prepend(document.createTextNode(name));
        btn.addEventListener('click', () => toggle(name));
        li.appendChild(btn);
        picksList.appendChild(li);
      });

      const count = picks.size;
      cauldron.classList.toggle('has-picks', count > 0);
      pot?.style.setProperty('--fill', Math.min(count, 8));
      clearBtn.hidden = count === 0;
      sendLink.setAttribute('aria-disabled', count === 0 ? 'true' : 'false');
      if (hint) {
        hint.textContent = count === 0
          ? defaultHint
          : `${count} ingredient${count === 1 ? '' : 's'} bubbling. Add more, or send the recipe my way.`;
      }

      const list = [...picks].map((name) => `- ${name}`).join('\n');
      const subject = 'A project brewed on your Toolkit page';
      const body = `Hi Maya,\n\nI would love to brew a project with these ingredients:\n${list}\n\nHere is a little about what I have in mind:\n\n`;
      sendLink.href = `mailto:kalen.mayaa@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      toolChips.forEach((chip) => chip.setAttribute('aria-pressed', picks.has(chip.textContent.trim()) ? 'true' : 'false'));
    };

    const toggle = (name, sourceEl) => {
      if (picks.has(name)) {
        picks.delete(name);
      } else {
        if (picks.size >= MAX_PICKS) {
          cauldronToast('The cauldron is full! Send this brew first.');
          return;
        }
        picks.add(name);
        if (pot && !prefersReducedMotion) {
          pot.classList.remove('splash');
          void pot.offsetWidth;
          pot.classList.add('splash');
        }
        if (sourceEl) spawnCardSparkle(sourceEl.closest('.accordion-body') || cauldron, 3);
        cauldronToast(`🧪 ${name} added to your cauldron`);
      }
      render();
    };

    toolChips.forEach((chip) => {
      chip.addEventListener('click', () => toggle(chip.textContent.trim(), chip));
    });
    clearBtn.addEventListener('click', () => { picks.clear(); render(); });
    render();
  }

  // ---- Services: the pretend AI answer types itself out when it scrolls into view ----
  const answerTyped = document.getElementById('answer-typed');
  if (answerTyped) {
    const fullText = answerTyped.dataset.text || '';
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      answerTyped.textContent = fullText;
    } else {
      let typingTimer = null;
      const typeAnswer = () => {
        clearInterval(typingTimer);
        let i = 0;
        answerTyped.textContent = '';
        typingTimer = setInterval(() => {
          i += 1;
          answerTyped.textContent = fullText.slice(0, i);
          if (i >= fullText.length) clearInterval(typingTimer);
        }, 28);
      };
      new IntersectionObserver((entries, obs) => {
        if (entries[0].isIntersecting) { typeAnswer(); obs.disconnect(); }
      }, { threshold: 0.6 }).observe(answerTyped.closest('.answer-demo'));
      answerTyped.closest('.spotlight-card')?.addEventListener('mouseenter', () => {
        if (answerTyped.textContent.length === fullText.length) typeAnswer();
      });
    }
  }

  // ---- Scroll parallax for the floating shapes & blobs ----
  const parallaxLayers = [
    ...[...document.querySelectorAll('.floaties')].map((el) => ({ el, speed: 0.14 })),
    ...[...document.querySelectorAll('.blob-layer')].map((el) => ({ el, speed: 0.07 })),
  ];

  if (parallaxLayers.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const updateParallax = () => {
      const vh = window.innerHeight;
      parallaxLayers.forEach(({ el, speed }) => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > vh + 200) return;
        const centerDelta = (rect.top + rect.height / 2) - vh / 2;
        el.style.transform = `translateY(${(centerDelta * speed).toFixed(1)}px)`;
      });
    };

    let parallaxTicking = false;
    window.addEventListener('scroll', () => {
      if (!parallaxTicking) {
        window.requestAnimationFrame(() => {
          updateParallax();
          parallaxTicking = false;
        });
        parallaxTicking = true;
      }
    }, { passive: true });

    window.addEventListener('resize', updateParallax);
    updateParallax();
  }

  // ---- Floating "Email Me" button: hide once the real Contact card, or the
  // footer (which has its own email link), is on screen ----
  const emailFab = document.getElementById('email-fab');
  const fabTargets = [document.getElementById('contact'), document.getElementById('site-footer')].filter(Boolean);

  if (emailFab && fabTargets.length && 'IntersectionObserver' in window) {
    const visibleTargets = new Set();
    const fabObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visibleTargets.add(entry.target);
        else visibleTargets.delete(entry.target);
      });
      emailFab.classList.toggle('is-hidden', visibleTargets.size > 0);
    }, { threshold: 0.25 });

    fabTargets.forEach((target) => fabObserver.observe(target));
  }

  // ---- Shared sparkle helpers ----
  const STAR_CHARS = ['✨', '⭐', '🌟'];
  const STAR_COLORS = ['var(--gold)', 'var(--green)', 'var(--gold-dark)'];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Spawns a star fixed to the viewport (used by the cursor trail).
  const spawnViewportStar = (x, y) => {
    const star = document.createElement('span');
    star.className = 'magic-star';
    star.textContent = STAR_CHARS[Math.floor(Math.random() * STAR_CHARS.length)];
    star.style.setProperty('--star-color', STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)]);
    const size = 8 + Math.random() * 10;
    const dx = (Math.random() - 0.5) * 44;
    const dy = 18 + Math.random() * 32;
    star.style.setProperty('--size', `${size}px`);
    star.style.setProperty('--dx', `${dx}px`);
    star.style.setProperty('--dy', `${dy}px`);
    star.style.left = `${x}px`;
    star.style.top = `${y}px`;
    document.body.appendChild(star);
    setTimeout(() => star.remove(), 950);
  };

  // Spawns a small burst of sparkles anchored inside a card (used on hover).
  const spawnCardSparkle = (host, count = 3) => {
    if (prefersReducedMotion) return;
    const rect = host.getBoundingClientRect();
    for (let i = 0; i < count; i += 1) {
      const spark = document.createElement('span');
      spark.className = 'hover-spark';
      spark.textContent = STAR_CHARS[Math.floor(Math.random() * STAR_CHARS.length)];
      spark.style.setProperty('--spark-color', STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)]);
      const size = 9 + Math.random() * 8;
      const startX = 10 + Math.random() * (rect.width - 20);
      const startY = 10 + Math.random() * (rect.height - 20);
      const dx = (Math.random() - 0.5) * 30;
      const dy = -14 - Math.random() * 20;
      spark.style.setProperty('--size', `${size}px`);
      spark.style.setProperty('--dx', `${dx}px`);
      spark.style.setProperty('--dy', `${dy}px`);
      spark.style.left = `${startX}px`;
      spark.style.top = `${startY}px`;
      host.appendChild(spark);
      setTimeout(() => spark.remove(), 720);
    }
  };

  // ---- Hover sparkle bursts on interactive cards ----
  if (!prefersReducedMotion) {
    document.querySelectorAll('.sparkle-host').forEach((host) => {
      let cooldown = false;
      host.addEventListener('mouseenter', () => {
        if (cooldown) return;
        cooldown = true;
        spawnCardSparkle(host, 3);
        setTimeout(() => { cooldown = false; }, 500);
      });
    });
  }

  // ---- Footer night sky: twinkling stars, shooting stars, fortunes ----
  const footer = document.getElementById('site-footer');
  const footerStars = document.getElementById('footer-stars');

  if (footer && footerStars) {
    for (let i = 0; i < 48; i += 1) {
      const star = document.createElement('span');
      star.className = Math.random() < 0.25 ? 'footer-star glint' : 'footer-star';
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${4 + Math.random() * 90}%`;
      star.style.setProperty('--s', `${1.5 + Math.random() * 2.5}px`);
      star.style.setProperty('--d', `${2.2 + Math.random() * 3}s`);
      star.style.setProperty('--delay', `${Math.random() * -5}s`);
      footerStars.appendChild(star);
    }

    const shootStar = () => {
      if (prefersReducedMotion) return;
      const streak = document.createElement('span');
      streak.className = 'shooting-star';
      const angle = 14 + Math.random() * 22;
      const distance = 260 + Math.random() * 220;
      const rad = (angle * Math.PI) / 180;
      streak.style.left = `${Math.random() * 65}%`;
      streak.style.top = `${4 + Math.random() * 35}%`;
      streak.style.setProperty('--angle', `${angle}deg`);
      streak.style.setProperty('--tx', `${(Math.cos(rad) * distance).toFixed(0)}px`);
      streak.style.setProperty('--ty', `${(Math.sin(rad) * distance).toFixed(0)}px`);
      streak.style.setProperty('--dur', `${0.9 + Math.random() * 0.5}s`);
      footerStars.appendChild(streak);
      setTimeout(() => streak.remove(), 1600);
    };

    // an occasional ambient streak, only while the footer is on screen
    let skyTimer = null;
    const scheduleStreak = () => {
      skyTimer = setTimeout(() => { shootStar(); scheduleStreak(); }, 5000 + Math.random() * 5000);
    };
    new IntersectionObserver(([entry]) => {
      clearTimeout(skyTimer);
      if (entry.isIntersecting) scheduleStreak();
    }).observe(footer);

    const FORTUNES = [
      'A website you love is closer than you think.',
      'The stars say your next launch goes smoothly.',
      'Wish granted: fewer plugins, faster pages.',
      'Your brand is about to have a glow up.',
      'Somewhere, a perfectly aligned div awaits you.',
      'Today is a very good day to hit publish.',
      'The cosmos approves of your color palette.',
      'Great things are loading. Please stand by.',
    ];
    const starCatch = document.getElementById('star-catch');
    const fortuneEl = document.getElementById('footer-fortune');
    let lastFortune = -1;

    if (starCatch && fortuneEl) {
      starCatch.addEventListener('click', () => {
        let pick;
        do { pick = Math.floor(Math.random() * FORTUNES.length); } while (pick === lastFortune);
        lastFortune = pick;
        fortuneEl.classList.remove('show');
        shootStar();
        spawnCardSparkle(starCatch, 6);
        setTimeout(() => {
          fortuneEl.textContent = FORTUNES[pick];
          fortuneEl.classList.add('show');
        }, prefersReducedMotion ? 0 : 450);
      });
    }

    const backToTop = document.getElementById('back-to-top');
    if (backToTop && !prefersReducedMotion) {
      backToTop.addEventListener('click', () => {
        backToTop.classList.remove('flying');
        void backToTop.offsetWidth;
        backToTop.classList.add('flying');
        setTimeout(() => backToTop.classList.remove('flying'), 1200);
      });
    }
  }

  // ---- Maya's avatar (About page only): click for a fun qualification ----
  const mayaAvatar = document.getElementById('maya-avatar');
  const avatarBubble = document.getElementById('avatar-bubble');
  if (mayaAvatar && avatarBubble) {
    const FACTS = [
      '7+ years turning ideas into working websites.',
      "Bachelor's degree in Computer Science and Engineering.",
      'Fluent in WordPress, Shopify, Webflow, HubSpot, Squarespace, Wix and Go High Level.',
      'Comfortable in HTML, CSS, JavaScript, PHP, React and Node.',
      'Also does SEO, graphic design, marketing and automation.',
      'Currently learning new AI tools for design and automation.',
      'Believes actions speak louder than words.',
      'The magic behind Maya Magic, since day one.',
      '150+ projects shipped and counting.',
      '100% client satisfaction. Ask around.',
    ];
    let avatarBubbleTimer;
    mayaAvatar.addEventListener('click', () => {
      avatarBubble.textContent = FACTS[Math.floor(Math.random() * FACTS.length)];
      avatarBubble.classList.remove('show');
      void avatarBubble.offsetWidth;
      avatarBubble.classList.add('show');
      clearTimeout(avatarBubbleTimer);
      avatarBubbleTimer = setTimeout(() => avatarBubble.classList.remove('show'), 5000);

      if (!prefersReducedMotion) {
        const rect = mayaAvatar.getBoundingClientRect();
        for (let i = 0; i < 8; i += 1) {
          setTimeout(() => spawnViewportStar(
            rect.left + rect.width / 2 + (Math.random() - 0.5) * rect.width * 0.7,
            rect.top + rect.height / 2 + (Math.random() - 0.5) * rect.height * 0.5,
          ), i * 30);
        }
      }
    });
  }

  // ---- About hero: Maya's eyes track the real cursor, and the whole
  // scene drifts toward it, effortlessly, no click needed ----
  const aboutHero = document.getElementById('about-top');
  const avatarEyes = document.querySelector('.maya-avatar-eyes');
  const avatarWrap = document.querySelector('.maya-avatar-wrap');
  const aboutFloaties = aboutHero ? aboutHero.querySelector('.floaties') : null;

  if (aboutHero && avatarEyes && avatarWrap && !prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
    const EYE_RANGE = 4.5;
    const AVATAR_RANGE = 14;
    const FLOATY_RANGE = 8;

    aboutHero.addEventListener('mousemove', (e) => {
      const heroRect = aboutHero.getBoundingClientRect();
      const heroCx = heroRect.left + heroRect.width / 2;
      const heroCy = heroRect.top + heroRect.height / 2;
      const nx = Math.max(-1, Math.min(1, (e.clientX - heroCx) / (heroRect.width / 2)));
      const ny = Math.max(-1, Math.min(1, (e.clientY - heroCy) / (heroRect.height / 2)));

      // eyes look straight at the actual pointer position
      const eyeRect = avatarEyes.getBoundingClientRect();
      const eyeCx = eyeRect.left + eyeRect.width / 2;
      const eyeCy = eyeRect.top + eyeRect.height / 2;
      const ex = e.clientX - eyeCx;
      const ey = e.clientY - eyeCy;
      const eDist = Math.hypot(ex, ey) || 1;
      const eScale = Math.min(1, eDist / 220) * EYE_RANGE;
      avatarEyes.style.transform = `translate(${(ex / eDist * eScale).toFixed(2)}px, ${(ey / eDist * eScale).toFixed(2)}px)`;

      // the whole avatar leans toward the cursor, a little
      avatarWrap.style.transform = `translate(${(nx * AVATAR_RANGE).toFixed(1)}px, ${(ny * AVATAR_RANGE * 0.6).toFixed(1)}px)`;

      // ambient props drift the opposite way, for a touch of depth
      if (aboutFloaties) {
        aboutFloaties.style.transform = `translate(${(-nx * FLOATY_RANGE).toFixed(1)}px, ${(-ny * FLOATY_RANGE).toFixed(1)}px)`;
      }
    }, { passive: true });

    aboutHero.addEventListener('mouseleave', () => {
      avatarEyes.style.transform = 'translate(0, 0)';
      avatarWrap.style.transform = 'translate(0, 0)';
      if (aboutFloaties) aboutFloaties.style.transform = 'translate(0, 0)';
    });
  }

  // ---- Services page: click a flip-card to see the back ----
  document.querySelectorAll('.flip-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      // don't flip when the click is on a link/button inside the card
      if (e.target.closest('a, button')) return;
      card.classList.toggle('flipped');
    });
  });

  // ---- Hero collage: the whole scene tilts gently toward the cursor ----
  const collage = document.getElementById('collage');
  const collageGrid = document.getElementById('collage-grid');
  if (collage && collageGrid && !prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
    collage.addEventListener('mousemove', (e) => {
      const rect = collage.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      collageGrid.style.transform = `rotateX(${(-py * 10).toFixed(1)}deg) rotateY(${(px * 10).toFixed(1)}deg)`;
    });
    collage.addEventListener('mouseleave', () => {
      collageGrid.style.transform = 'rotateX(0) rotateY(0)';
    });
  }

  // ---- Brand-mark easter egg: click it to cast a little spell ----
  const brandMark = document.querySelector('.brand');
  const toast = document.getElementById('magic-toast');
  if (brandMark && !prefersReducedMotion) {
    let toastTimer;
    brandMark.addEventListener('click', () => {
      const rect = brandMark.getBoundingClientRect();
      for (let i = 0; i < 10; i += 1) {
        setTimeout(() => spawnViewportStar(
          rect.left + rect.width / 2 + (Math.random() - 0.5) * 30,
          rect.top + rect.height / 2 + (Math.random() - 0.5) * 20,
        ), i * 30);
      }
      if (toast) {
        toast.textContent = '✨ Magic cast!';
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 1400);
      }
    });
  }

  // ---- Magic wand cursor with a trailing sparkle of stars ----
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;

  if (isFinePointer && !prefersReducedMotion) {
    const cursor = document.createElement('div');
    cursor.className = 'magic-cursor';
    cursor.textContent = '🪄';
    cursor.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cursor);
    document.documentElement.classList.add('has-wand');

    let lastX = window.innerWidth / 2;
    let lastY = window.innerHeight / 2;
    let lastSpawn = 0;
    const SPAWN_INTERVAL = 45;

    const positionCursor = (x, y) => {
      cursor.style.transform = `translate(${x - 4}px, ${y - 26}px) rotate(-40deg)`;
    };
    positionCursor(lastX, lastY);

    window.addEventListener('mousemove', (e) => {
      lastX = e.clientX;
      lastY = e.clientY;

      // Over the header, hide the wand entirely and let the real pointer
      // show through — nav links are the most important click target on
      // the site and deserve zero ambiguity about where the click lands.
      // Text fields keep their own I-beam cursor too, so the wand steps aside.
      if (e.target.closest('.site-header, input, textarea, select')) {
        cursor.style.opacity = '0';
        return;
      }
      cursor.style.opacity = '1';
      positionCursor(lastX, lastY);

      const now = performance.now();
      if (now - lastSpawn < SPAWN_INTERVAL) return;
      lastSpawn = now;
      spawnViewportStar(lastX, lastY);
    }, { passive: true });

    window.addEventListener('mousedown', () => {
      for (let i = 0; i < 6; i += 1) {
        setTimeout(() => spawnViewportStar(lastX, lastY), i * 20);
      }
    });

    document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });
  }

  // ---- Magnetic buttons: nudge toward the cursor when it's nearby ----
  if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
    const PULL_RADIUS = 70;
    const PULL_STRENGTH = 0.35;

    document.querySelectorAll('.magnetic').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy);
        if (dist > PULL_RADIUS + rect.width / 2) return;
        btn.style.transform = `translate(${(dx * PULL_STRENGTH).toFixed(1)}px, ${(dy * PULL_STRENGTH).toFixed(1)}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  // ---- Wisp: a floating companion on every page, with a speech bubble ----
  const wisp = document.getElementById('wisp');
  const wispBubble = document.getElementById('wisp-bubble');
  if (wisp && wispBubble) {
    const WISP_LINES = [
      'Meow. I mean, greetings, traveler. 🐈‍⬛',
      'You found me! That is worth at least 10 magic points. ✨',
      'I once turned a client bug into a "feature." True story.',
      'Psst, the Spellbook is this way. If you dare. 📖',
      'Maya says hi. I say nothing, I am a cat.',
      'Fun fact: I have opinions about Comic Sans.',
      'Still here. Still magic. Carry on. 🪄',
      'Just floating here, guarding the portfolio.',
      'Seven years of magic and I have seen things.',
      'Don’t mind me. I am load-bearing decoration.',
      'I do not do tricks. I do spells. Big difference.',
      'Nine lives, zero of them spent debugging CSS.',
      'This whole site runs on vibes and a little bit of code.',
      'I would high-five you, but, paws.',
      'Somewhere a wand is casting spells. Probably nearby.',
      'Rumor has it I am the real web developer here.',
      'Click around. The spellbook does not bite. Much.',
      'I have been awake this whole time, watching.',
      'Magic tip: hover over everything. Everything.',
      'You seem like someone who reads the fine print. Respect.',
      'The wand cursor and I are old friends.',
      'Ten out of ten cats recommend this portfolio.',
      'I guard this corner. It is a very important job.',
      'Between us, the toolkit page has the best snacks.',
    ];

    let bubbleTimer;
    const showWispBubble = (text) => {
      wispBubble.textContent = text;
      wispBubble.classList.add('show');
      clearTimeout(bubbleTimer);
      bubbleTimer = setTimeout(() => wispBubble.classList.remove('show'), 5000);
    };

    wisp.addEventListener('click', () => {
      const rect = wisp.getBoundingClientRect();
      if (!prefersReducedMotion) {
        for (let i = 0; i < 8; i += 1) {
          setTimeout(() => spawnViewportStar(
            rect.left + rect.width / 2 + (Math.random() - 0.5) * 40,
            rect.top + (Math.random() - 0.5) * 20,
          ), i * 30);
        }
      }
      showWispBubble(WISP_LINES[Math.floor(Math.random() * WISP_LINES.length)]);
    });

    // Wisp also talks on its own every so often, so the corner never feels
    // static even if nobody clicks.
    const scheduleWispChatter = () => {
      const delay = 10000 + Math.random() * 5000;
      setTimeout(() => {
        if (!document.hidden) {
          showWispBubble(WISP_LINES[Math.floor(Math.random() * WISP_LINES.length)]);
        }
        scheduleWispChatter();
      }, delay);
    };
    scheduleWispChatter();
  }

  // ---- Gatekeeper modal: a playful "are you sure" before opening the Spellbook ----
  const gateOverlay = document.getElementById('gate-overlay');
  const gateTrigger = document.getElementById('gate-trigger');
  if (gateOverlay && gateTrigger) {
    const gateYes = document.getElementById('gate-yes');
    const gateNo = document.getElementById('gate-no');
    const gateDestination = gateTrigger.getAttribute('href');
    const DECLINE_LINES = [
      'Smart. It is a lot in there. 😅',
      'Wise choice. The spellbook bites sometimes. 📖',
      'Fair enough. Magic is not for everyone.',
      'No shame in that. The wand cursor scares people off too.',
    ];

    const noOriginalText = gateNo ? gateNo.textContent : '';
    let noDisabled = false;

    const resetGateNo = () => {
      noDisabled = false;
      if (!gateNo) return;
      gateNo.classList.remove('gate-no-disabled');
      gateNo.textContent = noOriginalText;
    };

    const openGate = (e) => {
      e.preventDefault();
      resetGateNo();
      gateOverlay.classList.add('open');
    };
    const closeGate = () => gateOverlay.classList.remove('open');

    gateTrigger.addEventListener('click', openGate);

    if (gateYes) {
      gateYes.addEventListener('click', () => {
        window.location.href = gateDestination;
      });
    }
    if (gateNo) {
      // Hovering "Maybe not" is the joke: it locks itself out before you
      // can even click it.
      gateNo.addEventListener('mouseenter', () => {
        if (noDisabled) return;
        noDisabled = true;
        gateNo.classList.add('gate-no-disabled');
        gateNo.textContent = 'Too Late';
      });

      gateNo.addEventListener('click', () => {
        if (noDisabled) {
          if (toast) {
            toast.textContent = '😏 Told you. No backing out now.';
            toast.classList.add('show');
            clearTimeout(gateNo._toastTimer);
            gateNo._toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
          }
          return;
        }
        closeGate();
        if (toast) {
          toast.textContent = DECLINE_LINES[Math.floor(Math.random() * DECLINE_LINES.length)];
          toast.classList.add('show');
          clearTimeout(gateNo._toastTimer);
          gateNo._toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
        }
      });
    }
    gateOverlay.addEventListener('click', (e) => { if (e.target === gateOverlay) closeGate(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeGate(); });
  }

  // ---- "Make a Wish" widget (Contact page): sends the wish + email to
  // Formspree (once configured), then hands off to the Thank You page ----
  const wishForm = document.getElementById('wish-form');
  if (wishForm) {
    const wishInput = document.getElementById('wish-input');
    const wishEmail = document.getElementById('wish-email');
    const wishResponse = document.getElementById('wish-response');
    const wishCount = document.getElementById('wish-count');
    const wishSubmitBtn = wishForm.querySelector('button[type="submit"]');
    const RESPONSES = [
      'Sent it up with the stars. ✨',
      'The universe just noted that one down. 🌙',
      'Consider it sprinkled with a little magic. 🪄',
      'Filed away in the spellbook for safekeeping. 📖',
      'That wish is officially in the works. 🌟',
      'Wishes like that tend to come true. Watch this space. ✨',
    ];
    const isFormConfigured = !wishForm.action.includes('REPLACE_WITH_FORM_ID');

    let count = Number(sessionStorage.getItem('mayaMagicWishCount') || 0);
    const updateCount = () => {
      if (wishCount) wishCount.textContent = count === 0 ? '' : `${count} wish${count === 1 ? '' : 'es'} sent this visit`;
    };
    updateCount();

    const celebrate = () => {
      count += 1;
      sessionStorage.setItem('mayaMagicWishCount', String(count));
      updateCount();

      if (wishResponse) {
        wishResponse.textContent = RESPONSES[Math.floor(Math.random() * RESPONSES.length)];
        wishResponse.classList.remove('show');
        void wishResponse.offsetWidth;
        wishResponse.classList.add('show');
      }

      if (!prefersReducedMotion) {
        const rect = wishForm.getBoundingClientRect();
        for (let i = 0; i < 8; i += 1) {
          setTimeout(() => spawnViewportStar(
            rect.left + rect.width / 2 + (Math.random() - 0.5) * rect.width * 0.6,
            rect.top + (Math.random() - 0.5) * 20,
          ), i * 40);
        }
      }
    };

    wishForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const value = (wishInput?.value || '').trim();
      const email = (wishEmail?.value || '').trim();
      if (!value || !email) return;

      celebrate();

      // Formspree isn't wired up yet (no real form id) — stay on the page
      // and just play the local celebration so nothing breaks in the
      // meantime.
      if (!isFormConfigured) {
        wishInput.value = '';
        if (wishEmail) wishEmail.value = '';
        return;
      }

      if (wishSubmitBtn) wishSubmitBtn.disabled = true;

      fetch(wishForm.action, {
        method: 'POST',
        body: new FormData(wishForm),
        headers: { Accept: 'application/json' },
      })
        .then((res) => {
          if (res.ok) {
            window.location.href = `thank-you.html?name=${encodeURIComponent(email)}`;
          } else {
            throw new Error('Form submission failed');
          }
        })
        .catch(() => {
          if (wishResponse) {
            wishResponse.textContent = 'That one got lost in the ether. Mind trying again, or emailing me directly?';
            wishResponse.classList.add('show');
          }
          if (wishSubmitBtn) wishSubmitBtn.disabled = false;
        });
    });
  }

  // ==========================================================================
  // Hidden magic: secrets worth magic points, a footer meter with hints,
  // a "leaving so soon?" goodbye, and Midnight the shy lurking cat
  // ==========================================================================
  const EGGS = {
    brand: { label: 'You cast a spell on my name', hint: 'Names have power. Try mine, right at the top.' },
    wisp: { label: 'You said hi to Wisp', hint: 'The little cat in the corner has opinions.' },
    stars: { label: 'The stars read your fortune', hint: 'The night sky down in the footer reads fortunes.' },
    moon: { label: 'You waved at the moon', hint: 'Someone should say hello to the moon in the footer.' },
    avatar: { label: 'Maya shared a secret fact', hint: 'Maya has fun facts, if you give her a poke on the About page.' },
    flip: { label: 'You found the other side of a card', hint: 'Every card has two sides. Peek behind one on the Services page.' },
    cabinet: { label: 'You unlocked the cabinet', hint: 'Every cabinet has a key. Find it on the Toolkit page.' },
    cauldron: { label: 'Something is brewing', hint: 'A cauldron on the Toolkit page is hungry for ingredients.' },
    book: { label: 'You pulled a book off the shelf', hint: 'Some books want to be read. Visit the Portfolio shelves.' },
    gate: { label: 'Brave soul, you dared to enter', hint: 'The home page guards the Spellbook. Dare to enter it.' },
    cat: { label: 'You caught Midnight, Wisp\'s shy cousin', hint: 'A shy black cat peeks out between sections. Catch her if you can.' },
    spell: { label: 'You spoke the secret word', hint: 'Every wizard knows the magic word. Just type it, anywhere on the page.' },
  };
  const EGG_IDS = Object.keys(EGGS);
  const EGG_POINTS = 10;
  const EGG_KEY = 'mayaMagicSecrets';
  const reduceMagicMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const loadFound = () => {
    try { return new Set(JSON.parse(localStorage.getItem(EGG_KEY) || '[]').filter((id) => EGGS[id])); } catch (e) { return new Set(); }
  };
  const foundEggs = loadFound();
  const saveFound = () => {
    try { localStorage.setItem(EGG_KEY, JSON.stringify([...foundEggs])); } catch (e) { /* private mode: keep it in memory */ }
  };
  const magicPoints = () => foundEggs.size * EGG_POINTS;

  // a small toast of its own, so it never fights the other site toasts
  const eggToast = document.createElement('div');
  eggToast.className = 'egg-toast';
  eggToast.setAttribute('role', 'status');
  eggToast.setAttribute('aria-live', 'polite');
  document.body.appendChild(eggToast);
  let eggToastTimer;
  const showEggToast = (html, ms = 3200) => {
    eggToast.innerHTML = html;
    eggToast.classList.add('show');
    clearTimeout(eggToastTimer);
    eggToastTimer = setTimeout(() => eggToast.classList.remove('show'), ms);
  };

  // the footer meter: subtle, and a hint machine when clicked
  const footerBottom = document.querySelector('.footer-bottom');
  let eggCountEl = null;
  if (footerBottom) {
    const meter = document.createElement('button');
    meter.type = 'button';
    meter.className = 'egg-meter';
    meter.innerHTML = `<span aria-hidden="true">✦</span> Psst… there's hidden magic on this site <strong><span id="egg-count">${foundEggs.size}</span>/${EGG_IDS.length}</strong> found`;
    meter.title = 'Click for a hint';
    footerBottom.insertBefore(meter, footerBottom.querySelector('.back-to-top'));
    eggCountEl = meter.querySelector('#egg-count');
    meter.addEventListener('click', () => {
      const missing = EGG_IDS.filter((id) => !foundEggs.has(id));
      if (!missing.length) {
        showEggToast(`🏆 <strong>All ${EGG_IDS.length} secrets found!</strong> You are officially a wizard. ${magicPoints()} magic points.`, 4200);
        return;
      }
      const pick = missing[Math.floor(Math.random() * missing.length)];
      showEggToast(`🔮 <strong>Hint:</strong> ${EGGS[pick].hint}`, 5200);
    });
  }

  const findEgg = (id, x, y) => {
    if (!EGGS[id] || foundEggs.has(id)) return;
    foundEggs.add(id);
    saveFound();
    if (eggCountEl) eggCountEl.textContent = foundEggs.size;
    const allFound = foundEggs.size === EGG_IDS.length;
    setTimeout(() => {
      showEggToast(allFound
        ? `🏆 <strong>+${EGG_POINTS} magic points!</strong> ${EGGS[id].label}. That's all ${EGG_IDS.length} secrets. You are officially a wizard!`
        : `✨ <strong>+${EGG_POINTS} magic points!</strong> ${EGGS[id].label}. <span>${foundEggs.size}/${EGG_IDS.length} secrets found</span>`, allFound ? 5200 : 3400);
      if (!reduceMagicMotion) {
        const cx = x ?? window.innerWidth / 2;
        const cy = y ?? window.innerHeight - 120;
        for (let i = 0; i < 14; i += 1) {
          setTimeout(() => spawnViewportStar(cx + (Math.random() - 0.5) * 120, cy + (Math.random() - 0.5) * 60), i * 25);
        }
      }
    }, 450);
  };

  // secrets hidden in things people can already click
  document.addEventListener('click', (e) => {
    const t = e.target;
    const at = [e.clientX, e.clientY];
    if (t.closest('.brand')) findEgg('brand', ...at);
    else if (t.closest('#wisp')) findEgg('wisp', ...at);
    else if (t.closest('#star-catch')) findEgg('stars', ...at);
    else if (t.closest('.footer-moon')) findEgg('moon', ...at);
    else if (t.closest('#maya-avatar')) findEgg('avatar', ...at);
    else if (t.closest('.flip-card')) findEgg('flip', ...at);
    else if (t.closest('#cabinet-doors')) findEgg('cabinet', ...at);
    else if (t.closest('.accordion button.chip')) findEgg('cauldron', ...at);
    else if (t.closest('#gate-yes')) findEgg('gate', ...at);
  });
  document.addEventListener('magic:book', () => findEgg('book'));

  // the moon in the footer is secretly clickable
  const footerMoon = document.querySelector('.footer-moon');
  if (footerMoon) {
    footerMoon.addEventListener('click', () => {
      footerMoon.classList.remove('wave');
      void footerMoon.offsetWidth;
      footerMoon.classList.add('wave');
    });
  }

  // the secret word: type "magic" anywhere on the page (letters are read from
  // the physical keys, so caps lock and keyboard layout never get in the way)
  const SECRET_WORD = 'magic';
  let typed = '';
  document.addEventListener('keydown', (e) => {
    if (e.target.closest && e.target.closest('input, textarea, select')) return;
    const letter = /^Key[A-Z]$/.test(e.code || '') ? e.code.slice(3).toLowerCase() : (e.key || '').toLowerCase();
    if (letter.length !== 1) return;
    typed = (typed + letter).slice(-SECRET_WORD.length);
    if (typed === SECRET_WORD) {
      typed = '';
      if (foundEggs.has('spell')) showEggToast('🪄 <strong>Abracadabra!</strong> You already found this secret, but have some stars anyway.', 3200);
      findEgg('spell');
      if (!reduceMagicMotion) {
        for (let i = 0; i < 40; i += 1) {
          setTimeout(() => spawnViewportStar(Math.random() * window.innerWidth, Math.random() * window.innerHeight * 0.8), i * 30);
        }
      }
    }
  });

  // ---- "Leaving so soon?": when the pointer heads for the tab bar or close
  // button, once per visit, desktop only (browsers do not allow custom text
  // in the real close-tab dialog, so this is the friendly version) ----
  const canSenseExit = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (canSenseExit) {
    const arrivedAt = Date.now();
    let leaveShown = false;
    try { leaveShown = sessionStorage.getItem('mayaLeaveShown') === '1'; } catch (e) { /* ignore */ }

    const leave = document.createElement('div');
    leave.className = 'gate-overlay leave-overlay';
    leave.innerHTML = `
      <div class="gate-modal leave-modal" role="dialog" aria-modal="true" aria-labelledby="leave-title">
        <span class="gate-mascot" aria-hidden="true">🧙‍♀️</span>
        <h3 id="leave-title">Leaving so soon?</h3>
        <p class="leave-score"></p>
        <div class="gate-actions">
          <button type="button" class="btn btn-primary leave-stay">Stay and explore</button>
          <a href="contact.html" class="btn btn-outline">Say hi before I go</a>
        </div>
        <button type="button" class="leave-hint">Need a hint?</button>
      </div>`;
    document.body.appendChild(leave);
    const leaveScore = leave.querySelector('.leave-score');
    const leaveHint = leave.querySelector('.leave-hint');

    const closeLeave = () => leave.classList.remove('open');
    const openLeave = () => {
      const n = foundEggs.size;
      const total = EGG_IDS.length;
      leaveScore.innerHTML = n === 0
        ? `There are <strong>${total} secrets</strong> hidden around this magic world and you haven't found one yet. Sure you want to leave?`
        : n === total
          ? `You found <strong>every single secret</strong> and collected <strong>${magicPoints()} magic points</strong>. Legendary. Come back soon, wizard!`
          : `Congrats, you've collected <strong>${magicPoints()} magic points</strong> and found <strong>${n} of ${total}</strong> secrets. Are you sure you want to leave the magic world?`;
      leaveHint.hidden = n === total;
      leave.classList.add('open');
      leave.querySelector('.leave-stay').focus();
    };

    document.addEventListener('mouseout', (e) => {
      if (leaveShown || e.relatedTarget || e.clientY > 8) return;
      if (Date.now() - arrivedAt < 8000) return;
      if (document.querySelector('.gate-overlay.open, .book-cover.open')) return;
      leaveShown = true;
      try { sessionStorage.setItem('mayaLeaveShown', '1'); } catch (err) { /* ignore */ }
      openLeave();
    });
    leave.addEventListener('click', (e) => { if (e.target === leave) closeLeave(); });
    leave.querySelector('.leave-stay').addEventListener('click', closeLeave);
    leaveHint.addEventListener('click', () => {
      closeLeave();
      const missing = EGG_IDS.filter((id) => !foundEggs.has(id));
      if (missing.length) showEggToast(`🔮 <strong>Hint:</strong> ${EGGS[missing[Math.floor(Math.random() * missing.length)]].hint}`, 5200);
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLeave(); });
  }

  // ---- Midnight, Wisp's shy cousin, lurks around the page ----
  if (!reduceMagicMotion) {
    const CAT_SVG = `
      <svg viewBox="0 0 120 92" aria-hidden="true">
        <path d="M22 50 14 8l30 22Z" fill="#2b1d10"/><path d="M98 50l8-42-30 22Z" fill="#2b1d10"/>
        <path d="M24 40 19 17l15 12Z" fill="#cc704b" opacity=".75"/><path d="M96 40l5-23-15 12Z" fill="#cc704b" opacity=".75"/>
        <ellipse cx="60" cy="58" rx="44" ry="36" fill="#2b1d10"/>
        <g class="lurker-eyes">
          <ellipse cx="43" cy="54" rx="9" ry="10" fill="#e8c07d"/><ellipse cx="77" cy="54" rx="9" ry="10" fill="#e8c07d"/>
          <ellipse class="lurker-pupil" cx="43" cy="55" rx="3.2" ry="7.5" fill="#1a1109"/><ellipse class="lurker-pupil" cx="77" cy="55" rx="3.2" ry="7.5" fill="#1a1109"/>
          <circle cx="45.5" cy="51" r="2" fill="#fff"/><circle cx="79.5" cy="51" r="2" fill="#fff"/>
        </g>
        <path d="M56 68h8l-4 4.5Z" fill="#cc704b"/>
        <path d="M30 66 8 62M30 71 9 73M90 66l22-4M90 71l21 2" stroke="#f1d9b1" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>
        <ellipse cx="34" cy="88" rx="13" ry="8" fill="#2b1d10"/><ellipse cx="86" cy="88" rx="13" ry="8" fill="#2b1d10"/>
      </svg>`;

    const lurker = document.createElement('button');
    lurker.type = 'button';
    lurker.className = 'lurker';
    lurker.setAttribute('aria-label', 'A shy black cat is peeking at you. Catch her!');
    lurker.innerHTML = CAT_SVG;
    const runner = document.createElement('span');
    runner.className = 'lurker-runner';
    runner.setAttribute('aria-hidden', 'true');
    runner.textContent = '🐈‍⬛';

    let catBusy = false;
    let hideTimer = null;
    let shyTimer = null;

    const visibleSections = () => [...document.querySelectorAll('main > section')].filter((s) => {
      const r = s.getBoundingClientRect();
      // the section's bottom edge must be on screen, clear of the header
      return r.bottom > 160 && r.bottom < window.innerHeight - 20 && r.width > 300;
    });

    const hideCat = (fast) => {
      clearTimeout(hideTimer);
      clearTimeout(shyTimer);
      lurker.classList.remove('peek');
      lurker.classList.toggle('duck', !!fast);
      setTimeout(() => { lurker.remove(); lurker.classList.remove('duck', 'caught'); catBusy = false; }, fast ? 300 : 700);
    };

    const peek = (section) => {
      lurker.style.left = `${8 + Math.random() * 76}%`;
      lurker.classList.toggle('flip', Math.random() < 0.5);
      section.appendChild(lurker);
      void lurker.offsetWidth;
      lurker.classList.add('peek');
      hideTimer = setTimeout(() => hideCat(false), 4200 + Math.random() * 2200);
    };

    const dash = (section) => {
      const toRight = Math.random() < 0.5;
      runner.classList.toggle('to-left', !toRight);
      section.appendChild(runner);
      void runner.offsetWidth;
      runner.classList.add('run');
      setTimeout(() => { runner.classList.remove('run'); runner.remove(); catBusy = false; }, 2600);
    };

    const visit = () => {
      if (!catBusy && !document.hidden && !document.querySelector('.gate-overlay.open, .book-cover.open')) {
        const spots = visibleSections();
        if (spots.length) {
          catBusy = true;
          const section = spots[Math.floor(Math.random() * spots.length)];
          if (Math.random() < 0.72) peek(section); else dash(section);
        }
      }
      setTimeout(visit, 22000 + Math.random() * 20000);
    };
    setTimeout(visit, 9000 + Math.random() * 6000);

    // she is shy: linger over her too long and she ducks away
    lurker.addEventListener('mouseenter', () => {
      clearTimeout(shyTimer);
      shyTimer = setTimeout(() => { if (lurker.classList.contains('peek')) hideCat(true); }, 900);
    });
    lurker.addEventListener('mouseleave', () => clearTimeout(shyTimer));
    lurker.addEventListener('click', (e) => {
      if (!lurker.classList.contains('peek')) return;
      clearTimeout(shyTimer);
      lurker.classList.add('caught');
      findEgg('cat', e.clientX, e.clientY);
      setTimeout(() => hideCat(true), 650);
    });
  }

});
