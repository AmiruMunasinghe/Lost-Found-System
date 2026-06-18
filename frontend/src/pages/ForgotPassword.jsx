import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authPanel from "../assets/left_panel.png";
import { requestPasswordReset } from "../api/auth";

export default function ForgotPassword({ navigateTo, darkMode }) {
  const fallbackNavigate = useNavigate();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const go = (path) => {
    if (navigateTo) navigateTo(path);
    else fallbackNavigate(path);
  };

  async function handleSend() {
    const newErrors = {};
    if (!email.trim()) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Please enter a valid email address.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSuccess(true);
    } catch (error) {
      setErrors({ email: error.message || "Failed to request password reset" });
    } finally {
      setLoading(false);
    }
  }

  const T = darkMode
    ? {
        page: "#0f172a",
        shell: "#111827",
        panel: "#1e293b",
        leftPanel: "#111827",
        text: "#e2e8f0",
        heading: "#f8fafc",
        muted: "#94a3b8",
        label: "#cbd5e1",
        border: "#334155",
        input: "#0f172a",
        inputText: "#e2e8f0",
        secondaryButton: "#1e293b",
        iconBox: "linear-gradient(135deg, #1d4ed8, #0f172a)",
        shadow: "0 20px 60px rgba(0,0,0,0.35)",
      }
    : {
        page: "#eef4fb",
        shell: "#ffffff",
        panel: "#ffffff",
        leftPanel: "#eef4fb",
        text: "#0b3470",
        heading: "#0b3470",
        muted: "#667085",
        label: "#344054",
        border: "#d0d5dd",
        input: "#ffffff",
        inputText: "#101828",
        secondaryButton: "#ffffff",
        iconBox: "linear-gradient(135deg, #E8F0FE, #D6E4FF)",
        shadow: "0 20px 60px rgba(0,0,0,0.08)",
      };

  const styles = {
    page: {
      minHeight: "100%",
      background: T.page,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      boxSizing: "border-box",
      transition: "background-color 0.3s ease",
    },
    container: {
      width: "1000px",
      maxWidth: "100%",
      minHeight: "560px",
      background: T.shell,
      border: `1px solid ${T.border}`,
      borderRadius: "24px",
      overflow: "hidden",
      display: "grid",
      gridTemplateColumns: "45% 55%",
      boxShadow: T.shadow,
      transition: "background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
    },
    leftPanel: { background: darkMode ? "#0f172a" : "#eef4fb" },
    leftImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      objectPosition: "center",
      display: "block",
    },
    rightPanel: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "40px",
      background: T.panel,
      transition: "background-color 0.3s ease",
    },
    form: {
      width: "100%",
      maxWidth: "440px",
    },
    logo: {
      marginBottom: "20px",
    },
    logoTitle: {
      fontSize: "16px",
      fontWeight: "700",
      color: T.text,
    },
    logoSub: {
      fontSize: "12px",
      color: T.muted,
    },
    iconBox: {
      width: "60px",
      height: "60px",
      borderRadius: "16px",
      background: T.iconBox,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "20px",
    },
    heading: {
      fontSize: "40px",
      fontWeight: "800",
      color: T.heading,
      marginBottom: "8px",
      lineHeight: 1.1,
    },
    subtitle: {
      fontSize: "15px",
      color: T.muted,
      marginBottom: "30px",
      lineHeight: 1.5,
    },
    label: {
      display: "block",
      marginBottom: "8px",
      color: T.label,
      fontWeight: "600",
      fontSize: "14px",
    },
    input: {
      width: "100%",
      height: "50px",
      borderRadius: "12px",
      border: `1px solid ${T.border}`,
      background: T.input,
      color: T.inputText,
      padding: "0 16px",
      fontSize: "15px",
      marginBottom: "6px",
      boxSizing: "border-box",
      outline: "none",
      fontFamily: "inherit",
      colorScheme: darkMode ? "dark" : "light",
      transition: "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease",
    },
    errorText: {
      color: "#E24B4A",
      fontSize: "13px",
      marginBottom: "10px",
      marginLeft: "4px",
      display: "block",
    },
    sendBtn: {
      width: "100%",
      height: "52px",
      border: "none",
      borderRadius: "12px",
      background: "linear-gradient(90deg,#0F5FFF,#4A8BFF)",
      color: "#fff",
      fontSize: "16px",
      fontWeight: "700",
      cursor: "pointer",
      fontFamily: "inherit",
      marginTop: "8px",
    },
    backBtn: {
      width: "100%",
      height: "50px",
      borderRadius: "12px",
      border: "2px solid #2563eb",
      background: T.secondaryButton,
      color: darkMode ? "#93c5fd" : "#2563eb",
      fontSize: "15px",
      fontWeight: "600",
      cursor: "pointer",
      marginTop: "12px",
      fontFamily: "inherit",
      transition: "background-color 0.3s ease, color 0.3s ease",
    },
    loginText: {
      textAlign: "center",
      marginTop: "24px",
      color: T.muted,
      fontSize: "14px",
    },
    loginLink: {
      color: "#60a5fa",
      fontWeight: "700",
      cursor: "pointer",
    },
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
          <div style={styles.form}>
            <div style={styles.logo}>
              <div style={styles.logoTitle}>UniLost & Found</div>
              <div style={styles.logoSub}>University of Moratuwa</div>
            </div>

            <div style={styles.iconBox}>
              <span style={{ fontSize: "32px" }}>✉️</span>
            </div>

            <h1 className="auth-heading" style={styles.heading}>Reset Password 🔐</h1>
            <p style={styles.subtitle}>Enter your university email and we'll send you a reset link.</p>

            {success ? (
              <div style={{ background: "#dcfce7", color: "#166534", padding: 16, borderRadius: 12, marginBottom: 20, fontSize: 15, border: "1px solid #bbf7d0" }}>
                We've sent a password reset link to <strong>{email}</strong>. Please check your inbox.
              </div>
            ) : (
              <>
                <label style={styles.label}>University Email</label>
                <input
                  style={{ ...styles.input, borderColor: errors.email ? "#E24B4A" : T.border, marginBottom: errors.email ? "6px" : "22px" }}
                  type="email"
                  placeholder="john@uom.lk"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors({ ...errors, email: null }); }}
                />
                {errors.email && <span style={styles.errorText}>{errors.email}</span>}
              </>
            )}

            <button style={styles.sendBtn} onClick={handleSend} disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <button style={styles.backBtn} onClick={() => go("/login")}>← Back to login</button>

            <div style={styles.loginText}>
              Remember your password?{" "}
              <span style={styles.loginLink} onClick={() => go("/login")}>Sign In</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
