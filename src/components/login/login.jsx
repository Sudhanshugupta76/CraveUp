import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, saveSession } from "../../lib/api";
import "./login.css";

const Login = ({ onLogin, notify }) => {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isRegistering && password !== confirmPassword) {
      notify("Passwords do not match.", "error");
      return;
    }
    try {
      const result = await apiFetch(isRegistering ? "/api/auth/register" : "/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ name: name || email.split("@")[0], email, password }),
      });
      saveSession(result);
      onLogin(result.user);
      notify(isRegistering ? "Account created successfully." : "Welcome back to CraveUp.");
      navigate("/profile");
    } catch (error) {
      notify(error.message, "error");
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-intro">
          <span className="auth-eyebrow">Welcome to CraveUp</span>
          <h1>{isRegistering ? "Create your account" : "Welcome back"}</h1>
          <p>
            {isRegistering
              ? "Join us and make every meal worth remembering."
              : "Sign in to continue your delicious journey."}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegistering && (
            <label>
              Full name
              <input type="text" placeholder="Enter your name" value={name} onChange={(event) => setName(event.target.value)} required />
            </label>
          )}

          <label>
            Email address
            <input type="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>

          <label>
            Password
            <input type="password" placeholder="Minimum 8 characters" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>

          {isRegistering && (
            <label>
              Confirm password
              <input
                type="password"
                placeholder="Confirm your 8-character password"
                minLength={8}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </label>
          )}

          <button type="submit" className="auth-submit">
            {isRegistering ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="auth-switch">
          {isRegistering ? "Already have an account?" : "New to CraveUp?"}{" "}
          <button
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering ? "Sign in" : "Register"}
          </button>
        </p>
      </section>
    </main>
  );
};

export default Login;