const form = document.querySelector("#quote-form");
const formNote = document.querySelector("#form-note");
const header = document.querySelector("[data-elevate]");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector("#nav-links");
const navCta = document.querySelector(".nav-cta");
const stickyCta = document.querySelector(".sticky-cta");
const routeProgress = document.querySelector("#route-progress");
const routeSteps = Array.from(document.querySelectorAll("[data-route-step]"));
const routeTargets = routeSteps
  .map((link) => ({ link, target: document.querySelector(link.getAttribute("href")) }))
  .filter(({ target }) => target);
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canUsePointerGlow = window.matchMedia("(hover: hover) and (pointer: fine)").matches && !prefersReducedMotion;
const canUseTilt = window.matchMedia("(hover: hover) and (pointer: fine)").matches && !prefersReducedMotion;
const tiltTargets = Array.from(document.querySelectorAll(".hero-panel, .trust-item, .solution-card, .risk-item, .process-card, details"));

function setNote(message = "", isError = false) {
  if (!formNote) return;
  formNote.textContent = message;
  formNote.classList.toggle("is-error", isError);
}

if (canUsePointerGlow) {
  let cursorX = window.innerWidth / 2;
  let cursorY = window.innerHeight / 2;
  let cursorFrame = 0;

  window.addEventListener("pointermove", ({ clientX, clientY }) => {
    cursorX = clientX;
    cursorY = clientY;

    if (cursorFrame) return;
    cursorFrame = window.requestAnimationFrame(() => {
      document.documentElement.style.setProperty("--cursor-x", `${cursorX}px`);
      document.documentElement.style.setProperty("--cursor-y", `${cursorY}px`);
      cursorFrame = 0;
    });
  }, { passive: true });
}

if (canUsePointerGlow) {
  const siteCursor = document.createElement("div");
  const cursorShape = document.createElement("span");
  siteCursor.className = "site-cursor";
  siteCursor.setAttribute("aria-hidden", "true");
  cursorShape.className = "site-cursor__shape";
  siteCursor.append(cursorShape);
  document.body.append(siteCursor);
  document.documentElement.classList.add("has-site-cursor");

  const textInputSelector = 'input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="button"]):not([type="submit"]), textarea';
  const interactiveSelector = "a, button, summary, select, label, [role='button']";

  const updateCursorMode = (target) => {
    const element = target instanceof Element ? target : null;
    const isText = Boolean(element?.closest(textInputSelector));
    const isInteractive = !isText && Boolean(element?.closest(interactiveSelector));
    siteCursor.classList.toggle("is-text", isText);
    siteCursor.classList.toggle("is-interactive", isInteractive);
  };

  window.addEventListener("pointermove", (event) => {
    siteCursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    siteCursor.classList.add("is-visible");
    updateCursorMode(document.elementFromPoint(event.clientX, event.clientY));
  }, { passive: true });

  document.addEventListener("pointerover", (event) => {
    updateCursorMode(event.target);
  }, { passive: true });

  document.addEventListener("pointerdown", () => siteCursor.classList.add("is-pressed"), { passive: true });
  document.addEventListener("pointerup", () => siteCursor.classList.remove("is-pressed"), { passive: true });
  document.addEventListener("pointerleave", () => siteCursor.classList.remove("is-visible"));
  window.addEventListener("blur", () => siteCursor.classList.remove("is-visible"));
}

