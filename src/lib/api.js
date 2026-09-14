const getToken = () => localStorage.getItem("craveUpToken");
const apiBaseUrl = import.meta.env.VITE_API_URL || "";

export const apiFetch = async (url, options = {}) => {
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response;
  try {
    response = await fetch(`${apiBaseUrl}${url}`, { ...options, headers });
  } catch {
    throw new Error("Server se connection nahi ho raha. Please 'npm run server' start karein.");
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || "Something went wrong.");
  return payload;
};

export const saveSession = ({ token, user }) => {
  localStorage.setItem("craveUpToken", token);
  localStorage.setItem("craveUpUser", JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem("craveUpToken");
  localStorage.removeItem("craveUpUser");
};
