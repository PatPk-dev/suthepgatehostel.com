/* ===================================================
   MAIN.JS — Suthep Gate Hostel
   Navbar scroll, animations, carousel, counter
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollReveal();
  initStatsCounter();
  // initReviewsCarousel(); // Disabled for new grid layout
  initMobileMenu();
  initBackToTop();
  initLightbox();
  initFAQ();
  loadDynamicContent();
});

/* --- Load Dynamic Content from JSON --- */
async function loadDynamicContent() {
  try {
    const res = await fetch(`/data/content.json?t=${Date.now()}`);
    if (!res.ok) return;
    const data = await res.json();
    window.siteContent = data;

    // Update SEO meta if on specific pages
    updateSEO(data.seo);

    // Update booking links
    if (data.bookingUrl) {
      document.querySelectorAll('.booking-link').forEach(el => {
        el.href = data.bookingUrl;
      });
    }

    // Update hero
    if (data.hero) {
      const heroTitle = document.getElementById('hero-title');
      const heroSubtitle = document.getElementById('hero-subtitle');
      if (heroTitle) heroTitle.textContent = data.hero.title;
      if (heroSubtitle) heroSubtitle.textContent = data.hero.subtitle;
    }

    // Apply site images from admin
    if (data.siteImages) {
      applySiteImages(data.siteImages);
    }

    // Update rooms
    if (data.rooms) {
      renderRooms(data.rooms, data.bookingUrl);
    }

    // Update stats
    if (data.stats) {
      renderStats(data.stats);
    }

    // Update reviews
    if (data.reviews) {
      renderReviews(data.reviews);
    }

    // Update facilities
    if (data.facilities) {
      renderFacilities(data.facilities);
    }

    // Update location
    if (data.location) {
      renderLocation(data.location);
    }

    // Update footer
    if (data.location) {
      renderFooterContact(data.location);
    }

  } catch (err) {
    console.log('Using static content (no server)');
  }
}

/* --- SEO Update --- */
function updateSEO(seo) {
  if (!seo) return;
  const page = document.body.dataset.page || 'index';
  const pageSeo = seo[page];
  if (!pageSeo) return;

  if (pageSeo.title) document.title = pageSeo.title;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && pageSeo.description) metaDesc.content = pageSeo.description;
  const metaKeywords = document.querySelector('meta[name="keywords"]');
  if (metaKeywords && pageSeo.keywords) metaKeywords.content = pageSeo.keywords;
}

/* --- Render Rooms --- */
function renderRooms(rooms, bookingUrl) {
  const container = document.getElementById('rooms-container');
  if (!container) return;
  container.innerHTML = rooms.map(room => `
    <article class="room-card reveal" itemscope itemtype="https://schema.org/HotelRoom">
      <div class="room-image">
        <img src="${room.image}" alt="${room.name} - Suthep Gate Hostel" loading="lazy" width="400" height="260" itemprop="photo">
        <div class="room-price-badge" itemprop="priceRange">${room.price}<small>${room.priceNote}</small></div>
      </div>
      <div class="room-info">
        <h3 itemprop="name">${room.name}</h3>
        <div class="room-name-th">${room.nameTh}</div>
        <p itemprop="description">${room.description}</p>
        <div class="room-amenities">
          ${room.amenities.slice(0, 4).map(a => `<span class="room-amenity">${a}</span>`).join('')}
        </div>
        <div class="room-footer">
          <span class="room-capacity">👥 ${room.capacity}</span>
          <a href="${bookingUrl || '#booking'}" target="_blank" rel="noopener" class="btn btn-primary room-book-btn booking-link">Book Now</a>
        </div>
      </div>
    </article>
  `).join('');
  initScrollReveal();
}

/* --- Render Stats --- */
function renderStats(stats) {
  const container = document.getElementById('stats-container');
  if (!container) return;
  container.innerHTML = stats.map(s => `
    <div class="stat-item reveal">
      <div class="stat-number" data-target="${s.number}" data-suffix="${s.suffix}">0${s.suffix}</div>
      <div class="stat-label">${s.label}</div>
    </div>
  `).join('');
  initStatsCounter();
  initScrollReveal();
}

