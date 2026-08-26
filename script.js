const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

// --- Additive: Lenis smooth scrolling, driven by GSAP's own ticker so it
// stays in lockstep with ScrollTrigger below (the standard Lenis+GSAP
// pairing). Every existing scroll-driven effect further down (nav hide,
// chess sequence, parallax, section reveal) keeps working unmodified,
// since Lenis still drives the real window scroll position.
let lenis = null;
const hasGsap = Boolean(window.gsap && window.ScrollTrigger);

if (hasGsap) {
  window.gsap.registerPlugin(window.ScrollTrigger);
}

if (window.Lenis && !reduceMotion.matches) {
  lenis = new window.Lenis({
    duration: 1.05,
    smoothWheel: true,
    wheelMultiplier: 1,
  });

  if (hasGsap) {
    lenis.on("scroll", window.ScrollTrigger.update);
    window.gsap.ticker.add((time) => lenis.raf(time * 1000));
    window.gsap.ticker.lagSmoothing(0);
  } else {
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }
}

function smoothScrollTo(target) {
  if (lenis) {
    lenis.scrollTo(target, { offset: 0 });
  } else {
    target?.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
  }
}

// --- Additive: pinned, scroll-scrubbed sequences. Rather than every
// section simply stacking and fading in as it's reached (the rest of the
// page still works exactly that way), the hero and the skills stack get
// held in place while their content animates in response to scroll
// position — a "scene" the scrollbar drives, not just a page you pass.
if (hasGsap && !reduceMotion.matches) {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  // Hero: content and portrait ease out together as the page unpins,
  // revealing About underneath rather than simply scrolling past it.
  const heroPinTarget = document.querySelector(".hero");
  const heroContentEl = document.querySelector(".hero-content");
  const heroArtEl = document.querySelector(".hero-art");

  if (heroPinTarget && heroContentEl && heroArtEl) {
    gsap.timeline({
      scrollTrigger: {
        trigger: heroPinTarget,
        start: "top top",
        end: "+=90%",
        scrub: 0.6,
        pin: true,
        pinSpacing: true,
      },
    })
      .to(heroContentEl, { opacity: 0, y: -60, scale: 0.94, ease: "none" }, 0)
      .to(heroArtEl, { opacity: 0, y: -30, scale: 1.04, ease: "none" }, 0);
  }

  // Skills: the section pins briefly while each category row settles
  // into place in turn, tying the cascade directly to scroll position
  // instead of a fixed IntersectionObserver fade.
  const skillsPinTarget = document.querySelector(".skills");
  const stackRows = gsap.utils.toArray(".stack-row");

  if (skillsPinTarget && stackRows.length) {
    gsap.set(stackRows, { opacity: 0, y: 46 });

    gsap.timeline({
      scrollTrigger: {
        trigger: skillsPinTarget,
        start: "top top",
        end: `+=${stackRows.length * 32}%`,
        scrub: 0.6,
        pin: true,
        pinSpacing: true,
      },
    }).to(stackRows, {
      opacity: 1,
      y: 0,
      stagger: 1,
      ease: "none",
    });
  }
}

// --- Additive: full-screen page-load transition. Wipes away once the
// page has settled, then kicks off the hero title/image reveal so the
// arrival reads as one sequence rather than three unrelated animations.
const pageTransition = document.getElementById("pageTransition");

window.addEventListener("load", () => {
  const start = () => {
    pageTransition?.classList.add("is-hidden");
    document.querySelectorAll(".line-mask").forEach((line, index) => {
      setTimeout(() => line.classList.add("in"), index * 140);
    });
    const heroImg = document.querySelector(".portrait-frame .reveal-img");
    if (heroImg) heroImg.classList.add("img-in");
  };
  setTimeout(start, reduceMotion.matches ? 0 : 500);
});

// Route every in-page anchor link through the same smooth-scroll used by
// the progress rail, now that native CSS smooth-scrolling is switched off
// in favor of Lenis.
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const id = link.getAttribute("href");
    if (!id || id === "#") return;
    const target = document.querySelector(id);
    if (!target) return;
    event.preventDefault();
    smoothScrollTo(target);
  });
});

const stage = document.querySelector(".board-stage");
const magneticItems = document.querySelectorAll(".magnetic");

window.addEventListener("pointermove", (event) => {
  if (!stage || reduceMotion.matches) return;
  const driftX = (event.clientX / window.innerWidth - 0.5) * 18;
  const driftY = (event.clientY / window.innerHeight - 0.5) * 18;
  stage.style.transform = `translate3d(${driftX}px, ${driftY}px, 0)`;
});

