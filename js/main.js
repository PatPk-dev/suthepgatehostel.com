/* ===================================================
   MAIN.JS — Suthep Gate Hostel
   Navbar scroll, animations, carousel, counter
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollReveal();
  initStatsCounter();
  initReviewsCarousel();
  initMobileMenu();
  initBackToTop();
  initLightbox();
  initFAQ();
  loadDynamicContent();
});

/* --- Load Dynamic Content from JSON --- */
async function loadDynamicContent() {
  try {
    const res = await fetch('/data/content.json');
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
  container.innerHTML = reviews.map(r => `
    <div class="review-card">
      <div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
      <p class="review-text">${r.text}</p>
      <div class="review-author">
        <div class="review-avatar">${r.name.charAt(0)}</div>
        <div>
          <div class="review-name">${r.name}</div>
          <div class="review-country">${r.country}</div>
        </div>
      </div>
    </div>
  `).join('');
  initReviewsCarousel();
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

/* --- Reviews Carousel --- */
function initReviewsCarousel() {
  const track = document.getElementById('reviews-track');
  const prevBtn = document.getElementById('reviews-prev');
  const nextBtn = document.getElementById('reviews-next');
  if (!track || !prevBtn || !nextBtn) return;

  let currentIndex = 0;
  const cards = track.children;
  if (!cards.length) return;

  function getVisibleCount() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  function updateCarousel() {
    const visibleCount = getVisibleCount();
    const maxIndex = Math.max(0, cards.length - visibleCount);
    currentIndex = Math.min(currentIndex, maxIndex);

    const cardWidth = cards[0].offsetWidth + 24; // gap
    track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
  }

  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) currentIndex--;
    updateCarousel();
  });

  nextBtn.addEventListener('click', () => {
    const visibleCount = getVisibleCount();
    const maxIndex = Math.max(0, cards.length - visibleCount);
    if (currentIndex < maxIndex) currentIndex++;
    updateCarousel();
  });

  window.addEventListener('resize', updateCarousel);

  // Auto-play
  let autoplay = setInterval(() => {
    const visibleCount = getVisibleCount();
    const maxIndex = Math.max(0, cards.length - visibleCount);
    currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
    updateCarousel();
  }, 5000);

  track.parentElement.addEventListener('mouseenter', () => clearInterval(autoplay));
  track.parentElement.addEventListener('mouseleave', () => {
    autoplay = setInterval(() => {
      const visibleCount = getVisibleCount();
      const maxIndex = Math.max(0, cards.length - visibleCount);
      currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
      updateCarousel();
    }, 5000);
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
    const res = await fetch('/data/blog.json');
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