/* --- Render Reviews --- */
function renderReviews(reviews) {
  const container = document.getElementById('reviews-track');
  if (!container) return;

  // Clear any carousel styles
  container.style.transform = '';
  container.style.transition = '';

  // Star SVG path
  const starPath = "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";

  const getStars = (count) => {
    let html = '';
    for (let i = 0; i < count; i++) {
      html += `<svg class="review-star-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor"><path d="${starPath}"></path></svg>`;
    }
    return html;
  };

  container.innerHTML = reviews.map(r => `
    <div class="review-card">
      <p class="review-name">${r.name}</p>
      <p class="review-text">"${r.text}"</p>
      <div class="review-stars-container">
        ${getStars(r.rating || 5)}
      </div>
    </div>
  `).join('');

  // Hide navigation buttons as we are now using a static grid
  const nav = document.querySelector('.reviews-nav');
  if (nav) nav.style.display = 'none';

  // No carousel init
  // initReviewsCarousel(); 
}

/* --- Render Facilities --- */
function renderFacilities(facilities) {
  const container = document.getElementById('facilities-container');
  if (!container) return;
  container.innerHTML = facilities.map(f => `
    <div class="facility-card reveal">
      <div class="facility-icon">${f.icon}</div>
      <div class="facility-name">${f.name}</div>
    </div>
  `).join('');
  initScrollReveal();
}

/* --- Render Location --- */
function renderLocation(location) {
  const container = document.getElementById('nearby-places');
  if (!container || !location.nearbyPlaces) return;
  container.innerHTML = location.nearbyPlaces.map(p => `
    <div class="nearby-item">
      <span class="nearby-name">${p.name}</span>
      <span class="nearby-distance">${p.distance}</span>
    </div>
  `).join('');

  const mapEl = document.getElementById('location-map');
  if (mapEl && location.mapEmbed) {
    mapEl.innerHTML = `<iframe src="${location.mapEmbed}" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Suthep Gate Hostel Location"></iframe>`;
  }
}

/* --- Render Footer Contact --- */
function renderFooterContact(location) {
  const el = document.getElementById('footer-contact');
  if (!el) return;
  el.innerHTML = `
    <p>📍 ${location.addressEn || location.address}</p>
    <p>📞 ${location.phone}</p>
    <p>✉️ ${location.email}</p>
    <p>💬 LINE: ${location.line}</p>
  `;
}

/* --- Navbar Scroll Effect --- */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const onScroll = () => {
    if (window.scrollY > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* --- Mobile Menu --- */
function initMobileMenu() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    links.classList.toggle('open');
    document.body.style.overflow = links.classList.contains('open') ? 'hidden' : '';
  });

  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      toggle.classList.remove('active');
      links.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* --- Scroll Reveal --- */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, index * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(el => {
    if (!el.classList.contains('visible')) {
      observer.observe(el);
    }
  });
}

/* --- Stats Counter Animation --- */
function initStatsCounter() {
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  if (!statNumbers.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => observer.observe(el));
}