magneticItems.forEach((item) => {
  item.addEventListener("pointerleave", () => {
    item.style.transform = "";
  });

  item.addEventListener("pointermove", (event) => {
    if (reduceMotion.matches) return;
    const rect = item.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    item.style.transform = `translate(${x * 0.12}px, ${y * 0.18 - 3}px)`;
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.18,
    rootMargin: "0px 0px -8% 0px",
  }
);

document.querySelectorAll(".reveal").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 5, 4) * 70}ms`;
  revealObserver.observe(element);
});

const sectionDividerObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        sectionDividerObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.08 }
);

document.querySelectorAll(".section:not(.hero)").forEach((section) => {
  sectionDividerObserver.observe(section);
});

const nav = document.querySelector(".nav");
let lastScrollY = window.scrollY;

// --- Signature sequence: the king and rook advance through a short opening
// as the hero scrolls past, with a small algebraic-notation label tracking
// the "move" that's currently active. Ties the chess motif to real scroll
// position instead of an arbitrary decorative loop.
const heroSection = document.querySelector(".hero");
const kingPiece = document.querySelector(".king-piece");
const rookPiece = document.querySelector(".rook-piece");
const moveIndexEl = document.querySelector(".move-index");
const moveTextEl = document.querySelector(".move-text");

const moves = [
  { label: "e4", note: "Opening move" },
  { label: "Nf3", note: "Developing" },
  { label: "O-O", note: "Castled — position secured" },
];

const clamp01 = (value) => Math.min(1, Math.max(0, value));

function updateChessSequence() {
  if (!heroSection || !kingPiece || !rookPiece) return;

  const rect = heroSection.getBoundingClientRect();
  const scrollableHeight = rect.height - window.innerHeight;
  const progress = reduceMotion.matches
    ? 0
    : clamp01(scrollableHeight > 0 ? -rect.top / scrollableHeight : 0);

  const stageCount = moves.length;
  const stageIndex = Math.min(stageCount - 1, Math.floor(progress * stageCount));

  kingPiece.style.transform = `translate(${progress * -60}px, ${progress * -30}px) scale(${1 + progress * 0.08})`;
  rookPiece.style.transform = `translate(${progress * 40}px, ${progress * -50}px) rotate(${progress * 8}deg)`;

  if (moveIndexEl && moveTextEl) {
    moveIndexEl.textContent = String(stageIndex + 1).padStart(2, "0");
    moveTextEl.textContent = `${moves[stageIndex].label} — ${moves[stageIndex].note}`;
  }
}

window.addEventListener("scroll", () => {
  const currentY = window.scrollY;
  if (nav) {
    nav.style.transform = currentY > lastScrollY && currentY > 120 ? "translateY(-130%)" : "translateY(0)";
  }
  lastScrollY = currentY;
  updateChessSequence();

  if (!reduceMotion.matches) {
    document.documentElement.style.setProperty("--page-scroll", `${currentY * 0.12}px`);
    updateHeadingParallax();
  }
}, { passive: true });

// --- Subtle per-heading parallax so scrolling feels like moving through
// one connected canvas rather than a stack of separate sections. Only
// applies once a heading has already finished its entrance reveal, so it
// never fights that animation.
const parallaxEls = document.querySelectorAll(".section:not(.hero) h2, .section-kicker");

function updateHeadingParallax() {
  const vh = window.innerHeight;
  parallaxEls.forEach((el) => {
    if (!el.classList.contains("visible")) return;
    const rect = el.getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    const offset = (center - vh / 2) * 0.06;
    el.style.transform = `translateY(${offset}px)`;
  });
}

window.addEventListener("resize", updateChessSequence);

updateChessSequence();

// --- Hero portrait: gentle idle float plus a cursor-responsive 3D tilt,
// so the landscape photo reads as a real tilted object rather than a
// flat, static crop.
const portraitFrame = document.querySelector(".portrait-frame");
const heroArt = document.querySelector(".hero-art");

if (portraitFrame && heroArt && !reduceMotion.matches) {
  let tiltX = 0;
  let tiltY = 0;
  let targetTiltX = 0;
  let targetTiltY = 0;

  heroArt.addEventListener("pointermove", (event) => {
    const rect = heroArt.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    targetTiltX = py * -10;
    targetTiltY = px * 16;
  });

  heroArt.addEventListener("pointerleave", () => {
    targetTiltX = 0;
    targetTiltY = 0;
  });

  function animatePortraitFrame(timestamp) {
    tiltX += (targetTiltX - tiltX) * 0.07;
    tiltY += (targetTiltY - tiltY) * 0.07;
    const float = Math.sin(timestamp / 1500) * 6;

    portraitFrame.style.transform =
      `rotateX(${8 + tiltX}deg) rotateY(${tiltY}deg) translateY(${float}px) rotate(-1.6deg)`;

    requestAnimationFrame(animatePortraitFrame);
  }

  requestAnimationFrame(animatePortraitFrame);
}

// --- Full-screen chess-phase menu: same overlay-nav pattern as the
// reference (numbered rows, staggered reveal), but every phase name
// maps to a real section, and the numbering encodes the game's actual
// order rather than an arbitrary count.
const menuToggle = document.querySelector(".menu-toggle");
const siteMenu = document.querySelector("#site-menu");
const siteMenuLinks = siteMenu ? siteMenu.querySelectorAll("a") : [];

function setMenuOpen(isOpen) {
  if (!menuToggle || !siteMenu) return;

  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close the game menu" : "Open the game menu");
  siteMenu.classList.toggle("is-open", isOpen);
  siteMenu.setAttribute("aria-hidden", String(!isOpen));
  document.body.style.overflow = isOpen ? "hidden" : "";

  siteMenuLinks.forEach((link) => {
    link.tabIndex = isOpen ? 0 : -1;
  });

  if (isOpen) {
    siteMenuLinks[0]?.focus();
  }
}

if (menuToggle && siteMenu) {
  menuToggle.addEventListener("click", () => {
    setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
  });

  siteMenuLinks.forEach((link) => {
    link.addEventListener("click", () => setMenuOpen(false));
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      setMenuOpen(false);
      menuToggle.focus();
    }
  });
}

// --- Hero stats count up from zero once they scroll into view, instead
// of just appearing — small detail, but it makes the numbers feel earned
// rather than printed.
const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const match = el.textContent.match(/\d+/);
      if (match && !reduceMotion.matches) {
        const target = Number(match[0]);
        const prefix = el.textContent.replace(match[0], "{n}").split("{n}")[0];
        const suffix = el.textContent.replace(match[0], "{n}").split("{n}")[1] || "";
        const duration = 900;
        const start = performance.now();

        function tick(now) {
          const progress = Math.min(1, (now - start) / duration);
          const value = Math.round(target * (1 - Math.pow(1 - progress, 3)));
          el.textContent = `${prefix}${String(value).padStart(match[0].length, "0")}${suffix}`;
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      }
      statObserver.unobserve(el);
    });
  },
  { threshold: 0.6 }
);

document.querySelectorAll(".hero-stats strong").forEach((el) => statObserver.observe(el));

// --- Subtle 3D tilt on skill and project cards for a more tactile, less
// "flat scroll" feel.
function attachCardTilt(el, maxDeg = 6) {
  el.addEventListener("pointermove", (event) => {
    if (reduceMotion.matches) return;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(800px) rotateX(${py * -maxDeg}deg) rotateY(${px * maxDeg}deg) translateY(-4px)`;
  });

  el.addEventListener("pointerleave", () => {
    el.style.transform = "";
  });
}

