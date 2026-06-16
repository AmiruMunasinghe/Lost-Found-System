import { useState } from "react";

const C = {
  primary: "#0F5FFF",
  primaryDk: "#0b3470",
  bg: "#eef4fb",
  card: "#FFFFFF",
  text: "#0b3470",
  body: "#344054",
  muted: "#667085",
  border: "#d0d5dd",
  fieldBg: "#f6f9ff",
  link: "#2563eb",
};

const css = {
  page: {
    minHeight: "100vh",
    background: C.bg,
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    padding: "30px 16px",
  },
  container: {
    width: "100%",
    maxWidth: 600,
    margin: "0 auto",
  },
  backLink: {
    background: "none",
    border: "none",
    color: C.link,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    marginBottom: 18,
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: 0,
    fontFamily: "inherit",
  },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  fieldGap: { marginBottom: 18 },
  label: {
    display: "block",
    marginBottom: "10px",
    color: C.body,
    fontWeight: "600",
    fontSize: "15px",
  },
  input: {
    width: "100%",
    height: "54px",
    borderRadius: "14px",
    border: `1px solid ${C.border}`,
    padding: "0 18px",
    fontSize: "15px",
    boxSizing: "border-box",
    outline: "none",
    fontFamily: "inherit",
  },
  btnPrimary: {
    padding: "12px 28px",
    background: "linear-gradient(90deg,#0F5FFF,#4A8BFF)",
    color: "#fff",
    border: "none",
    borderRadius: 14,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  },
};

function Avatar({ initials, size = 56 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "linear-gradient(135deg, #0F5FFF, #4A8BFF)",
      color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 700, fontSize: size * 0.35,
    }}>{initials}</div>
  );
}

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

function Toggle({ value, onChange }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 44, height: 24, borderRadius: 12,
        background: value ? C.primary : C.border,
        position: "relative", cursor: "pointer",
        transition: "background .2s", flexShrink: 0,
      }}
    >
      <div style={{
        position: "absolute", width: 18, height: 18,
        background: "#fff", borderRadius: "50%",
        top: 3, left: value ? 23 : 3,
        transition: "left .2s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
      }} />
    </div>
  );
}

export default function Profile({ go }) {
  const [tab, setTab] = useState(0);
  const [name, setName] = useState("Kumar Sangakkara");
  const [phone, setPhone] = useState("");
  const [curPass, setCurPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [emailNotif, setEmailNotif] = useState(true);
  const [inAppNotif, setInAppNotif] = useState(true);
  const [matchNotif, setMatchNotif] = useState(false);

  const tabs = ["Profile info", "Change password", "Notifications"];

  return (
    <div style={css.page}>
      <div style={css.container}>
        <button style={css.backLink} onClick={() => go("dashboard")}>← Back to Dashboard</button>

        <div style={{
          background: C.card, border: `1px solid ${C.border}`,
          borderRadius: 22, padding: "22px 24px",
          display: "flex", alignItems: "center", gap: 16, marginBottom: 18,
          boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
        }}>
          <Avatar initials="KS" size={56} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: C.text }}>Kumar Sangakkara</div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 3 }}>kumars.23@uom.lk · Student</div>
          </div>
        </div>

        <div style={{
          display: "flex", background: C.fieldBg,
          borderRadius: 14, padding: 4, marginBottom: 18,
          border: `1px solid ${C.border}`,
        }}>
          {tabs.map((t, i) => (
            <button key={t} onClick={() => setTab(i)} style={{
              flex: 1, padding: "10px 6px", fontSize: 13,
              border: "none", borderRadius: 11, cursor: "pointer",
              background: tab === i ? C.card : "transparent",
              color: tab === i ? C.text : C.muted,
              fontWeight: tab === i ? 700 : 400,
              boxShadow: tab === i ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
              fontFamily: "inherit",
              transition: "all .2s",
            }}>{t}</button>
          ))}
        </div>

        <div style={{
          background: C.card, border: `1px solid ${C.border}`,
          borderRadius: 22, padding: "28px 28px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
        }}>
          {tab === 0 && (
            <div>
              <div style={css.row2}>
                <Field label="Full Name"><Input value={name} onChange={e => setName(e.target.value)} /></Field>
                <Field label="Phone Number"><Input placeholder="+94 77 xxx xxxx" value={phone} onChange={e => setPhone(e.target.value)} /></Field>
              </div>
              <Field label="University Email (read-only)">
                <Input value="kumars.23@uom.lk" disabled style={{ ...css.input, background: C.fieldBg, color: C.muted }} />
              </Field>
              <button style={css.btnPrimary} onClick={() => alert("Profile updated!")}>Save Changes</button>
            </div>
          )}
          {tab === 1 && (
            <div>
              <Field label="Current Password"><Input type="password" value={curPass} onChange={e => setCurPass(e.target.value)} /></Field>
              <Field label="New Password"><Input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} /></Field>
              <button style={css.btnPrimary} onClick={() => alert("Password updated!")}>Update Password</button>
            </div>
          )}
          {tab === 2 && (
            <div>
              {[
                { label: "Email notifications", desc: "Receive alerts via university email", val: emailNotif, set: setEmailNotif },
                { label: "In-app notifications", desc: "Show alerts within the system", val: inAppNotif, set: setInAppNotif },
                { label: "Match alerts", desc: "Notify when a potential match found", val: matchNotif, set: setMatchNotif },
              ].map((item, i, arr) => (
                <div key={item.label} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "16px 0",
                  borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none",
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{item.desc}</div>
                  </div>
                  <Toggle value={item.val} onChange={item.set} />
                </div>
              ))}
              <div style={{ marginTop: 24 }}>
                <button style={css.btnPrimary} onClick={() => alert("Preferences saved!")}>Save Preferences</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}