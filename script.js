/* ===========================================
   F.M.A PORTFOLIO — Award-Winning Interactions
   GSAP ScrollTrigger + Lenis Smooth Scroll
   =========================================== */

// Load pretext for chat bubble shrink-wrapping
import('./node_modules/@chenglou/pretext/dist/layout.js')
  .then(m => { window._pretext = m; })
  .catch(() => {});

document.addEventListener('DOMContentLoaded', () => {

  // ─── PRELOADER ───────────────────────────────
  const preloader = document.getElementById('preloader');
  const preloaderFill = document.getElementById('preloader-fill');
  let progress = 0;

  function updatePreloader() {
    progress += (100 - progress) * 0.08;
    preloaderFill.style.width = progress + '%';

    if (progress < 95) {
      requestAnimationFrame(updatePreloader);
    }
  }
  updatePreloader();

  window.addEventListener('load', () => {
    // Complete the bar
    preloaderFill.style.width = '100%';

    setTimeout(() => {
      preloader.classList.add('done');
      document.body.classList.add('loaded');
      initAnimations();
      initThreeScene();
      initChatBar();
      initGhostCursors();
    }, 400);
  });

  // Fallback: if load doesn't fire quickly
  setTimeout(() => {
    if (!document.body.classList.contains('loaded')) {
      preloaderFill.style.width = '100%';
      setTimeout(() => {
        preloader.classList.add('done');
        document.body.classList.add('loaded');
        initAnimations();
        initThreeScene();
        initGhostCursors();
      }, 200);
    }
  }, 5000);

  // ─── LENIS SMOOTH SCROLL ────────────────────
  let lenis;
  try {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Connect Lenis to GSAP ScrollTrigger
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  } catch (e) {
    // Lenis not loaded, fall back to native scroll
    document.documentElement.style.scrollBehavior = 'smooth';
  }

  // ─── CUSTOM CURSOR ──────────────────────────
  const cursor = document.getElementById('cursor');
  const cursorDot = document.getElementById('cursor-dot');

  if (cursor && cursorDot && window.matchMedia('(pointer: fine)').matches) {
    let mouseX = 0, mouseY = 0;
    let cursorOuterX = 0, cursorOuterY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      // Dot follows instantly
      cursorDot.style.left = mouseX + 'px';
      cursorDot.style.top = mouseY + 'px';
    });

    function animateCursor() {
      cursorOuterX += (mouseX - cursorOuterX) * 0.1;
      cursorOuterY += (mouseY - cursorOuterY) * 0.1;
      cursor.style.left = cursorOuterX + 'px';
      cursor.style.top = cursorOuterY + 'px';
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover states
    document.querySelectorAll('a, button, [data-magnetic]').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
    });
  } else {
    // Hide cursor elements on touch devices
    if (cursor) cursor.style.display = 'none';
    if (cursorDot) cursorDot.style.display = 'none';
  }

  // ─── MAGNETIC BUTTONS ───────────────────────
  document.querySelectorAll('[data-magnetic]').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
      el.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
      setTimeout(() => { el.style.transition = ''; }, 400);
    });
  });

  // ─── NAVBAR ─────────────────────────────────
  const navbar = document.getElementById('navbar');
  let lastScrollY = 0;

  function handleNavScroll() {
    const currentY = window.scrollY || document.documentElement.scrollTop;

    // Add/remove scrolled class for background
    if (currentY > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Hide on scroll-down, show on scroll-up (only when menu is closed)
    if (!menuOpen) {
      if (currentY > lastScrollY && currentY > 200) {
        navbar.classList.add('hidden');
      } else {
        navbar.classList.remove('hidden');
      }
    }

    lastScrollY = currentY;
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });

  // ─── FULLSCREEN MENU ────────────────────────
  const burgerBtn = document.getElementById('nav-burger');
  const menuOverlay = document.getElementById('menu-overlay');
  let menuOpen = false;

  function openMenu() {
    menuOpen = true;
    burgerBtn.classList.add('open');
    menuOverlay.classList.add('open');
    navbar.classList.add('menu-active');
    navbar.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    if (lenis) lenis.stop();
  }

  function closeMenu() {
    menuOpen = false;
    burgerBtn.classList.remove('open');
    menuOverlay.classList.remove('open');
    navbar.classList.remove('menu-active');
    document.body.style.overflow = '';
    if (lenis) lenis.start();
  }

  if (burgerBtn) {
    burgerBtn.addEventListener('click', () => {
      if (menuOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  // Close menu on link click
  if (menuOverlay) {
    menuOverlay.querySelectorAll('.menu-link').forEach(link => {
      link.addEventListener('click', () => {
        closeMenu();
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuOpen) {
        closeMenu();
      }
    });
  }

  // ─── SCROLL INDICATOR ───────────────────────
  const scrollIndicator = document.getElementById('scroll-indicator');
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
      const work = document.getElementById('work');
      if (work) {
        if (lenis) {
          lenis.scrollTo(work);
        } else {
          work.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
    scrollIndicator.style.cursor = 'pointer';
  }

  // ─── BACK TO TOP ────────────────────────────
  document.querySelectorAll('.footer-back-top').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(0);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });

  // ─── GSAP ANIMATIONS ───────────────────────
  function initAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      // Fallback: just reveal everything
      document.querySelectorAll('[data-reveal]').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
      // Animate hero words with CSS
      document.querySelectorAll('.hero-word').forEach((word, i) => {
        word.style.transition = `transform 1s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.15}s, opacity 1s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.15}s`;
        word.style.transform = 'translateY(0)';
        word.style.opacity = '1';
      });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // ── Hero Entrance ──
    const heroTL = gsap.timeline({ delay: 0.2 });

    heroTL
      .to('.hero-word', {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: 'expo.out',
        stagger: 0.15
      })
      .to('.hero-bio', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out'
      }, '-=0.6')
      .to('.hero-tagline', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out'
      }, '-=0.5')
      .to('.hero-scroll-indicator', {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out'
      }, '-=0.3')
      .to('.hero-info-bar', {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out'
      }, '-=0.3');

    // ── Hero Parallax ──
    gsap.to('#hero-heading-1', {
      x: -150,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5
      }
    });

    gsap.to('#hero-heading-2', {
      x: 150,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5
      }
    });

    gsap.to('#spline-container', {
      y: 100,
      scale: 0.9,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5
      }
    });

    gsap.to('.hero-scroll-indicator', {
      opacity: 0,
      scrollTrigger: {
        trigger: '.hero',
        start: '80% top',
        end: '100% top',
        scrub: true
      }
    });

    // ── Section Reveals ──
    document.querySelectorAll('[data-reveal]').forEach((el, i) => {
      gsap.fromTo(el,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            end: 'top 50%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    // ── Section Title Line Reveals ──
    document.querySelectorAll('.section-title .line, .about-headline .line, .contact-headline .line').forEach((line, i) => {
      gsap.fromTo(line,
        {
          opacity: 0,
          y: 60,
          rotateX: 15
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: line,
            start: 'top 90%',
            toggleActions: 'play none none none'
          },
          delay: i * 0.1
        }
      );
    });

    // ── Project Cards Stagger ──
    const projectCards = gsap.utils.toArray('.project-card');
    projectCards.forEach((card, i) => {
      gsap.fromTo(card,
        { opacity: 0, y: 80 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    // ── Service Cards Stagger ──
    const serviceCards = gsap.utils.toArray('.service-card');
    serviceCards.forEach((card, i) => {
      gsap.fromTo(card,
        { opacity: 0, y: 60, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
            toggleActions: 'play none none none'
          },
          delay: (i % 2) * 0.15
        }
      );
    });

    // ── Skill Categories Stagger ──
    const skillCategories = gsap.utils.toArray('.skill-category');
    skillCategories.forEach((cat, i) => {
      gsap.fromTo(cat,
        { opacity: 0, y: 60, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: cat,
            start: 'top 88%',
            toggleActions: 'play none none none'
          },
          delay: (i % 2) * 0.15
        }
      );
    });

    // ── Skill Tags Cascade ──
    document.querySelectorAll('.skill-category').forEach(cat => {
      const tags = cat.querySelectorAll('.skill-tags span');
      gsap.fromTo(tags,
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: 'power2.out',
          stagger: 0.04,
          scrollTrigger: {
            trigger: cat,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    // ── Process Steps Stagger ──
    const processSteps = gsap.utils.toArray('.process-step');
    processSteps.forEach((step, i) => {
      gsap.fromTo(step,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: step,
            start: 'top 90%',
            toggleActions: 'play none none none'
          },
          delay: i * 0.1
        }
      );
    });

    // ── Stat Counter Animation ──
    document.querySelectorAll('.stat-number[data-count]').forEach(el => {
      const target = parseInt(el.getAttribute('data-count'));
      const counter = { val: 0 };

      gsap.to(counter, {
        val: target,
        duration: 2.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none none'
        },
        onUpdate: () => {
          el.textContent = Math.round(counter.val);
        }
      });
    });

    // ── Contact Links Stagger ──
    const contactLinks = gsap.utils.toArray('.contact-big-link');
    contactLinks.forEach((link, i) => {
      gsap.fromTo(link,
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: link,
            start: 'top 90%',
            toggleActions: 'play none none none'
          },
          delay: i * 0.1
        }
      );
    });

    // ── Marquee Speed on Scroll ──
    const marqueeContent = document.querySelector('.marquee-content');
    if (marqueeContent) {
      gsap.to(marqueeContent, {
        animationDuration: '15s',
        ease: 'none',
        scrollTrigger: {
          trigger: '.marquee-section',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          onUpdate: (self) => {
            const speed = 30 - (self.progress * 15);
            marqueeContent.style.animationDuration = speed + 's';
          }
        }
      });
    }
  }

  // ─── TYPING EFFECT ON TAGLINE ───────────────
  function initTypingEffect() {
    const tagline = document.querySelector('.hero-tagline p');
    if (!tagline) return;

    const originalHTML = tagline.innerHTML;
    tagline.innerHTML = '';
    let charIndex = 0;
    const typeDelay = 35;

    function typeText() {
      if (charIndex < originalHTML.length) {
        if (originalHTML.charAt(charIndex) === '<') {
          const closingIndex = originalHTML.indexOf('>', charIndex);
          tagline.innerHTML += originalHTML.substring(charIndex, closingIndex + 1);
          charIndex = closingIndex + 1;
        } else {
          tagline.innerHTML += originalHTML.charAt(charIndex);
          charIndex++;
        }
        setTimeout(typeText, typeDelay);
      }
    }

    setTimeout(typeText, 1500);
  }

  // Start typing after preloader
  setTimeout(initTypingEffect, 800);

  // ─── SMOOTH ANCHOR LINKS ────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(target, { offset: -60 });
        } else {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // ─── THREE.JS HERO SCENE ───────────────────
  function initThreeScene() {
    if (typeof THREE === 'undefined') return;
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const container = canvas.parentElement;

    // ── Renderer ──
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // ── Scene & Camera ──
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.z = 5;

    function syncSize() {
      const w = container.offsetWidth;
      const h = container.offsetHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    syncSize();

    // ── Core geometry: nested wireframe icosahedra ──
    const icoOuter = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.0, 1),
      new THREE.MeshBasicMaterial({ color: 0x506383, wireframe: true, transparent: true, opacity: 0.55 })
    );

    const icoInner = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.52, 1),
      new THREE.MeshBasicMaterial({ color: 0xF0F0EE, wireframe: true, transparent: true, opacity: 0.2 })
    );

    scene.add(icoOuter, icoInner);

    // ── Particles on a spherical shell (Fibonacci distribution) ──
    const N = 180;
    const rawPos = new Float32Array(N * 3);
    const orbits = [];

    for (let i = 0; i < N; i++) {
      const phi   = Math.acos(1 - (2 * (i + 0.5)) / N);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r     = 1.55 + Math.random() * 0.75;

      rawPos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      rawPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      rawPos[i * 3 + 2] = r * Math.cos(phi);

      orbits.push({
        phi,
        theta: theta + Math.random() * 0.5,
        r,
        dTheta: (Math.random() - 0.5) * 0.005,
        dPhi:   (Math.random() - 0.5) * 0.004,
      });
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(rawPos, 3));
    const points = new THREE.Points(pGeo, new THREE.PointsMaterial({
      color: 0x7A899B, size: 0.028, transparent: true, opacity: 0.85, sizeAttenuation: true
    }));
    scene.add(points);

    // ── Connection lines between nearby particles ──
    const MAX_CONNECTIONS = 140;
    const MAX_DIST = 0.72;
    const connIdx = [];

    outer:
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const dx = rawPos[i*3]   - rawPos[j*3];
        const dy = rawPos[i*3+1] - rawPos[j*3+1];
        const dz = rawPos[i*3+2] - rawPos[j*3+2];
        if (dx*dx + dy*dy + dz*dz < MAX_DIST * MAX_DIST) {
          connIdx.push(i, j);
          if (connIdx.length / 2 >= MAX_CONNECTIONS) break outer;
        }
      }
    }

    const lBuf = new Float32Array(connIdx.length * 3);
    const lGeo = new THREE.BufferGeometry();
    lGeo.setAttribute('position', new THREE.BufferAttribute(lBuf, 3));
    const lineSegs = new THREE.LineSegments(lGeo,
      new THREE.LineBasicMaterial({ color: 0x506383, transparent: true, opacity: 0.2 })
    );
    scene.add(lineSegs);

    // ── Mouse parallax ──
    let tRotX = 0, tRotY = 0, cRotX = 0, cRotY = 0;
    document.addEventListener('mousemove', (e) => {
      tRotY = ((e.clientX / window.innerWidth)  - 0.5) * 0.55;
      tRotX = ((e.clientY / window.innerHeight) - 0.5) * 0.38;
    });

    // ── Animation loop ──
    const t0 = performance.now();

    function animate() {
      requestAnimationFrame(animate);
      const t = (performance.now() - t0) * 0.001;

      // Rotate icosahedra independently
      icoOuter.rotation.y =  t * 0.20;
      icoOuter.rotation.x =  t * 0.10;
      icoInner.rotation.y = -t * 0.25;
      icoInner.rotation.z =  t * 0.15;

      // Smooth parallax follow
      cRotX += (tRotX - cRotX) * 0.04;
      cRotY += (tRotY - cRotY) * 0.04;
      scene.rotation.x = cRotX;
      scene.rotation.y = cRotY;

      // Drift particles along their orbits
      const pos = pGeo.attributes.position.array;
      for (let i = 0; i < N; i++) {
        const o = orbits[i];
        o.theta += o.dTheta;
        o.phi   += o.dPhi;
        if (o.phi < 0.08)            { o.phi =  0.08;           o.dPhi *= -1; }
        if (o.phi > Math.PI - 0.08)  { o.phi = Math.PI - 0.08;  o.dPhi *= -1; }

        pos[i*3]     = o.r * Math.sin(o.phi) * Math.cos(o.theta);
        pos[i*3 + 1] = o.r * Math.sin(o.phi) * Math.sin(o.theta);
        pos[i*3 + 2] = o.r * Math.cos(o.phi);
      }
      pGeo.attributes.position.needsUpdate = true;

      // Update line segment endpoints
      const lb = lGeo.attributes.position.array;
      for (let k = 0; k < connIdx.length; k += 2) {
        const a = connIdx[k], b = connIdx[k + 1];
        const base = k * 3;
        lb[base]     = pos[a*3];     lb[base + 1] = pos[a*3 + 1]; lb[base + 2] = pos[a*3 + 2];
        lb[base + 3] = pos[b*3];     lb[base + 4] = pos[b*3 + 1]; lb[base + 5] = pos[b*3 + 2];
      }
      lGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    }

    animate();

    // Fade canvas in once running
    requestAnimationFrame(() => canvas.classList.add('ready'));

    window.addEventListener('resize', syncSize);
  }

  // ─── CHAT WIDGET ────────────────────────────────
  function initChatBar() {
    const wrap      = document.getElementById('chat-bar-wrap');
    const toggleBtn = document.getElementById('chat-bar-toggle-btn');
    const messages  = document.getElementById('chat-bar-messages');
    const input     = document.getElementById('chat-bar-input');
    const sendBtn   = document.getElementById('chat-bar-send-btn');

    if (!input || !sendBtn || !toggleBtn) return;

    let isOpen  = false;
    let greeted = false;

    function openBar() {
      isOpen = true;
      wrap.classList.add('open');
      toggleBtn.setAttribute('aria-label', 'Close chat');
      setTimeout(() => input.focus(), 260);
    }

    function closeBar() {
      isOpen = false;
      wrap.classList.remove('open');
      toggleBtn.setAttribute('aria-label', 'Open chat');
    }

    toggleBtn.addEventListener('click', () => isOpen ? closeBar() : openBar());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) closeBar();
    });

    // ── Auto-reply corpus ──
    const REPLIES = [
      { re: /\b(hi|hello|hey|sup|yo|howdy)\b/i,
        text: "Hey! 👋 I'm an AI stand-in for Feisal. Ask me about his work, services, or how to get in touch." },
      { re: /\b(service|offer|speciali[sz]|what do you do|capabilities|help with)\b/i,
        text: "Feisal does three things exceptionally well:\n\n→ AI Agent Engineering — LLM orchestration, RAG pipelines, autonomous agents\n→ Workflow Automation — replacing manual ops with intelligent systems\n→ Full-Stack Dev — Next.js apps built for scale\n\nAnything specific?" },
      { re: /\b(project|work|portfolio|built|made|example|nexbot|flowforge|datapulse|mindstack)\b/i,
        text: "Scroll up to the WORK section — NEXBOT AI, FlowForge, DataPulse, and MindStack. Each covers a different part of the AI/automation space. Want details on any one?" },
      { re: /\b(skill|tech|stack|language|framework|tool|python|react|node|langchain)\b/i,
        text: "Core stack:\n\nAI/LLM — LangChain · OpenAI · Claude · LlamaIndex\nFrontend — React · Next.js · TypeScript · GSAP\nBackend — Node.js · Python · FastAPI\nInfra — Supabase · Docker · AWS · Vercel" },
      { re: /\b(contact|hire|email|reach|talk|work together|quote|price|cost|rate|budget|avail|freelance|contract)\b/i,
        text: "Feisal's available for freelance & contract work — Q2 2026 onwards.\n\nBest way in: hello@fma.dev\nTypically responds within 24 hours. 🚀" },
      { re: /\b(about|who|background|story|experience|year|london)\b/i,
        text: "Feisal is a London-based Agent Engineer sitting at the intersection of AI, automation, and clean engineering.\n\n50+ projects · 3+ years · 15+ AI agents shipped.\n\nPhilosophy: understand deeply, engineer simply, ship with intention." },
      { re: /.*/,
        text: "Good question — for anything detailed, Feisal's the right person. Reach him at hello@fma.dev. He's pretty quick to respond." },
    ];

    function getReply(text) {
      return (REPLIES.find(r => r.re.test(text)) || REPLIES[REPLIES.length - 1]).text;
    }

    function timestamp() {
      return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function shrinkWrapBubble(el, text) {
      if (!window._pretext) return;
      const bubble = el.querySelector('.chat-msg-bubble');
      if (!bubble) return;
      const { prepareWithSegments, walkLineRanges } = window._pretext;
      const cs       = getComputedStyle(bubble);
      const fontStr  = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily.split(',')[0].trim().replace(/['"]/g, '')}`;
      const paddingH = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
      const wrapW    = wrap.offsetWidth || 400;
      const maxW     = wrapW * 0.84 - paddingH;
      if (maxW <= 0) return;
      const prepared = prepareWithSegments(text, fontStr, { whiteSpace: 'pre-wrap' });
      let maxLineW   = 0;
      walkLineRanges(prepared, maxW, line => { if (line.width > maxLineW) maxLineW = line.width; });
      bubble.style.width    = Math.ceil(maxLineW + paddingH) + 'px';
      bubble.style.maxWidth = '100%';
    }

    function appendMsg(text, role) {
      const el = document.createElement('div');
      el.className = `chat-msg chat-msg--${role}`;
      el.innerHTML = `<div class="chat-msg-bubble">${text.replace(/\n/g, '<br>')}</div><span class="chat-msg-time">${timestamp()}</span>`;
      messages.appendChild(el);
      messages.classList.add('has-messages');
      messages.scrollTop = messages.scrollHeight;
      shrinkWrapBubble(el, text);
    }

    function showTyping() {
      const el = document.createElement('div');
      el.className = 'chat-typing';
      el.innerHTML = '<span></span><span></span><span></span>';
      messages.appendChild(el);
      messages.classList.add('has-messages');
      messages.scrollTop = messages.scrollHeight;
      return el;
    }

    function send() {
      const text = input.value.trim();
      if (!text) return;
      if (!greeted) {
        greeted = true;
        appendMsg("Hey 👋 — ask me anything about Feisal's work, services, or how to get in touch.", 'bot');
      }
      appendMsg(text, 'user');
      input.value = '';
      input.style.height = 'auto';
      sendBtn.disabled = true;
      const typing = showTyping();
      setTimeout(() => {
        typing.remove();
        appendMsg(getReply(text), 'bot');
      }, 700 + Math.random() * 600);
    }

    input.addEventListener('input', () => {
      sendBtn.disabled = !input.value.trim();
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 160) + 'px';
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!sendBtn.disabled) send();
      }
    });

    sendBtn.addEventListener('click', send);

    // Greet after 8s — open bar and show greeting
    setTimeout(() => {
      if (!greeted) {
        greeted = true;
        openBar();
        appendMsg("Hey 👋 — ask me anything about Feisal's work, services, or how to get in touch.", 'bot');
      }
    }, 8000);
  }

  // ─── GHOST CURSORS (Live Presence Simulation) ───
  function initGhostCursors() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const NAMES   = ['alex', 'kai', 'sam', 'morgan', 'riley', 'drew', 'casey', 'jordan'];
    const PALETTE = [
      { fill: 'rgba(122,137,155,0.95)', bg: 'rgba(36,53,83,0.88)',  border: 'rgba(122,137,155,0.35)', text: '#a0b4c4' },
      { fill: 'rgba(80,99,131,0.95)',   bg: 'rgba(26,42,74,0.88)',  border: 'rgba(80,99,131,0.35)',   text: '#8fa3c0' },
      { fill: 'rgba(210,220,232,0.88)', bg: 'rgba(46,65,96,0.88)',  border: 'rgba(210,220,232,0.25)', text: '#c8d5e0' },
    ];

    // Live visitor badge
    const badge = document.createElement('div');
    badge.className = 'live-badge';
    badge.innerHTML = '<span class="live-badge-dot"></span><span class="live-badge-text">3 VIEWING</span>';
    document.body.appendChild(badge);

    const shuffled = [...NAMES].sort(() => Math.random() - 0.5);
    const ghosts   = [];

    for (let i = 0; i < 3; i++) {
      const c  = PALETTE[i];
      const el = document.createElement('div');
      el.className = 'ghost-cursor';
      el.innerHTML = `
        <svg width="18" height="22" viewBox="0 0 18 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.5 2L3.5 17.5L7.5 13.5L10.5 20L12.5 19L9.5 12.5L15 12.5Z"
                fill="${c.fill}" stroke="rgba(0,0,0,0.2)" stroke-width="0.5" stroke-linejoin="round"/>
        </svg>
        <span class="ghost-label" style="background:${c.bg};border-color:${c.border};color:${c.text}">${shuffled[i]}</span>
      `;
      document.body.appendChild(el);

      ghosts.push({
        el,
        colorIdx: i,
        x: window.innerWidth  * (0.15 + Math.random() * 0.7),
        y: window.innerHeight * (0.15 + Math.random() * 0.7),
        targetX: 0, targetY: 0,
        speed: 0.025 + Math.random() * 0.03,
        opacity: 0,
        state: 'entering',
        timer: 0,
        delay: i * 1800 + Math.random() * 500,
      });
    }

    function newTarget(g) {
      const pad = 60;
      g.targetX = pad + Math.random() * (window.innerWidth  - pad * 2);
      g.targetY = pad + Math.random() * (window.innerHeight - pad * 2);
    }

    let t0 = null;
    function tick(ts) {
      if (!t0) t0 = ts;
      const elapsed = ts - t0;

      ghosts.forEach(g => {
        if (elapsed < g.delay) return;

        if (g.state === 'entering') {
          g.opacity = Math.min(1, g.opacity + 0.016);
          if (g.opacity < 0.05) newTarget(g);
          if (g.opacity >= 0.99) g.state = 'moving';

        } else if (g.state === 'moving') {
          const dx = g.targetX - g.x, dy = g.targetY - g.y;
          g.x += dx * g.speed;
          g.y += dy * g.speed;
          if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
            g.state = 'idle';
            g.timer = 80 + Math.random() * 160;
          }

        } else if (g.state === 'idle') {
          g.x += (Math.random() - 0.5) * 0.4;
          g.y += (Math.random() - 0.5) * 0.4;
          if (--g.timer <= 0) {
            g.state = Math.random() < 0.08 ? 'leaving' : 'moving';
            if (g.state === 'moving') newTarget(g);
          }

        } else if (g.state === 'leaving') {
          g.opacity = Math.max(0, g.opacity - 0.012);
          if (g.opacity <= 0) {
            const taken   = ghosts.map(h => h.el.querySelector('.ghost-label')?.textContent);
            const fresh   = NAMES.filter(n => !taken.includes(n));
            const newName = fresh.length ? fresh[0] : NAMES[Math.floor(Math.random() * NAMES.length)];
            const lbl = g.el.querySelector('.ghost-label');
            if (lbl) lbl.textContent = newName;

            const edge = Math.floor(Math.random() * 4);
            g.x = edge === 0 ? Math.random() * window.innerWidth  : edge === 1 ? window.innerWidth  + 20 : edge === 2 ? Math.random() * window.innerWidth  : -20;
            g.y = edge === 0 ? -20 : edge === 1 ? Math.random() * window.innerHeight : edge === 2 ? window.innerHeight + 20 : Math.random() * window.innerHeight;
            g.delay = 0;
            g.state = 'entering';
          }
        }

        g.el.style.transform = `translate(${g.x}px,${g.y}px)`;
        g.el.style.opacity   = g.opacity;
      });

      requestAnimationFrame(tick);
    }

    // Start after hero entrance animations settle
    setTimeout(() => {
      badge.classList.add('visible');
      requestAnimationFrame(tick);
    }, 2500);

    // Occasionally flicker the visitor count for realism
    function flickerCount() {
      const n   = 2 + Math.floor(Math.random() * 4);
      const txt = badge.querySelector('.live-badge-text');
      if (txt) txt.textContent = `${n} VIEWING`;
      setTimeout(flickerCount, 9000 + Math.random() * 14000);
    }
    setTimeout(flickerCount, 6000);
  }

  // ─── CONSOLE BRANDING ──────────────────────
  console.log(
    '%c★ F.M.A — Agent Engineer & Vibe Coder',
    'color: #F0F0EE; font-size: 14px; font-weight: bold; background: #2E4160; padding: 10px 20px; border-radius: 6px;'
  );
  console.log(
    '%cDesigned & engineered with intention.',
    'color: #7A899B; font-size: 11px;'
  );
});
