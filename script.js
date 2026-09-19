document.addEventListener('DOMContentLoaded', () => {
  const motionReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Editorial word reveal for every major section heading. The source text is
  // retained as an accessible label while the visible words animate in sequence.
  const revealHeadings = document.querySelectorAll(
    '.section-header h2, .principles-title, .certs-heading, .contact-card h2'
  );

  revealHeadings.forEach(heading => {
    const originalText = heading.textContent.trim();
    if (!originalText || heading.dataset.fontRevealReady) return;

    heading.dataset.fontRevealReady = 'true';
    heading.classList.add('font-reveal');
    heading.setAttribute('aria-label', originalText);
    heading.textContent = '';

    originalText.split(/\s+/).forEach((word, index) => {
      const wordElement = document.createElement('span');
      wordElement.className = 'font-reveal-word';
      wordElement.style.setProperty('--word-index', index);
      wordElement.setAttribute('aria-hidden', 'true');
      wordElement.textContent = word;
      heading.appendChild(wordElement);
      if (index < originalText.trim().split(/\s+/).length - 1) {
        heading.appendChild(document.createTextNode(' '));
      }
    });
  });

  // Give repeated content a deliberate entrance rhythm, including sections
  // that originally had no reveal class (skills and certification cards).
  const staggerGroups = [
    '.skills-grid .skill-card',
    '.projects-list .project-card-layout',
    '.process-grid .process-card',
    '.principles-grid .principle-card',
    '.timeline .timeline-item',
    '.education-grid .education-card',
    '.certs-grid .cert-card'
  ];

  staggerGroups.forEach(selector => {
    document.querySelectorAll(selector).forEach((card, index) => {
      card.classList.add('reveal');
      card.style.setProperty('--reveal-delay', `${Math.min(index * 72, 360)}ms`);
    });
  });

  // Silent Typewriter Text Engine
  const typewriterElement = document.getElementById('typewriter');
  const phrases = [
    "PYTHON FULL-STACK DEVELOPER",
    "FLASK & REACT SPECIALIST",
    "BUILDING PRACTICAL WEB SYSTEMS",
    "MYSQL & DATABASE ARCHITECTURE"
  ];

  if (typewriterElement) {
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 90;

    function type() {
      const currentPhrase = phrases[phraseIndex];

      if (isDeleting) {
        typewriterElement.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 40;
      } else {
        typewriterElement.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 95;
      }

      if (!isDeleting && charIndex === currentPhrase.length) {
        typingSpeed = 2200; // Pause at full phrase
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typingSpeed = 400; // Pause before typing next phrase
      }

      setTimeout(type, typingSpeed);
    }

    setTimeout(type, 400);
  }

  // Mobile Menu Toggle
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const isActive = navLinks.classList.toggle('active');
      menuToggle.classList.toggle('active');
      menuToggle.setAttribute('aria-expanded', isActive);
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 3D Image Flip Card Click & Touch Handler
  const imageFlipCards = document.querySelectorAll('.image-flip-card');

  imageFlipCards.forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't toggle flip if clicking live demo or github links on the back card
      if (e.target.tagName === 'A' || e.target.closest('a')) return;
      card.classList.toggle('is-flipped');
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.classList.toggle('is-flipped');
      }
    });
  });

  // Optimized Scroll Reveal Observer (60FPS)
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -30px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('active'));
  }

  // Desktop Magnetic Buttons
  const magneticButtons = document.querySelectorAll('.magnetic');

  if (window.innerWidth > 992) {
    magneticButtons.forEach(btn => {
      let requestID = null;

      btn.addEventListener('mousemove', (e) => {
        if (requestID) cancelAnimationFrame(requestID);

        requestID = requestAnimationFrame(() => {
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;

          btn.style.transform = `translate3d(${x * 0.12}px, ${y * 0.12}px, 0)`;
        });
      });

      btn.addEventListener('mouseleave', () => {
        if (requestID) cancelAnimationFrame(requestID);
        btn.style.transform = 'translate3d(0px, 0px, 0)';
      });
    });
  }

  // Cursor Spotlight Glow Engine
  const spotlight = document.getElementById('cursorSpotlight');
  if (spotlight && window.innerWidth > 768) {
    let mouseX = 0, mouseY = 0;
    let spotX = 0, spotY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animateSpotlight() {
      spotX += (mouseX - spotX) * 0.12;
      spotY += (mouseY - spotY) * 0.12;
      spotlight.style.transform = `translate3d(${spotX}px, ${spotY}px, 0)`;
      requestAnimationFrame(animateSpotlight);
    }
    animateSpotlight();
  }

  // Dynamic Hero Interactions (Mouse Parallax & Scroll Movement)
  const prefersReducedMotion = motionReduced;

  if (!prefersReducedMotion && window.innerWidth > 768) {
    const heroPortraitImg = document.getElementById('heroPortraitImg');
    const heroTypography = document.querySelector('.hero-giant-typography');
    const heroSection = document.getElementById('hero');

    if (heroSection) {
      // Subtle Mouse Parallax on Portrait
      let mousePX = 0, mousePY = 0;
      let curPX = 0, curPY = 0;
      let parallaxRAF = null;

      window.addEventListener('mousemove', (e) => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        mousePX = ((e.clientX - cx) / cx) * 14;
        mousePY = ((e.clientY - cy) / cy) * 10;

        if (!parallaxRAF) {
          parallaxRAF = requestAnimationFrame(updateParallax);
        }
      });

      function updateParallax() {
        curPX += (mousePX - curPX) * 0.08;
        curPY += (mousePY - curPY) * 0.08;

        if (heroPortraitImg) {
          heroPortraitImg.style.transform = `translate3d(${curPX.toFixed(2)}px, ${curPY.toFixed(2)}px, 0)`;
        }

        if (Math.abs(mousePX - curPX) > 0.05 || Math.abs(mousePY - curPY) > 0.05) {
          parallaxRAF = requestAnimationFrame(updateParallax);
        } else {
          parallaxRAF = null;
        }
      }

      // Subtle Horizontal Movement on Large Name while Scrolling
      window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        if (scrolled < window.innerHeight && heroTypography) {
          const moveX = scrolled * 0.06;
          heroTypography.style.transform = `translate(-50%, 0) translateX(${moveX.toFixed(2)}px)`;
        }
      }, { passive: true });
    }
  }

  // 3D Card Hover Tilt Engine (MotionSites.ai Style)
  if (window.innerWidth > 992 && !prefersReducedMotion) {
    const tiltCards = document.querySelectorAll('.project-card-layout, .skill-card, .about-card, .education-card, .cert-card, .contact-card, .process-card, .principle-card, .timeline-content');

    tiltCards.forEach(card => {
      let tiltRAF = null;

      card.addEventListener('mousemove', (e) => {
        if (tiltRAF) cancelAnimationFrame(tiltRAF);

        tiltRAF = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;

          const rotateX = ((y - centerY) / centerY) * -2.5;
          const rotateY = ((x - centerX) / centerX) * 2.5;

          card.style.transform = `perspective(1400px) translate3d(0, -4px, 0) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.008, 1.008, 1.008)`;
          card.style.transition = 'transform 0.14s ease-out';
          card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
          card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
          card.classList.add('is-tilting');
        });
      });

      card.addEventListener('mouseleave', () => {
        if (tiltRAF) cancelAnimationFrame(tiltRAF);
        card.style.removeProperty('transform');
        card.style.removeProperty('transition');
        card.classList.remove('is-tilting');
      });
    });
  }

  // Interactive Chess Pieces Click & Jump Feature
  const chessPieces = document.querySelectorAll('.glass-piece');
  const pieceInfo = {
    'King': '♚ Strategic Foresight & Vision',
    'Knight': '♞ Agile Problem Solving',
    'Rook': '♜ Scalable System Architecture',
    'Pawn': '♟ Purposeful Execution'
  };

  chessPieces.forEach(piece => {
    piece.addEventListener('click', (e) => {
      e.stopPropagation();
      piece.classList.remove('piece-jump');
      void piece.offsetWidth; // Force reflow
      piece.classList.add('piece-jump');

      const title = piece.getAttribute('title') || 'Pawn';
      const desc = pieceInfo[title] || 'Strategic Move';

      // Floating Feedback Tag
      const toast = document.createElement('div');
      toast.className = 'chess-toast';
      toast.textContent = desc;
      toast.style.position = 'fixed';
      toast.style.left = `${e.clientX}px`;
      toast.style.top = `${e.clientY - 30}px`;
      toast.style.transform = 'translate(-50%, -50%)';
      toast.style.padding = '0.5rem 1rem';
      toast.style.borderRadius = '999px';
      toast.style.background = 'linear-gradient(135deg, #f0cf8e, #c9974f)';
      toast.style.color = '#140d06';
      toast.style.fontWeight = '900';
      toast.style.fontSize = '0.82rem';
      toast.style.boxShadow = '0 10px 25px rgba(201, 151, 79, 0.5)';
      toast.style.zIndex = '99999';
      toast.style.pointerEvents = 'none';
      toast.style.animation = 'floatToast 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards';

      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 1200);
    });
  });

  // Dynamic Live Token Ticker Simulation (Smart Queue Card)
  const tokenElement = document.querySelector('.token-banner');
  if (tokenElement) {
    let currentToken = 42;
    setInterval(() => {
      currentToken = (currentToken % 99) + 1;
      const formatted = currentToken < 10 ? '0' + currentToken : currentToken;
      tokenElement.innerHTML = `<span class="live-pulse-dot"></span> Now Serving: Token #0${formatted}`;
    }, 3800);
  }

  // Interactive Button Click Ripple Effect
  const rippleButtons = document.querySelectorAll('.primary-btn, .glass-btn, .nav-cta, .contact-brand-btn');
  rippleButtons.forEach(btn => {
    btn.addEventListener('click', function (e) {
      const circle = document.createElement('span');
      const diameter = Math.max(this.clientWidth, this.clientHeight);
      const radius = diameter / 2;
      const rect = this.getBoundingClientRect();

      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${e.clientX - rect.left - radius}px`;
      circle.style.top = `${e.clientY - rect.top - radius}px`;
      circle.classList.add('btn-ripple');

      const ripple = this.querySelector('.btn-ripple');
      if (ripple) ripple.remove();

      this.appendChild(circle);
      setTimeout(() => circle.remove(), 600);
    });
  });

  // Dynamic Stat Counters Engine
  const statNumbers = document.querySelectorAll('.stat-number');
  if (statNumbers.length > 0 && 'IntersectionObserver' in window) {
    const statsObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = parseInt(entry.target.getAttribute('data-target') || '0', 10);
          const suffix = entry.target.getAttribute('data-suffix') || '';
          let count = 0;
          const duration = 1200;
          const stepTime = Math.max(Math.floor(duration / (target || 1)), 40);

          const timer = setInterval(() => {
            count++;
            entry.target.textContent = (count < 10 ? '0' + count : count) + suffix;
            if (count >= target) {
              entry.target.textContent = (target < 10 ? '0' + target : target) + suffix;
              clearInterval(timer);
            }
          }, stepTime);

          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(num => statsObserver.observe(num));
  }

  // Scroll Progress Bar Tracker (60FPS)
  const scrollProgressBar = document.getElementById('scrollProgress');
  if (scrollProgressBar) {
    let scrollTicking = false;
    window.addEventListener('scroll', () => {
      if (!scrollTicking) {
        requestAnimationFrame(() => {
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
          scrollProgressBar.style.width = `${progress}%`;
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    }, { passive: true });
  }

  // Live Voting Bar Trigger
  const voteScreens = document.querySelectorAll('.vote-screen');
  if (voteScreens.length > 0 && 'IntersectionObserver' in window) {
    const voteObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.bar-fill').forEach(bar => {
            const percent = bar.style.getPropertyValue('--percent') || '50%';
            bar.style.width = '0%';
            setTimeout(() => {
              bar.style.width = percent;
            }, 150);
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    voteScreens.forEach(vs => voteObserver.observe(vs));
  }

  // 1-Click Copy Email to Clipboard Feature
  function handleCopyEmail(btn) {
    const email = btn.getAttribute('data-email') || 'jeromeofficial07@gmail.com';
    navigator.clipboard.writeText(email).then(() => {
      const textSpan = btn.querySelector('.btn-text') || btn.querySelector('.btn-label') || btn;
      const originalText = textSpan.textContent;
      textSpan.textContent = '✓ Copied to Clipboard!';
      btn.classList.add('is-copied');
      setTimeout(() => {
        textSpan.textContent = originalText;
        btn.classList.remove('is-copied');
      }, 2500);
    }).catch(() => {
      window.location.href = `mailto:${email}`;
    });
  }

  window.copyEmailToClipboard = handleCopyEmail;

  const copyEmailBtns = document.querySelectorAll('.copy-email-btn');
  copyEmailBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      handleCopyEmail(btn);
    });
  });
});
