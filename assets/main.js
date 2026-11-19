document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  initAccordion();
  initFadeIn();
  initCookieConsent();
  initQuoteForm();
});

function initNavbar() {
  const nav = document.getElementById("navbar");
  const toggle = document.getElementById("mobileToggle");
  const menu = document.getElementById("mobileMenu");

  const closeMenu = () => {
    if (!toggle || !menu) return;
    menu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Menü megnyitása");
  };

  if (toggle && menu) {
    toggle.setAttribute("aria-controls", "mobileMenu");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Menü megnyitása");

    toggle.addEventListener("click", () => {
      const open = !menu.classList.contains("open");
      menu.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Menü bezárása" : "Menü megnyitása");
    });

    menu.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") closeMenu();
    });

    document.addEventListener("click", event => {
      if (!menu.contains(event.target) && !toggle.contains(event.target)) closeMenu();
    });
  }

  if (nav) {
    const updateNav = () => nav.classList.toggle("scrolled", window.scrollY > 12);
    updateNav();
    window.addEventListener("scroll", updateNav, { passive: true });
  }
}

function initAccordion() {
  document.querySelectorAll(".accordion-item").forEach((item, index) => {
    const button = item.querySelector(".accordion-trigger");
    const panel = item.querySelector(".accordion-content");
    if (!button || !panel) return;

    if (!panel.id) panel.id = `accordion-panel-${index + 1}`;
    button.setAttribute("aria-controls", panel.id);
    button.setAttribute("aria-expanded", String(item.classList.contains("open")));

    button.addEventListener("click", () => {
      const open = !item.classList.contains("open");
      item.classList.toggle("open", open);
      button.setAttribute("aria-expanded", String(open));
    });
  });
}

function initFadeIn() {
  const items = document.querySelectorAll(".fade-in");
  if (!items.length || !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    items.forEach(item => item.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  items.forEach(item => observer.observe(item));
}

function openCookieSettings() {
  const modal = document.getElementById("cookieModal");
  if (modal) {
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  }
}
window.openCookieSettings = openCookieSettings;

function initCookieConsent() {
  const banner = document.getElementById("cookieBanner");
  const modal = document.getElementById("cookieModal");
  const analyticsCheckbox = document.getElementById("analyticsConsent");
  const consentKey = "cookieConsent";

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  window.gtag("consent", "default", {
    analytics_storage: "denied"
  });

  const hideBanner = () => { if (banner) banner.style.display = "none"; };
  const showBanner = () => { if (banner) banner.style.display = "block"; };
  const closeModal = () => {
    if (modal) {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
    }
  };

  function loadGA() {
    // Add the actual GA4 Measurement ID only after the site owner confirms it.
    const GA_ID = "G-XXXXXXX";
    if (window.gaLoaded || GA_ID === "G-XXXXXXX") return;

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
    document.head.appendChild(script);
    window.gtag("js", new Date());
    window.gtag("config", GA_ID);
    window.gaLoaded = true;
  }

  window.acceptAllCookies = function () {
    localStorage.setItem(consentKey, "all");
    if (analyticsCheckbox) analyticsCheckbox.checked = true;
    window.gtag("consent", "update", { analytics_storage: "granted" });
    loadGA();
    hideBanner();
    closeModal();
  };

  window.acceptNecessaryCookies = function () {
    localStorage.setItem(consentKey, "necessary");
    if (analyticsCheckbox) analyticsCheckbox.checked = false;
    window.gtag("consent", "update", { analytics_storage: "denied" });
    hideBanner();
    closeModal();
  };

  window.saveCookieSettings = function () {
    const analytics = Boolean(analyticsCheckbox && analyticsCheckbox.checked);
    localStorage.setItem(consentKey, analytics ? "all" : "necessary");
    window.gtag("consent", "update", { analytics_storage: analytics ? "granted" : "denied" });
    if (analytics) loadGA();
    hideBanner();
    closeModal();
  };

  let savedConsent = null;
  try {
    savedConsent = localStorage.getItem(consentKey);
  } catch (error) {
    // When storage is unavailable, keep analytics disabled and show the consent banner.
  }

  if (analyticsCheckbox) analyticsCheckbox.checked = savedConsent === "all";

  if (savedConsent === "all") {
    window.gtag("consent", "update", { analytics_storage: "granted" });
    loadGA();
    hideBanner();
  } else if (savedConsent === "necessary") {
    window.gtag("consent", "update", { analytics_storage: "denied" });
    hideBanner();
  } else {
    showBanner();
  }

  if (modal) {
    modal.setAttribute("aria-hidden", modal.classList.contains("open") ? "false" : "true");
    modal.addEventListener("click", event => {
      if (event.target === modal) closeModal();
    });
    modal.addEventListener("keydown", event => {
      if (event.key === "Escape") closeModal();
    });
  }
}

function initQuoteForm() {
  const form = document.getElementById("quoteForm");
  if (!form) return;

  const submitBtn = document.getElementById("submitBtn");
  const success = document.getElementById("successMessage");
  const error = document.getElementById("errorMessage");

  if (success) success.setAttribute("role", "status");
  if (error) error.setAttribute("role", "alert");

  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (success) success.style.display = "none";
    if (error) error.style.display = "none";

    const privacyAcknowledged = document.getElementById("privacyAcknowledged");
    const termsAccepted = document.getElementById("termsAccepted");
    if ((privacyAcknowledged && !privacyAcknowledged.checked) || (termsAccepted && !termsAccepted.checked)) {
      if (error) {
        error.textContent = "Kérjük, olvassa el az adatkezelési tájékoztatót, és fogadja el az ÁSZF-et.";
        error.style.display = "block";
      }
      return;
    }

    const honeypot = form.querySelector('input[name="_gotcha"]');
    if (honeypot && honeypot.value.trim() !== "") return;

    const formData = new FormData(form);
    const originalLabel = submitBtn ? submitBtn.textContent : "";

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Küldés...";
    }

    try {
      const response = await fetch("https://formspree.io/f/xqedvgrn", {
        method: "POST",
        body: formData,
        headers: { "Accept": "application/json" }
      });

      if (!response.ok) throw new Error(`Form submission failed: ${response.status}`);

      form.reset();
      if (success) {
        success.style.display = "block";
        success.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      if (typeof window.gtag === "function") {
        window.gtag("event", "generate_lead", { form_name: "ajanlatkeres" });
      }
    } catch (submissionError) {
      if (error) {
        error.textContent = "Hiba történt az elküldés során. Kérjük, próbálja újra, vagy hívjon minket telefonon.";
        error.style.display = "block";
        error.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel || "Kérem az ajánlatot";
      }
    }
  });
}
