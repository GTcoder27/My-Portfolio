/* ============================================================
   GIRISH NANDANWAR PORTFOLIO - app.js
   Three.js scenes, GSAP animations, interactivity
============================================================ */

'use strict';

// ============================================================
// 1. GSAP SETUP
// ============================================================
gsap.registerPlugin(ScrollTrigger);

// ============================================================
// 1b. THREE.JS - GLOBAL STARFIELD (full-page fixed background)
// ============================================================
(function initStarsBackground() {
    const canvas = document.getElementById('stars-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x0b0820, 1); // deep purple-space bg color

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 1;

    // ---- Star layers ----
    // Layer 1: many tiny distant stars
    function makeStarLayer(count, size, spread, color, opacity) {
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count * 3; i += 3) {
            pos[i] = (Math.random() - 0.5) * spread;
            pos[i + 1] = (Math.random() - 0.5) * spread;
            pos[i + 2] = (Math.random() - 0.5) * spread * 0.1; // shallow Z so they fill screen
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({
            size,
            color,
            transparent: true,
            opacity,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
        return new THREE.Points(geo, mat);
    }

    // Tiny distant dim stars
    const layer1 = makeStarLayer(300, 0.003, 5, 0xccbbff, 0.55);
    // Medium bluish stars
    const layer2 = makeStarLayer(150, 0.005, 4, 0x99aaff, 0.65);
    // Bright glowing accent stars
    const layer3 = makeStarLayer(60, 0.009, 4, 0xffffff, 0.9);
    // Pinkish/magenta accent stars
    const layer4 = makeStarLayer(40, 0.008, 4, 0xdd88ff, 0.75);
    // Cyan accent stars
    const layer5 = makeStarLayer(30, 0.008, 4, 0x88ccff, 0.8);

    scene.add(layer1, layer2, layer3, layer4, layer5);

    // ---- Twinkle animation data ----
    // We'll animate opacity of different layers to simulate twinkling
    const layers = [layer1, layer2, layer3, layer4, layer5];
    const baseOpacities = [0.55, 0.65, 0.9, 0.75, 0.8];
    const twinkleOffsets = layers.map(() => Math.random() * Math.PI * 2);
    const twinkleSpeeds = [0.4, 0.6, 0.9, 0.5, 0.7];
    const twinkleDepths = [0.15, 0.2, 0.3, 0.2, 0.25];

    // Slow parallax on mouse
    let targetRX = 0, targetRY = 0;
    window.addEventListener('mousemove', e => {
        targetRX = -(e.clientY / window.innerHeight - 0.5) * 0.06;
        targetRY = (e.clientX / window.innerWidth - 0.5) * 0.06;
    });

    // Scroll drift — stars drift slightly as the page scrolls
    let scrollY = 0;
    window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

    const clock = new THREE.Clock();
    let currentRX = 0, currentRY = 0;

    function animateStars() {
        requestAnimationFrame(animateStars);
        const t = clock.getElapsedTime();

        // Smooth mouse parallax rotation
        currentRX += (targetRX - currentRX) * 0.04;
        currentRY += (targetRY - currentRY) * 0.04;

        const scrollFactor = scrollY * 0.00008;

        layers.forEach((layer, i) => {
            // Scroll drift: each layer moves at a different rate (parallax depth)
            layer.position.y = -scrollFactor * (i + 1) * 0.6;
            // Subtle rotation following mouse
            layer.rotation.x = currentRX * (i * 0.3 + 0.5);
            layer.rotation.y = currentRY * (i * 0.3 + 0.5);
            // Twinkle — vary opacity sinusoidally
            const tOpa = baseOpacities[i] + Math.sin(t * twinkleSpeeds[i] + twinkleOffsets[i]) * twinkleDepths[i];
            layer.material.opacity = Math.max(0, Math.min(1, tOpa));
        });

        renderer.render(scene, camera);
    }
    animateStars();

    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }, { passive: true });
})();

// ============================================================
// 2. SCROLL PROGRESS BAR
// ============================================================
const scrollBar = document.getElementById('scroll-progress');
window.addEventListener('scroll', () => {
    const scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    scrollBar.style.width = scrolled + '%';
});

// ============================================================
// 3. CURSOR GLOW
// ============================================================
const cursorGlow = document.getElementById('cursor-glow');
window.addEventListener('mousemove', e => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
});
// Show default cursor in interactive elements
document.querySelectorAll('a, button, input, textarea, .skill-card, .project-card').forEach(el => {
    el.style.cursor = 'pointer';
});

// ============================================================
// 4. HEADER SCROLL BEHAVIOR
// ============================================================
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
});

// ============================================================
// 5. MOBILE MENU
// ============================================================
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');

menuToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    const spans = menuToggle.querySelectorAll('span');
    if (!mobileMenu.classList.contains('hidden')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
        spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
});

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
            mobileMenu.classList.add('hidden');
            const spans = menuToggle.querySelectorAll('span');
            spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ============================================================
// 6. TYPEWRITER EFFECT
// ============================================================
const typeEl = document.getElementById('typewriter');
const titles = ['Competetive Programmer', 'AI Engineer', 'Full Stack Dev', 'Computer Vision Expert'];
let tIdx = 0, cIdx = 0, deleting = false;

function typeWrite() {
    const current = titles[tIdx];
    if (deleting) {
        typeEl.textContent = current.substring(0, cIdx--);
        if (cIdx < 0) {
            deleting = false;
            tIdx = (tIdx + 1) % titles.length;
            setTimeout(typeWrite, 500);
        } else setTimeout(typeWrite, 45);
    } else {
        typeEl.textContent = current.substring(0, cIdx++);
        if (cIdx > current.length) {
            deleting = true;
            setTimeout(typeWrite, 1400);
        } else setTimeout(typeWrite, 95);
    }
}
typeWrite();

// ============================================================
// 7. COUNTER ANIMATION (About section stats)
// ============================================================
function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'));
    const duration = 2000;
    const start = performance.now();
    function update(t) {
        const progress = Math.min((t - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 4);
        el.textContent = Math.floor(ease * target);
        if (progress < 1) requestAnimationFrame(update);
        else el.textContent = target;
    }
    requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            document.querySelectorAll('.stat-num').forEach(animateCounter);
            counterObserver.disconnect();
        }
    });
}, { threshold: 0.5 });

const statsEl = document.querySelector('.about-stats');
if (statsEl) counterObserver.observe(statsEl);

// ============================================================
// 8. SKILL BAR ANIMATION
// ============================================================
const skillObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            document.querySelectorAll('.skill-fill').forEach(fill => {
                const w = fill.getAttribute('data-width');
                // Delay long enough for GSAP card entrance animation to run first
                setTimeout(() => { fill.style.width = w + '%'; }, 800);
            });
            skillObserver.disconnect();
        }
    });
}, { threshold: 0.3 });

const skillsSection = document.getElementById('skills');
if (skillsSection) skillObserver.observe(skillsSection);

// ============================================================
// 9. GSAP SCROLL ANIMATIONS
// ============================================================
window.addEventListener('load', () => {
    // Hero text entrance
    gsap.from('.hero-badge', { opacity: 0, y: 20, duration: 0.8, delay: 0.2 });
    gsap.from('.hero-greeting', { opacity: 0, y: 20, duration: 0.8, delay: 0.35 });
    gsap.from('.hero-name', { opacity: 0, y: 30, duration: 0.9, delay: 0.5 });
    gsap.from('.hero-title', { opacity: 0, y: 25, duration: 0.8, delay: 0.65 });
    gsap.from('.hero-bio', { opacity: 0, y: 20, duration: 0.8, delay: 0.8 });
    gsap.from('.hero-actions', { opacity: 0, y: 20, duration: 0.8, delay: 1.0 });
    gsap.from('.profile-3d-wrapper', { opacity: 0, scale: 0.85, duration: 1.2, delay: 0.7, ease: 'back.out(1.4)' });

    // Section headers
    gsap.utils.toArray('.section-header').forEach(el => {
        gsap.from(el, {
            scrollTrigger: { trigger: el, start: 'top 80%' },
            opacity: 0, y: 40, duration: 0.9
        });
    });

    // About section
    gsap.from('.about-text-card', {
        scrollTrigger: { trigger: '.about-grid', start: 'top 75%' },
        opacity: 0, x: -50, duration: 0.9, ease: 'power3.out'
    });
    gsap.from('#about-canvas', {
        scrollTrigger: { trigger: '.about-grid', start: 'top 75%' },
        opacity: 0, x: 50, duration: 0.9, ease: 'power3.out', delay: 0.2
    });

    // Skill cards stagger — use fromTo so cards always end at fully visible state
    gsap.fromTo('.skill-card',
        { opacity: 0, y: 30, scale: 0.9 },
        {
            opacity: 1, y: 0, scale: 1,
            stagger: 0.06, duration: 0.6, ease: 'back.out(1.5)',
            scrollTrigger: {
                trigger: '.skills-grid',
                start: 'top 85%',
                once: true,
            }
        }
    );

    // Project cards – BIDIRECTIONAL slide from left
    // Each card gets its own ScrollTrigger so they animate independently on scroll direction
    gsap.utils.toArray('.project-card').forEach((card, i) => {
        gsap.fromTo(card,
            { x: '-120%', opacity: 0 },       // start: off-screen left
            {
                x: '0%',
                opacity: 1,
                duration: 0.75,
                delay: i * 0.12,               // stagger per card
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: card,
                    start: 'top 88%',          // enter viewport
                    end: 'top 20%',
                    // scroll DOWN → play (slide in)
                    // scroll UP  → reverse (slide out to left)
                    toggleActions: 'play reverse play reverse',
                },
            }
        );
    });

    // Contact grid
    gsap.from('.contact-info', {
        scrollTrigger: { trigger: '.contact-grid', start: 'top 80%' },
        opacity: 0, x: -40, duration: 0.9, ease: 'power3.out'
    });
    gsap.from('.contact-form', {
        scrollTrigger: { trigger: '.contact-grid', start: 'top 80%' },
        opacity: 0, x: 40, duration: 0.9, ease: 'power3.out', delay: 0.15
    });

    // Achievements: LeetCode card from left, Codeforces card from right
    gsap.from('#leetcode-card', {
        scrollTrigger: { trigger: '.coding-profiles-grid', start: 'top 80%' },
        opacity: 0, x: -60, duration: 0.9, ease: 'power3.out'
    });
    gsap.from('#cf-card', {
        scrollTrigger: { trigger: '.coding-profiles-grid', start: 'top 80%' },
        opacity: 0, x: 60, duration: 0.9, ease: 'power3.out', delay: 0.15
    });
    gsap.from('.coding-banner', {
        scrollTrigger: { trigger: '.coding-banner', start: 'top 85%' },
        opacity: 0, y: 30, duration: 0.8, ease: 'power3.out'
    });

    // Refresh all ScrollTriggers after full page load so positions are correct
    ScrollTrigger.refresh();
});

