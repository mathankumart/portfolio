const header     = document.querySelector("[data-header]");
const nav        = document.querySelector("[data-nav]");
const navToggle  = document.querySelector("[data-nav-toggle]");
const navLinks   = [...document.querySelectorAll(".site-nav a")];
const experienceTabs   = [...document.querySelectorAll("[data-exp-tab]")];
const experiencePanels = [...document.querySelectorAll("[data-exp-panel]")];
const blogGrid = document.querySelector("[data-blog-grid]");

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
    const isOpen = btn.classList.contains("is-active");
    const currentIndex = domainBtns.indexOf(btn);
    const nextIndex = (currentIndex + 1) % domainBtns.length;
    const previousIndex = Math.max(currentIndex - 1, 0);
    const targetBtn = isOpen
      ? domainBtns[currentIndex === domainBtns.length - 1 ? previousIndex : nextIndex]
      : btn;
    const targetDetail = targetBtn.closest(".skill-domain")?.querySelector(".sd-detail");

    // Close all
    domainBtns.forEach((b) => {
      b.classList.remove("is-active");
      b.setAttribute("aria-expanded", "false");
      const d = b.closest(".skill-domain")?.querySelector(".sd-detail");
      if (d) d.classList.remove("is-open");
    });

    // Re-clicking the active section advances, except the last section moves back.
    targetBtn.classList.add("is-active");
    targetBtn.setAttribute("aria-expanded", "true");
    if (targetDetail) targetDetail.classList.add("is-open");
  });
});

/* ── Header shadow on scroll ── */
const setHeaderShadow = () => {
  header?.classList.toggle("has-shadow", window.scrollY > 12);
};
setHeaderShadow();
window.addEventListener("scroll", setHeaderShadow, { passive: true });

/* ── Blog feed ── */
const escapeHtml = (value = "") =>
  value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[char]));

const formatPostDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "";
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const renderBlogPosts = (posts) => {
  if (!blogGrid || !posts?.length) return;

  blogGrid.innerHTML = posts.slice(0, 3).map((post) => {
    const title = escapeHtml(post.title);
    const excerpt = escapeHtml(post.excerpt);
    const date = escapeHtml(formatPostDate(post.publishedAt));
    const image = escapeHtml(post.image);
    const imageMarkup = image
      ? `<img src="${image}" alt="${title} blog preview" loading="lazy">`
      : "";

    return `
      <a class="blog-card" href="${escapeHtml(post.url)}" target="_blank" rel="noreferrer">
        ${imageMarkup}
        <span>${date}</span>
        <strong>${title}</strong>
        <p>${excerpt}</p>
      </a>
    `;
  }).join("");
};

fetch("assets/data/blogs.json", { cache: "no-cache" })
  .then((response) => response.ok ? response.json() : null)
  .then((data) => renderBlogPosts(data?.posts))
  .catch(() => {});
