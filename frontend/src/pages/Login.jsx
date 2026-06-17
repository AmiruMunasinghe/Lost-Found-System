import { useState } from "react";
import authPanel from "../assets/left_panel.png";
import { loginUser } from "../api/auth";

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

export default function Login({ setUser, pageParams, navigateTo, darkMode }) {
  const t = useDark(darkMode);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e?.preventDefault?.();
    const nextErrors = {};
    if (!email.trim()) nextErrors.email = "Email or username is required.";
    if (!pass) nextErrors.pass = "Password is required.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      setApiError("");
      setLoading(true);
      const user = await loginUser({ identifier: email, password: pass });
      if (setUser) setUser(user);

      if (pageParams?.next) {
        navigateTo(pageParams.next, pageParams.nextParams || {});
      } else {
        navigateTo(user.role === "admin" ? "admin-dashboard" : "browse");
      }
    } catch (err) {
      setApiError(err.message || "Login failed. Check backend and credentials.");
    } finally {
      setLoading(false);
    }
  }

  const styles = {
    page: { minHeight: "100vh", background: t.page, display: "flex", justifyContent: "center", alignItems: "center", padding: 30, fontFamily: "'DM Sans', 'Segoe UI', sans-serif" },
    container: { width: 1200, maxWidth: "100%", minHeight: 720, background: t.card, borderRadius: 30, overflow: "hidden", display: "grid", gridTemplateColumns: "45% 55%", boxShadow: "0 20px 60px rgba(0,0,0,0.12)", border: `1px solid ${t.border}` },
    leftPanel: { background: darkMode ? "#0f172a" : "#eef4fb" },
    rightPanel: { display: "flex", justifyContent: "center", alignItems: "center", padding: 60, background: t.panel },
    form: { width: "100%", maxWidth: 520 },
    logoTitle: { fontSize: 18, fontWeight: 800, color: t.text },
    logoSub: { fontSize: 13, color: t.muted },
    heading: { fontSize: 52, fontWeight: 800, color: t.text, margin: "30px 0 10px", lineHeight: 1.1 },
    subtitle: { fontSize: 17, color: t.muted, marginBottom: 36 },
    label: { display: "block", marginBottom: 10, color: t.body, fontWeight: 700, fontSize: 15 },
    input: { width: "100%", height: 60, borderRadius: 14, border: `1px solid ${t.inputBorder}`, padding: "0 18px", fontSize: 16, marginBottom: 6, boxSizing: "border-box", outline: "none", background: t.inputBg, color: t.text, colorScheme: darkMode ? "dark" : "light" },
    errorText: { color: "#E24B4A", fontSize: 13, marginBottom: 14, marginLeft: 4, display: "block" },
    signInBtn: { width: "100%", height: 62, border: "none", borderRadius: 14, background: loading ? "#94a3b8" : "linear-gradient(90deg,#0F5FFF,#4A8BFF)", color: "#fff", fontSize: 18, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", marginTop: 12 },
    secondaryBtn: { border: "none", background: "none", color: t.link, fontWeight: 800, cursor: "pointer" },
  };

  return (
    <div style={styles.page}>
      <style>{`
        @media (max-width: 850px) {
          .auth-grid { grid-template-columns: 1fr !important; }
          .auth-left { display: none !important; }
          .auth-right { padding: 32px 22px !important; }
        }
      `}</style>
      <div className="auth-grid" style={styles.container}>
        <div className="auth-left" style={styles.leftPanel}>
          <img src={authPanel} alt="Lost and Found" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>

        <div className="auth-right" style={styles.rightPanel}>
          <form onSubmit={handleLogin} style={styles.form}>
            <div>
              <div style={styles.logoTitle}>UniLost & Found</div>
              <div style={styles.logoSub}>University of Moratuwa</div>
            </div>

            <h1 style={styles.heading}>Welcome Back 👋</h1>
            <p style={styles.subtitle}>Sign in using your backend account</p>

            {apiError && <div style={{ background: "#fee2e2", color: "#991b1b", padding: 12, borderRadius: 12, marginBottom: 16, fontSize: 14 }}>{apiError}</div>}

            <label style={styles.label}>Email or Username</label>
            <input value={email} onChange={(e) => { setEmail(e.target.value); setErrors({ ...errors, email: null }); }} placeholder="abdul@test.com" style={styles.input} />
            {errors.email && <span style={styles.errorText}>{errors.email}</span>}

            <label style={styles.label}>Password</label>
            <input type="password" value={pass} onChange={(e) => { setPass(e.target.value); setErrors({ ...errors, pass: null }); }} placeholder="••••••••" style={styles.input} />
            {errors.pass && <span style={styles.errorText}>{errors.pass}</span>}

            <button type="submit" disabled={loading} style={styles.signInBtn}>{loading ? "Signing in..." : "Sign In"}</button>

            <p style={{ textAlign: "center", marginTop: 24, color: t.muted }}>
              No account? <button type="button" style={styles.secondaryBtn} onClick={() => navigateTo && navigateTo("register")}>Create account</button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