// ============================================================
// 9b. ACHIEVEMENTS - SVG RINGS + STAT COUNTERS
// ============================================================
(function initAchievementsAnimations() {
    let triggered = false;

    function animatePlatformCounter(el) {
        const target = parseInt(el.getAttribute('data-target'));
        if (!target) return;
        const dur = 1800;
        const start = performance.now();
        function tick(now) {
            const p = Math.min((now - start) / dur, 1);
            const ease = 1 - Math.pow(1 - p, 4);
            el.textContent = Math.floor(ease * target);
            if (p < 1) requestAnimationFrame(tick);
            else el.textContent = target;
        }
        requestAnimationFrame(tick);
    }

    function animateRings() {
        document.querySelectorAll('.ring-fill').forEach(ring => {
            const pct = parseFloat(ring.getAttribute('data-pct')) / 100;
            const circumference = 201; // 2 * π * 32
            const offset = circumference * (1 - pct);
            ring.style.strokeDashoffset = offset;
        });
        // Counters inside rings
        document.querySelectorAll('.ring-num').forEach(animatePlatformCounter);
        // All pstat-val counters
        document.querySelectorAll('.pstat-val').forEach(animatePlatformCounter);
    }

    const achSection = document.getElementById('achievements');
    if (achSection) {
        const obs = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && !triggered) {
                triggered = true;
                animateRings();
                obs.disconnect();
            }
        }, { threshold: 0.25 });
        obs.observe(achSection);
    }
})();

// (Hero canvas removed — global starfield provides the home section background)

// ============================================================
// 11. THREE.JS - ABOUT SECTION ANIMATED TORUS SCENE
// ============================================================
(function initAboutThree() {
    const canvas = document.getElementById('about-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x050816, 1);

    const scene = new THREE.Scene();
    const w = canvas.parentElement.clientWidth || 600;
    const h = 400;
    renderer.setSize(w, h);
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    camera.position.z = 5;

    // Torus knot
    const knotGeo = new THREE.TorusKnotGeometry(1.2, 0.35, 150, 20);
    const knotMat = new THREE.MeshPhongMaterial({
        color: 0x7c3aed,
        emissive: 0x200050,
        specular: 0x00f5d4,
        shininess: 120,
        wireframe: false,
    });
    const knot = new THREE.Mesh(knotGeo, knotMat);
    scene.add(knot);

    // Wireframe overlay
    const wireGeo = new THREE.TorusKnotGeometry(1.25, 0.36, 100, 16);
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x00f5d4, wireframe: true, transparent: true, opacity: 0.15 });
    const wire = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wire);

    // Floating particles
    const partGeo = new THREE.BufferGeometry();
    const partCount = 1500;
    const partPos = new Float32Array(partCount * 3);
    for (let i = 0; i < partCount * 3; i++) partPos[i] = (Math.random() - 0.5) * 10;
    partGeo.setAttribute('position', new THREE.BufferAttribute(partPos, 3));
    const partMat = new THREE.PointsMaterial({ size: 0.018, color: 0x7c3aed, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending });
    scene.add(new THREE.Points(partGeo, partMat));

    // Lights
    scene.add(new THREE.AmbientLight(0x200040, 2));
    const light1 = new THREE.PointLight(0x7c3aed, 4, 15);
    light1.position.set(3, 3, 3);
    scene.add(light1);
    const light2 = new THREE.PointLight(0x00f5d4, 3, 15);
    light2.position.set(-3, -3, 2);
    scene.add(light2);

    let mouseX = 0, mouseY = 0;
    canvas.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        mouseY = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
    });

    const clock = new THREE.Clock();
    function animate() {
        const t = clock.getElapsedTime();
        requestAnimationFrame(animate);
        knot.rotation.x = t * 0.3 + mouseY * 0.3;
        knot.rotation.y = t * 0.4 + mouseX * 0.3;
        wire.rotation.x = knot.rotation.x;
        wire.rotation.y = knot.rotation.y;
        light1.position.x = Math.sin(t * 0.7) * 3;
        light1.position.y = Math.cos(t * 0.5) * 3;
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        const nw = canvas.parentElement.clientWidth || 600;
        renderer.setSize(nw, h);
        camera.aspect = nw / h;
        camera.updateProjectionMatrix();
    });
})();

