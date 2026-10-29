/* Запускаємо інтерактивність після готовності документа */
document.addEventListener("DOMContentLoaded", () => {
  initTypingEffect();
  initRevealObserver();
  initCounters();
  initHeroLight();
  initMenuTilt();
  initNavigation();
  initMenuFilters();
  initBookingForm();
  initScrollControls();
});

/* Друкує підзаголовок головного екрана з урахуванням reduced motion */
function initTypingEffect() {
  const subtitle = document.querySelector("#hero-subtitle");
  if (!subtitle) return;
  const text = subtitle.dataset.text || subtitle.textContent.trim();
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    subtitle.textContent = text;
    return;
  }
  subtitle.textContent = "";
  subtitle.classList.add("is-typing");
  let index = 0;
  const typeNext = () => {
    subtitle.textContent = text.slice(0, index++);
    if (index <= text.length) window.setTimeout(typeNext, 29);
    else subtitle.classList.remove("is-typing");
  };
  window.setTimeout(typeNext, 450);
}

/* Поступово показує блоки, коли вони входять у видиму область */
function initRevealObserver() {
  const elements = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  elements.forEach((element) => observer.observe(element));
}

/* Анімує числові показники один раз під час появи */
function initCounters() {
  const counters = document.querySelectorAll(".stat-number");
  if (!("IntersectionObserver" in window)) {
    counters.forEach((counter) => { counter.textContent = counter.dataset.count || "0"; });
    return;
  }
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.5 });
  counters.forEach((counter) => observer.observe(counter));
}

/* Рахує значення від нуля до цільового числа з плавним темпом */
function animateCounter(counter) {
  const target = Number(counter.dataset.count);
  if (!Number.isFinite(target)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    counter.textContent = String(target);
    return;
  }
  const duration = 1400;
  const start = performance.now();
  const update = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    counter.textContent = String(Math.round(target * eased));
    if (progress < 1) window.requestAnimationFrame(update);
  };
  window.requestAnimationFrame(update);
}

/* Пересуває м'яке світло за курсором у межах головного екрана */
function initHeroLight() {
  const hero = document.querySelector(".hero");
  if (!hero || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  hero.addEventListener("pointermove", (event) => {
    const bounds = hero.getBoundingClientRect();
    hero.style.setProperty("--pointer-x", `${event.clientX - bounds.left}px`);
    hero.style.setProperty("--pointer-y", `${event.clientY - bounds.top}px`);
  });
}

/* Додає карткам меню легкий нахил відповідно до руху миші */
function initMenuTilt() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.querySelectorAll(".menu-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch") return;
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      card.style.transform = `rotateX(${y * -5}deg) rotateY(${x * 5}deg) translateY(-2px)`;
    });
    card.addEventListener("pointerleave", () => { card.style.transform = ""; });
  });
}

/* Керує мобільною навігацією, плавним переходом і активним пунктом */
function initNavigation() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("#primary-nav");
  const links = [...document.querySelectorAll('.primary-nav a[href^="#"]')];
  if (!toggle || !nav) return;
  const closeMenu = () => {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Відкрити меню");
    nav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  };
  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Відкрити меню" : "Закрити меню");
    nav.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
  });
  links.forEach((link) => link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    closeMenu();
  }));
  if (!("IntersectionObserver" in window)) return;
  const sections = links.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((link) => {
        const active = link.getAttribute("href") === `#${entry.target.id}`;
        if (link.classList.contains("nav-cta")) return;
        link.classList.toggle("is-current", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-30% 0px -60% 0px" });
  sections.forEach((section) => observer.observe(section));
}

/* Фільтрує позиції меню за категорією та оновлює стани кнопок */
function initMenuFilters() {
  const buttons = document.querySelectorAll(".filter-button");
  const cards = document.querySelectorAll(".menu-card");
  buttons.forEach((button) => button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    buttons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    cards.forEach((card) => {
      const shouldShow = filter === "all" || card.dataset.category === filter;
      card.classList.toggle("is-hidden", !shouldShow);
      card.classList.remove("is-filtering-out");
      if (shouldShow) {
        card.animate(
          [{ opacity: 0, transform: "translateY(8px) scale(.97)" }, { opacity: 1, transform: "translateY(0) scale(1)" }],
          { duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 260, easing: "ease-out" }
        );
      }
    });
  }));
}

