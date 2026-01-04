(function () {
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const header = document.querySelector('.site-header');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !isOpen);
      navMenu.classList.toggle('is-open', !isOpen);
    });

    navMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('is-open');
      });
    });
  }

  if (header && document.body.classList.contains('home')) {
    window.addEventListener('scroll', function () {
      const currentScroll = window.pageYOffset;
      
      if (currentScroll > 100) {
        header.style.background = 'rgba(10, 10, 10, 0.95)';
        header.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
      } else {
        header.style.background = 'transparent';
        header.style.borderBottom = 'none';
      }
    }, { passive: true });
  }

  const heroSlides = document.querySelectorAll('.hero-slide');
  const heroNavBtns = document.querySelectorAll('.hero-nav-btn');
  
  if (heroSlides.length > 0) {
    let currentSlide = 0;
    let slideInterval;

    function showSlide(index) {
      heroSlides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
      });
      heroNavBtns.forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
      });
      currentSlide = index;
    }

    function nextSlide() {
      const next = (currentSlide + 1) % heroSlides.length;
      showSlide(next);
    }

    function startSlideshow() {
      slideInterval = setInterval(nextSlide, 5000);
    }

    function stopSlideshow() {
      clearInterval(slideInterval);
    }

    heroNavBtns.forEach((btn, index) => {
      btn.addEventListener('click', function () {
        stopSlideshow();
        showSlide(index);
        startSlideshow();
      });
    });

    startSlideshow();
  }

  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item[data-category]');

  if (filterBtns.length > 0 && galleryItems.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        const filter = this.dataset.filter;
        
        filterBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        galleryItems.forEach(item => {
          if (filter === 'all' || item.dataset.category === filter) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.querySelector('.lightbox-image');
  const lightboxClose = document.querySelector('.lightbox-close');
  const lightboxPrev = document.querySelector('.lightbox-prev');
  const lightboxNext = document.querySelector('.lightbox-next');
  const lightboxTriggers = document.querySelectorAll('[data-lightbox]');

  if (lightbox && lightboxTriggers.length > 0) {
    let currentImageIndex = 0;
    const images = Array.from(lightboxTriggers).map(trigger => trigger.href);

    function openLightbox(index) {
      currentImageIndex = index;
      lightboxImage.src = images[index];
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }

    function showPrevImage() {
      currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
      lightboxImage.src = images[currentImageIndex];
    }

    function showNextImage() {
      currentImageIndex = (currentImageIndex + 1) % images.length;
      lightboxImage.src = images[currentImageIndex];
    }

    lightboxTriggers.forEach((trigger, index) => {
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        openLightbox(index);
      });
    });

    if (lightboxClose) {
      lightboxClose.addEventListener('click', closeLightbox);
    }

    if (lightboxPrev) {
      lightboxPrev.addEventListener('click', showPrevImage);
    }

    if (lightboxNext) {
      lightboxNext.addEventListener('click', showNextImage);
    }

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('active')) return;
      
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrevImage();
      if (e.key === 'ArrowRight') showNextImage();
    });
  }
})();
