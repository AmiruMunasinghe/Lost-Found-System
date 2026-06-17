import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authPanel from "../assets/left_panel.png";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export default function Login({ setUser, pageParams }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [pass, setPass] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    const newErrors = {};
    if (!username.trim()) newErrors.email = "Username is required.";
    if (!pass) newErrors.pass = "Password is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password: pass }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ pass: data.message ?? "Invalid username or password." });
        return;
      }

      const role = data.user?.role ?? "student";
      if (setUser) {
        setUser({
          token: data.accessToken,
          name: data.user?.username ?? username,
          role,
          email: data.user?.email,
          id: data.user?.id,
        });
      }

      if (pageParams && pageParams.next) {
        navigate(`/${pageParams.next}`, { state: pageParams.nextParams });
      } else {
        navigate(role === "admin" ? "/admin-dashboard" : "/");
      }
    } catch {
      setErrors({ pass: "Could not reach the server. Please try again." });
    } finally {
      setLoading(false);
    }
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

    heading: {
      fontSize: "58px",
      fontWeight: "800",
      color: "#0b3470",
      marginBottom: "10px",
      lineHeight: 1.1,
    },

    subtitle: {
      fontSize: "18px",
      color: "#667085",
      marginBottom: "40px",
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
    },

    errorText: {
      color: "#E24B4A",
      fontSize: "13px",
      marginBottom: "16px",
      marginLeft: "4px",
      display: "block",
    },

    forgot: {
      textAlign: "right",
      marginBottom: "25px",
    },

    forgotLink: {
      color: "#2563eb",
      cursor: "pointer",
      fontWeight: "500",
      fontSize: "14px",
      border: "none",
      background: "none",
    },

    signInBtn: {
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

    divider: {
      textAlign: "center",
      color: "#98A2B3",
      margin: "28px 0",
      fontSize: "14px",
    },

    ssoBtn: {
      width: "100%",
      height: "62px",
      borderRadius: "14px",
      border: "2px solid #2563eb",
      background: "#ffffff",
      color: "#2563eb",
      fontSize: "17px",
      fontWeight: "600",
      cursor: "pointer",
    },

    register: {
      textAlign: "center",
      marginTop: "30px",
      color: "#667085",
      fontSize: "15px",
    },

    registerLink: {
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
        display: "block",}}/></div>

        {/* RIGHT LOGIN PANEL */}
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

            <h1 style={styles.heading}>
              Welcome Back 👋
            </h1>

            <p style={styles.subtitle}>
              Sign in to continue to your account
            </p>

            <label style={styles.label}>
              Username
            </label>

            <input
              style={{...styles.input, borderColor: errors.email ? "#E24B4A" : "#d0d5dd", marginBottom: errors.email ? "6px" : "22px"}}
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setErrors({...errors, email: null}); }}
            />
            {errors.email && <span style={styles.errorText}>{errors.email}</span>}

            <label style={styles.label}>
              Password
            </label>

            <input
              style={{...styles.input, borderColor: errors.pass ? "#E24B4A" : "#d0d5dd", marginBottom: errors.pass ? "6px" : "22px"}}
              type="password"
              placeholder="Enter your password"
              value={pass}
              onChange={(e) => { setPass(e.target.value); setErrors({...errors, pass: null}); }}
            />
            {errors.pass && <span style={styles.errorText}>{errors.pass}</span>}

            <div style={styles.forgot}>
              <button
                style={styles.forgotLink}
                onClick={() => navigate("/forgot")}
              >
                Forgot Password?
              </button>
            </div>

            <button
              style={{...styles.signInBtn, opacity: loading ? 0.7 : 1}}
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <div style={styles.divider}>
              OR
            </div>

            <button style={styles.ssoBtn}>
              🎓 Sign in with University SSO
            </button>

            <div style={styles.register}>
              Don't have an account?{" "}
              <span
                style={styles.registerLink}
                onClick={() => navigate("/register")}
              >
                Create Account
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
