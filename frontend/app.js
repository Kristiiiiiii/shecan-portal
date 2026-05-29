(() => {
  // Use same origin when the Node server runs on :5000; otherwise talk to the API there.
  const API_BASE =
    window.location.port === "5000" || !window.location.port
      ? ""
      : "http://localhost:5000";

  const qs = (sel) => document.querySelector(sel);
  const qsa = (sel) => Array.from(document.querySelectorAll(sel));

  const form = qs("#volunteerForm");
  const submitBtn = qs("#submitBtn");
  const spinner = qs("#submitBtn .spinner");
  const btnText = qs("#submitBtn .btn-text");

  const toast = qs("#toast");
  const toastClose = qs("#toastClose");
  const toastTitle = qs("#toastTitle");
  const toastMsg = qs("#toastMsg");
  const year = qs("#year");

  const themeToggle = qs("#themeToggle");
  const navToggle = qs("#navToggle");
  const navLinks = qs("#navLinks");

  function setBusy(isBusy) {
    submitBtn.disabled = isBusy;
    spinner.style.display = isBusy ? "inline-block" : "none";
    btnText.textContent = isBusy ? "Submitting..." : "Submit";
  }

  function showToast({ title, message, variant }) {
    toastTitle.textContent = title || "Success";
    toastMsg.textContent = message || "Form Submitted Successfully";

    const icon = qs("#toastIcon i");
    if (variant === "error") {
      qs("#toastIcon").style.background = "linear-gradient(135deg, #fb7185, #e11d48)";
      icon.className = "fa-solid fa-triangle-exclamation";
    } else {
      qs("#toastIcon").style.background = "linear-gradient(135deg, var(--brand-2), #16a34a)";
      icon.className = "fa-solid fa-circle-check";
    }

    toast.classList.add("show");
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => toast.classList.remove("show"), 4200);
  }

  function clearErrors() {
    qsa(".error").forEach((el) => (el.textContent = ""));
  }

  function setError(field, message) {
    const el = qs(`[data-error-for="${field}"]`);
    if (el) el.textContent = message;
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validate(payload) {
    clearErrors();
    let ok = true;

    if (!payload.name || payload.name.trim().length < 2) {
      ok = false;
      setError("name", "Please enter your name.");
    }

    if (!payload.email || !payload.email.trim()) {
      ok = false;
      setError("email", "Please enter your email.");
    } else if (!isValidEmail(payload.email.trim())) {
      ok = false;
      setError("email", "Please enter a valid email.");
    }

    if (!payload.message || payload.message.trim().length < 10) {
      ok = false;
      setError("message", "Please write a short message (at least 10 characters).");
    }

    return ok;
  }

  async function submit(payload) {
    const res = await fetch(`${API_BASE}/api/forms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data && data.error ? data.error : "Submission failed";
      throw new Error(msg);
    }
    return data;
  }

  function initTheme() {
    const saved = localStorage.getItem("shecan.theme");
    const prefersLight =
      window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    const theme = saved || (prefersLight ? "light" : "dark");
    document.body.dataset.theme = theme;
    themeToggle.innerHTML =
      theme === "light"
        ? '<i class="fa-solid fa-moon"></i>'
        : '<i class="fa-solid fa-sun"></i>';
  }

  function toggleTheme() {
    const next = document.body.dataset.theme === "light" ? "dark" : "light";
    document.body.dataset.theme = next;
    localStorage.setItem("shecan.theme", next);
    themeToggle.innerHTML =
      next === "light"
        ? '<i class="fa-solid fa-moon"></i>'
        : '<i class="fa-solid fa-sun"></i>';
  }

  function initNav() {
    navToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(open));
    });

    navLinks.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (!a) return;
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  }

  function initForm() {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const payload = {
        name: qs("#name").value,
        email: qs("#email").value,
        message: qs("#message").value
      };

      if (!validate(payload)) return;

      try {
        setBusy(true);
        await submit(payload);
        form.reset();
        showToast({ title: "Success", message: "Form Submitted Successfully" });
      } catch (err) {
        showToast({
          title: "Error",
          message: err.message || "Something went wrong.",
          variant: "error"
        });
      } finally {
        setBusy(false);
      }
    });
  }

  function initToast() {
    toastClose.addEventListener("click", () => toast.classList.remove("show"));
    toast.addEventListener("click", (e) => {
      if (e.target === toast) toast.classList.remove("show");
    });
  }

  function boot() {
    year.textContent = String(new Date().getFullYear());
    initTheme();
    initNav();
    initForm();
    initToast();

    themeToggle.addEventListener("click", toggleTheme);
  }

  document.addEventListener("DOMContentLoaded", boot);
})();

