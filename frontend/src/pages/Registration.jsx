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
    maxWidth: 480,
    boxSizing: "border-box",
  },
  row2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
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

function Select({ options, ...props }) {
  return (
    <select style={{ ...css.input, height: 38 }} {...props}>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  );
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

  return (
    <div style={css.page}>
      <div style={css.card}>
        <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: C.text, textAlign: "center" }}>Create account</h2>
        <p style={{ margin: "0 0 24px", fontSize: 13, color: C.muted, textAlign: "center" }}>Fill in the details below to get started</p>

        <div style={css.row2}>
          <Field label="Full name">
            <Input placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} />
          </Field>
          <Field label="Role">
            <Select options={["Student", "Staff"]} value={role} onChange={e => setRole(e.target.value)} />
          </Field>
        </div>

        <div style={css.row2}>
          <Field label="University email">
            <Input type="email" placeholder="john@uom.lk" value={email} onChange={e => setEmail(e.target.value)} />
          </Field>
          <Field label="Student / Staff ID">
            <Input placeholder="e.g. 230224V" value={id} onChange={e => setId(e.target.value)} />
          </Field>
        </div>

        <div style={css.row2}>
          <Field label="Password">
            <Input type="password" placeholder="Min. 8 characters" value={pass} onChange={e => setPass(e.target.value)} />
          </Field>
          <Field label="Confirm password">
            <Input type="password" placeholder="Repeat password" value={conf} onChange={e => setConf(e.target.value)} />
          </Field>
        </div>

        <div style={{ marginTop: 8 }}>
          <BtnPrimary onClick={handleRegister}>Create account</BtnPrimary>
          <div style={{ marginTop: 10 }}>
            <BtnSecondary onClick={() => go("login")}>Back to sign in</BtnSecondary>
          </div>
        </div>
      </div>
    </div>
  );
}