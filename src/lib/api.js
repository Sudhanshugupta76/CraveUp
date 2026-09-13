const getToken = () => localStorage.getItem("craveUpToken");

export const apiFetch = async (url, options = {}) => {
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response;
  try {
    response = await fetch(url, { ...options, headers });
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
