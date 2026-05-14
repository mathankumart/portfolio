const header     = document.querySelector("[data-header]");
const nav        = document.querySelector("[data-nav]");
const navToggle  = document.querySelector("[data-nav-toggle]");
const navLinks   = [...document.querySelectorAll(".site-nav a")];
const experienceTabs   = [...document.querySelectorAll("[data-exp-tab]")];
const experiencePanels = [...document.querySelectorAll("[data-exp-panel]")];

/* ── Mobile nav toggle ── */
navToggle?.addEventListener("click", () => {
  const isOpen = nav?.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
  navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    nav?.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
    navToggle?.setAttribute("aria-label", "Open menu");
  });
});

/* ── Active nav link on scroll ── */
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.toggle(
          "is-active",
          link.getAttribute("href") === `#${entry.target.id}`
        );
      });
    });
  },
  { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
);
document.querySelectorAll("main section[id]").forEach((s) => sectionObserver.observe(s));

/* ── Experience tabs ── */
experienceTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.expTab;

    experienceTabs.forEach((other) => {
      const isActive = other === tab;
      other.classList.toggle("is-active", isActive);
      other.setAttribute("aria-selected", String(isActive));
    });

    experiencePanels.forEach((panel) => {
      const isActive = panel.dataset.expPanel === target;
      panel.classList.toggle("is-active", isActive);
      panel.hidden = !isActive;
    });
  });
});

/* ── Skills accordion ── */
const domainBtns = [...document.querySelectorAll("[data-domain-btn]")];

domainBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const domain  = btn.dataset.domainBtn;
    const detail  = btn.closest(".skill-domain")?.querySelector(".sd-detail");
    const isOpen  = btn.classList.contains("is-active");

    if (isOpen) return;

    // Close all
    domainBtns.forEach((b) => {
      b.classList.remove("is-active");
      b.setAttribute("aria-expanded", "false");
      const d = b.closest(".skill-domain")?.querySelector(".sd-detail");
      if (d) d.classList.remove("is-open");
    });

    // Open clicked (toggle)
    if (!isOpen) {
      btn.classList.add("is-active");
      btn.setAttribute("aria-expanded", "true");
      if (detail) detail.classList.add("is-open");
    }
  });
});

/* ── Header shadow on scroll ── */
const setHeaderShadow = () => {
  header?.classList.toggle("has-shadow", window.scrollY > 12);
};
setHeaderShadow();
window.addEventListener("scroll", setHeaderShadow, { passive: true });