document.querySelectorAll(".stack-row, .project-card, .education-card, .info-item").forEach((el) => attachCardTilt(el));

// --- Additive: side progress rail. Highlights the active section as you
// scroll, and jumps to a section on click.
const railButtons = document.querySelectorAll(".progress-rail button");

if (railButtons.length) {
  railButtons.forEach((button) => {
    button.addEventListener("click", () => {
      smoothScrollTo(document.querySelector(button.dataset.target));
    });
  });

  const railObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const match = document.querySelector(`.progress-rail button[data-target="#${entry.target.id}"]`);
        if (!match) return;
        if (entry.isIntersecting) {
          railButtons.forEach((b) => b.classList.remove("is-active"));
          match.classList.add("is-active");
        }
      });
    },
    { threshold: 0.5, rootMargin: "-40% 0px -40% 0px" }
  );

  document.querySelectorAll("#hero, #about, #skills, #projects, #experience, #education, #contact").forEach((section) => {
    railObserver.observe(section);
  });
}

// --- Additive: custom cursor — a dot that tracks the pointer exactly and
// a ring that lags gently behind it, growing and filling gold whenever
// it passes over a link, button, or card. Fine-pointer devices only;
// the native cursor is left alone everywhere else.
const customCursor = document.querySelector(".custom-cursor");
const cursorDot = document.querySelector(".cursor-dot");
const cursorRing = document.querySelector(".cursor-ring");
const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

if (customCursor && cursorDot && cursorRing && !reduceMotion.matches && isFinePointer) {
  document.documentElement.classList.add("has-fine-pointer");

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  window.addEventListener("pointermove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    customCursor.classList.add("is-active");
    cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  });

  window.addEventListener("pointerleave", () => {
    customCursor.classList.remove("is-active");
  });

  function animateCursorRing() {
    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;
    cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateCursorRing);
  }

  requestAnimationFrame(animateCursorRing);

  document.querySelectorAll("a, button, .magnetic, .stack-row, .project-card").forEach((el) => {
    el.addEventListener("pointerenter", () => customCursor.classList.add("is-hover"));
    el.addEventListener("pointerleave", () => customCursor.classList.remove("is-hover"));
  });
}

