const TOKEN_KEY = 'foodiego-token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

async function request(url, options = {}) {
  const token = getToken();
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // Token expire aanaa / invalid-na app-ku sollum (AuthContext logout pannum)
    if (res.status === 401 && token && !url.startsWith('/api/auth/login')) {
      window.dispatchEvent(new Event('auth:expired'));
    }
    throw Object.assign(new Error(data.error || 'Something went wrong'), { status: res.status });
  }
  return data;
}

// ---------- Auth ----------
export const signupApi = (form) => request('/api/auth/signup', { method: 'POST', body: JSON.stringify(form) });
export const loginApi = (form) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(form) });
export const meApi = () => request('/api/auth/me');
export const logoutApi = () => request('/api/auth/logout', { method: 'POST' });

// ---------- Restaurants ----------
export const getRestaurants = ({ search = '', cuisine = '', veg = false, minRating = 0, sort = 'relevance' } = {}) =>
  request(
    `/api/restaurants?search=${encodeURIComponent(search)}&cuisine=${encodeURIComponent(cuisine)}` +
      `&veg=${veg ? 1 : 0}&minRating=${minRating}&sort=${sort}`
  );

export const getRestaurant = (id) => request(`/api/restaurants/${id}`);

// ---------- Orders (Login is required.) ----------
export const placeOrder = (payload) => request('/api/orders', { method: 'POST', body: JSON.stringify(payload) });
export const getOrder = (id) => request(`/api/orders/${id}`);
export const getMyOrders = () => request('/api/orders');

export const rupees = (n) => `₹${n}`;

export const formatCount = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace('.0', '')}K` : `${n}`);
