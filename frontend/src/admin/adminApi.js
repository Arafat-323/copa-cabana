const API = import.meta.env.VITE_API_URL;
const KEY = 'cc_token';

// sessionStorage : la session se ferme avec l'onglet (utile sur un appareil partagé)
export const getToken = () => { try { return sessionStorage.getItem(KEY); } catch { return null; } };
export const setToken = (t) => { try { t ? sessionStorage.setItem(KEY, t) : sessionStorage.removeItem(KEY); } catch { /* ignore */ } };

export async function api(path, opts = {}) {
  const res = await fetch(API + path, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}`, ...opts.headers },
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && path !== '/auth/login') { setToken(null); window.dispatchEvent(new Event('cc-logout')); }
  if (!res.ok) throw new Error(data.error || 'Une erreur est survenue.');
  return data;
}
export const send = (path, method, body) => api(path, { method, body: JSON.stringify(body) });
