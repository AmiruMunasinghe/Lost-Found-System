import { useState } from "react";
import authPanel from "../assets/left_panel.png";

export default function Registration({ go }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [id, setId] = useState("");
  const [role, setRole] = useState("Student");
  const [pass, setPass] = useState("");
  const [conf, setConf] = useState("");

  function handleRegister() {
    if (!name || !email || !id || !pass) return alert("Please fill in all fields.");
    if (pass !== conf) return alert("Passwords do not match.");
    alert("Registration successful! Please sign in.");
    go("login");
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
      fontSize: "48px",
      fontWeight: "800",
      color: "#0b3470",
      marginBottom: "10px",
      lineHeight: 1.1,
    },

    subtitle: {
      fontSize: "18px",
      color: "#667085",
      marginBottom: "35px",
    },

    row2: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "16px",
    },

    fieldGap: {
      marginBottom: "20px",
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
      boxSizing: "border-box",
      outline: "none",
      fontFamily: "inherit",
    },

    select: {
      width: "100%",
      height: "62px",
      borderRadius: "14px",
      border: "1px solid #d0d5dd",
      padding: "0 18px",
      fontSize: "16px",
      boxSizing: "border-box",
      outline: "none",
      fontFamily: "inherit",
      background: "#ffffff",
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
      marginTop: "12px",
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

        {/* RIGHT REGISTRATION PANEL */}
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
              Create Account ✨
            </h1>

            <p style={styles.subtitle}>
              Fill in the details below to get started
            </p>

            <div style={styles.row2}>
              <div style={styles.fieldGap}>
                <label style={styles.label}>Full Name</label>
                <input
                  style={styles.input}
                  placeholder="John Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div style={styles.fieldGap}>
                <label style={styles.label}>Role</label>
                <select
                  style={styles.select}
                  value={role}
                  onChange={e => setRole(e.target.value)}
                >
                  <option>Student</option>
                  <option>Staff</option>
                </select>
              </div>
            </div>

            <div style={styles.row2}>
              <div style={styles.fieldGap}>
                <label style={styles.label}>University Email</label>
                <input
                  style={styles.input}
                  type="email"
                  placeholder="john@uom.lk"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div style={styles.fieldGap}>
                <label style={styles.label}>Student / Staff ID</label>
                <input
                  style={styles.input}
                  placeholder="e.g. 230224V"
                  value={id}
                  onChange={e => setId(e.target.value)}
                />
              </div>
            </div>

            <div style={styles.row2}>
              <div style={styles.fieldGap}>
                <label style={styles.label}>Password</label>
                <input
                  style={styles.input}
                  type="password"
                  placeholder="Min. 8 characters"
                  value={pass}
                  onChange={e => setPass(e.target.value)}
                />
              </div>
              <div style={styles.fieldGap}>
                <label style={styles.label}>Confirm Password</label>
                <input
                  style={styles.input}
                  type="password"
                  placeholder="Repeat password"
                  value={conf}
                  onChange={e => setConf(e.target.value)}
                />
              </div>
            </div>

            <button
              style={styles.signUpBtn}
              onClick={handleRegister}
            >
              Create Account
            </button>

            <div style={styles.loginText}>
              Already have an account?{" "}
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