if (canUseTilt) {
  tiltTargets.forEach((target) => {
    target.classList.add("tilt-surface");

    target.addEventListener("pointermove", (event) => {
      const rect = target.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateY = ((x / rect.width) - 0.5) * 3.4;
      const rotateX = -((y / rect.height) - 0.5) * 2.8;
      const beamAngle = 104 + (x / rect.width) * 36;

      target.classList.add("is-tilting");
      target.style.setProperty("--tilt-x", `${rotateX.toFixed(2)}deg`);
      target.style.setProperty("--tilt-y", `${rotateY.toFixed(2)}deg`);
      target.style.setProperty("--beam-angle", `${beamAngle.toFixed(1)}deg`);
    });

    target.addEventListener("pointerleave", () => {
      target.classList.remove("is-tilting");
      target.style.setProperty("--tilt-x", "0deg");
      target.style.setProperty("--tilt-y", "0deg");
      target.style.removeProperty("--beam-angle");
    });
  });
}

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const invalid = Array.from(form.querySelectorAll("[required]")).find((field) => !field.checkValidity());
    if (invalid) {
      invalid.reportValidity();
      setNote("Bitte die Pflichtfelder ausfüllen.", true);
      return;
    }

    const data = new FormData(form);
    const body = [
      "Neue ARAG Rückrufanfrage",
      "",
      `Anliegen: ${data.get("topic") || ""}`,
      `Name: ${data.get("name") || ""}`,
      `Telefon: ${data.get("phone") || ""}`,
      `Firma: ${data.get("company") || ""}`,
      `Notiz: ${data.get("message") || ""}`,
    ].join("\n");

    const mailto = `mailto:?subject=${encodeURIComponent("ARAG Rückrufanfrage")}&body=${encodeURIComponent(body)}`;
    setNote("Danke. Die Rückrufanfrage ist vorbereitet.");
    window.location.href = mailto;
  });
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    navLinks.classList.toggle("is-open", !isOpen);
  });

  navLinks.addEventListener("click", (event) => {
    if (!event.target.closest("a")) return;
    menuToggle.setAttribute("aria-expanded", "false");
    navLinks.classList.remove("is-open");
  });
}

function updateChromeOnScroll() {
  if (header) {
    header.classList.toggle("is-elevated", window.scrollY > 12);
  }

  const formRect = form ? form.getBoundingClientRect() : null;
  const formIsPrimaryView = formRect ? formRect.top < window.innerHeight * 0.72 && formRect.bottom > 160 : false;
  const formIsTarget = window.location.hash === "#anfrage";
  document.body.classList.toggle("is-form-view", formIsPrimaryView || formIsTarget);

  if (stickyCta) {
    stickyCta.classList.toggle("is-visible", window.scrollY > 520 && !formIsPrimaryView && !formIsTarget);
  }

  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100)) : 100;
  const isAtPageEnd = scrollable <= 0 || window.scrollY >= scrollable - 4;
  document.documentElement.style.setProperty("--page-progress-scale", String(progress / 100));
  document.documentElement.style.setProperty("--ambient-shift", `${Math.round(progress * -0.16)}px`);
  document.body.classList.toggle("route-finished", isAtPageEnd || progress > 92);
  document.body.classList.toggle("has-read-intent", progress > 12);

  if (navCta) {
    navCta.textContent = progress > 68 ? "Rückruf sichern" : "Schnellcheck starten";
  }

  if (stickyCta) {
    stickyCta.textContent = progress > 76 ? "Rückruf sichern" : "Anfrage";
  }

  if (routeProgress) {
    routeProgress.textContent = String(Math.round(progress));
  }

  if (routeTargets.length) {
    const marker = window.scrollY + window.innerHeight * 0.42;
    const current = isAtPageEnd
      ? routeTargets[routeTargets.length - 1]
      : routeTargets.reduce((active, item) => (item.target.offsetTop <= marker ? item : active), routeTargets[0]);
    routeTargets.forEach(({ link }) => link.classList.toggle("is-active", link === current.link));
  }
}

document.addEventListener("scroll", updateChromeOnScroll);
window.addEventListener("resize", updateChromeOnScroll);
window.addEventListener("hashchange", () => setTimeout(updateChromeOnScroll, 80));
window.addEventListener("load", () => setTimeout(updateChromeOnScroll, 180));
window.addEventListener("pageshow", () => setTimeout(updateChromeOnScroll, 180));

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

updateChromeOnScroll();
