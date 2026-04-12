document.getElementById('year').textContent = new Date().getFullYear();

document.addEventListener('DOMContentLoaded', () => {
    // ── PRELOAD IMAGES ──────────────────────────────────────────
    [...Array.from({length: 14}, (_, i) => `images/${i+1}.avif`),
     ...Array.from({length: 5},  (_, i) => `images-swipe/${i+1}.avif`)]
        .forEach(src => { new Image().src = src; });

    // ── SCROLL REVEAL ────────────────────────────────────────────
    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('active'); });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // ── SCROLLSPY & NAVBAR ───────────────────────────────────────
    const sections = document.querySelectorAll('section[id], footer');
    const navItems = document.querySelectorAll('.nav-links a');
    const navPill  = document.querySelector('.nav-pill-indicator');
    const mainNav  = document.getElementById('main-nav');

    let sectionTops = [], cachedScrollHeight = 0;
    const cacheSectionMetrics = () => {
        cachedScrollHeight = document.documentElement.scrollHeight;
        sectionTops = Array.from(sections).map(s => s.offsetTop);
    };
    cacheSectionMetrics();

    const updateNavPill = link => {
        if (!link || !navPill) return;
        navPill.classList.add('visible');
        Object.assign(navPill.style, {
            width:  `${link.offsetWidth}px`,
            height: `${link.offsetHeight}px`,
            left:   `${link.offsetLeft}px`,
            top:    `${link.offsetTop}px`,
        });
    };

    const updateActiveNav = () => {
        const scrollY = window.scrollY;
        let activeId = scrollY < 100 ? 'home'
            : scrollY + window.innerHeight >= cachedScrollHeight - 50 ? 'lokasi' : '';

        if (!activeId) {
            sectionTops.forEach((top, i) => {
                if (sections[i].tagName !== 'FOOTER' && scrollY >= top - 150)
                    activeId = sections[i].id;
            });
        }

        if (activeId) {
            let found = null;
            navItems.forEach(link => {
                const active = link.getAttribute('href') === `#${activeId}`;
                link.classList.toggle('active', active);
                if (active) found = link;
            });
            if (found) updateNavPill(found);
        }
    };

    // Shared RAF-throttled scroll handler
    let scrollPending = false;
    window.addEventListener('scroll', () => {
        if (scrollPending) return;
        scrollPending = true;
        requestAnimationFrame(() => {
            scrollPending = false;
            mainNav.classList.toggle('scrolled', window.scrollY > 50);
            updateActiveNav();
        });
    }, { passive: true });

    // Debounced resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { cacheSectionMetrics(); updateActiveNav(); }, 150);
    }, { passive: true });

    const spyObserver = new IntersectionObserver(updateActiveNav, { rootMargin: '-10% 0px -50% 0px', threshold: 0 });
    sections.forEach(s => spyObserver.observe(s));
    window.addEventListener('load', updateActiveNav);
    setTimeout(updateActiveNav, 300);

    // ── SMOOTH SCROLL ────────────────────────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            const href = link.getAttribute('href');
            if (!href || href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target)
                window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - mainNav.offsetHeight - 20, behavior: 'smooth' });
        });
    });

    // ── MOBILE MENU ──────────────────────────────────────────────
    const mobileMenuBtn = document.getElementById('mobile-menu');
    const navLinksList  = document.querySelector('.nav-links');
    const closeMobileMenu = () => {
        navLinksList.classList.remove('nav-active');
        mobileMenuBtn.classList.remove('toggle-active');
    };

    mobileMenuBtn.addEventListener('click', e => {
        e.stopPropagation();
        navLinksList.classList.toggle('nav-active');
        mobileMenuBtn.classList.toggle('toggle-active');
    });
    navLinksList.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMobileMenu));
    document.addEventListener('click', e => {
        if (navLinksList.classList.contains('nav-active') &&
            !navLinksList.contains(e.target) && !mobileMenuBtn.contains(e.target))
            closeMobileMenu();
    });

    // ── SWIPE GALLERY ────────────────────────────────────────────
    const galeri     = document.getElementById('swipe-galeri');
    const swipeGuideEl = document.getElementById('swipe-guide');
    let swipeCards = [], isDragging = false, startX = 0, currentX = 0;

    const initCards = () => {
        const isExpanded = document.querySelector('#sejarah .container')?.classList.contains('sejarah-expanded');
        swipeCards = Array.from(galeri.querySelectorAll('.swipe-card'));
        swipeCards.forEach((card, i) => {
            card.style.zIndex     = swipeCards.length - i;
            card.style.transition = 'transform 0.6s cubic-bezier(0.23,1,0.32,1), opacity 0.6s ease';
            if (isExpanded) {
                const configs = [
                    ['translateX(0) scale(1) rotate(0deg)',                    '1'],
                    ['translateX(-60px) translateY(20px) scale(0.9) rotate(-15deg)', '0.8'],
                    ['translateX(60px) translateY(20px) scale(0.9) rotate(15deg)',   '0.8'],
                ];
                const [t, o] = configs[i] ?? ['translateX(0) translateY(40px) scale(0.8) rotate(0deg)', '0'];
                card.style.transform = t;
                card.style.opacity   = o;
            } else {
                card.style.transformOrigin = 'bottom center';
                card.style.transform = i < 3 ? `scale(${1 - i * 0.05}) translateY(${i * 15}px)` : 'scale(0.9) translateY(30px)';
                card.style.opacity   = i < 3 ? '1' : '0';
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

        let rafId = null;
        const onMove = ev => {
            if (!isDragging) return;
            currentX = (ev.type === 'mousemove' ? ev.pageX : ev.touches[0].pageX) - startX;
            if (!rafId) rafId = requestAnimationFrame(() => {
                card.style.transform = `translateX(${currentX}px) rotate(${currentX / 10}deg)`;
                rafId = null;
            });
        };
        const onEnd = () => {
            isDragging = false;
            if (rafId) cancelAnimationFrame(rafId);
            card.style.transition = 'transform 0.5s ease, opacity 0.6s ease';
            if (Math.abs(currentX) > 100) {
                const dir = currentX > 0 ? 1 : -1;
                card.style.opacity   = '0';
                card.style.transform = `translateX(${dir * 1000}px) rotate(${dir * 90}deg)`;
                setTimeout(() => { galeri.appendChild(card); initCards(); }, 400);
            } else { initCards(); }
            window.removeEventListener('mousemove',  onMove);
            window.removeEventListener('mouseup',    onEnd);
            window.removeEventListener('touchmove',  onMove);
            window.removeEventListener('touchend',   onEnd);
            currentX = 0;
        };
        window.addEventListener('mousemove',  onMove);
        window.addEventListener('mouseup',    onEnd);
        window.addEventListener('touchmove',  onMove, { passive: true });
        window.addEventListener('touchend',   onEnd,  { passive: true });
    };
    galeri.querySelectorAll('.swipe-card').forEach(card => {
        card.addEventListener('mousedown',  startDrag);
        card.addEventListener('touchstart', startDrag, { passive: true });
    });

    // ── LIGHTBOX ─────────────────────────────────────────────────
    const lightbox        = document.getElementById('lightbox');
    const lightboxImg     = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxPrev    = document.getElementById('lightbox-prev');
    const lightboxNext    = document.getElementById('lightbox-next');
    const carousels       = document.querySelectorAll('.galeri-carousel');
    let galeriItems = [], originalgaleriItems = [], currentIndex = -1;

    const setCarouselPlay = state => carousels.forEach(c => c.style.animationPlayState = state);

    document.addEventListener('click', e => {
        const item = e.target.closest('.galeri-item');
        if (!item?.closest('.galeri-carousel-wrapper')) return;
        const idx = item.getAttribute('data-index');
        if (idx !== null) {
            galeriItems = originalgaleriItems;
            currentIndex = +idx;
            openLightbox(galeriItems[currentIndex]);
        }
    });

    lightboxImg.onload = () => { lightboxImg.style.opacity = '1'; };

    const openLightbox = item => {
        lightboxImg.style.opacity = '0';
        lightboxImg.src           = item.querySelector('img').src;
        lightboxCaption.innerText = item.getAttribute('data-caption') || '';
        lightbox.classList.add('active');
        setCarouselPlay('paused');
        const show = galeriItems.length > 1;
        lightboxPrev.style.display = lightboxNext.style.display = show ? 'flex' : 'none';
    };

    const closeLightbox = () => {
        lightbox.classList.remove('active');
        setCarouselPlay('running');
    };

    lightboxPrev.addEventListener('click', e => { e.stopPropagation(); currentIndex = (currentIndex - 1 + galeriItems.length) % galeriItems.length; openLightbox(galeriItems[currentIndex]); });
    lightboxNext.addEventListener('click', e => { e.stopPropagation(); currentIndex = (currentIndex + 1) % galeriItems.length; openLightbox(galeriItems[currentIndex]); });
    document.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

    document.addEventListener('keydown', e => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'ArrowLeft')  { currentIndex = (currentIndex - 1 + galeriItems.length) % galeriItems.length; openLightbox(galeriItems[currentIndex]); }
        else if (e.key === 'ArrowRight') { currentIndex = (currentIndex + 1) % galeriItems.length; openLightbox(galeriItems[currentIndex]); }
        else if (e.key === 'Escape')     closeLightbox();
    });

    // ── GALLERY CAROUSEL SETUP ───────────────────────────────────
    const carousel1 = document.getElementById('galeri-carousel-1');
    const carousel2 = document.getElementById('galeri-carousel-2');
    const allItems  = [...(carousel1?.children ?? []), ...(carousel2?.children ?? [])];

    if (carousel1) carousel1.innerHTML = '';
    if (carousel2) carousel2.innerHTML = '';

    const mid = Math.ceil(allItems.length / 2);
    allItems.forEach((item, i) => {
        const target = i < mid ? carousel1 : carousel2;
        if (!target) return;
        item.setAttribute('data-index', originalgaleriItems.length);
        originalgaleriItems.push(item);
        target.appendChild(item);
    });

    [carousel1, carousel2].forEach(c => {
        if (!c) return;
        Array.from(c.children).forEach(item => {
            const clone = item.cloneNode(true);
            clone.classList.add('clone');
            c.appendChild(clone);
        });
        requestAnimationFrame(() => c.classList.add('is-ready'));
    });

    // ── HERO SLIDER ──────────────────────────────────────────────
    const heroSlider = document.getElementById('hero-slider');
    const heroDots   = document.querySelectorAll('.hero-dot');
    let heroIndex = 0, heroInterval = null;

    const updateHeroSlider = () => {
        heroSlider.style.transition = 'transform 0.6s ease-in-out';
        heroSlider.style.transform  = `translateX(-${heroIndex * 100 / 3}%)`;
        heroDots.forEach((d, i) => d.classList.toggle('active', i === heroIndex));
    };
    const startHeroAuto = () => {
        clearInterval(heroInterval);
        heroInterval = setInterval(() => { heroIndex = (heroIndex + 1) % 3; updateHeroSlider(); }, 5000);
    };

    if (heroSlider) {
        startHeroAuto();
        heroDots.forEach(dot => {
            dot.addEventListener('click', e => {
                heroIndex = +e.target.getAttribute('data-index');
                updateHeroSlider();
                startHeroAuto();
            });
        });

        let isDragHero = false, heroStartX = 0;
        heroSlider.addEventListener('mousedown', e => { isDragHero = true; heroStartX = e.pageX; heroSlider.style.transition = 'none'; });
        window.addEventListener('mousemove', e => {
            if (!isDragHero) return;
            heroSlider.style.transform = `translateX(${-(heroIndex * window.innerWidth) + (e.pageX - heroStartX)}px)`;
        });
        window.addEventListener('mouseup', e => {
            if (!isDragHero) return;
            isDragHero = false;
            const walk = e.pageX - heroStartX;
            if (walk < -100 && heroIndex < 2) heroIndex++;
            else if (walk > 100 && heroIndex > 0) heroIndex--;
            updateHeroSlider();
            startHeroAuto();
        });
    }

    // ── READ MORE / SEJARAH ──────────────────────────────────────
    const btnReadMore      = document.getElementById('btn-read-more');
    const sejarahPanjang   = document.getElementById('sejarah-panjang');
    const sejarahContainer = document.querySelector('#sejarah .container');
    const sejarahSection   = document.getElementById('sejarah');

    if (btnReadMore && sejarahPanjang) {
        btnReadMore.addEventListener('click', () => {
            const quoteBox = document.querySelector('.quote-box');
            const isOpen   = sejarahPanjang.style.display === 'block';

            sejarahPanjang.style.display = isOpen ? 'none' : 'block';
            sejarahContainer?.classList.toggle('sejarah-expanded', !isOpen);
            btnReadMore.innerHTML       = isOpen
                ? 'Baca Selengkapnya <i class="fa-solid fa-chevron-down"></i>'
                : 'Tutup Sejarah <i class="fa-solid fa-chevron-up"></i>';
            btnReadMore.style.marginTop = isOpen ? '25px' : '40px';
            if (quoteBox)    quoteBox.style.display    = isOpen ? 'block' : 'none';
            if (swipeGuideEl) swipeGuideEl.style.display = isOpen ? 'block' : 'none';

            const navH = mainNav.offsetHeight;
            setTimeout(() => {
                window.scrollTo({ top: sejarahSection.getBoundingClientRect().top + window.scrollY - navH - 20, behavior: 'smooth' });
            }, isOpen ? 100 : 50);
            setTimeout(initCards, 50);
        });
    }

    // ── 3D TILT — LIGHTBOX ───────────────────────────────────────
    let vpW = window.innerWidth, vpH = window.innerHeight;
    window.addEventListener('resize', () => { vpW = window.innerWidth; vpH = window.innerHeight; }, { passive: true });

    if (lightbox && lightboxImg) {
        lightbox.addEventListener('mousemove', e => {
            if (!lightbox.classList.contains('active')) return;
            const dx = e.clientX - vpW / 2, dy = e.clientY - vpH / 2;
            const mx = vpW * 0.4, my = vpH * 0.4;
            if (Math.abs(dx) > mx || Math.abs(dy) > my) {
                lightboxImg.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1,1,1)';
                return;
            }
            lightboxImg.style.transition = 'transform 0.1s ease-out';
            lightboxImg.style.transform  = `perspective(1000px) rotateX(${(dy/my)*-12}deg) rotateY(${(dx/mx)*12}deg) scale3d(1.05,1.05,1.05)`;
        });
        lightbox.addEventListener('mouseleave', () => {
            lightboxImg.style.transition = 'transform 0.5s ease-out';
            lightboxImg.style.transform  = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1,1,1)';
        });
    }

    // ── 3D TILT — GOOGLE MAP ─────────────────────────────────────
    const mapBox     = document.querySelector('.lokasi-map-box');
    const mapOverlay = document.getElementById('map-overlay');
    const MAP_RESET  = { transform: 'rotateX(0) rotateY(0) translateY(0) scale3d(1,1,1)', boxShadow: '0 25px 60px rgba(0,0,0,0.55)' };

    if (mapBox && mapOverlay) {
        mapBox.addEventListener('mousemove', e => {
            if (mapOverlay.classList.contains('hidden')) return;
            const { top, left, width, height } = mapBox.getBoundingClientRect();
            const rX = ((e.clientY - top  - height / 2) / (height / 2)) * -12;
            const rY = ((e.clientX - left - width  / 2) / (width  / 2)) *  12;
            mapBox.style.transform = `rotateX(${rX}deg) rotateY(${rY}deg) translateY(-10px) scale3d(1.05,1.05,1.05)`;
            mapBox.style.boxShadow = `${-rY}px ${rX + 30}px 60px rgba(0,0,0,0.6)`;
        });
        mapBox.addEventListener('mouseleave', () => Object.assign(mapBox.style, MAP_RESET));
        mapOverlay.addEventListener('click', () => {
            mapOverlay.classList.add('hidden');
            Object.assign(mapBox.style, MAP_RESET);
        });
    }
});