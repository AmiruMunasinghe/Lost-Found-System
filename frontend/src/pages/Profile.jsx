import { useState } from "react";

const C = {
  primary: "#185FA5",
  bg: "#F4F6FA",
  card: "#FFFFFF",
  text: "#1A1D2E",
  muted: "#6B7080",
  border: "#DDE1EA",
  fieldBg: "#F8F9FC",
};

const css = {
  page: {
    minHeight: "100vh",
    background: C.bg,
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    padding: "24px 16px",
  },
  container: {
    width: "100%",
    maxWidth: 540,
    margin: "0 auto",
  },
  link: {
    background: "none",
    border: "none",
    color: C.primary,
    fontSize: 13,
    cursor: "pointer",
    marginBottom: 14,
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  fieldGap: { marginBottom: 14 },
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
    outline: "none",
    boxSizing: "border-box",
  },
  btnPrimary: {
    padding: "9px 24px",
    background: C.primary,
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
};

function Avatar({ initials, size = 52 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: C.primary, color: "#fff",
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
        width: 38, height: 22, borderRadius: 11,
        background: value ? C.primary : C.border,
        position: "relative", cursor: "pointer",
        transition: "background .2s", flexShrink: 0,
      }}
    >
      <div style={{
        position: "absolute", width: 16, height: 16,
        background: "#fff", borderRadius: "50%",
        top: 3, left: value ? 19 : 3,
        transition: "left .2s",
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
        <button style={css.link} onClick={() => go("dashboard")}>← Back to Dashboard</button>

        <div style={{
          background: C.card, border: `1px solid ${C.border}`,
          borderRadius: 14, padding: "18px 20px",
          display: "flex", alignItems: "center", gap: 14, marginBottom: 14,
        }}>
          <Avatar initials="KS" size={52} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: C.text }}>Kumar Sangakkara</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>kumars.23@uom.lk · Student</div>
          </div>
        </div>

        <div style={{
          display: "flex", background: C.fieldBg,
          borderRadius: 9, padding: 3, marginBottom: 14,
        }}>
          {tabs.map((t, i) => (
            <button key={t} onClick={() => setTab(i)} style={{
              flex: 1, padding: "8px 4px", fontSize: 12,
              border: "none", borderRadius: 7, cursor: "pointer",
              background: tab === i ? C.card : "transparent",
              color: tab === i ? C.text : C.muted,
              fontWeight: tab === i ? 600 : 400,
              boxShadow: tab === i ? `0 0 0 1px ${C.border}` : "none",
            }}>{t}</button>
          ))}
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "24px" }}>
          {tab === 0 && (
            <div>
              <div style={css.row2}>
                <Field label="Full name"><Input value={name} onChange={e => setName(e.target.value)} /></Field>
                <Field label="Phone number"><Input placeholder="+94 77 xxx xxxx" value={phone} onChange={e => setPhone(e.target.value)} /></Field>
              </div>
              <Field label="University email (read-only)">
                <Input value="kumars.23@uom.lk" disabled />
              </Field>
              <button style={css.btnPrimary} onClick={() => alert("Profile updated!")}>Save changes</button>
            </div>
          )}
          {tab === 1 && (
            <div>
              <Field label="Current password"><Input type="password" value={curPass} onChange={e => setCurPass(e.target.value)} /></Field>
              <Field label="New password"><Input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} /></Field>
              <button style={css.btnPrimary} onClick={() => alert("Password updated!")}>Update password</button>
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
                  padding: "14px 0",
                  borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none",
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{item.desc}</div>
                  </div>
                  <Toggle value={item.val} onChange={item.set} />
                </div>
              ))}
              <div style={{ marginTop: 20 }}>
                <button style={css.btnPrimary} onClick={() => alert("Preferences saved!")}>Save preferences</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}