function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const isDecimal = target % 1 !== 0;
  const duration = 2000;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    const current = target * eased;

    if (isDecimal) {
      el.textContent = current.toFixed(1) + suffix;
    } else {
      el.textContent = Math.floor(current).toLocaleString() + suffix;
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

/* --- Reviews Carousel (Infinite Loop) --- */
function initReviewsCarousel() {
  const track = document.getElementById('reviews-track');
  const prevBtn = document.getElementById('reviews-prev');
  const nextBtn = document.getElementById('reviews-next');
  if (!track || !prevBtn || !nextBtn) return;

  // Clear existing clones if any (prevent duplication on re-init)
  const existingClones = track.querySelectorAll('.clone');
  existingClones.forEach(el => el.remove());

  const originalCards = Array.from(track.children);
  const cardCount = originalCards.length;
  if (cardCount === 0) return;

  // Determine how many clones we need (enough to cover the widest view)
  // Max visible cards usually 4 (desktop), so 4 clones at each end is safe
  const cloneCount = 4;

  // Clone End -> Start (for prev loop)
  for (let i = 0; i < cloneCount; i++) {
    const originalIndex = (cardCount - 1 - i + cardCount) % cardCount; // safe modulo
    const clone = originalCards[originalIndex].cloneNode(true);
    clone.classList.add('clone');
    clone.setAttribute('aria-hidden', 'true');
    track.prepend(clone);
  }

  // Clone Start -> End (for next loop)
  for (let i = 0; i < cloneCount; i++) {
    const clone = originalCards[i % cardCount].cloneNode(true);
    clone.classList.add('clone');
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  }

  // Initial state: shifted by cloneCount
  let currentIndex = cloneCount;
  const params = { isJumping: false }; // Lock state during jump

  function getCardWidth() {
    const cards = track.children;
    if (!cards.length) return 0;
    // card width + gap (24px defined in CSS)
    return cards[0].offsetWidth + 24;
  }

  function getVisibleCount() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    if (window.innerWidth <= 1280) return 3;
    return 4; // Show 4 cards on very large screens
  }

  function updateCarousel(instant = false) {
    const cardWidth = getCardWidth();
    // Center logic? No, standard left-align carousel
    // If we want centering with variable width, we might need offset adjustment
    // but the request was "make it narrower to see many". Left align is standard.

    if (instant) {
      track.style.transition = 'none';
      track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
      track.offsetHeight; // Force reflow
      track.style.transition = ''; // Restore CSS transition
    } else {
      track.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
      track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
    }
  }

  // Set initial position without animation
  // Use timeout to ensure DOM is ready and width is calculated
  setTimeout(() => updateCarousel(true), 50);

  // Handle loop jump on transition end
  track.addEventListener('transitionend', () => {
    if (params.isJumping) return;

    // If we scrolled past the real last item to the first end-clone
    if (currentIndex >= cardCount + cloneCount) {
      params.isJumping = true;
      currentIndex = cloneCount; // Jump to real first item
      updateCarousel(true);
      setTimeout(() => { params.isJumping = false; }, 50);
    }
    // If we scrolled past the real first item to the last start-clone
    else if (currentIndex < cloneCount) {
      params.isJumping = true;
      currentIndex = cardCount + cloneCount - 1; // Jump to real last item (adjusted logic)
      // Actually simpler: 
      // The start clones are [End3, End2, End1] ... [Real1...RealN] ... [Start1, Start2, Start3]
      // Index < cloneCount means we are in start clones.
      // If index becomes cloneCount - 1 (which acts as LastItem), we want to jump to RealLastItem index.
      // RealLastItem index is cloneCount + cardCount - 1.
      currentIndex = cloneCount + cardCount - (cloneCount - currentIndex);
      updateCarousel(true);
      setTimeout(() => { params.isJumping = false; }, 50);
    }
  });

  const nextSlide = () => {
    if (currentIndex >= track.children.length - 1) return; // Prevention
    currentIndex++;
    updateCarousel();
  };

  const prevSlide = () => {
    if (currentIndex <= 0) return; // Prevention
    currentIndex--;
    updateCarousel();
  };

  // Event Listeners
  nextBtn.addEventListener('click', () => {
    stopAutoplay();
    nextSlide();
    startAutoplay();
  });

  prevBtn.addEventListener('click', () => {
    stopAutoplay();
    prevSlide();
    startAutoplay();
  });

  // Autoplay
  let autoplayInterval;
  function startAutoplay() {
    stopAutoplay();
    autoplayInterval = setInterval(nextSlide, 4000);
  }

  function stopAutoplay() {
    clearInterval(autoplayInterval);
  }

  startAutoplay();
  track.parentElement.addEventListener('mouseenter', stopAutoplay);
  track.parentElement.addEventListener('mouseleave', startAutoplay);

  // Re-calculate width on resize (reset position to safe index)
  window.addEventListener('resize', () => {
    // Optional: reset to a safe "real" index on heavy resize to avoid alignment issues
    currentIndex = cloneCount;
    updateCarousel(true);
  });
}

