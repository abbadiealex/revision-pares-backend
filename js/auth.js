const Auth = (() => {
  const API_BASE_URL = 'https://revision-pares-backend.onrender.com/api';
  const TOKEN_KEY = 'revisionParesToken';
  const USER_KEY = 'revisionParesUser';

  const DASHBOARDS = {
    alumno: 'dashboard-alumno.html',
    evaluador: 'dashboard-evaluador.html',
    profesor: 'dashboard-profesor.html'
  };

  function getToken() {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  function getCurrentUser() {
    const rawUser = sessionStorage.getItem(USER_KEY);

    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser);
    } catch {
      logout();
      return null;
    }
  }

  function saveSession({ token, user }) {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function clearStoredSession() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  function logout() {
    clearStoredSession();
    window.location.href = 'login.html';
  }

  function getDashboardForRole(role) {
    return DASHBOARDS[role] || 'login.html';
  }

  function redirectToDashboard(role) {
    window.location.href = getDashboardForRole(role);
  }

  function redirectToLogin() {
    window.location.href = 'login.html';
  }

  async function apiFetch(path, options = {}) {
    const token = getToken();
    const headers = new Headers(options.headers || {});

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers
    });

    let payload;
    try {
      payload = await response.json();
    } catch {
      throw new Error('El backend no respondio con JSON valido.');
    }

    if (!response.ok || !payload.success) {
      throw new Error(payload.error || 'No fue posible completar la operacion.');
    }

    return payload.data;
  }

  async function login(correo, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ correo, password })
    });

    let payload;
    try {
      payload = await response.json();
    } catch {
      throw new Error('El backend no respondio con JSON valido.');
    }

    if (!response.ok || !payload.success) {
      throw new Error(payload.error || 'Correo o password incorrectos.');
    }

    const token = payload.data?.token;
    const user = payload.data?.user;

    if (!token || !user?.rol) {
      throw new Error('La respuesta de login no incluyo token o rol.');
    }

    saveSession({ token, user });
    return { token, user };
  }

  function requireRole(allowedRoles) {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    const token = getToken();
    const user = getCurrentUser();

    if (!token || !user) {
      redirectToLogin();
      return null;
    }

    if (!roles.includes(user.rol)) {
      window.location.replace(getDashboardForRole(user.rol));
      return null;
    }

    initLogoutButtons();
    return user;
  }

  function initLogoutButtons() {
    document.querySelectorAll('[data-logout]').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        logout();
      });
    });
  }

  return {
    API_BASE_URL,
    apiFetch,
    getToken,
    getCurrentUser,
    getDashboardForRole,
    initLogoutButtons,
    login,
    logout,
    redirectToDashboard,
    requireRole
  };
})();
