import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
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
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showPass, setShowPass] = useState(false);

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
      setFailedAttempts(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  }

  const styles = {
    page: { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: t.page, display: "flex", justifyContent: "center", alignItems: "center", padding: 20, fontFamily: "'DM Sans', 'Segoe UI', sans-serif", zIndex: 9999 },
    container: { width: 1000, maxWidth: "100%", minHeight: 560, background: t.card, borderRadius: 24, overflow: "hidden", display: "grid", gridTemplateColumns: "45% 55%", boxShadow: "0 20px 60px rgba(0,0,0,0.12)", border: `1px solid ${t.border}` },
    leftPanel: { background: darkMode ? "#0f172a" : "#eef4fb" },
    rightPanel: { display: "flex", justifyContent: "center", alignItems: "center", padding: 40, background: t.panel },
    form: { width: "100%", maxWidth: 440 },
    logoTitle: { fontSize: 16, fontWeight: 800, color: t.text },
    logoSub: { fontSize: 12, color: t.muted },
    heading: { fontSize: 40, fontWeight: 800, color: t.text, margin: "20px 0 8px", lineHeight: 1.1 },
    subtitle: { fontSize: 15, color: t.muted, marginBottom: 24 },
    label: { display: "block", marginBottom: 8, color: t.body, fontWeight: 700, fontSize: 14 },
    input: { width: "100%", height: 50, borderRadius: 12, border: `1px solid ${t.inputBorder}`, padding: "0 16px", fontSize: 15, marginBottom: 6, boxSizing: "border-box", outline: "none", background: t.inputBg, color: t.text, colorScheme: darkMode ? "dark" : "light" },
    pwInput: { width: "100%", height: 50, borderRadius: 12, border: `1px solid ${t.inputBorder}`, padding: "0 40px 0 16px", fontSize: 15, marginBottom: 6, boxSizing: "border-box", outline: "none", background: t.inputBg, color: t.text, colorScheme: darkMode ? "dark" : "light" },
    eyeIcon: { position: "absolute", right: 14, top: 40, cursor: "pointer", color: t.muted },
    errorText: { color: "#E24B4A", fontSize: 13, marginBottom: 10, marginLeft: 4, display: "block" },
    signInBtn: { width: "100%", height: 52, border: "none", borderRadius: 12, background: loading ? "#94a3b8" : "linear-gradient(90deg,#0F5FFF,#4A8BFF)", color: "#fff", fontSize: 16, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", marginTop: 8 },
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

            {apiError && <div style={{ background: "#fee2e2", color: "#991b1b", padding: 12, borderRadius: 12, marginBottom: 16, fontSize: 14 }}>{apiError}</div>}

            <label style={styles.label}>Email or Username</label>
            <input value={email} onChange={(e) => { setEmail(e.target.value); setErrors({ ...errors, email: null }); }} placeholder="abdul@test.com" style={styles.input} />
            {errors.email && <span style={styles.errorText}>{errors.email}</span>}

            <div style={{ position: "relative", marginBottom: errors.pass ? 0 : 16 }}>
              <label style={styles.label}>Password</label>
              <input type={showPass ? "text" : "password"} value={pass} onChange={(e) => { setPass(e.target.value); setErrors({ ...errors, pass: null }); }} placeholder="••••••••" style={styles.pwInput} />
              <div style={styles.eyeIcon} onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
            </div>
            {errors.pass && <span style={styles.errorText}>{errors.pass}</span>}

            <button type="submit" disabled={loading} style={styles.signInBtn}>{loading ? "Signing in..." : "Sign In"}</button>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 24, gap: "12px" }}>
              {failedAttempts > 0 && (
                <button type="button" style={{ ...styles.secondaryBtn, fontSize: 14 }} onClick={() => navigateTo && navigateTo("forgot")}>
                  Forgot password?
                </button>
              )}
              <p style={{ margin: 0, color: t.muted, fontSize: 14 }}>
                No account? <button type="button" style={styles.secondaryBtn} onClick={() => navigateTo && navigateTo("register")}>Create account</button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
