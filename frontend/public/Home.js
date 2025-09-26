// Home.js - improved + defensive (drop-in replacement)
document.addEventListener("DOMContentLoaded", () => {
  /* -----------------------
     Small helpers
  ------------------------*/
  const safe = (id) => document.getElementById(id);
  const qs = (sel) => document.querySelector(sel);
  const qsa = (sel) => Array.from(document.querySelectorAll(sel));
  const delay = (ms) => new Promise(res => setTimeout(res, ms));

  // Remember last focused element before opening modal (for restore)
  let lastFocusedEl = null;

  /* -----------------------
     NAVBAR / THEME / SCROLL
  ------------------------*/
  const menuToggle = safe("menu-toggle");
  const navLinks = safe("nav-links");
  if (menuToggle && navLinks) {
    // toggle class + aria-expanded for accessibility
    menuToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("show");
      menuToggle.setAttribute("aria-expanded", String(!!isOpen));
    });
  }

  const backToTop = safe("backToTop");
  window.addEventListener("scroll", () => {
    const nav = qs(".navbar");
    nav?.classList.toggle("scrolled", window.scrollY > 50);
    if (backToTop) backToTop.style.display = window.scrollY > 200 ? "block" : "none";
  });
  backToTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  safe("themeToggle")?.addEventListener("click", () => {
    document.body.classList.toggle("light");
    // persist choice (optional)
    try { localStorage.setItem("theme", document.body.classList.contains("light") ? "light" : "dark"); } catch(e) {}
  });

  /* -----------------------
     BUILD AI / TEMPLATES (defensive)
  ------------------------*/
  const buildAiBtn = safe("buildAiBtn");
  if (buildAiBtn) {
    buildAiBtn.addEventListener("click", () => {
      const gameName = safe("gameName")?.value || "Untitled Game";
      const gameType = safe("gameType")?.value || "2D";
      const genre = safe("genre")?.value || "platformer";
      const style = safe("style")?.value || "pixel";
      try {
        localStorage.setItem("gameName", gameName);
        localStorage.setItem("gameType", gameType);
        localStorage.setItem("genre", genre);
        localStorage.setItem("style", style);
      } catch (e) {}
      window.location.href = "ai-builder.html";
    });
  }
  safe("browseTemplatesBtn")?.addEventListener("click", () => window.location.href = "template.html");

  /* -----------------------
     GALLERY LIGHTBOX
  ------------------------*/
  const galleryImages = qsa(".gallery-img");
  const lightbox = safe("lightbox");         // note: lightbox in HTML uses class "lightbox" (not .modal)
  const lightboxImg = safe("lightboxImg");
  const closeLightbox = safe("closeLightbox");
  const prevBtn = safe("prevBtn");
  const nextBtn = safe("nextBtn");
  let currentIndex = 0;

  // helper to open any modal-like element (works for .modal or lightbox)
  function openModalByElement(modalEl, focusSelector) {
    if (!modalEl) return;
    lastFocusedEl = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    modalEl.classList.add("show");
    modalEl.style.display = modalEl.style.display || "flex";
    modalEl.removeAttribute("hidden");
    document.body.style.overflow = "hidden";

    try { modalEl.setAttribute("aria-hidden", "false"); } catch (e) {}

    // small autofocus to first focusable element or provided selector
    setTimeout(() => {
      let input = null;
      if (focusSelector) input = modalEl.querySelector(focusSelector);
      if (!input) input = modalEl.querySelector("button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])");
      (input || modalEl).focus?.();
    }, 60);
  }

  function closeModalByElement(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove("show");
    // remove inline scroll lock after transition
    setTimeout(() => {
      try { modalEl.setAttribute("hidden", ""); } catch (err) {}
      try { modalEl.style.display = "none"; } catch (err) {}
      try { modalEl.setAttribute("aria-hidden", "true"); } catch (e) {}
      // only enable scrolling if no other overlays are visible
      const anyOpen = document.querySelectorAll(".modal.show, .lightbox.show").length > 0;
      if (!anyOpen) document.body.style.overflow = "";
    }, 240);

    // restore previous focus (defensive)
    setTimeout(() => { try { lastFocusedEl?.focus?.(); } catch(e) {} }, 300);
  }

  function showImage(i) {
    if (!galleryImages.length || !lightbox || !lightboxImg) return;
    currentIndex = ((i % galleryImages.length) + galleryImages.length) % galleryImages.length;
    const src = galleryImages[currentIndex].dataset?.src || galleryImages[currentIndex].src;
    lightboxImg.src = src;
    // set alt from clicked image if available
    lightboxImg.alt = galleryImages[currentIndex].alt || "Gallery image";
    openModalByElement(lightbox, ".close-lightbox");
  }

  if (galleryImages.length && lightbox && lightboxImg) {
    galleryImages.forEach((img, i) => img.addEventListener("click", () => showImage(i)));
    closeLightbox?.addEventListener("click", () => closeModalByElement(lightbox));
    prevBtn?.addEventListener("click", (e) => { e?.preventDefault(); showImage((currentIndex - 1 + galleryImages.length) % galleryImages.length); });
    nextBtn?.addEventListener("click", (e) => { e?.preventDefault(); showImage((currentIndex + 1) % galleryImages.length); });

    // keyboard navigation for lightbox
    document.addEventListener("keydown", (e) => {
      if (!lightbox || !lightbox.classList.contains("show")) return;
      if (e.key === "Escape") closeModalByElement(lightbox);
      if (e.key === "ArrowLeft") showImage((currentIndex - 1 + galleryImages.length) % galleryImages.length);
      if (e.key === "ArrowRight") showImage((currentIndex + 1) % galleryImages.length);
    });
  }

  /* -----------------------
     AI Modal (defensive)
  ------------------------*/
  const aiBtn = safe("aiBtn");
  const aiModal = safe("aiModal");
  const aiClose = safe("aiClose");
  const aiForm = safe("aiForm");
  const aiResult = safe("aiResult");

  aiBtn?.addEventListener("click", (e) => { e?.preventDefault(); openModalByElement(aiModal, "#genre"); });
  aiClose?.addEventListener("click", () => closeModalByElement(aiModal));
  aiForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!aiResult) return;
    const selects = Array.from(aiForm.querySelectorAll("select")).map(s => s.value);
    if (selects.some(v => !v || v.trim() === "")) {
      aiResult.textContent = "❌ Please select all fields before building.";
      aiResult.style.display = "block";
      return;
    }
    aiResult.style.display = "block";
    aiResult.textContent = "⏳ Building...";
    const prompt = `Make a ${selects[0]} game for ${selects[1]} with ${selects[2]} style`;
    try {
      const res = await fetch("/api/ai", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) aiResult.innerHTML = `✅ Game generated! Folder: <strong>${(data.result && data.result.folder) || 'output'}</strong>`;
      else aiResult.textContent = `❌ ${data.error || data.message || 'Failed to generate game'}`;
    } catch (err) {
      console.error(err);
      aiResult.textContent = "❌ Server error. Please try again later.";
    }
    // hide form to show result (as in original)
    aiForm.style.display = "none";
  });

  /* -----------------------
     TESTIMONIALS
  ------------------------*/
  const testimonials = qsa(".testimonial");
  let tIndex = 0;
  if (testimonials.length) {
    const showTestimonial = (i) => {
      testimonials.forEach(t => t.classList.remove("active"));
      testimonials[i].classList.add("active");
    };
    showTestimonial(0);
    setInterval(() => { tIndex = (tIndex + 1) % testimonials.length; showTestimonial(tIndex); }, 4000);
  }

  /* -----------------------
     NEWSLETTER
  ------------------------*/
  const newsletterForm = safe("newsletterForm");
  const emailInput = safe("emailInput");
  const formResponse = safe("formResponse");
  newsletterForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = (emailInput?.value || "").trim();
    if (email && email.includes("@")) {
      formResponse.textContent = "✅ Thanks for subscribing!";
      emailInput.value = "";
    } else {
      formResponse.textContent = "❌ Please enter a valid email address.";
    }
  });

  /* -----------------------
     FAQ accordion
  ------------------------*/
  qsa(".faq-question").forEach(q => q.addEventListener("click", () => {
    q.classList.toggle("active");
    const ans = q.nextElementSibling;
    if (!ans) return;
    ans.style.display = ans.style.display === "block" ? "none" : "block";
  }));

  /* -----------------------
     BUTTON RIPPLE
  ------------------------*/
  qsa(".btn").forEach(btn => {
    // ensure position for pseudo children
    btn.style.position = btn.style.position || "relative";
    btn.style.overflow = btn.style.overflow || "hidden";

    btn.addEventListener("click", function (e) {
      const ripple = document.createElement("span");
      ripple.className = "ripple";
      const rect = this.getBoundingClientRect();
      ripple.style.left = `${e.clientX - rect.left}px`;
      ripple.style.top = `${e.clientY - rect.top}px`;
      // small defensive styling if CSS missing
      ripple.style.position = "absolute";
      ripple.style.transform = "translate(-50%, -50%)";
      ripple.style.pointerEvents = "none";
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  });

  /* -----------------------
     AUTH: LOGIN & SIGNUP (glass modals)
  ------------------------*/
  const loginModal = safe("loginModal");
  const signupModal = safe("signupModal");
  const loginForm = safe("loginForm");
  const signupForm = safe("signupForm");

  const navLoginLinks = qsa('a[href="#login"]');
  const navSignupLinks = qsa('a[href="#signup"]');
  const loginBtn = safe("loginBtn");
  const signupBtn = safe("signupBtn");

  const loginTriggers = [...navLoginLinks, ...(loginBtn ? [loginBtn] : [])];
  const signupTriggers = [...navSignupLinks, ...(signupBtn ? [signupBtn] : [])];

  loginTriggers.forEach(t => t.addEventListener("click", (e) => { e?.preventDefault(); openModalByElement(loginModal, "#loginUsername"); }));
  signupTriggers.forEach(t => t.addEventListener("click", (e) => { e?.preventDefault(); openModalByElement(signupModal, "#signupUsername"); }));

  // switch links inside modals (defensive selectors)
  document.getElementById("openSignup")?.addEventListener("click", (e) => {
    e.preventDefault();
    closeModalByElement(loginModal);
    setTimeout(() => openModalByElement(signupModal, "#signupUsername"), 260);
  });
  document.getElementById("openLogin")?.addEventListener("click", (e) => {
    e.preventDefault();
    closeModalByElement(signupModal);
    setTimeout(() => openModalByElement(loginModal, "#loginUsername"), 260);
  });

  // close buttons inside modals
  qsa(".modal .close-btn, .lightbox .close-lightbox").forEach(btn => {
    btn.addEventListener("click", () => {
      const root = btn.closest(".modal") || btn.closest(".lightbox");
      closeModalByElement(root);
    });
  });

  // backdrop close (global) - now supports elements with class "modal" or "lightbox"
  document.addEventListener("click", (e) => {
    try {
      const tgt = e.target;
      if (!(tgt instanceof Element)) return;
      // if clicked exactly on overlay (modal or lightbox), close it
      if (tgt.classList.contains("modal") || tgt.classList.contains("lightbox")) {
        closeModalByElement(tgt);
      }
    } catch (err) { /* ignore */ }
  });

  // Escape closes open overlays (modal.show OR lightbox.show)
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      qsa(".modal.show, .lightbox.show").forEach(m => closeModalByElement(m));
    }
  });

  // LOGIN submit (calls /api/auth/login if present)
  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const status = safe("loginStatus");
    const username = safe("loginUsername")?.value?.trim() || "";
    const password = safe("loginPassword")?.value || "";
    const submitBtn = loginForm.querySelector('button[type="submit"]');

    if (!username || !password) {
      if (status) status.textContent = "❌ Enter username and password.";
      return;
    }

    if (status) status.textContent = "⏳ Logging in...";
    if (submitBtn) { submitBtn.disabled = true; submitBtn.dataset.orig = submitBtn.textContent; submitBtn.textContent = "Please wait..."; }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const payload = await res.json().catch(() => ({}));
      if (res.ok) {
        try { localStorage.setItem("authToken", payload.token || ""); localStorage.setItem("user", JSON.stringify(payload.user || { username })); } catch(e){}
        if (status) status.textContent = "✅ Welcome!";
        setTimeout(() => closeModalByElement(loginModal), 700);
      } else {
        if (status) status.textContent = "❌ " + (payload.error || payload.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      if (status) status.textContent = "❌ Server error. Try later.";
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = submitBtn.dataset?.orig || "Sign in"; }
    }
  });

  // SIGNUP submit (calls /api/auth/signup if present)
  signupForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const status = safe("signupStatus");
    const username = safe("signupUsername")?.value?.trim() || "";
    const password = safe("signupPassword")?.value || "";
    const submitBtn = signupForm.querySelector('button[type="submit"]');

    if (!username || !password) {
      if (status) status.textContent = "❌ Enter username and password.";
      return;
    }

    if (status) status.textContent = "⏳ Creating account...";
    if (submitBtn) { submitBtn.disabled = true; submitBtn.dataset.orig = submitBtn.textContent; submitBtn.textContent = "Please wait..."; }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const payload = await res.json().catch(() => ({}));
      if (res.ok) {
        try { localStorage.setItem("authToken", payload.token || ""); localStorage.setItem("user", JSON.stringify(payload.user || { username })); } catch(e){}
        if (status) status.textContent = "✅ Account created!";
        setTimeout(() => closeModalByElement(signupModal), 700);
      } else {
        if (status) status.textContent = "❌ " + (payload.error || payload.message || "Signup failed");
      }
    } catch (err) {
      console.error(err);
      if (status) status.textContent = "❌ Server error. Try later.";
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = submitBtn.dataset?.orig || "Create account"; }
    }
  });

  /* -----------------------
     Defensive: hide legacy auth modal if present
  ------------------------*/
  const legacyAuth = safe("authModal");
  if (legacyAuth) {
    legacyAuth.classList.remove("show");
    legacyAuth.setAttribute("hidden", "");
    legacyAuth.style.display = "none";
  }
});
