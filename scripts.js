// Set current year
document.getElementById('year').textContent = new Date().getFullYear();

document.addEventListener('DOMContentLoaded', () => {

    // =========================================================
    // 1. SCROLL REVEAL
    // =========================================================
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('active'); });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // =========================================================
    // 2. SCROLLSPY & NAVBAR GLASS PILL
    // =========================================================
    const sections = document.querySelectorAll('section[id], footer');
    const navItems = document.querySelectorAll('.nav-links a');
    const navPill = document.querySelector('.nav-pill-indicator');

    function updateNavPill(link) {
        if (!link || !navPill) return;
        navPill.classList.add('visible');
        navPill.style.width = `${link.offsetWidth}px`;
        navPill.style.height = `${link.offsetHeight}px`;
        navPill.style.left = `${link.offsetLeft}px`;
        navPill.style.top = `${link.offsetTop}px`;
    }

    function updateActiveNav() {
        const pageHeight = document.documentElement.scrollHeight;
        let activeId = '';

        if (window.scrollY + window.innerHeight >= pageHeight - 50) {
            activeId = 'lokasi';
        } else if (window.scrollY < 100) {
            activeId = 'home';
        } else {
            sections.forEach(s => {
                if (s.tagName === 'FOOTER') return;
                if (window.scrollY >= s.offsetTop - 150) activeId = s.id;
            });
        }

        if (activeId) {
            let found = null;
            navItems.forEach(link => {
                const isActive = link.getAttribute('href') === `#${activeId}`;
                link.classList.toggle('active', isActive);
                if (isActive) found = link;
            });
            if (found) updateNavPill(found);
        }
    }

    const spyObserver = new IntersectionObserver(() => updateActiveNav(), {
        rootMargin: '-10% 0px -50% 0px', threshold: 0
    });
    sections.forEach(s => spyObserver.observe(s));
    window.addEventListener('scroll', updateActiveNav, { passive: true });
    window.addEventListener('resize', updateActiveNav);
    window.addEventListener('load', updateActiveNav);
    setTimeout(updateActiveNav, 300);

    // =========================================================
    // 3. SMOOTH SCROLL (anchor links)
    // =========================================================
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            const href = link.getAttribute('href');
            if (!href || href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const navH = document.getElementById('main-nav').offsetHeight;
                window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navH - 20, behavior: 'smooth' });
            }
        });
    });

    // =========================================================
    // 4. NAVBAR SCROLL EFFECT
    // =========================================================
    const mainNav = document.getElementById('main-nav');
    window.addEventListener('scroll', () => {
        mainNav.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });

    // =========================================================
    // 5. MOBILE MENU TOGGLE
    // =========================================================
    document.getElementById('mobile-menu').addEventListener('click', () => {
        document.querySelector('.nav-links').classList.toggle('nav-active');
        document.getElementById('mobile-menu').classList.toggle('toggle-active');
    });

    // =========================================================
    // 6. TINDER SWIPE GALLERY
    // =========================================================
    const gallery = document.getElementById('tinder-gallery');
    let isDragging = false, startX = 0, currentX = 0;

    function initCards() {
        const isExpanded = document.querySelector('#about .container')?.classList.contains('about-expanded');
        const cards = Array.from(gallery.querySelectorAll('.swipe-card'));
        cards.forEach((card, i) => {
            card.style.zIndex = cards.length - i;
            card.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.6s ease';
            if (isExpanded) {
                if (i === 0) { card.style.transform = 'translateX(0) scale(1) rotate(0deg)'; card.style.opacity = '1'; }
                else if (i === 1) { card.style.transform = 'translateX(-60px) translateY(20px) scale(0.9) rotate(-15deg)'; card.style.opacity = '0.8'; }
                else if (i === 2) { card.style.transform = 'translateX(60px) translateY(20px) scale(0.9) rotate(15deg)'; card.style.opacity = '0.8'; }
                else { card.style.transform = 'translateX(0) translateY(40px) scale(0.8) rotate(0deg)'; card.style.opacity = '0'; }
            } else {
                card.style.transformOrigin = 'bottom center';
                if (i < 3) { card.style.transform = `scale(${1 - i * 0.05}) translateY(${i * 15}px)`; card.style.opacity = '1'; }
                else { card.style.transform = `scale(0.9) translateY(30px)`; card.style.opacity = '0'; }
            }
        });
    }
    initCards();

    function startDrag(e) {
        const cards = Array.from(gallery.querySelectorAll('.swipe-card'));
        if (e.currentTarget !== cards[0]) return;
        const guide = document.getElementById('swipe-guide');
        if (guide) guide.style.opacity = '0';
        isDragging = true;
        startX = e.type === 'mousedown' ? e.pageX : e.touches[0].pageX;
        e.currentTarget.style.transition = 'none';

        const onMove = e => {
            if (!isDragging) return;
            currentX = (e.type === 'mousemove' ? e.pageX : e.touches[0].pageX) - startX;
            e.currentTarget.style.transform = `translateX(${currentX}px) rotate(${currentX / 10}deg)`;
        };
        const onEnd = () => {
            isDragging = false;
            const card = cards[0];
            card.style.transition = 'transform 0.5s ease, opacity 0.6s ease';
            if (Math.abs(currentX) > 100) {
                const dir = currentX > 0 ? 1 : -1;
                card.style.opacity = '0';
                card.style.transform = `translateX(${dir * 1000}px) rotate(${dir * 90}deg)`;
                setTimeout(() => { gallery.appendChild(card); initCards(); }, 400);
            } else { initCards(); }
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onEnd);
            window.removeEventListener('touchmove', onMove);
            window.removeEventListener('touchend', onEnd);
            currentX = 0;
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onEnd);
        window.addEventListener('touchmove', onMove);
        window.addEventListener('touchend', onEnd);
    }
    Array.from(gallery.querySelectorAll('.swipe-card')).forEach(card => {
        card.addEventListener('mousedown', startDrag);
        card.addEventListener('touchstart', startDrag);
    });

    // =========================================================
    // 7. LIGHTBOX
    // =========================================================
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    let galleryItems = [], originalGalleryItems = [], currentIndex = -1;

    document.addEventListener('click', e => {
        const item = e.target.closest('.gallery-item');
        if (item?.closest('.gallery-carousel-wrapper')) {
            const idx = item.getAttribute('data-index');
            if (idx !== null) { galleryItems = originalGalleryItems; currentIndex = parseInt(idx); openLightbox(galleryItems[currentIndex]); }
        }
    });

    function openLightbox(item, direction = null) {
        const img = item.querySelector('img');
        const caption = item.getAttribute('data-caption');
        if (direction && lightbox.classList.contains('active')) {
            lightboxImg.style.transition = 'opacity 0.2s ease-out';
            lightboxImg.style.opacity = '0';
            setTimeout(() => { lightboxImg.src = img.src; lightboxCaption.innerText = caption || ''; lightboxImg.style.opacity = '1'; }, 150);
            return;
        }
        lightboxImg.src = img.src;
        lightboxCaption.innerText = caption || '';
        lightbox.classList.add('active');
        const show = galleryItems.length > 1;
        lightboxPrev.style.display = show ? 'flex' : 'none';
        lightboxNext.style.display = show ? 'flex' : 'none';
    }

    const closeLightbox = () => lightbox.classList.remove('active');
    lightboxPrev.addEventListener('click', e => { e.stopPropagation(); currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length; openLightbox(galleryItems[currentIndex], 'prev'); });
    lightboxNext.addEventListener('click', e => { e.stopPropagation(); currentIndex = (currentIndex + 1) % galleryItems.length; openLightbox(galleryItems[currentIndex], 'next'); });
    document.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

    document.addEventListener('keydown', e => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'ArrowLeft') { currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length; openLightbox(galleryItems[currentIndex], 'prev'); }
        else if (e.key === 'ArrowRight') { currentIndex = (currentIndex + 1) % galleryItems.length; openLightbox(galleryItems[currentIndex], 'next'); }
        else if (e.key === 'Escape') closeLightbox();
    });

    // =========================================================
    // 8. GALLERY AUTO-SCROLL
    // =========================================================
    const carousel1 = document.getElementById('gallery-carousel-1');
    const carousel2 = document.getElementById('gallery-carousel-2');

    [carousel1, carousel2].forEach(carousel => {
        if (!carousel) return;
        Array.from(carousel.children).forEach(item => {
            item.setAttribute('data-index', originalGalleryItems.length);
            originalGalleryItems.push(item);
            carousel.appendChild(item.cloneNode(true));
        });
    });

    let pos1 = 0, pos2 = 0;
    const speed = 1.6;

    function animateGallery() {
        if (carousel1) {
            pos1 += speed;
            if (pos1 >= carousel1.scrollWidth / 2) pos1 = 0;
            carousel1.style.transform = `translateX(-${pos1}px)`;
        }
        if (carousel2) {
            pos2 += speed;
            if (pos2 >= carousel2.scrollWidth / 2) pos2 = 0;
            carousel2.style.transform = `translateX(${pos2 - carousel2.scrollWidth / 2}px)`;
        }
        requestAnimationFrame(animateGallery);
    }
    animateGallery();

    // =========================================================
    // 9. HERO SLIDER
    // =========================================================
    const heroSlider = document.getElementById('hero-slider');
    const heroDots = document.querySelectorAll('.hero-dot');
    let heroIndex = 0, heroInterval = null;

    function updateHeroSlider() {
        heroSlider.style.transition = 'transform 0.6s ease-in-out';
        heroSlider.style.transform = `translateX(-${heroIndex * 100 / 3}%)`;
        heroDots.forEach((d, i) => d.classList.toggle('active', i === heroIndex));
    }

    function startHeroAuto() {
        clearInterval(heroInterval);
        heroInterval = setInterval(() => { heroIndex = (heroIndex + 1) % 3; updateHeroSlider(); }, 5000);
    }

    if (heroSlider) {
        startHeroAuto();
        heroDots.forEach(dot => { dot.addEventListener('click', e => { heroIndex = parseInt(e.target.getAttribute('data-index')); updateHeroSlider(); startHeroAuto(); }); });

        let isDragHero = false, heroStartX = 0;
        heroSlider.addEventListener('mousedown', e => { isDragHero = true; heroStartX = e.pageX; heroSlider.style.transition = 'none'; });
        window.addEventListener('mousemove', e => { if (!isDragHero) return; heroSlider.style.transform = `translateX(${-(heroIndex * window.innerWidth) + (e.pageX - heroStartX)}px)`; });
        window.addEventListener('mouseup', e => {
            if (!isDragHero) return; isDragHero = false;
            const walk = e.pageX - heroStartX;
            if (walk < -100 && heroIndex < 2) heroIndex++;
            else if (walk > 100 && heroIndex > 0) heroIndex--;
            updateHeroSlider(); startHeroAuto();
        });
    }

    // =========================================================
    // 10. READ MORE / SEJARAH
    // =========================================================
    const btnReadMore = document.getElementById('btn-read-more');
    const sejarahPanjang = document.getElementById('sejarah-panjang');
    const aboutContainer = document.querySelector('#about .container');

    if (btnReadMore && sejarahPanjang) {
        btnReadMore.addEventListener('click', () => {
            const quoteBox = document.querySelector('.quote-box');
            const swipeGuide = document.getElementById('swipe-guide');
            const isOpen = sejarahPanjang.style.display === 'block';

            sejarahPanjang.style.display = isOpen ? 'none' : 'block';
            aboutContainer?.classList.toggle('about-expanded', !isOpen);
            btnReadMore.innerHTML = isOpen ? 'Baca Selengkapnya <i class="fa-solid fa-chevron-down"></i>' : 'Tutup Sejarah <i class="fa-solid fa-chevron-up"></i>';
            btnReadMore.style.marginTop = isOpen ? '25px' : '40px';
            if (quoteBox) quoteBox.style.display = isOpen ? 'block' : 'none';
            if (swipeGuide) swipeGuide.style.display = isOpen ? 'block' : 'none';

            const navH = document.getElementById('main-nav')?.offsetHeight || 0;
            const about = document.getElementById('about');
            setTimeout(() => {
                window.scrollTo({ top: about.getBoundingClientRect().top + window.scrollY - navH - 20, behavior: 'smooth' });
            }, isOpen ? 100 : 50);
            setTimeout(initCards, 50);
        });
    }

    // =========================================================
    // 11. 3D TILT — WAWANCARA VIDEO CARD
    // =========================================================
    const videoCard = document.querySelector('.video-card-interactive');
    if (videoCard) {
        videoCard.addEventListener('mousemove', e => {
            const rect = videoCard.getBoundingClientRect();
            const x = e.clientX - rect.left, y = e.clientY - rect.top;
            if (y > rect.height - 60) { videoCard.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1,1,1)'; return; }
            const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -10;
            const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 10;
            videoCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02,1.02,1.02)`;
        });
        videoCard.addEventListener('mouseleave', () => { videoCard.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1,1,1)'; });
    }

    // =========================================================
    // 12. 3D TILT — LIGHTBOX IMAGE
    // =========================================================
    if (lightbox && lightboxImg) {
        lightbox.addEventListener('mousemove', e => {
            if (!lightbox.classList.contains('active')) return;
            const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
            const dx = e.clientX - cx, dy = e.clientY - cy;
            const mx = window.innerWidth * 0.4, my = window.innerHeight * 0.4;
            if (Math.abs(dx) > mx || Math.abs(dy) > my) {
                lightboxImg.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1,1,1)';
                return;
            }
            lightboxImg.style.transition = 'transform 0.1s ease-out';
            lightboxImg.style.transform = `perspective(1000px) rotateX(${(dy / my) * -12}deg) rotateY(${(dx / mx) * 12}deg) scale3d(1.05,1.05,1.05)`;
        });
        lightbox.addEventListener('mouseleave', () => {
            lightboxImg.style.transition = 'transform 0.5s ease-out';
            lightboxImg.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1,1,1)';
        });
    }

    // =========================================================
    // 13. 3D TILT — GOOGLE MAP BOX
    // =========================================================
    const mapBox = document.querySelector('.lokasi-map-box');
    const mapOverlay = document.getElementById('map-overlay');

    if (mapBox && mapOverlay) {
        mapBox.addEventListener('mousemove', e => {
            if (mapOverlay.classList.contains('hidden')) return;
            const rect = mapBox.getBoundingClientRect();
            const rotateX = ((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -12;
            const rotateY = ((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 12;
            mapBox.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px) scale3d(1.05,1.05,1.05)`;
            mapBox.style.boxShadow = `${-rotateY}px ${rotateX + 30}px 60px rgba(0,0,0,0.6)`;
        });
        mapBox.addEventListener('mouseleave', () => {
            mapBox.style.transform = 'rotateX(0) rotateY(0) translateY(0) scale3d(1,1,1)';
            mapBox.style.boxShadow = '0 25px 60px rgba(0,0,0,0.55)';
        });
        mapOverlay.addEventListener('click', () => {
            mapOverlay.classList.add('hidden');
            mapBox.style.transform = 'rotateX(0) rotateY(0) translateY(0) scale3d(1,1,1)';
            mapBox.style.boxShadow = '0 25px 60px rgba(0,0,0,0.55)';
        });
    }
});
