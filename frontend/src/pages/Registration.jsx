import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authPanel from "../assets/left_panel.png";

export default function Registration({ navigateTo, darkMode }) {
  const fallbackNavigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [id, setId] = useState("");
  const [role, setRole] = useState("Student");
  const [pass, setPass] = useState("");
  const [conf, setConf] = useState("");
  const [errors, setErrors] = useState({});

  const go = (path) => {
    if (navigateTo) navigateTo(path);
    else fallbackNavigate(path);
  };

  function handleRegister() {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Full Name is required.";
    if (!email.trim()) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Please enter a valid email address.";

    if (!id.trim()) newErrors.id = "ID is required.";
    if (!pass) newErrors.pass = "Password is required.";
    else if (pass.length < 8) newErrors.pass = "Password must be at least 8 characters.";

    if (!conf) newErrors.conf = "Confirm Password is required.";
    else if (pass !== conf) newErrors.conf = "Passwords do not match.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    alert("Registration successful! Please sign in.");
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
        shadow: "0 20px 60px rgba(0,0,0,0.08)",
      };

  const inputStyle = (error) => ({
    ...styles.input,
    background: T.input,
    color: T.inputText,
    borderColor: error ? "#E24B4A" : T.border,
    colorScheme: darkMode ? "dark" : "light",
  });

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
      marginBottom: "35px",
    },
    row2: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "16px",
    },
    fieldGap: {
      marginBottom: "16px",
    },
    errorText: {
      color: "#E24B4A",
      fontSize: "13px",
      marginTop: "6px",
      marginLeft: "4px",
      display: "block",
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
      padding: "0 18px",
      fontSize: "16px",
      boxSizing: "border-box",
      outline: "none",
      fontFamily: "inherit",
      transition: "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease",
    },
    signUpBtn: {
      width: "100%",
      height: "64px",
      border: "none",
      borderRadius: "14px",
      background: "linear-gradient(90deg,#0F5FFF,#4A8BFF)",
      color: "#fff",
      fontSize: "18px",
      fontWeight: "700",
      cursor: "pointer",
      marginTop: "8px",
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
      marginTop: "12px",
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

            <h1 className="auth-heading" style={styles.heading}>Create Account ✨</h1>
            <p style={styles.subtitle}>Fill in the details below to get started</p>

            <div className="auth-row2" style={styles.row2}>
              <div style={styles.fieldGap}>
                <label style={styles.label}>Full Name</label>
                <input
                  style={inputStyle(errors.name)}
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErrors({ ...errors, name: null }); }}
                />
                {errors.name && <span style={styles.errorText}>{errors.name}</span>}
              </div>

              <div style={styles.fieldGap}>
                <label style={styles.label}>Role</label>
                <select
                  style={inputStyle(false)}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option>Student</option>
                  <option>Staff</option>
                </select>
              </div>
            </div>

            <div className="auth-row2" style={styles.row2}>
              <div style={styles.fieldGap}>
                <label style={styles.label}>University Email</label>
                <input
                  style={inputStyle(errors.email)}
                  type="email"
                  placeholder="john@uom.lk"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors({ ...errors, email: null }); }}
                />
                {errors.email && <span style={styles.errorText}>{errors.email}</span>}
              </div>

              <div style={styles.fieldGap}>
                <label style={styles.label}>Student / Staff ID</label>
                <input
                  style={inputStyle(errors.id)}
                  placeholder="e.g. 230224V"
                  value={id}
                  onChange={(e) => { setId(e.target.value); setErrors({ ...errors, id: null }); }}
                />
                {errors.id && <span style={styles.errorText}>{errors.id}</span>}
              </div>
            </div>

            <div className="auth-row2" style={styles.row2}>
              <div style={styles.fieldGap}>
                <label style={styles.label}>Password</label>
                <input
                  style={inputStyle(errors.pass)}
                  type="password"
                  placeholder="Min. 8 characters"
                  value={pass}
                  onChange={(e) => { setPass(e.target.value); setErrors({ ...errors, pass: null }); }}
                />
                {errors.pass && <span style={styles.errorText}>{errors.pass}</span>}
              </div>

              <div style={styles.fieldGap}>
                <label style={styles.label}>Confirm Password</label>
                <input
                  style={inputStyle(errors.conf)}
                  type="password"
                  placeholder="Repeat password"
                  value={conf}
                  onChange={(e) => { setConf(e.target.value); setErrors({ ...errors, conf: null }); }}
                />
                {errors.conf && <span style={styles.errorText}>{errors.conf}</span>}
              </div>
            </div>

            <button style={styles.signUpBtn} onClick={handleRegister}>Create Account</button>

            <div style={styles.loginText}>
              Already have an account?{" "}
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

  @media (max-width: 620px) {
    .auth-row2 {
      grid-template-columns: 1fr !important;
      gap: 0 !important;
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
