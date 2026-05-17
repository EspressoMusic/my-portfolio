(function () {
  const C = window.PORTFOLIO_CONTENT || {};
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function get(obj, path) {
    return path.split(".").reduce((o, k) => (o && o[k] !== undefined ? o[k] : null), obj);
  }

  function bindContent() {
    document.querySelectorAll("[data-bind]").forEach((el) => {
      const val = get(C, el.getAttribute("data-bind"));
      if (val != null) el.textContent = val;
    });

    document.querySelectorAll("[data-bind-src]").forEach((el) => {
      const val = get(C, el.getAttribute("data-bind-src"));
      if (!val) return;
      el.src = val;
      el.onerror = () => {
        el.src = "assets/images/shilo.png";
      };
    });

    document.querySelectorAll("[data-bind-href]").forEach((el) => {
      const key = el.getAttribute("data-bind-href");
      const val = get(C, key);
      if (!val) return;
      el.href = key === "email" ? `mailto:${val}` : val;
    });

    document.title = `${C.name || "Portfolio"} — Developer`;

    const cvBtn = document.querySelector(".btn-cv");
    if (cvBtn && !C.cvFile) cvBtn.style.display = "none";
  }

  function renderStats() {
    const list = document.getElementById("stats-list");
    if (!list || !C.stats) return;
    list.innerHTML = C.stats
      .map(
        (s, i) => `
      <li class="stat-item" data-scroll="fade-up" data-scroll-delay="${i}">
        <span class="stat-number" data-count="${s.value}" data-suffix="${s.suffix || ""}">0</span>
        <span class="stat-label">${s.label}</span>
      </li>`
      )
      .join("");
  }

  function renderBento() {
    const wrap = document.getElementById("projects-bento");
    if (!wrap || !C.projects) return;

    wrap.innerHTML = C.projects
      .map((p, i) => {
        const large = p.featured ? " bento-card--large" : "";
        const thumb = p.image
          ? `<div class="bento-thumb"><img src="${p.image}" alt="" loading="lazy" onerror="this.src='assets/images/project-placeholder.svg'"/></div>`
          : "";
        return `
        <article class="bento-card${large}" data-scroll="fade-up" data-scroll-delay="${i}">
          <div class="bento-body">
            <span class="bento-tag">${p.tag}</span>
            <h3 class="bento-title">${p.title}</h3>
            ${p.subtitle ? `<p class="bento-sub">${p.subtitle}</p>` : ""}
            <p class="bento-desc">${p.description}</p>
            <a href="${p.link || "#"}" class="bento-link" target="_blank" rel="noopener">View project</a>
          </div>
          ${large ? thumb : ""}
        </article>`;
      })
      .join("");
  }

  function renderSkills() {
    const grid = document.getElementById("skills-grid");
    if (!grid || !C.skills) return;
    grid.innerHTML = C.skills
      .map(
        (g, i) => `
      <div class="skill-group" data-scroll="fade-up" data-scroll-delay="${i}">
        <h3 class="skill-group-title">${g.title}</h3>
        <ul class="skill-tags">${g.items.map((t) => `<li>${t}</li>`).join("")}</ul>
      </div>`
      )
      .join("");
  }

  function renderServices() {
    const stack = document.getElementById("services-grid");
    if (!stack || !C.services) return;
    stack.innerHTML = C.services
      .map(
        (s, i) => `
      <article class="service-card" data-scroll="fade-left" data-scroll-delay="${i}">
        <h3>${s.title}</h3>
        <p>${s.desc}</p>
      </article>`
      )
      .join("");
  }

  function renderContact() {
    const wrap = document.getElementById("contact-links");
    if (!wrap) return;
    const parts = [];
    if (C.email) parts.push(`<a class="contact-email" href="mailto:${C.email}">${C.email}</a>`);
    if (C.phone) parts.push(`<a class="contact-phone" href="tel:${C.phoneTel || C.phone}">${C.phone}</a>`);
    wrap.innerHTML = parts.join("");
  }

  function renderSocial() {
    const wrap = document.getElementById("social-links");
    if (!wrap || !C.social) return;
    const labels = { linkedin: "LinkedIn", github: "GitHub", portfolio: "Portfolio" };
    wrap.innerHTML = Object.entries(C.social)
      .filter(([, url]) => url && url !== "#")
      .map(([k, url]) => `<a href="${url}" target="_blank" rel="noopener">${labels[k] || k}</a>`)
      .join("");
  }

  function scrollDelay(el) {
    const d = el.getAttribute("data-scroll-delay");
    return d ? parseInt(d, 10) * 70 : 0;
  }

  function initScrollReveal() {
    const els = document.querySelectorAll("[data-scroll]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const ms = scrollDelay(el);
          const show = () => el.classList.add("is-inview");
          if (ms) setTimeout(show, ms);
          else show();
          observer.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    els.forEach((el) => observer.observe(el));

    window.addEventListener("load", () => {
      els.forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.9) {
          el.classList.add("is-inview");
        }
      });
    });
  }

  function initCounters() {
    document.querySelectorAll("[data-count]").forEach((el) => {
      const target = parseInt(el.getAttribute("data-count"), 10);
      const suffix = el.getAttribute("data-suffix") || "";
      const run = () => {
        const dur = 1500;
        const start = performance.now();
        const tick = (now) => {
          const t = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - t, 4);
          el.textContent = Math.floor(eased * target) + suffix;
          if (t < 1) requestAnimationFrame(tick);
          else el.textContent = target + suffix;
        };
        requestAnimationFrame(tick);
      };
      const obs = new IntersectionObserver(
        (e) => {
          if (e[0].isIntersecting) {
            run();
            obs.disconnect();
          }
        },
        { threshold: 0.5 }
      );
      obs.observe(el);
    });
  }

  function initScrollProgress() {
    const bar = document.querySelector(".scroll-progress-bar");
    if (!bar || reducedMotion) return;
    const update = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${h > 0 ? window.scrollY / h : 0})`;
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  function initSectionReveal() {
    document.querySelectorAll("section").forEach((s) => s.classList.add("section-reveal"));
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("section-visible")),
      { threshold: 0.06 }
    );
    document.querySelectorAll(".section-reveal").forEach((s) => obs.observe(s));
  }

  function initHeader() {
    const header = document.getElementById("header");
    window.addEventListener(
      "scroll",
      () => header.classList.toggle("is-scrolled", window.scrollY > 20),
      { passive: true }
    );
  }

  function initNav() {
    const toggle = document.querySelector(".nav-toggle");
    const menu = document.getElementById("nav-menu");
    if (!toggle || !menu) return;
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open);
    });
    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => menu.classList.remove("is-open")));
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (id.length < 2) return;
        const t = document.querySelector(id);
        if (t) {
          e.preventDefault();
          t.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
        }
      });
    });
  }

  function initPhotoParallax() {
    const frame = document.querySelector(".photo-frame");
    if (!frame || reducedMotion) return;
    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY;
        frame.style.transform = `rotate(2deg) translateY(${y * 0.04}px)`;
      },
      { passive: true }
    );
  }

  document.getElementById("year").textContent = new Date().getFullYear();

  bindContent();
  renderStats();
  renderBento();
  renderSkills();
  renderServices();
  renderContact();
  renderSocial();
  initScrollReveal();
  initCounters();
  initScrollProgress();
  initSectionReveal();
  initHeader();
  initNav();
  initSmoothScroll();
  initPhotoParallax();
})();
