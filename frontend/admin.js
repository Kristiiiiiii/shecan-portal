(() => {
  const API_BASE =
    window.location.port === "5000" || !window.location.port
      ? ""
      : "http://localhost:5000";

  const qs = (sel) => document.querySelector(sel);
  const qsa = (sel) => Array.from(document.querySelectorAll(sel));

  const loginForm = qs("#loginForm");
  const loginBtn = qs("#loginBtn");
  const loginSpinner = qs("#loginBtn .spinner");
  const loginText = qs("#loginBtn .btn-text");

  const dashboard = qs("#dashboard");
  const submissionsEl = qs("#submissions");
  const dashLoading = qs("#dashLoading");

  const refreshBtn = qs("#refreshBtn");
  const logoutBtn = qs("#logoutBtn");
  const themeToggle = qs("#themeToggle");

  const toast = qs("#toast");
  const toastClose = qs("#toastClose");
  const toastTitle = qs("#toastTitle");
  const toastMsg = qs("#toastMsg");

  const TOKEN_KEY = "shecan.admin.token";

  function setLoginBusy(isBusy) {
    loginBtn.disabled = isBusy;
    loginSpinner.style.display = isBusy ? "inline-block" : "none";
    loginText.textContent = isBusy ? "Logging in..." : "Login";
  }

  function showToast({ title, message, variant }) {
    toastTitle.textContent = title || "Success";
    toastMsg.textContent = message || "Done";

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

  async function login(email, password) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data && data.error ? data.error : "Login failed");
    return data.token;
  }

  async function fetchSubmissions(token) {
    const res = await fetch(`${API_BASE}/api/forms`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data && data.error ? data.error : "Failed to fetch submissions");
    return data.items || [];
  }

  function formatDate(iso) {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  }

  function render(items) {
    submissionsEl.innerHTML = "";
    if (!items.length) {
      const empty = document.createElement("div");
      empty.className = "card";
      empty.innerHTML = `<h3 style="margin:0 0 6px">No submissions yet</h3>
        <p style="margin:0; color: var(--muted); line-height:1.7; font-size: 13px">
          When users submit the volunteer form, entries will appear here.
        </p>`;
      submissionsEl.appendChild(empty);
      return;
    }

    items.forEach((it) => {
      const card = document.createElement("article");
      card.className = "card";
      const safe = (s) => String(s || "").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
      card.innerHTML = `
        <div style="display:flex; align-items:flex-start; justify-content:space-between; gap: 12px">
          <div>
            <h3 style="margin:0 0 6px">${safe(it.name)}</h3>
            <p style="margin:0; color: var(--muted); font-weight: 700; font-size: 12px">
              <i class="fa-solid fa-envelope"></i> ${safe(it.email)} •
              <i class="fa-solid fa-clock"></i> ${safe(formatDate(it.createdAt))}
            </p>
          </div>
          <span class="badge" style="margin:0; font-size:12px"><i class="fa-solid fa-file-lines"></i> Message</span>
        </div>
        <p style="margin:10px 0 0; color: var(--muted); line-height:1.7; font-size: 13px; white-space: pre-wrap">
          ${safe(it.message)}
        </p>
      `;
      submissionsEl.appendChild(card);
    });
  }

  function setAuthedUI(isAuthed) {
    dashboard.style.display = isAuthed ? "block" : "none";
    loginForm.closest(".form-card").style.display = isAuthed ? "none" : "block";
  }

  async function loadDashboard() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setAuthedUI(false);
      return;
    }

    setAuthedUI(true);
    dashLoading.style.display = "block";
    try {
      const items = await fetchSubmissions(token);
      render(items);
    } catch (err) {
      showToast({ title: "Error", message: err.message || "Failed to load.", variant: "error" });
      if (String(err.message || "").toLowerCase().includes("token")) {
        localStorage.removeItem(TOKEN_KEY);
        setAuthedUI(false);
      }
    } finally {
      dashLoading.style.display = "none";
    }
  }

  function updateThemeButton(theme) {
    const isLight = theme === "light";
    themeToggle.innerHTML = isLight
      ? '<i class="fa-solid fa-moon" aria-hidden="true"></i><span class="theme-toggle-label">Dark</span>'
      : '<i class="fa-solid fa-sun" aria-hidden="true"></i><span class="theme-toggle-label">Light</span>';
    themeToggle.setAttribute("aria-label", isLight ? "Switch to dark mode" : "Switch to light mode");
  }

  function initTheme() {
    const saved = localStorage.getItem("shecan.theme");
    const prefersLight =
      window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    const theme = saved || (prefersLight ? "light" : "dark");
    document.body.dataset.theme = theme;
    updateThemeButton(theme);
  }

  function toggleTheme() {
    const next = document.body.dataset.theme === "light" ? "dark" : "light";
    document.body.dataset.theme = next;
    localStorage.setItem("shecan.theme", next);
    updateThemeButton(next);
  }

  function boot() {
    initTheme();
    themeToggle.addEventListener("click", toggleTheme);

    toastClose.addEventListener("click", () => toast.classList.remove("show"));

    refreshBtn.addEventListener("click", loadDashboard);
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem(TOKEN_KEY);
      showToast({ title: "Logged out", message: "You have been logged out." });
      setAuthedUI(false);
    });

    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearErrors();

      const email = qs("#adminEmail").value.trim().toLowerCase();
      const password = qs("#adminPassword").value;

      let ok = true;
      if (!email || !isValidEmail(email)) {
        ok = false;
        setError("adminEmail", "Enter a valid email.");
      }
      if (!password || password.length < 6) {
        ok = false;
        setError("adminPassword", "Enter your password (min 6 chars).");
      }
      if (!ok) return;

      try {
        setLoginBusy(true);
        const token = await login(email, password);
        localStorage.setItem(TOKEN_KEY, token);
        showToast({ title: "Success", message: "Logged in." });
        await loadDashboard();
      } catch (err) {
        showToast({ title: "Error", message: err.message || "Login failed.", variant: "error" });
      } finally {
        setLoginBusy(false);
      }
    });

    loadDashboard();
  }

  document.addEventListener("DOMContentLoaded", boot);
})();

