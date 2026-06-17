import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authPanel from "../assets/left_panel.png";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});

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
    navigate("/login");
  }

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#eef4fb",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "30px",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    },

    container: {
      width: "1400px",
      maxWidth: "100%",
      minHeight: "850px",
      background: "#ffffff",
      borderRadius: "30px",
      overflow: "hidden",
      display: "grid",
      gridTemplateColumns: "45% 55%",
      boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
    },

    leftPanel: {
      backgroundImage: `url(${authPanel})`,
      backgroundSize: "contain",
      backgroundPosition: "left center",
      backgroundRepeat: "no-repeat",
      backgroundColor: "#eef4fb",
    },

    rightPanel: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "70px",
      background: "#ffffff",
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
      color: "#0b3470",
    },

    logoSub: {
      fontSize: "13px",
      color: "#667085",
    },

    iconBox: {
      width: "72px",
      height: "72px",
      borderRadius: "18px",
      background: "linear-gradient(135deg, #E8F0FE, #D6E4FF)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "24px",
    },

    heading: {
      fontSize: "48px",
      fontWeight: "800",
      color: "#0b3470",
      marginBottom: "10px",
      lineHeight: 1.1,
    },

    subtitle: {
      fontSize: "18px",
      color: "#667085",
      marginBottom: "40px",
      lineHeight: 1.5,
    },

    label: {
      display: "block",
      marginBottom: "10px",
      color: "#344054",
      fontWeight: "600",
      fontSize: "15px",
    },

    input: {
      width: "100%",
      height: "62px",
      borderRadius: "14px",
      border: "1px solid #d0d5dd",
      padding: "0 18px",
      fontSize: "16px",
      marginBottom: "6px",
      boxSizing: "border-box",
      outline: "none",
      fontFamily: "inherit",
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
    },

    backBtn: {
      width: "100%",
      height: "62px",
      borderRadius: "14px",
      border: "2px solid #2563eb",
      background: "#ffffff",
      color: "#2563eb",
      fontSize: "17px",
      fontWeight: "600",
      cursor: "pointer",
      marginTop: "14px",
    },

    loginText: {
      textAlign: "center",
      marginTop: "30px",
      color: "#667085",
      fontSize: "15px",
    },

    loginLink: {
      color: "#2563eb",
      fontWeight: "700",
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* LEFT IMAGE PANEL */}
        <div style={styles.leftPanel}>
          <img src={authPanel}
            alt="Lost and Found"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
            }} />
        </div>

        {/* RIGHT FORGOT PASSWORD PANEL */}
        <div style={styles.rightPanel}>
          <div style={styles.form}>

            <div style={styles.logo}>
              <div style={styles.logoTitle}>
                UniLost & Found
              </div>
              <div style={styles.logoSub}>
                University of Moratuwa
              </div>
            </div>

            <div style={styles.iconBox}>
              <span style={{ fontSize: "32px" }}>✉️</span>
            </div>

            <h1 style={styles.heading}>
              Reset Password 🔐
            </h1>

            <p style={styles.subtitle}>
              Enter your university email and we'll send you a reset link.
            </p>

            <label style={styles.label}>
              University Email
            </label>

            <input
              style={{...styles.input, borderColor: errors.email ? "#E24B4A" : "#d0d5dd", marginBottom: errors.email ? "6px" : "22px"}}
              type="email"
              placeholder="john@uom.lk"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors({...errors, email: null}); }}
            />
            {errors.email && <span style={styles.errorText}>{errors.email}</span>}

            <button
              style={styles.sendBtn}
              onClick={handleSend}
            >
              Send Reset Link
            </button>

            <button
              style={styles.backBtn}
              onClick={() => navigate("/login")}
            >
              ← Back to login
            </button>

            <div style={styles.loginText}>
              Remember your password?{" "}
              <span
                style={styles.loginLink}
                onClick={() => go("login")}
              >
                Sign In
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}