import { useState } from "react";
import authPanel from "../assets/left_panel.png";
import { registerUser } from "../api/auth";

function useDark(dm) {
  return dm ? {
    page: "#0f172a", card: "#1e293b", panel: "#111827", border: "#334155",
    text: "#e2e8f0", muted: "#94a3b8", body: "#cbd5e1", inputBg: "#0f172a",
    inputBorder: "#475569", link: "#60a5fa",
  } : {
    page: "#eef4fb", card: "#ffffff", panel: "#ffffff", border: "#d0d5dd",
    text: "#0b3470", muted: "#667085", body: "#344054", inputBg: "#ffffff",
    inputBorder: "#d0d5dd", link: "#2563eb",
  };
}

export default function Registration({ setUser, navigateTo, darkMode }) {
  const t = useDark(darkMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [conf, setConf] = useState("");
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e) {
    e?.preventDefault?.();
    const nextErrors = {};
    if (!name.trim()) nextErrors.name = "Full name / username is required.";
    if (!email.trim()) nextErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email)) nextErrors.email = "Please enter a valid email address.";
    if (!pass) nextErrors.pass = "Password is required.";
    else if (pass.length < 6) nextErrors.pass = "Use at least 6 characters for backend testing.";
    if (pass !== conf) nextErrors.conf = "Passwords do not match.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      setApiError("");
      setLoading(true);
      const user = await registerUser({ name, email, password: pass });
      if (setUser) setUser(user);
      alert("Registration successful. You are now logged in.");
      navigateTo && navigateTo("browse");
    } catch (err) {
      setApiError(err.message || "Registration failed. Check backend/database.");
    } finally {
      setLoading(false);
    }
  }

  const input = (err) => ({ width: "100%", height: 58, borderRadius: 14, border: `1px solid ${err ? "#E24B4A" : t.inputBorder}`, padding: "0 18px", fontSize: 16, boxSizing: "border-box", outline: "none", fontFamily: "inherit", background: t.inputBg, color: t.text, colorScheme: darkMode ? "dark" : "light" });
  const label = { display: "block", marginBottom: 9, color: t.body, fontWeight: 700, fontSize: 15 };

  return (
    <div style={{ minHeight: "100vh", background: t.page, display: "flex", justifyContent: "center", alignItems: "center", padding: 30, fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <style>{`
        @media (max-width: 850px) {
          .auth-grid { grid-template-columns: 1fr !important; }
          .auth-left { display: none !important; }
          .auth-right { padding: 32px 22px !important; }
        }
      `}</style>
      <div className="auth-grid" style={{ width: 1200, maxWidth: "100%", minHeight: 720, background: t.card, borderRadius: 30, overflow: "hidden", display: "grid", gridTemplateColumns: "45% 55%", boxShadow: "0 20px 60px rgba(0,0,0,0.12)", border: `1px solid ${t.border}` }}>
        <div className="auth-left" style={{ background: darkMode ? "#0f172a" : "#eef4fb" }}>
          <img src={authPanel} alt="Lost and Found" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>
        <div className="auth-right" style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 60, background: t.panel }}>
          <form onSubmit={handleRegister} style={{ width: "100%", maxWidth: 520 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: t.text }}>UniLost & Found</div>
            <div style={{ fontSize: 13, color: t.muted }}>University of Moratuwa</div>

            <h1 style={{ fontSize: 44, fontWeight: 800, color: t.text, margin: "28px 0 10px", lineHeight: 1.1 }}>Create Account</h1>
            <p style={{ fontSize: 16, color: t.muted, marginBottom: 28 }}>Register using the backend `/auth/register` API.</p>

            {apiError && <div style={{ background: "#fee2e2", color: "#991b1b", padding: 12, borderRadius: 12, marginBottom: 16, fontSize: 14 }}>{apiError}</div>}

            <div style={{ marginBottom: 14 }}>
              <label style={label}>Username / Full Name</label>
              <input value={name} onChange={(e) => { setName(e.target.value); setErrors({ ...errors, name: null }); }} style={input(errors.name)} />
              {errors.name && <span style={{ color: "#E24B4A", fontSize: 13 }}>{errors.name}</span>}
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={label}>Email</label>
              <input value={email} onChange={(e) => { setEmail(e.target.value); setErrors({ ...errors, email: null }); }} style={input(errors.email)} />
              {errors.email && <span style={{ color: "#E24B4A", fontSize: 13 }}>{errors.email}</span>}
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={label}>Password</label>
              <input type="password" value={pass} onChange={(e) => { setPass(e.target.value); setErrors({ ...errors, pass: null }); }} style={input(errors.pass)} />
              {errors.pass && <span style={{ color: "#E24B4A", fontSize: 13 }}>{errors.pass}</span>}
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={label}>Confirm Password</label>
              <input type="password" value={conf} onChange={(e) => { setConf(e.target.value); setErrors({ ...errors, conf: null }); }} style={input(errors.conf)} />
              {errors.conf && <span style={{ color: "#E24B4A", fontSize: 13 }}>{errors.conf}</span>}
            </div>

            <button type="submit" disabled={loading} style={{ width: "100%", height: 62, border: "none", borderRadius: 14, background: loading ? "#94a3b8" : "linear-gradient(90deg,#0F5FFF,#4A8BFF)", color: "#fff", fontSize: 18, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", marginTop: 8 }}>{loading ? "Creating..." : "Create Account"}</button>
            <p style={{ textAlign: "center", marginTop: 24, color: t.muted }}>Already have an account? <button type="button" onClick={() => navigateTo && navigateTo("login")} style={{ border: "none", background: "none", color: t.link, fontWeight: 800, cursor: "pointer" }}>Sign in</button></p>
          </form>
        </div>
      </div>
    </div>
  );
}
