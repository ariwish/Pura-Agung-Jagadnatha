document.getElementById('year').textContent = new Date().getFullYear();

document.addEventListener('DOMContentLoaded', () => {
    // ── SCROLL REVEAL & SCROLLSPY ───────────────────────────────
    const navPill = document.querySelector('.nav-pill-indicator');
    const mainNav = document.getElementById('main-nav');
    const navItems = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section[id], footer');

    const updateNavPill = link => {
        if (!link || !navPill) return;
        navPill.classList.add('visible');
        const { offsetWidth: w, offsetHeight: h, offsetLeft: l, offsetTop: t } = link;
        Object.assign(navPill.style, { width: `${w}px`, height: `${h}px`, left: `${l}px`, top: `${t}px` });
    };

    // Combined Intersection Observer for Reveal and Scrollspy
    const observerOptions = { threshold: [0, 0.1, 0.5, 0.8], rootMargin: '-10% 0px -20% 0px' };
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            // Reveal logic
            if (entry.isIntersecting && entry.target.classList.contains('reveal')) {
                entry.target.classList.add('active');
            }
            
            // Scrollspy logic
            if (entry.isIntersecting && entry.target.tagName !== 'FOOTER') {
                const id = entry.target.getAttribute('id');
                navItems.forEach(link => {
                    const isActive = link.getAttribute('href') === `#${id}`;
                    link.classList.toggle('active', isActive);
                    if (isActive) updateNavPill(link);
                });
            }
        });
    }, observerOptions);

    sections.forEach(s => observer.observe(s));
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    window.addEventListener('scroll', () => {
        mainNav.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });

    // ── MOBILE MENU ──────────────────────────────────────────────
    const navToggle = document.getElementById('nav-toggle');
    document.querySelectorAll('.nav-links a').forEach(link => 
        link.addEventListener('click', () => navToggle.checked = false)
    );

    // ── SWIPE GALLERY ────────────────────────────────────────────
    const galeri = document.getElementById('swipe-galeri');
    const swipeGuideEl = document.getElementById('swipe-guide');
    let swipeCards = [], isDragging = false, startX = 0, currentX = 0;

    const initCards = () => {
        const isExpanded = document.querySelector('#sejarah .container')?.classList.contains('sejarah-expanded');
        swipeCards = Array.from(galeri.querySelectorAll('.swipe-card'));
        swipeCards.forEach((card, i) => {
            card.style.zIndex = swipeCards.length - i;
            card.style.transition = 'transform 0.6s cubic-bezier(0.23,1,0.32,1), opacity 0.6s ease';
            if (isExpanded) {
                const configs = [['0,0,1,0', '1'], ['-60px,20px,0.9,-15deg', '0.8'], ['60px,20px,0.9,15deg', '0.8']];
                const [cfg, o] = configs[i] ?? ['0,40px,0.8,0', '0'];
                const [x, y, s, r] = cfg.split(',');
                card.style.transform = `translateX(${x}) translateY(${y}) scale(${s}) rotate(${r})`;
                card.style.opacity = o;
            } else {
                card.style.transformOrigin = 'bottom center';
                card.style.transform = i < 3 ? `scale(${1 - i * 0.05}) translateY(${i * 15}px)` : 'scale(0.9) translateY(30px)';
                card.style.opacity = i < 3 ? '1' : '0';
            }
        });
    };
    initCards();

    const startDrag = e => {
        const card = e.currentTarget;
        if (card !== swipeCards[0]) return;
        if (swipeGuideEl) swipeGuideEl.style.opacity = '0';
        isDragging = true;
        startX = e.type === 'mousedown' ? e.pageX : e.touches[0].pageX;
        card.style.transition = 'none';

        const onMove = ev => {
            if (!isDragging) return;
            currentX = (ev.type === 'mousemove' ? ev.pageX : ev.touches[0].pageX) - startX;
            card.style.transform = `translateX(${currentX}px) rotate(${currentX / 10}deg)`;
        };
        const onEnd = () => {
            isDragging = false;
            card.style.transition = 'transform 0.5s ease, opacity 0.6s ease';
            if (Math.abs(currentX) > 100) {
                const dir = currentX > 0 ? 1 : -1;
                card.style.opacity = '0';
                card.style.transform = `translateX(${dir * 1000}px) rotate(${dir * 90}deg)`;
                setTimeout(() => { galeri.appendChild(card); initCards(); }, 400);
            } else { initCards(); }
            window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onEnd);
            window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onEnd);
            currentX = 0;
        };
        window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onEnd);
        window.addEventListener('touchmove', onMove); window.addEventListener('touchend', onEnd);
    };
    galeri.querySelectorAll('.swipe-card').forEach(card => {
        card.addEventListener('mousedown', startDrag);
        card.addEventListener('touchstart', startDrag, { passive: true });
    });

    // ── LIGHTBOX ─────────────────────────────────────────────────
    const lightbox = document.getElementById('lightbox'), lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption'), carousels = document.querySelectorAll('.galeri-carousel');
    let galeriItems = Array.from(document.querySelectorAll('.galeri-item:not(.clone)')), currentIndex = -1;

    const openLightbox = index => {
        currentIndex = index;
        const item = galeriItems[currentIndex];
        lightboxImg.style.opacity = '0';
        lightboxImg.src = item.querySelector('img').src;
        lightboxCaption.innerText = item.getAttribute('data-caption') || '';
        lightbox.classList.add('active');
        carousels.forEach(c => c.style.animationPlayState = 'paused');
    };

    document.addEventListener('click', e => {
        const item = e.target.closest('.galeri-item');
        if (item) openLightbox(galeriItems.indexOf(item.classList.contains('clone') ? galeriItems.find(i => i.querySelector('img').src === item.querySelector('img').src) : item));
        if (e.target.closest('.lightbox-close') || e.target === lightbox) {
            lightbox.classList.remove('active');
            carousels.forEach(c => c.style.animationPlayState = 'running');
        }
    });

    lightboxImg.onload = () => lightboxImg.style.opacity = '1';
    const navigate = dir => { currentIndex = (currentIndex + dir + galeriItems.length) % galeriItems.length; openLightbox(currentIndex); };
    document.getElementById('lightbox-prev').onclick = e => { e.stopPropagation(); navigate(-1); };
    document.getElementById('lightbox-next').onclick = e => { e.stopPropagation(); navigate(1); };
    document.addEventListener('keydown', e => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'ArrowLeft') navigate(-1); else if (e.key === 'ArrowRight') navigate(1); else if (e.key === 'Escape') lightbox.click();
    });

    // ── HERO SLIDER ──────────────────────────────────────────────
    const heroSlider = document.getElementById('hero-slider'), heroDots = document.querySelectorAll('.hero-dot');
    let heroIndex = 0, heroInterval = null;

    const updateHero = () => {
        heroSlider.style.transform = `translateX(-${heroIndex * 100 / 3}%)`;
        heroDots.forEach((d, i) => d.classList.toggle('active', i === heroIndex));
    };
    const startAuto = () => { clearInterval(heroInterval); heroInterval = setInterval(() => { heroIndex = (heroIndex + 1) % 3; updateHero(); }, 5000); };
    
    if (heroSlider) {
        startAuto();
        heroDots.forEach(dot => dot.onclick = e => { heroIndex = +e.target.dataset.index; updateHero(); startAuto(); });
    }

    // ── READ MORE ────────────────────────────────────────────────
    const btnReadMore = document.getElementById('btn-read-more'), sejarahPanjang = document.getElementById('sejarah-panjang');
    const sejarahContainer = document.querySelector('#sejarah .container'), sejarahSection = document.getElementById('sejarah');

    if (btnReadMore) btnReadMore.onclick = () => {
        const isOpen = sejarahPanjang.style.display === 'block';
        sejarahPanjang.style.display = isOpen ? 'none' : 'block';
        sejarahContainer.classList.toggle('sejarah-expanded', !isOpen);
        btnReadMore.innerHTML = isOpen ? 'Baca Selengkapnya <i class="fa-solid fa-chevron-down"></i>' : 'Tutup Sejarah <i class="fa-solid fa-chevron-up"></i>';
        document.querySelector('.quote-box')?.style.setProperty('display', isOpen ? 'block' : 'none');
        if (swipeGuideEl) swipeGuideEl.style.display = isOpen ? 'block' : 'none';
        setTimeout(() => {
            window.scrollTo({ top: sejarahSection.offsetTop - mainNav.offsetHeight - 20, behavior: 'smooth' });
            initCards();
        }, 50);
    };

    // ── 3D TILT ──────────────────────────────────────────────────
    const tilt = (el, amount) => {
        el.addEventListener('mousemove', e => {
            const { left, top, width, height } = el.getBoundingClientRect();
            const rX = ((e.clientY - top - height / 2) / (height / 2)) * -amount;
            const rY = ((e.clientX - left - width / 2) / (width / 2)) * amount;
            el.style.transform = `perspective(1000px) rotateX(${rX}deg) rotateY(${rY}deg) scale3d(1.05,1.05,1.05)`;
        });
        el.addEventListener('mouseleave', () => el.style.transform = '');
    };
    if (lightboxImg) tilt(lightboxImg, 12);
    const mapBox = document.querySelector('.lokasi-map-box'), mapOverlay = document.getElementById('map-overlay');
    if (mapBox) tilt(mapBox, 12);
    if (mapOverlay) mapOverlay.onclick = () => mapOverlay.classList.add('hidden');
});