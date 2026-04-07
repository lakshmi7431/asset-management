import { useState } from "react";
import "../style/login.css";

// ── tiny JWT decoder — reads the payload without a library ──
// JWT = header.payload.signature  (all base64url encoded)
function decodeJwtPayload(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return {};
  }
}

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  // ── login handler ──
  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Please enter your username and password.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      const response = await fetch("http://127.0.0.1:8000/api/users/login", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();

      if (data.access_token) {
        localStorage.setItem("token", data.access_token);

        // ── decode the token to read is_super_user ──
        // your backend puts  "role": "superadmin"  OR  "is_super_user": true
        // in the JWT payload — check whichever your backend actually uses
        const payload = decodeJwtPayload(data.access_token);

        const superUser =
          payload.is_super_user === true ||
          payload.role === "superadmin";
       // const name = payload.first_name || payload.email || "User";
      //   const role = payload.is_super_user ? "Super Admin" : "User";

       onLoginSuccess(superUser);
      } else {
        setError("Invalid username or password. Please try again.");
      }
        } catch (err) {
         setError("Something went wrong. Please try again.");
       } finally {
          setLoading(false);
       }
      };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="login-root">
      <div className="login-card">

        <div className="login-eyebrow">Welcome back</div>
        <h1 className="login-title">Sign in</h1>
        <p className="login-subtitle">Access your dashboard</p>

        {error && <div className="error-banner">{error}</div>}

        <div className="field-group">
          <div className="field-wrap">
            <label className="field-label">Username</label>
            <input
              className="field-input"
              type="text"
              placeholder="your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="field-wrap">
            <label className="field-label">Password</label>
            <input
              className="field-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        <button
          className="btn-login"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <span className="btn-loading">
              <span className="spinner" /> Signing in...
            </span>
          ) : (
            "Sign in"
          )}
        </button>

      </div>
    </div>
  );
}

export default Login;