// ============================================================
// 12. THREE.JS - SKILLS SECTION FLOATING GEOMETRY
// ============================================================
(function initSkillsThree() {
    const canvas = document.getElementById('skills-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x050816, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 6;

    // Many floating icosahedra
    const meshes = [];
    const colors = [0x7c3aed, 0x00f5d4, 0x3b82f6, 0xec4899, 0xf59e0b];
    for (let i = 0; i < 25; i++) {
        const geo = i % 3 === 0
            ? new THREE.IcosahedronGeometry(0.2 + Math.random() * 0.2, 0)
            : i % 3 === 1
                ? new THREE.OctahedronGeometry(0.15 + Math.random() * 0.2, 0)
                : new THREE.TetrahedronGeometry(0.15 + Math.random() * 0.25, 0);
        const mat = new THREE.MeshBasicMaterial({
            color: colors[i % colors.length],
            wireframe: true,
            transparent: true,
            opacity: 0.3 + Math.random() * 0.3,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(
            (Math.random() - 0.5) * 18,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 4 - 3,
        );
        mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        mesh.userData = {
            rx: (Math.random() - 0.5) * 0.008,
            ry: (Math.random() - 0.5) * 0.008,
            vy: (Math.random() - 0.5) * 0.004,
        };
        meshes.push(mesh);
        scene.add(mesh);
    }

    const clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);
        meshes.forEach(m => {
            m.rotation.x += m.userData.rx;
            m.rotation.y += m.userData.ry;
            m.position.y += m.userData.vy;
            if (m.position.y > 6) m.position.y = -6;
            if (m.position.y < -6) m.position.y = 6;
        });
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });
})();

// ============================================================
// 13. THREE.JS - CONTACT SECTION PARTICLE NET
// ============================================================
(function initContactThree() {
    const canvas = document.getElementById('contact-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x050816, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 5;

    // Particle grid
    const count = 80;
    const partGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * count * 3);
    let idx = 0;
    for (let i = 0; i < count; i++) {
        for (let j = 0; j < count; j++) {
            positions[idx++] = (i / count - 0.5) * 20;
            positions[idx++] = Math.sin((i + j) * 0.1) * 0.5;
            positions[idx++] = (j / count - 0.5) * 20;
        }
    }
    partGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const partMat = new THREE.PointsMaterial({
        size: 0.05,
        color: 0x7c3aed,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(partGeo, partMat);
    scene.add(points);

    const clock = new THREE.Clock();
    const pos = partGeo.attributes.position;
    function animate() {
        requestAnimationFrame(animate);
        const t = clock.getElapsedTime();
        let k = 0;
        for (let i = 0; i < count; i++) {
            for (let j = 0; j < count; j++) {
                pos.array[k + 1] = Math.sin((i * 0.1) + (j * 0.1) + t * 0.5) * 0.8;
                k += 3;
            }
        }
        pos.needsUpdate = true;
        points.rotation.y = t * 0.02;
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });
})();

// ============================================================
// 14. VANILLA TILT - Re-init after GSAP loads cards
// ============================================================
window.addEventListener('load', () => {
    if (typeof VanillaTilt !== 'undefined') {
        VanillaTilt.init(document.querySelectorAll('[data-tilt]'), {
            max: 12,
            speed: 400,
            glare: true,
            'max-glare': 0.15,
        });
    }
});

// ============================================================
// 15. CONTACT FORM (mock submit)
// ============================================================
const form = document.getElementById('contact-form');
if (form) {
    form.addEventListener('submit', e => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const original = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> <span>Message Sent!</span>';
        btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        btn.disabled = true;
        setTimeout(() => {
            btn.innerHTML = original;
            btn.style.background = '';
            btn.disabled = false;
            form.reset();
        }, 3000);
    });
}
