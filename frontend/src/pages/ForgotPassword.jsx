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
  fieldGap: { marginBottom: 14 },
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

export default function ForgotPassword({ go }) {
  const [email, setEmail] = useState("");

  function handleSend() {
    if (!email) return alert("Please enter your email address.");
    alert(`Reset link sent to ${email}`);
    go("login");
  }

  return (
    <div style={css.page}>
      <div style={css.card}>
        <div style={{
          width: 52, height: 52, borderRadius: 12,
          background: "#E6F1FB", display: "flex", alignItems: "center",
          justifyContent: "center", margin: "0 0 16px",
        }}>
          <span style={{ fontSize: 22, color: C.primary }}>✉</span>
        </div>
        <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700, color: C.text }}>Reset your password</h2>
        <p style={{ margin: "0 0 24px", fontSize: 13, color: C.muted, lineHeight: 1.5 }}>
          Enter your university email and we'll send you a reset link.
        </p>
        <Field label="University email">
          <Input type="email" placeholder="john@uom.lk" value={email} onChange={e => setEmail(e.target.value)} />
        </Field>
        <div style={{ marginTop: 4 }}>
          <BtnPrimary onClick={handleSend}>Send reset link</BtnPrimary>
          <div style={{ marginTop: 10 }}>
            <BtnSecondary onClick={() => go("login")}>Back to sign in</BtnSecondary>
          </div>
        </div>
      </div>
    </div>
  );
}