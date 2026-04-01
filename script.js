/* ===========================================
   F.M.A PORTFOLIO — Award-Winning Interactions
   GSAP ScrollTrigger + Lenis Smooth Scroll
   =========================================== */

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
  let scrollDirection = 'up';

  function handleNavScroll() {
    const currentY = window.scrollY || document.documentElement.scrollTop;

    if (currentY > 100) {
      navbar.style.background = 'rgba(46, 65, 96, 0.92)';
    } else {
      navbar.style.background = 'rgba(46, 65, 96, 0.6)';
    }

    // Hide/show on scroll direction
    if (currentY > lastScrollY && currentY > 200) {
      navbar.classList.add('hidden');
      scrollDirection = 'down';
    } else {
      navbar.classList.remove('hidden');
      scrollDirection = 'up';
    }

    lastScrollY = currentY;
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });

  // ─── MOBILE NAV ─────────────────────────────
  const mobileToggle = document.getElementById('nav-mobile-toggle');
  const navLinks = document.getElementById('nav-links');
  let menuOpen = false;

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      menuOpen = !menuOpen;

      if (menuOpen) {
        navLinks.classList.add('open');
        mobileToggle.children[0].style.transform = 'rotate(45deg) translate(3px, 3px)';
        mobileToggle.children[1].style.transform = 'rotate(-45deg)';
        if (lenis) lenis.stop();
      } else {
        navLinks.classList.remove('open');
        mobileToggle.children[0].style.transform = '';
        mobileToggle.children[1].style.transform = '';
        if (lenis) lenis.start();
      }
    });

    // Close menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (menuOpen) {
          menuOpen = false;
          navLinks.classList.remove('open');
          mobileToggle.children[0].style.transform = '';
          mobileToggle.children[1].style.transform = '';
          if (lenis) lenis.start();
        }
      });
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

      gsap.fromTo(el,
        { textContent: 0 },
        {
          textContent: target,
          duration: 2,
          ease: 'power2.out',
          snap: { textContent: 1 },
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
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

    // ── WebGL support check ──
    try {
      const test = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!test) return; // silently skip — glow still shows
    } catch (e) { return; }

    const container = canvas.parentElement;
    const isMobile  = window.innerWidth < 768 || navigator.maxTouchPoints > 0;

    // ── Renderer ──
    // On old iPhones cap pixel ratio at 1 to avoid GPU overload
    const dpr = isMobile ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !isMobile });
    renderer.setPixelRatio(dpr);

    // ── Scene & Camera ──
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.z = 5;

    function syncSize() {
      const w = container.offsetWidth  || 1;
      const h = container.offsetHeight || 1;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    syncSize();

    // ── ResizeObserver — fires on container resize, not just window ──
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(syncSize).observe(container);
    } else {
      window.addEventListener('resize', syncSize, { passive: true });
    }

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

    // ── Particles — fewer on mobile for performance ──
    const N           = isMobile ? 80  : 180;
    const MAX_CONN    = isMobile ? 50  : 140;
    const MAX_DIST_SQ = isMobile ? 0.64 : 0.5184; // 0.8² vs 0.72²
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
        dTheta: (Math.random() - 0.5) * (isMobile ? 0.004 : 0.005),
        dPhi:   (Math.random() - 0.5) * (isMobile ? 0.003 : 0.004),
      });
    }

    const pGeo   = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(rawPos, 3));
    const points = new THREE.Points(pGeo, new THREE.PointsMaterial({
      color: 0x7A899B, size: 0.028, transparent: true, opacity: 0.85, sizeAttenuation: true
    }));
    scene.add(points);

    // ── Connection lines ──
    const connIdx = [];
    outer:
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const dx = rawPos[i*3]   - rawPos[j*3];
        const dy = rawPos[i*3+1] - rawPos[j*3+1];
        const dz = rawPos[i*3+2] - rawPos[j*3+2];
        if (dx*dx + dy*dy + dz*dz < MAX_DIST_SQ) {
          connIdx.push(i, j);
          if (connIdx.length / 2 >= MAX_CONN) break outer;
        }
      }
    }

    const lBuf = new Float32Array(connIdx.length * 3);
    const lGeo = new THREE.BufferGeometry();
    lGeo.setAttribute('position', new THREE.BufferAttribute(lBuf, 3));
    scene.add(new THREE.LineSegments(lGeo,
      new THREE.LineBasicMaterial({ color: 0x506383, transparent: true, opacity: 0.2 })
    ));

    // ── Parallax — mouse on desktop, touch/gyro on mobile ──
    let tRotX = 0, tRotY = 0, cRotX = 0, cRotY = 0;

    if (!isMobile) {
      document.addEventListener('mousemove', (e) => {
        tRotY = ((e.clientX / window.innerWidth)  - 0.5) * 0.55;
        tRotX = ((e.clientY / window.innerHeight) - 0.5) * 0.38;
      });
    } else {
      // Touch drag parallax
      let lastTX = null, lastTY = null;
      canvas.addEventListener('touchmove', (e) => {
        const t = e.touches[0];
        if (lastTX !== null) {
          tRotY += (t.clientX - lastTX) * 0.003;
          tRotX += (t.clientY - lastTY) * 0.002;
          tRotY = Math.max(-0.5, Math.min(0.5, tRotY));
          tRotX = Math.max(-0.35, Math.min(0.35, tRotX));
        }
        lastTX = t.clientX; lastTY = t.clientY;
      }, { passive: true });
      canvas.addEventListener('touchend', () => { lastTX = null; lastTY = null; });

      // Device orientation (gyroscope) if available
      if (typeof DeviceOrientationEvent !== 'undefined') {
        window.addEventListener('deviceorientation', (e) => {
          if (e.gamma == null) return;
          tRotY = (e.gamma / 45) * 0.4;   // left/right tilt
          tRotX = (e.beta  / 90) * 0.25;  // forward/back tilt
        }, { passive: true });
      }
    }

    // ── Pause when tab hidden (saves battery on mobile) ──
    let paused = false;
    document.addEventListener('visibilitychange', () => {
      paused = document.hidden;
    });

    // ── Animation loop ──
    const t0 = performance.now();

    function animate() {
      requestAnimationFrame(animate);
      if (paused) return;

      const t = (performance.now() - t0) * 0.001;

      icoOuter.rotation.y =  t * 0.20;
      icoOuter.rotation.x =  t * 0.10;
      icoInner.rotation.y = -t * 0.25;
      icoInner.rotation.z =  t * 0.15;

      cRotX += (tRotX - cRotX) * 0.04;
      cRotY += (tRotY - cRotY) * 0.04;
      scene.rotation.x = cRotX;
      scene.rotation.y = cRotY;

      const pos = pGeo.attributes.position.array;
      for (let i = 0; i < N; i++) {
        const o = orbits[i];
        o.theta += o.dTheta;
        o.phi   += o.dPhi;
        if (o.phi < 0.08)           { o.phi = 0.08;            o.dPhi *= -1; }
        if (o.phi > Math.PI - 0.08) { o.phi = Math.PI - 0.08;  o.dPhi *= -1; }
        pos[i*3]     = o.r * Math.sin(o.phi) * Math.cos(o.theta);
        pos[i*3 + 1] = o.r * Math.sin(o.phi) * Math.sin(o.theta);
        pos[i*3 + 2] = o.r * Math.cos(o.phi);
      }
      pGeo.attributes.position.needsUpdate = true;

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
    requestAnimationFrame(() => canvas.classList.add('ready'));
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
