// Doorstep shared persona + theme switcher — Phase 2.
//
// Plain DOM, framework-agnostic: works inside React 18 (provider/), vanilla
// (admin/, customer/), and will keep working once customer/ becomes React 19
// in Phase 5. Mounts into <div id="doorstep-switcher"></div>, which must be
// the first element inside <body>, before the product's own root — that way
// this renders as a normal in-flow bar that pushes existing content down
// rather than an overlay that could cover a product's own header controls
// (Admin's own topbar is `position: sticky; top: 0`; an overlay switcher
// would fight it during scroll).
//
// Navigates via window.location. Full page loads between products are
// expected and fine — there is no shared client-side router.

const PERSONA_KEY = "doorstep:persona";
const THEME_KEY = "doorstep:theme";

// Hardcoded to real mock-data records so every product opens populated
// rather than empty. Admin has no per-staff identity in mock-data (moderation
// actions carry a free-text admin_name, not a stable id) — "Desmond Achebe"
// is simply the most active name in moderation-actions.json.
const PERSONAS = {
  customer: { label: "Customer", name: "Hannah Breece", id: "cst_001", path: "/customer/" },
  provider: { label: "Provider", name: "Marisol Vega", id: "prv_001", path: "/provider/" },
  admin: { label: "Admin", name: "Desmond Achebe", id: null, path: "/admin/" },
};

const ORDER = ["customer", "provider", "admin"];

function icon(name) {
  const paths = {
    chevron: '<path d="M6 9l6 6 6-6" />',
    check: '<path d="M5 12.5l4.5 4.5L19 7" />',
    sun: '<circle cx="12" cy="12" r="4.2" /><path d="M12 2.6v2.2M12 19.2v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.6 12h2.2M19.2 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6" />',
    moon: '<path d="M20 13.5A8 8 0 1 1 10.5 4a6.4 6.4 0 0 0 9.5 9.5Z" />',
  };
  return (
    '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" ' +
    'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' +
    paths[name] +
    "</svg>"
  );
}

function readPersona() {
  const stored = localStorage.getItem(PERSONA_KEY);
  if (stored && PERSONAS[stored]) return stored;
  const path = window.location.pathname;
  if (path.startsWith("/provider")) return "provider";
  if (path.startsWith("/admin")) return "admin";
  return "customer";
}

function readTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

export function mountSwitcher(mountEl) {
  if (!mountEl) return;

  let persona = readPersona();
  let theme = readTheme();
  let open = false;

  applyTheme(theme);
  // Persist even if it was only just inferred from the URL, so a product
  // visited directly (not through the switcher) still carries the same
  // choice forward to the next product.
  localStorage.setItem(PERSONA_KEY, persona);

  function render() {
    const current = PERSONAS[persona];
    mountEl.innerHTML =
      '<div class="ds-switcher-bar">' +
      '<div class="ds-switcher ' + (open ? "is-open" : "") + '">' +
      '<button type="button" class="ds-switcher-pill" aria-haspopup="true" aria-expanded="' + open + '">' +
      "<span>Viewing as: <strong>" + current.label + "</strong></span>" +
      icon("chevron") +
      "</button>" +
      (open
        ? '<div class="ds-switcher-menu" role="menu">' +
          '<p class="ds-switcher-menu-header">Demo mode &mdash; no login required.</p>' +
          ORDER.map((key) => {
            const p = PERSONAS[key];
            const selected = key === persona;
            return (
              '<button type="button" class="ds-switcher-option ' +
              (selected ? "is-selected" : "") +
              '" data-persona="' + key + '" role="menuitemradio" aria-checked="' + selected + '">' +
              '<span class="ds-switcher-option-text"><strong>' + p.label + "</strong><small>" + p.name + "</small></span>" +
              (selected ? icon("check") : "") +
              "</button>"
            );
          }).join("") +
          '<div class="ds-switcher-divider"></div>' +
          '<button type="button" class="ds-switcher-theme" data-action="toggle-theme">' +
          icon(theme === "dark" ? "sun" : "moon") +
          "<span>" + (theme === "dark" ? "Light theme" : "Dark theme") + "</span>" +
          "</button>" +
          "</div>"
        : "") +
      "</div>" +
      "</div>";
    wire();
  }

  function closeMenu() {
    if (!open) return;
    open = false;
    render();
  }

  function wire() {
    const pill = mountEl.querySelector(".ds-switcher-pill");
    if (pill) {
      pill.addEventListener("click", () => {
        open = !open;
        render();
      });
    }

    mountEl.querySelectorAll("[data-persona]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-persona");
        localStorage.setItem(PERSONA_KEY, key);
        if (key === persona) {
          closeMenu();
          return;
        }
        window.location.href = PERSONAS[key].path;
      });
    });

    const themeBtn = mountEl.querySelector('[data-action="toggle-theme"]');
    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        theme = theme === "dark" ? "light" : "dark";
        localStorage.setItem(THEME_KEY, theme);
        applyTheme(theme);
        render();
      });
    }

    if (open) {
      // Capture phase fires before this click event's own bubble-phase
      // target handlers, so a click on the pill or a menu item is not
      // mistaken for an outside click on the same event. `once` removes
      // this after it fires; the next open() re-arms it in wire() again.
      document.addEventListener("click", onDocumentClick, { capture: true, once: true });
    }
  }

  function onDocumentClick(e) {
    if (!mountEl.contains(e.target)) closeMenu();
  }

  function onKeydown(e) {
    if (open && e.key === "Escape") closeMenu();
  }

  document.addEventListener("keydown", onKeydown);
  render();
}

const autoMount = document.getElementById("doorstep-switcher");
if (autoMount) mountSwitcher(autoMount);
