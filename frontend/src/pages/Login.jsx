import { useState } from "react";

const C = {
  primary:    "#185FA5",
  primaryDk:  "#0C447C",
  bg:         "#F4F6FA",
  card:       "#FFFFFF",
  text:       "#1A1D2E",
  muted:      "#6B7080",
  border:     "#DDE1EA",
  fieldBg:    "#F8F9FC",
  danger:     "#E24B4A",
  amber:      "#BA7517",
  green:      "#3B6D11",
};

const css = {
  page: {
    minHeight: "100vh",
    background: C.bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    padding: "24px 16px",
  },
  card: {
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 14,
    padding: "36px 40px",
    width: "100%",
    maxWidth: 420,
    boxSizing: "border-box",
  },
  label: {
    display: "block",
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.6px",
    textTransform: "uppercase",
    color: C.muted,
    marginBottom: 6,
  },
  input: {
    width: "100%",
    padding: "9px 12px",
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    background: C.fieldBg,
    fontSize: 14,
    color: C.text,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  btnPrimary: {
    width: "100%",
    padding: "11px",
    background: C.primary,
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  btnSecondary: {
    width: "100%",
    padding: "10px",
    background: C.fieldBg,
    color: C.text,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  link: {
    background: "none",
    border: "none",
    color: C.primary,
    fontSize: 12,
    cursor: "pointer",
    padding: 0,
    fontFamily: "inherit",
  },
  divider: {
    border: "none",
    borderTop: `1px solid ${C.border}`,
    margin: "20px 0",
  },
  fieldGap: { marginBottom: 14 },
};

function Field({ label, children }) {
  return (
    <div style={css.fieldGap}>
      <label style={css.label}>{label}</label>
      {children}
    </div>
  );
}

function Input(props) {
  return <input style={css.input} {...props} />;
}

function BtnPrimary({ children, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      style={{ ...css.btnPrimary, background: hov ? C.primaryDk : C.primary }}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >{children}</button>
  );
}

function BtnSecondary({ children, onClick }) {
  return <button style={css.btnSecondary} onClick={onClick}>{children}</button>;
}

function BrandHeader() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 24 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: C.primary, display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>LF</span>
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 15, color: C.text }}>UniLost&amp;Found</div>
        <div style={{ fontSize: 11, color: C.muted }}>University of Moratuwa</div>
      </div>
    </div>
  );
}

export default function Login({ setPage }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  function handleLogin() {
    if (!email || !pass) {
      alert("Please enter email and password.");
      return;
    }

     setPage("dashboard"); // ✅ always login success
  }

  return (
    <div style={css.page}>
      <div style={css.card}>
        <BrandHeader />
        <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: C.text }}>Welcome back</h2>
        <p style={{ margin: "0 0 24px", fontSize: 13, color: C.muted }}>Sign in to your account to continue</p>

        <Field label="Email / Student ID">
          <Input type="email" placeholder="e.g. kumars.23@uom.lk" value={email} onChange={e => setEmail(e.target.value)} />
        </Field>
        <Field label="Password">
          <Input type="password" placeholder="Enter your password" value={pass} onChange={e => setPass(e.target.value)} />
        </Field>

        <div style={{ textAlign: "right", marginBottom: 18, marginTop: -6 }}>
          <button style={css.link} onClick={() => setPage("forgot")}>Forgot password?</button>
        </div>

        <BtnPrimary onClick={handleLogin}>Sign in</BtnPrimary>
        <hr style={css.divider} />
        <BtnSecondary onClick={() => setPage("register")}>Create new account</BtnSecondary>
      </div>
    </div>
  );
}