/* Перевіряє обов'язкові поля та показує підтвердження тестового бронювання */
function initBookingForm() {
  const form = document.querySelector("#booking-form");
  if (!form) return;
  const fields = {
    name: form.elements.namedItem("name"),
    phone: form.elements.namedItem("phone"),
    date: form.elements.namedItem("date"),
    time: form.elements.namedItem("time"),
    guests: form.elements.namedItem("guests"),
    zone: form.elements.namedItem("zone")
  };
  const errors = {
    name: document.querySelector("#name-error"),
    phone: document.querySelector("#phone-error"),
    date: document.querySelector("#date-error"),
    time: document.querySelector("#time-error"),
    guests: document.querySelector("#guests-error"),
    zone: document.querySelector("#zone-error")
  };
  const dateInput = fields.date;
  const localToday = new Date();
  dateInput.min = `${localToday.getFullYear()}-${String(localToday.getMonth() + 1).padStart(2, "0")}-${String(localToday.getDate()).padStart(2, "0")}`;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const messages = {
      name: fields.name.value.trim() ? "" : "Вкажіть, будь ласка, ваше ім'я.",
      phone: isValidPhone(fields.phone.value) ? "" : "Введіть коректний номер, наприклад +380 00 000 00 00.",
      date: isValidDate(fields.date.value) ? "" : "Оберіть сьогоднішню або майбутню дату.",
      time: fields.time.value && fields.time.value >= "08:00" && fields.time.value <= "21:30" ? "" : "Оберіть час роботи кафе: 08:00–21:30.",
      guests: fields.guests.value ? "" : "Оберіть кількість гостей.",
      zone: fields.zone.value ? "" : "Оберіть тип зони."
    };
    let firstInvalid = null;
    Object.keys(fields).forEach((key) => {
      const invalid = Boolean(messages[key]);
      errors[key].textContent = messages[key];
      fields[key].setAttribute("aria-invalid", String(invalid));
      if (invalid && !firstInvalid) firstInvalid = fields[key];
    });
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }
    const success = document.querySelector("#form-success");
    success.textContent = "Дякуємо, столик заброньовано! Ми зателефонуємо для підтвердження.";
    form.reset();
    dateInput.min = `${localToday.getFullYear()}-${String(localToday.getMonth() + 1).padStart(2, "0")}-${String(localToday.getDate()).padStart(2, "0")}`;
    Object.values(errors).forEach((error) => { error.textContent = ""; });
    Object.values(fields).forEach((field) => field.removeAttribute("aria-invalid"));
  });

  Object.entries(fields).forEach(([key, field]) => field.addEventListener("input", () => {
    errors[key].textContent = "";
    field.removeAttribute("aria-invalid");
  }));
}

/* Перевіряє міжнародний або український формат номера телефону */
function isValidPhone(value) {
  const normalized = value.trim();
  if (!/^\+?[\d\s()-]+$/.test(normalized)) return false;
  const digits = normalized.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

/* Перевіряє правильність дати та забороняє дати в минулому */
function isValidDate(value) {
  if (!value) return false;
  const selected = new Date(`${value}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return !Number.isNaN(selected.getTime()) && selected >= today;
}

/* Оновлює прогрес сторінки та видимість кнопки повернення нагору */
function initScrollControls() {
  const progress = document.querySelector("#scroll-progress");
  const backToTop = document.querySelector("#back-to-top");
  const update = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const percent = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progress.style.width = `${Math.min(percent, 100)}%`;
    backToTop.classList.toggle("is-visible", window.scrollY > 500);
  };
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  });
}