/* --- Back to Top --- */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* --- Lightbox --- */
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  const lightboxImg = lightbox.querySelector('img');

  document.querySelectorAll('.gallery-item img').forEach(img => {
    img.addEventListener('click', () => {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

/* --- FAQ Accordion --- */
function initFAQ() {
  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.parentElement;
      const wasActive = item.classList.contains('active');

      // Close all
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));

      // Toggle clicked
      if (!wasActive) {
        item.classList.add('active');
      }
    });
  });
}

/* --- Apply Site Images from Admin --- */
function applySiteImages(siteImages) {
  const page = document.body.dataset.page || 'index';

  // Hero background (CSS)
  if (siteImages.hero && page === 'index') {
    const heroBg = document.querySelector('.hero-bg');
    if (heroBg) {
      heroBg.style.backgroundImage = `url('${siteImages.hero.url}')`;
    }
  }

  // About section image (homepage)
  if (siteImages.about && page === 'index') {
    const aboutImg = document.querySelector('#about .about-image img');
    if (aboutImg) aboutImg.src = siteImages.about.url;
  }

  // Room images (homepage)
  if (page === 'index') {
    const roomCards = document.querySelectorAll('#rooms .room-card');
    const roomKeys = ['roomDorm', 'roomPrivate', 'roomDeluxe'];
    roomCards.forEach((card, i) => {
      if (siteImages[roomKeys[i]]) {
        const img = card.querySelector('.room-image img');
        if (img) img.src = siteImages[roomKeys[i]].url;
      }
    });
  }

  // Gallery images (homepage)
  if (page === 'index') {
    const galleryItems = document.querySelectorAll('.gallery-item img');
    for (let i = 0; i < galleryItems.length; i++) {
      const key = 'gallery' + (i + 1);
      if (siteImages[key]) {
        galleryItems[i].src = siteImages[key].url;
      }
    }
  }

  // About page image
  if (siteImages.aboutPage && page === 'about') {
    const aboutPageImg = document.querySelector('.about-image img');
    if (aboutPageImg) aboutPageImg.src = siteImages.aboutPage.url;
  }

  // Blog page images (static fallback cards)
  if (page === 'blog') {
    const blogCards = document.querySelectorAll('.blog-card');
    const blogKeys = ['blog1', 'blog2', 'blog3'];
    blogCards.forEach((card, i) => {
      if (siteImages[blogKeys[i]]) {
        const img = card.querySelector('.blog-image img');
        if (img) img.src = siteImages[blogKeys[i]].url;
      }
    });
  }

  // Rooms page images
  if (page === 'rooms') {
    const roomMapping = {
      'dorm': 'roomDorm',
      'private': 'roomPrivate',
      'deluxe': 'roomDeluxe'
    };
    Object.entries(roomMapping).forEach(([sectionId, imgKey]) => {
      if (siteImages[imgKey]) {
        const section = document.getElementById(sectionId);
        if (section) {
          const img = section.querySelector('img');
          if (img) img.src = siteImages[imgKey].url;
        }
      }
    });
  }
}

/* --- Blog loader (for blog page) --- */
async function loadBlogPosts() {
  try {
    const res = await fetch(`/data/blog.json?t=${Date.now()}`);
    if (!res.ok) return;
    const data = await res.json();

    const container = document.getElementById('blog-container');
    if (!container || !data.posts) return;

    container.innerHTML = data.posts.map(post => `
      <a href="/blog-post.html?slug=${post.slug}" class="blog-card reveal" itemscope itemtype="https://schema.org/BlogPosting" style="text-decoration:none; color:inherit;">
        <div class="blog-image">
          <img src="${post.image}" alt="${post.title}" loading="lazy" width="400" height="220" itemprop="image">
        </div>
        <div class="blog-content">
          <time class="blog-date" datetime="${post.date}" itemprop="datePublished">${new Date(post.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
          <h3 itemprop="headline">${post.title}</h3>
          <p itemprop="description" class="th">${post.excerpt}</p>
          <div class="blog-tags">
            ${post.tags.map(t => `<span class="blog-tag">${t}</span>`).join('')}
          </div>
        </div>
      </a>
    `).join('');

    initScrollReveal();
  } catch (err) {
    console.log('Blog data not available');
  }
}
