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
  // Shader-displaced organic core (FBM 3D simplex noise) wrapped in a synced
  // wireframe shell, an outer halo, a soft-point particle constellation with
  // dynamic connections, and a post-process pass adding chromatic aberration,
  // glitch blocks, scanlines, vignette and a 6-tap soft halo bloom.
  // Mouse warps the noise field; click triggers an expanding shockwave ring.
  function initThreeScene() {
    if (typeof THREE === 'undefined') return;
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    try {
      const test = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!test) return;
    } catch (e) { return; }

    const container = canvas.parentElement;
    const isMobile  = window.innerWidth < 768 || navigator.maxTouchPoints > 0;
    const reduced   = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const dpr = isMobile ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !isMobile });
    renderer.setPixelRatio(dpr);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.z = 5;

    const renderTarget = new THREE.WebGLRenderTarget(1, 1, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType
    });

    const postScene  = new THREE.Scene();
    const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // ── Shared GLSL: 3D simplex noise + 4-octave FBM ──
    const NOISE_GLSL = `
      vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
      vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
      vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
      vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
      float snoise(vec3 v){
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        i = mod289(i);
        vec4 p = permute(permute(permute(
                  i.z + vec4(0.0, i1.z, i2.z, 1.0))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        vec4 x = x_ * ns.x + ns.yyyy;
        vec4 y = y_ * ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
        p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }
      float fbm(vec3 p){
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 4; i++) {
          v += a * snoise(p);
          p *= 2.0;
          a *= 0.5;
        }
        return v;
      }
    `;

    // ── Core organic mesh: shader-displaced icosahedron ──
    const coreSubdiv = isMobile ? 3 : 5;
    const coreGeo = new THREE.IcosahedronGeometry(1.0, coreSubdiv);
    coreGeo.computeVertexNormals();

    const coreUniforms = {
      uTime:     { value: 0 },
      uAmp:      { value: reduced ? 0.10 : 0.18 },
      uFreq:     { value: 1.4 },
      uMouse:    { value: new THREE.Vector3(0, 0, 1) },
      uMouseStr: { value: 0.0 },
      uShock:    { value: 0.0 },
      uColorA:   { value: new THREE.Color(0x2E4160) }, // deep navy
      uColorB:   { value: new THREE.Color(0x7A899B) }, // steel blue
      uColorRim: { value: new THREE.Color(0xF0F0EE) }, // off-white rim
    };

    const coreVert = `
      uniform float uTime;
      uniform float uAmp;
      uniform float uFreq;
      uniform vec3  uMouse;
      uniform float uMouseStr;
      uniform float uShock;
      varying vec3  vN;
      varying vec3  vWorldPos;
      varying float vDisp;
      ${NOISE_GLSL}
      void main() {
        vec3 p = position;
        vec3 n = normalize(normal);
        float t = uTime * 0.45;
        float disp = fbm(p * uFreq + vec3(0.0, 0.0, t));
        // Mouse-driven push: side facing the cursor swells outward
        float facing = max(0.0, dot(n, normalize(uMouse + vec3(0.0001))));
        disp += facing * uMouseStr * 0.55;
        // Shockwave: ring of displacement expanding from the center
        float r = length(p);
        float ring = exp(-pow((r - uShock * 1.6) * 4.0, 2.0)) * uShock;
        disp += ring * 0.7;
        vDisp = disp;
        vec3 displaced = p + n * disp * uAmp;
        vec4 mv = modelViewMatrix * vec4(displaced, 1.0);
        vWorldPos = (modelMatrix * vec4(displaced, 1.0)).xyz;
        vN = normalize(normalMatrix * n);
        gl_Position = projectionMatrix * mv;
      }
    `;

    const coreMat = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: coreUniforms,
      vertexShader: coreVert,
      fragmentShader: `
        precision highp float;
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        uniform vec3 uColorRim;
        varying vec3  vN;
        varying vec3  vWorldPos;
        varying float vDisp;
        void main() {
          vec3 V = normalize(cameraPosition - vWorldPos);
          float fres = pow(1.0 - max(0.0, dot(vN, V)), 2.5);
          float t = clamp(vDisp * 0.5 + 0.5, 0.0, 1.0);
          vec3 base = mix(uColorA, uColorB, t);
          vec3 col  = mix(base, uColorRim, fres * 0.85);
          // Faint horizontal data-band on the rim
          float band = 0.04 * sin(vWorldPos.y * 22.0);
          col += band * fres;
          gl_FragColor = vec4(col, 0.92);
        }
      `,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    // Wireframe shell sharing the SAME uniforms/vertex shader so it deforms in lockstep
    const wireMat = new THREE.ShaderMaterial({
      transparent: true,
      wireframe: true,
      uniforms: coreUniforms,
      vertexShader: coreVert,
      fragmentShader: `
        precision highp float;
        varying float vDisp;
        void main() {
          float a = 0.32 + vDisp * 0.45;
          gl_FragColor = vec4(0.94, 0.94, 0.93, clamp(a, 0.06, 0.55));
        }
      `,
    });
    const wireMesh = new THREE.Mesh(coreGeo, wireMat);
    wireMesh.scale.setScalar(1.018); // slight outset to avoid z-fighting
    scene.add(wireMesh);

    // ── Outer floating halo shell — slow counter-rotation ──
    const halo = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.55, 1),
      new THREE.MeshBasicMaterial({ color: 0x506383, wireframe: true, transparent: true, opacity: 0.32 })
    );
    scene.add(halo);

    // ── Particle constellation (soft round shader points) ──
    const N           = isMobile ? 90  : 200;
    const MAX_CONN    = isMobile ? 60  : 160;
    const MAX_DIST_SQ = isMobile ? 0.70 : 0.55;
    const rawPos = new Float32Array(N * 3);
    const seeds  = new Float32Array(N);
    const orbits = [];

    for (let i = 0; i < N; i++) {
      const phi   = Math.acos(1 - (2 * (i + 0.5)) / N);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r     = 1.85 + Math.random() * 0.85;
      rawPos[i*3]     = r * Math.sin(phi) * Math.cos(theta);
      rawPos[i*3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      rawPos[i*3 + 2] = r * Math.cos(phi);
      seeds[i] = Math.random();
      orbits.push({
        phi,
        theta: theta + Math.random() * 0.5,
        r,
        dTheta: (Math.random() - 0.5) * (isMobile ? 0.004 : 0.005),
        dPhi:   (Math.random() - 0.5) * (isMobile ? 0.003 : 0.004),
      });
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(rawPos, 3));
    pGeo.setAttribute('seed',     new THREE.BufferAttribute(seeds,  1));

    const pMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime:    { value: 0 },
        uPxRatio: { value: dpr },
        uColor:   { value: new THREE.Color(0xC8D0DA) },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uPxRatio;
        attribute float seed;
        varying float vSeed;
        void main() {
          vSeed = seed;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          float pulse = 0.6 + 0.4 * sin(uTime * 2.0 + seed * 6.2831);
          float s = (3.0 + seed * 4.5) * pulse * uPxRatio;
          gl_PointSize = s * (1.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        precision highp float;
        uniform vec3 uColor;
        varying float vSeed;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          float a = smoothstep(0.5, 0.05, d);
          a += smoothstep(0.18, 0.0, d) * 0.6; // bright core
          gl_FragColor = vec4(uColor, a * (0.55 + vSeed * 0.45));
        }
      `,
    });
    const points = new THREE.Points(pGeo, pMat);
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
      new THREE.LineBasicMaterial({ color: 0x506383, transparent: true, opacity: 0.18 })
    ));

    // ── Post-process: glitch + chromatic aberration + soft halo + scanlines + vignette ──
    const postMat = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        tDiffuse:    { value: renderTarget.texture },
        uTime:       { value: 0 },
        uGlitch:     { value: 0 },
        uResolution: { value: new THREE.Vector2(1, 1) }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
      `,
      fragmentShader: `
        precision highp float;
        uniform sampler2D tDiffuse;
        uniform float uTime;
        uniform float uGlitch;
        uniform vec2  uResolution;
        varying vec2 vUv;
        float rand(vec2 co){ return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453); }
        void main() {
          vec2 uv = vUv;

          // Block displacement glitch
          float blockY = floor(uv.y * 22.0);
          float blockNoise = rand(vec2(blockY, floor(uTime * 9.0)));
          float displace = (blockNoise - 0.5) * uGlitch * 0.08;
          uv.x += step(0.65, blockNoise) * displace;

          // Radial chromatic aberration — stronger at edges & during glitches
          vec2 dir = uv - 0.5;
          float dist = length(dir);
          float ab = (0.0028 + uGlitch * 0.025) * dist;
          vec4 r = texture2D(tDiffuse, uv + dir * ab);
          vec4 g = texture2D(tDiffuse, uv);
          vec4 b = texture2D(tDiffuse, uv - dir * ab);
          vec4 col;
          col.r = r.r; col.g = g.g; col.b = b.b;
          col.a = max(max(r.a, g.a), b.a);

          // Soft halo bloom — 6 radial taps, threshold bright pixels, additive
          vec3  glow = vec3(0.0);
          const int TAPS = 6;
          for (int i = 0; i < TAPS; i++) {
            float a = 6.2831853 * float(i) / float(TAPS);
            vec2 off = vec2(cos(a), sin(a)) * 0.014;
            vec4 s = texture2D(tDiffuse, vUv + off);
            float l = max(s.r, max(s.g, s.b));
            float thresh = smoothstep(0.55, 1.0, l);
            glow += s.rgb * thresh * s.a;
          }
          glow /= float(TAPS);
          col.rgb += glow * 0.85;
          col.a   = max(col.a, length(glow) * 0.55);

          // Scanlines (subtle)
          float scan = sin(vUv.y * uResolution.y * 1.4) * 0.05;
          col.rgb -= scan * col.a;

          // Edge vignette
          col.rgb *= 1.0 - dist * 0.32;

          // Glitch noise burst
          float burst = step(0.985, rand(vec2(floor(uTime * 30.0), 0.0))) * uGlitch;
          col.rgb += burst * 0.15;

          gl_FragColor = col;
        }
      `
    });
    postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMat));

    function syncSize() {
      const w = container.offsetWidth  || 1;
      const h = container.offsetHeight || 1;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderTarget.setSize(w * dpr, h * dpr);
      postMat.uniforms.uResolution.value.set(w * dpr, h * dpr);
      pMat.uniforms.uPxRatio.value = dpr;
    }
    syncSize();

    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(syncSize).observe(container);
    } else {
      window.addEventListener('resize', syncSize, { passive: true });
    }

    // ── Interactions: mouse parallax + cursor-driven displacement ──
    let tRotX = 0, tRotY = 0, cRotX = 0, cRotY = 0;
    const mouseVec = new THREE.Vector3(0, 0, 1);
    let mouseStrTarget = 0, mouseStrCurrent = 0;
    let lastMouseMove = 0;

    if (!isMobile) {
      document.addEventListener('mousemove', (e) => {
        const nx = (e.clientX / window.innerWidth)  - 0.5;
        const ny = (e.clientY / window.innerHeight) - 0.5;
        tRotY = nx * 0.55;
        tRotX = ny * 0.38;
        // Direction from origin toward cursor in scene space
        mouseVec.set(nx * 2.5, -ny * 2.5, 1.0).normalize();
        // Push harder when cursor is over the canvas
        const rect = canvas.getBoundingClientRect();
        const inside =
          e.clientX >= rect.left && e.clientX <= rect.right &&
          e.clientY >= rect.top  && e.clientY <= rect.bottom;
        mouseStrTarget = inside ? 1.0 : 0.22;
        lastMouseMove = performance.now();
      });
    } else {
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
        mouseStrTarget = 0.6;
      }, { passive: true });
      canvas.addEventListener('touchend', () => {
        lastTX = null; lastTY = null;
        mouseStrTarget = 0.0;
      });
      if (typeof DeviceOrientationEvent !== 'undefined') {
        window.addEventListener('deviceorientation', (e) => {
          if (e.gamma == null) return;
          tRotY = (e.gamma / 45) * 0.4;
          tRotX = (e.beta  / 90) * 0.25;
        }, { passive: true });
      }
    }

    // ── Glitch pulse system (declared before fireShock so closures can reach it) ──
    let glitchTarget = 0, glitchUntil = 0;
    function triggerGlitch(strength = 1.0, duration = 320) {
      glitchTarget = strength;
      glitchUntil  = performance.now() + duration;
      document.querySelectorAll('.glitch-text').forEach(el => {
        el.classList.remove('glitching');
        void el.offsetWidth;
        el.classList.add('glitching');
        setTimeout(() => el.classList.remove('glitching'), 600);
      });
    }
    window.__follyGlitch = triggerGlitch;

    // Click / tap → expanding shockwave + glitch burst
    let shockUntil = 0;
    const SHOCK_DUR = 900;
    function fireShock() {
      shockUntil = performance.now() + SHOCK_DUR;
      triggerGlitch(1.0, 380);
    }
    canvas.addEventListener('click', fireShock);
    canvas.addEventListener('touchstart', fireShock, { passive: true });

    let paused = false;
    document.addEventListener('visibilitychange', () => { paused = document.hidden; });

    setTimeout(() => triggerGlitch(1.0, 380), 600);
    function scheduleNextGlitch() {
      const wait = 5000 + Math.random() * 4000;
      setTimeout(() => {
        if (!document.hidden) triggerGlitch(0.7 + Math.random() * 0.4, 260);
        scheduleNextGlitch();
      }, wait);
    }
    scheduleNextGlitch();

    // ── Animation loop ──
    const t0 = performance.now();
    function animate() {
      requestAnimationFrame(animate);
      if (paused) return;

      const now = performance.now();
      const t   = (now - t0) * 0.001;

      halo.rotation.y =  t * 0.10;
      halo.rotation.x = -t * 0.06;
      coreMesh.rotation.y = t * 0.12;
      coreMesh.rotation.x = t * 0.05;
      wireMesh.rotation.copy(coreMesh.rotation);

      cRotX += (tRotX - cRotX) * 0.04;
      cRotY += (tRotY - cRotY) * 0.04;
      scene.rotation.x = cRotX;
      scene.rotation.y = cRotY;

      // Decay cursor influence when the mouse is idle
      if (now - lastMouseMove > 600) mouseStrTarget *= 0.96;
      mouseStrCurrent += (mouseStrTarget - mouseStrCurrent) * 0.08;
      coreUniforms.uMouse.value.copy(mouseVec);
      coreUniforms.uMouseStr.value = mouseStrCurrent;

      // Shockwave decay
      const shockRem = Math.max(0, shockUntil - now);
      coreUniforms.uShock.value = shockRem > 0 ? shockRem / SHOCK_DUR : 0;

      coreUniforms.uTime.value = t;
      pMat.uniforms.uTime.value = t;

      // Particle orbits
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

      // Glitch decay back to idle baseline
      const idleGlitch = 0.04;
      if (now > glitchUntil) glitchTarget = idleGlitch;
      const cur = postMat.uniforms.uGlitch.value;
      postMat.uniforms.uGlitch.value = cur + (glitchTarget - cur) * 0.25;
      postMat.uniforms.uTime.value   = t;

      // Two-pass render: scene → renderTarget → post quad → canvas
      renderer.setRenderTarget(renderTarget);
      renderer.clear();
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);
      renderer.clear();
      renderer.render(postScene, postCamera);
    }

    animate();
    requestAnimationFrame(() => canvas.classList.add('ready'));
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
