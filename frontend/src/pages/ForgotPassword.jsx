import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authPanel from "../assets/left_panel.png";

export default function ForgotPassword({ navigateTo, darkMode }) {
  const fallbackNavigate = useNavigate();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});

  const go = (path) => {
    if (navigateTo) navigateTo(path);
    else fallbackNavigate(path);
  };

  function handleSend() {
    const newErrors = {};
    if (!email.trim()) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Please enter a valid email address.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    alert(`Reset link sent to ${email}`);
    go("/login");
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
      padding: "30px",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      boxSizing: "border-box",
      transition: "background-color 0.3s ease",
    },
    container: {
      width: "1400px",
      maxWidth: "100%",
      minHeight: "780px",
      background: T.shell,
      border: `1px solid ${T.border}`,
      borderRadius: "30px",
      overflow: "hidden",
      display: "grid",
      gridTemplateColumns: "45% 55%",
      boxShadow: T.shadow,
      transition: "background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
    },
    leftPanel: {
      backgroundColor: T.leftPanel,
      transition: "background-color 0.3s ease",
    },
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
      padding: "70px",
      background: T.panel,
      transition: "background-color 0.3s ease",
    },
    form: {
      width: "100%",
      maxWidth: "520px",
    },
    logo: {
      marginBottom: "30px",
    },
    logoTitle: {
      fontSize: "18px",
      fontWeight: "700",
      color: T.text,
    },
    logoSub: {
      fontSize: "13px",
      color: T.muted,
    },
    iconBox: {
      width: "72px",
      height: "72px",
      borderRadius: "18px",
      background: T.iconBox,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "24px",
    },
    heading: {
      fontSize: "48px",
      fontWeight: "800",
      color: T.heading,
      marginBottom: "10px",
      lineHeight: 1.1,
    },
    subtitle: {
      fontSize: "18px",
      color: T.muted,
      marginBottom: "40px",
      lineHeight: 1.5,
    },
    label: {
      display: "block",
      marginBottom: "10px",
      color: T.label,
      fontWeight: "600",
      fontSize: "15px",
    },
    input: {
      width: "100%",
      height: "62px",
      borderRadius: "14px",
      border: `1px solid ${T.border}`,
      background: T.input,
      color: T.inputText,
      padding: "0 18px",
      fontSize: "16px",
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
      marginBottom: "16px",
      marginLeft: "4px",
      display: "block",
    },
    sendBtn: {
      width: "100%",
      height: "64px",
      border: "none",
      borderRadius: "14px",
      background: "linear-gradient(90deg,#0F5FFF,#4A8BFF)",
      color: "#fff",
      fontSize: "18px",
      fontWeight: "700",
      cursor: "pointer",
      fontFamily: "inherit",
    },
    backBtn: {
      width: "100%",
      height: "62px",
      borderRadius: "14px",
      border: "2px solid #2563eb",
      background: T.secondaryButton,
      color: darkMode ? "#93c5fd" : "#2563eb",
      fontSize: "17px",
      fontWeight: "600",
      cursor: "pointer",
      marginTop: "14px",
      fontFamily: "inherit",
      transition: "background-color 0.3s ease, color 0.3s ease",
    },
    loginText: {
      textAlign: "center",
      marginTop: "30px",
      color: T.muted,
      fontSize: "15px",
    },
    loginLink: {
      color: "#60a5fa",
      fontWeight: "700",
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.page}>
      <style>{authResponsiveCss}</style>
      <div className="auth-container" style={styles.container}>
        <div className="auth-left-panel" style={styles.leftPanel}>
          <img src={authPanel} alt="Lost and Found" style={styles.leftImage} />
        </div>

        <div className="auth-right-panel" style={styles.rightPanel}>
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

            <label style={styles.label}>University Email</label>
            <input
              style={{ ...styles.input, borderColor: errors.email ? "#E24B4A" : T.border, marginBottom: errors.email ? "6px" : "22px" }}
              type="email"
              placeholder="john@uom.lk"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors({ ...errors, email: null }); }}
            />
            {errors.email && <span style={styles.errorText}>{errors.email}</span>}

            <button style={styles.sendBtn} onClick={handleSend}>Send Reset Link</button>

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

const authResponsiveCss = `
  @media (max-width: 900px) {
    .auth-container {
      grid-template-columns: 1fr !important;
      min-height: auto !important;
      border-radius: 22px !important;
    }
    .auth-left-panel {
      display: none !important;
    }
    .auth-right-panel {
      padding: 36px 24px !important;
    }
    .auth-heading {
      font-size: 38px !important;
    }
  }

  @media (max-width: 520px) {
    .auth-right-panel {
      padding: 28px 18px !important;
    }
    .auth-heading {
      font-size: 32px !important;
    }
  }
`;