// --- Additive: Three.js hero ornament — a slow-rotating faceted gold
// wireframe sitting behind the portrait frame for extra depth. Purely
// decorative, so it fails silently if Three.js hasn't loaded.
const hero3dCanvas = document.getElementById("hero3d");

if (hero3dCanvas && window.THREE) {
  const renderer = new window.THREE.WebGLRenderer({ canvas: hero3dCanvas, alpha: true, antialias: true });
  const camera = new window.THREE.PerspectiveCamera(45, 1, 0.1, 100);
  const scene = new window.THREE.Scene();

  camera.position.z = 4.2;

  const geometry = new window.THREE.IcosahedronGeometry(1.4, 0);
  const material = new window.THREE.MeshBasicMaterial({ color: 0xc9974f, wireframe: true, transparent: true, opacity: 0.7 });
  const shape = new window.THREE.Mesh(geometry, material);
  scene.add(shape);

  function sizeHero3d() {
    const size = hero3dCanvas.clientWidth || 320;
    renderer.setSize(size, size, false);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
  }

  sizeHero3d();
  window.addEventListener("resize", sizeHero3d);

  let targetRotX = 0;
  let targetRotY = 0;
  let scrollSpin = 0;

  // Additive: on top of the idle spin and pointer-tilt below, a slow
  // roll on the z-axis tracks overall page-scroll progress directly —
  // the ornament keeps turning in step with the scrollbar, not just on
  // its own clock.
  if (hasGsap) {
    window.ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        scrollSpin = self.progress;
      },
    });
  }

  hero3dCanvas.addEventListener("pointermove", (event) => {
    if (reduceMotion.matches) return;
    const rect = hero3dCanvas.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    targetRotY = px * 0.6;
    targetRotX = py * -0.6;
  });

  function animateHero3d() {
    if (!reduceMotion.matches) {
      shape.rotation.y += 0.004;
      shape.rotation.x += (targetRotX - shape.rotation.x) * 0.05;
      shape.rotation.y += (targetRotY - shape.rotation.y) * 0.05;
      shape.rotation.z = scrollSpin * Math.PI * 2;
      renderer.render(scene, camera);
      requestAnimationFrame(animateHero3d);
    } else {
      renderer.render(scene, camera);
    }
  }

  animateHero3d();
}

// --- Additive: project image reveal. A curtain wipe uncovers each
// .reveal-img as it scrolls into view (the hero image is triggered
// separately by the page-load transition above, not by this observer).
const imageRevealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("img-in");
        imageRevealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.3 }
);

document.querySelectorAll(".reveal-img:not(.portrait-frame .reveal-img)").forEach((img) => {
  imageRevealObserver.observe(img);
});

// --- Additive: featured-project flip card. Click or press Enter/Space to
// flip the preview and reveal the "Visit Project" call-to-action; click
// or press again to flip it back.
const projectFlip = document.getElementById("projectFlip");

if (projectFlip) {
  function toggleProjectFlip() {
    const isFlipped = projectFlip.classList.toggle("is-flipped");
    projectFlip.setAttribute("aria-pressed", String(isFlipped));
  }

  projectFlip.addEventListener("click", toggleProjectFlip);
  projectFlip.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleProjectFlip();
    }
  });
}

// --- Additive: brief text-scramble on hover for skill/project titles and
// project tags, echoing the "matrix scramble" micro-interaction. Resolves
// back to the real text; skipped entirely under reduced motion.
const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ♔♕♖♗♘♙";

function scrambleText(el) {
  if (reduceMotion.matches || el.dataset.scrambling === "true") return;
  el.dataset.scrambling = "true";

  const original = el.dataset.originalText || el.textContent;
  el.dataset.originalText = original;

  const totalFrames = 12;
  let frame = 0;

  const interval = setInterval(() => {
    frame += 1;
    const revealCount = Math.floor((frame / totalFrames) * original.length);

    el.textContent = original
      .split("")
      .map((ch, i) => {
        if (ch === " " || i < revealCount) return ch;
        return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      })
      .join("");

    if (frame >= totalFrames) {
      el.textContent = original;
      el.dataset.scrambling = "false";
      clearInterval(interval);
    }
  }, 32);
}

document.querySelectorAll(".stack-tags span, .project-card h3, .project-tags span").forEach((el) => {
  el.addEventListener("pointerenter", () => scrambleText(el));
});