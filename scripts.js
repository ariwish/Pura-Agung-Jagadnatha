document.getElementById('year').textContent = new Date().getFullYear();

document.addEventListener('DOMContentLoaded', () => {
    const navPill = document.querySelector('.nav-pill-indicator'), mainNav = document.getElementById('main-nav');
    const navItems = document.querySelectorAll('.nav-links a'), sections = document.querySelectorAll('section[id], footer');

    // ── NAVIGATION & SCROLL ──────────────────────────────────────
    const updatePill = el => {
        if (!el || !navPill) return;
        navPill.classList.add('visible');
        Object.assign(navPill.style, { width: `${el.offsetWidth}px`, height: `${el.offsetHeight}px`, left: `${el.offsetLeft}px`, top: `${el.offsetTop}px` });
    };

    const obs = new IntersectionObserver(entries => entries.forEach(e => {
        if (e.target.id === 'scroll-start') return mainNav.classList.toggle('scrolled', !e.isIntersecting);
        if (e.isIntersecting && e.target.classList.contains('reveal')) e.target.classList.add('active');
    }), { threshold: 0.1 });

    const updateActive = () => {
        let activeId = 'home';
        const scrollY = window.scrollY;
        sections.forEach(s => {
            if (s.tagName !== 'FOOTER' && scrollY >= s.offsetTop - 200) activeId = s.id;
        });
        if (scrollY + window.innerHeight >= document.documentElement.scrollHeight - 50) activeId = 'lokasi';
        
        const link = [...navItems].find(a => a.getAttribute('href') === `#${activeId}`);
        navItems.forEach(a => a.classList.toggle('active', a === link));
        if (link) updatePill(link);
    };

    [document.getElementById('scroll-start'), ...document.querySelectorAll('.reveal')].forEach(el => el && obs.observe(el));
    
    let tick = false;
    window.addEventListener('scroll', () => {
        if (!tick) {
            requestAnimationFrame(() => { updateActive(); tick = false; });
            tick = true;
        }
    }, { passive: true });
    window.addEventListener('resize', updateActive);
    updateActive();
    
    document.querySelector('.nav-links').onclick = e => { if (e.target.tagName === 'A') document.getElementById('nav-toggle').checked = false; };

    // ── SWIPE GALLERY ────────────────────────────────────────────
    const galeri = document.getElementById('swipe-galeri'), swipeGuide = document.getElementById('swipe-guide');
    let cards = [], isDragging = false, startX = 0;

    const initCards = () => {
        const expanded = document.querySelector('.sejarah-expanded');
        cards = [...galeri.querySelectorAll('.swipe-card')];
        cards.forEach((c, i) => {
            Object.assign(c.style, { zIndex: cards.length - i, transition: 'transform 0.6s var(--ease-out), opacity 0.6s ease', opacity: i < 3 || expanded ? (i < 3 ? '1' : '0.8') : '0' });
            if (expanded) {
                const cfgs = ['0,0,1,0', '-60px,20px,0.9,-15deg', '60px,20px,0.9,15deg'];
                const [x, y, s, r] = (cfgs[i] || '0,40px,0.8,0').split(',');
                c.style.transform = `translate3d(${x}, ${y}, 0) scale(${s}) rotate(${r})`;
            } else {
                c.style.transform = i < 3 ? `scale(${1 - i * 0.05}) translateY(${i * 15}px)` : 'scale(0.9) translateY(30px)';
            }
        });
    };
    initCards();

    const drag = e => {
        const c = e.currentTarget; if (c !== cards[0]) return;
        if (swipeGuide) swipeGuide.style.opacity = '0';
        isDragging = true; startX = e.pageX || e.touches[0].pageX; c.style.transition = 'none';
        const move = ev => {
            if (!isDragging) return;
            const x = (ev.pageX || ev.touches[0].pageX) - startX;
            c.style.transform = `translate3d(${x}px, 0, 0) rotate(${x / 10}deg)`;
            if (Math.abs(x) > 100) {
                isDragging = false; c.style.transition = 'transform 0.5s ease, opacity 0.6s ease'; c.style.opacity = '0';
                c.style.transform = `translate3d(${x > 0 ? 1000 : -1000}px, 0, 0) rotate(${x > 0 ? 90 : -90}deg)`;
                setTimeout(() => { galeri.append(c); initCards(); }, 400);
                window.removeEventListener('mousemove', move); window.removeEventListener('touchmove', move);
            }
        };
        const end = () => { isDragging = false; if (c.style.opacity !== '0') initCards(); window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', end); };
        window.addEventListener('mousemove', move); window.addEventListener('mouseup', end);
        window.addEventListener('touchmove', move, { passive: true }); window.addEventListener('touchend', end, { passive: true });
    };
    galeri.querySelectorAll('.swipe-card').forEach(c => { c.onmousedown = drag; c.ontouchstart = drag; });

    // ── LIGHTBOX ─────────────────────────────────────────────────
    const lb = document.getElementById('lightbox'), lbImg = document.getElementById('lightbox-img'), lbCap = document.getElementById('lightbox-caption');
    const items = [...document.querySelectorAll('.galeri-item:not(.clone)')], carousels = document.querySelectorAll('.galeri-carousel');
    let idx = -1;

    const openLB = i => {
        idx = i; lbImg.style.opacity = '0'; lbImg.src = items[idx].querySelector('img').src;
        lbCap.innerText = items[idx].dataset.caption || ''; lb.classList.add('active');
        carousels.forEach(c => c.style.animationPlayState = 'paused');
    };

    document.onclick = e => {
        const it = e.target.closest('.galeri-item');
        if (it) openLB(items.indexOf(it.classList.contains('clone') ? items.find(img => img.querySelector('img').src === it.querySelector('img').src) : it));
        if (e.target.closest('.lightbox-close') || e.target === lb) { lb.classList.remove('active'); carousels.forEach(c => c.style.animationPlayState = 'running'); }
    };
    lbImg.onload = () => lbImg.style.opacity = '1';
    const nav = d => { idx = (idx + d + items.length) % items.length; openLB(idx); };
    document.getElementById('lightbox-prev').onclick = e => { e.stopPropagation(); nav(-1); };
    document.getElementById('lightbox-next').onclick = e => { e.stopPropagation(); nav(1); };
    document.onkeydown = e => { if (lb.classList.contains('active')) { if (e.key === 'ArrowLeft') nav(-1); else if (e.key === 'ArrowRight') nav(1); else if (e.key === 'Escape') lb.click(); } };

    // ── HERO SLIDER ──────────────────────────────────────────────
    const hero = document.getElementById('hero-slider'), dots = document.querySelectorAll('.hero-dot');
    let hIdx = 0, hInt = setInterval(() => { hIdx = (hIdx + 1) % 3; upHero(); }, 5000);
    const upHero = () => { hero.style.transform = `translate3d(-${hIdx * 100 / 3}%, 0, 0)`; dots.forEach((d, i) => d.classList.toggle('active', i === hIdx)); };
    if (hero) dots.forEach(d => d.onclick = e => { hIdx = +e.target.dataset.index; upHero(); clearInterval(hInt); hInt = setInterval(() => { hIdx = (hIdx + 1) % 3; upHero(); }, 5000); });

    // ── READ MORE ────────────────────────────────────────────────
    const btnRM = document.getElementById('btn-read-more'), sejPanjang = document.getElementById('sejarah-panjang');
    const sejCont = document.querySelector('#sejarah .container');
    if (btnRM) btnRM.onclick = () => {
        const open = sejPanjang.style.display === 'block';
        sejPanjang.style.display = open ? 'none' : 'block';
        sejCont.classList.toggle('sejarah-expanded', !open);
        setTimeout(() => { window.scrollTo({ top: document.getElementById('sejarah').offsetTop - mainNav.offsetHeight - 20, behavior: 'smooth' }); initCards(); }, 50);
    };

    // ── 3D TILT ──────────────────────────────────────────────────
    const tilt = (el, amt) => {
        el.onmousemove = e => {
            const { left, top, width, height } = el.getBoundingClientRect();
            const rX = ((e.clientY - top - height / 2) / (height / 2)) * -amt, rY = ((e.clientX - left - width / 2) / (width / 2)) * amt;
            el.style.transform = `perspective(1000px) rotateX(${rX}deg) rotateY(${rY}deg) scale3d(1.05,1.05,1.05)`;
        };
        el.onmouseleave = () => el.style.transform = '';
    };
    if (lbImg) tilt(lbImg, 12);
    const map = document.querySelector('.lokasi-map-box');
    if (map) tilt(map, 12);
    const mapOv = document.getElementById('map-overlay');
    if (mapOv) mapOv.onclick = () => mapOv.classList.add('hidden');
});