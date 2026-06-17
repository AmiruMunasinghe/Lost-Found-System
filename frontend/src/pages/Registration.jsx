import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authPanel from "../assets/left_panel.png";

export default function Registration() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [id, setId] = useState("");
  const [role, setRole] = useState("Student");
  const [pass, setPass] = useState("");
  const [conf, setConf] = useState("");
  const [errors, setErrors] = useState({});

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
                  style={{...styles.input, borderColor: errors.name ? "#E24B4A" : "#d0d5dd"}}
                  placeholder="John Doe"
                  value={name}
                  onChange={e => { setName(e.target.value); setErrors({...errors, name: null}); }}
                />
                {errors.name && <span style={styles.errorText}>{errors.name}</span>}
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
                  style={{...styles.input, borderColor: errors.email ? "#E24B4A" : "#d0d5dd"}}
                  type="email"
                  placeholder="john@uom.lk"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErrors({...errors, email: null}); }}
                />
                {errors.email && <span style={styles.errorText}>{errors.email}</span>}
              </div>
              <div style={styles.fieldGap}>
                <label style={styles.label}>Student / Staff ID</label>
                <input
                  style={{...styles.input, borderColor: errors.id ? "#E24B4A" : "#d0d5dd"}}
                  placeholder="e.g. 230224V"
                  value={id}
                  onChange={e => { setId(e.target.value); setErrors({...errors, id: null}); }}
                />
                {errors.id && <span style={styles.errorText}>{errors.id}</span>}
              </div>
            </div>

            <div style={styles.row2}>
              <div style={styles.fieldGap}>
                <label style={styles.label}>Password</label>
                <input
                  style={{...styles.input, borderColor: errors.pass ? "#E24B4A" : "#d0d5dd"}}
                  type="password"
                  placeholder="Min. 8 characters"
                  value={pass}
                  onChange={e => { setPass(e.target.value); setErrors({...errors, pass: null}); }}
                />
                {errors.pass && <span style={styles.errorText}>{errors.pass}</span>}
              </div>
              <div style={styles.fieldGap}>
                <label style={styles.label}>Confirm Password</label>
                <input
                  style={{...styles.input, borderColor: errors.conf ? "#E24B4A" : "#d0d5dd"}}
                  type="password"
                  placeholder="Repeat password"
                  value={conf}
                  onChange={e => { setConf(e.target.value); setErrors({...errors, conf: null}); }}
                />
                {errors.conf && <span style={styles.errorText}>{errors.conf}</span>}
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
                onClick={() => navigate("/login")}
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