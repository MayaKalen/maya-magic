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

  // ---- Portfolio bookcase: hero stats always match the real shelves ----
  const shelfBooks = document.querySelectorAll('.bookcase .book');
  if (shelfBooks.length) {
    const setText = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
    setText('project-total', shelfBooks.length);
    setText('platform-total', document.querySelectorAll('.bookcase .shelf').length);
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
      if (e.target.closest('.site-header')) {
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

});
