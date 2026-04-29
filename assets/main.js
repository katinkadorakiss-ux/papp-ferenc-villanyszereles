document.addEventListener("DOMContentLoaded", () => {
  initDateTime();
  initNavbar();
  initAccordion();
  initFadeIn();
  initCookieConsent();
  initQuoteForm();
});

function initDateTime() {
  const el = document.getElementById("datetime");
  if (!el) return;

  function updateTime() {
    const now = new Date();
    el.textContent =
      now.toLocaleDateString("hu-HU") + " " + now.toLocaleTimeString("hu-HU");
  }

  updateTime();
  setInterval(updateTime, 1000);
}

function initNavbar() {
  const nav = document.getElementById("navbar");
  const toggle = document.getElementById("mobileToggle");
  const menu = document.getElementById("mobileMenu");

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", menu.classList.contains("open") ? "true" : "false");
    });

    menu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  if (nav) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 20) nav.classList.add("scrolled");
      else nav.classList.remove("scrolled");
    });
  }
}

function initAccordion() {
  document.querySelectorAll(".accordion-trigger").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.parentElement.classList.toggle("open");
    });
  });
}

function initFadeIn() {
  const items = document.querySelectorAll(".fade-in");
  if (!items.length || !("IntersectionObserver" in window)) {
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
  }, { threshold: 0.1 });

  items.forEach(item => observer.observe(item));
}

function openCookieSettings() {
  const modal = document.getElementById("cookieModal");
  if (modal) modal.classList.add("open");
}
window.openCookieSettings = openCookieSettings;

function initCookieConsent() {
  const banner = document.getElementById("cookieBanner");
  const modal = document.getElementById("cookieModal");
  const analyticsCheckbox = document.getElementById("analyticsConsent");

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function(){ dataLayer.push(arguments); };

  gtag('consent', 'default', {
    analytics_storage: 'denied'
  });

  function hideBanner() {
    if (banner) banner.style.display = "none";
  }

  function showBanner() {
    if (banner) banner.style.display = "block";
  }

  function loadGA() {
    if (window.gaLoaded) return;

    const GA_ID = "G-XXXXXXX"; // <-- Cseréld le a saját GA4 Measurement ID-ra

    if (GA_ID === "G-XXXXXXX") return;

    const script = document.createElement("script");
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    script.async = true;
    document.head.appendChild(script);

    gtag('js', new Date());
    gtag('config', GA_ID);

    window.gaLoaded = true;
  }

  window.acceptAllCookies = function() {
    localStorage.setItem("cookieConsent", "all");
    if (analyticsCheckbox) analyticsCheckbox.checked = true;
    gtag('consent', 'update', { analytics_storage: 'granted' });
    loadGA();
    hideBanner();
    if (modal) modal.classList.remove("open");
  };

  window.acceptNecessaryCookies = function() {
    localStorage.setItem("cookieConsent", "necessary");
    if (analyticsCheckbox) analyticsCheckbox.checked = false;
    hideBanner();
    if (modal) modal.classList.remove("open");
  };

  window.saveCookieSettings = function() {
    const analytics = analyticsCheckbox?.checked;

    localStorage.setItem("cookieConsent", analytics ? "all" : "necessary");

    if (analytics) {
      gtag('consent', 'update', { analytics_storage: 'granted' });
      loadGA();
    } else {
      gtag('consent', 'update', { analytics_storage: 'denied' });
    }

    if (modal) modal.classList.remove("open");
    hideBanner();
  };

  const savedConsent = localStorage.getItem("cookieConsent");

  if (analyticsCheckbox) {
    analyticsCheckbox.checked = savedConsent === "all";
  }

  if (savedConsent === "all") {
    gtag('consent', 'update', { analytics_storage: 'granted' });
    loadGA();
    hideBanner();
  } else if (savedConsent === "necessary") {
    hideBanner();
  } else {
    showBanner();
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("open");
    });
  }
}

function initQuoteForm() {
  const form = document.getElementById("quoteForm");
  if (!form) return;

  const submitBtn = document.getElementById("submitBtn");
  const success = document.getElementById("successMessage");
  const error = document.getElementById("errorMessage");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (success) success.style.display = "none";
    if (error) error.style.display = "none";

    const consent = document.getElementById("consent");
    if (consent && !consent.checked) {
      if (error) {
        error.innerHTML = "Kérjük, fogadja el az adatkezelési tájékoztatót és az ÁSZF-et.";
        error.style.display = "block";
      }
      return;
    }

    const honeypot = form.querySelector('input[name="_gotcha"]');
    if (honeypot && honeypot.value.trim() !== "") {
      return;
    }

    const formData = new FormData(form);

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Küldés...";
    }

    try {
      const response = await fetch("https://formspree.io/f/xqedvgrn", {
        method: "POST",
        body: formData,
        headers: {
          "Accept": "application/json"
        }
      });

      if (response.ok) {
        form.reset();

        if (success) {
          success.style.display = "block";
          success.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        if (typeof window.gtag === "function") {
          gtag("event", "generate_lead", {
            form_name: "ajanlatkeres"
          });
        }
      } else {
        if (error) {
          error.innerHTML = "Hiba történt az elküldés során. Kérjük, próbálja újra, vagy hívjon minket telefonon.";
          error.style.display = "block";
        }
      }
    } catch (err) {
      if (error) {
        error.innerHTML = "Hiba történt az elküldés során. Kérjük, próbálja újra, vagy hívjon minket telefonon.";
        error.style.display = "block";
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Kérem az ajánlatot";
      }
    }
  });
}