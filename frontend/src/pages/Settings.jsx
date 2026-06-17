import React, { useEffect, useState } from "react";
import { Bell, CheckCircle, Eye, EyeOff, Lock, Moon, Save, Sun, User } from "lucide-react";
import { changePassword } from "../api/auth";

const defaultSettings = {
  emailNotifications: true,
  matchAlerts: true,
  rewardAlerts: true,
  showContactDetails: false,
  twoStepVerification: false,
};

export default function Settings({ user, darkMode, setDarkMode, navigateTo }) {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("unilost-settings");
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    localStorage.setItem("unilost-settings", JSON.stringify(settings));
  }, [settings]);

  const t = darkMode
    ? {
        page: "#0f172a",
        card: "#1e293b",
        text: "#e2e8f0",
        body: "#cbd5e1",
        muted: "#94a3b8",
        border: "#334155",
        input: "#111827",
        soft: "#172554",
      }
    : {
        page: "transparent",
        card: "#ffffff",
        text: "#0b3470",
        body: "#344054",
        muted: "#667085",
        border: "#d0d5dd",
        input: "#f8fafc",
        soft: "#f0f5ff",
      };

  const updateSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    setSavedMessage("");
  };

  const saveSettings = () => {
    localStorage.setItem("unilost-settings", JSON.stringify(settings));
    setSavedMessage("Settings saved successfully.");
  };

  return (
    <div style={{ ...styles.container, background: t.page }}>
      <div style={styles.header}>
        <h1 style={{ ...styles.title, color: t.text }}>Settings</h1>
        <p style={{ ...styles.subtitle, color: t.muted }}>
          Manage your account preferences, privacy, and notification settings.
        </p>
      </div>

      <div style={styles.grid}>
        <section style={{ ...styles.card, background: t.card, border: `1px solid ${t.border}` }}>
          <div style={styles.cardHeader}>
            <User size={22} color="#0F5FFF" />
            <div>
              <h2 style={{ ...styles.cardTitle, color: t.text }}>Account</h2>
              <p style={{ ...styles.cardSub, color: t.muted }}>Basic user details</p>
            </div>
          </div>

          <div style={{ ...styles.infoBox, background: t.input, border: `1px solid ${t.border}` }}>
            <p style={{ ...styles.infoText, color: t.body }}>
              <strong style={{ color: t.text }}>Name:</strong> {user?.name || "User"}
            </p>
            <p style={{ ...styles.infoText, color: t.body }}>
              <strong style={{ color: t.text }}>Role:</strong> {user?.role || "student"}
            </p>
          </div>

          <button style={styles.secondaryBtn} onClick={() => navigateTo("/profile")}>
            Edit Profile
          </button>
        </section>

        <section style={{ ...styles.card, background: t.card, border: `1px solid ${t.border}` }}>
          <div style={styles.cardHeader}>
            {darkMode ? <Moon size={22} color="#60a5fa" /> : <Sun size={22} color="#0F5FFF" />}
            <div>
              <h2 style={{ ...styles.cardTitle, color: t.text }}>Appearance</h2>
              <p style={{ ...styles.cardSub, color: t.muted }}>Theme preference</p>
            </div>
          </div>

          <SettingRow
            label="Dark Mode"
            description="Switch the system between light and dark theme."
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
            t={t}
          />
        </section>

        <section style={{ ...styles.card, background: t.card, border: `1px solid ${t.border}` }}>
          <div style={styles.cardHeader}>
            <Bell size={22} color="#0F5FFF" />
            <div>
              <h2 style={{ ...styles.cardTitle, color: t.text }}>Notifications</h2>
              <p style={{ ...styles.cardSub, color: t.muted }}>Control alerts you receive</p>
            </div>
          </div>

          <SettingRow
            label="Email Notifications"
            description="Receive important updates through email."
            checked={settings.emailNotifications}
            onChange={() => updateSetting("emailNotifications")}
            t={t}
          />
          <SettingRow
            label="Match Alerts"
            description="Notify me when a possible lost/found match is detected."
            checked={settings.matchAlerts}
            onChange={() => updateSetting("matchAlerts")}
            t={t}
          />
          <SettingRow
            label="Reward Alerts"
            description="Notify me about points and badges."
            checked={settings.rewardAlerts}
            onChange={() => updateSetting("rewardAlerts")}
            t={t}
          />
        </section>

        <section style={{ ...styles.card, background: t.card, border: `1px solid ${t.border}` }}>
          <div style={styles.cardHeader}>
            <Eye size={22} color="#0F5FFF" />
            <div>
              <h2 style={{ ...styles.cardTitle, color: t.text }}>Privacy</h2>
              <p style={{ ...styles.cardSub, color: t.muted }}>Control what others can see</p>
            </div>
          </div>

          <SettingRow
            label="Show Contact Details"
            description="Allow claimers/reporters to see your contact details after verification."
            checked={settings.showContactDetails}
            onChange={() => updateSetting("showContactDetails")}
            t={t}
          />
        </section>

        <SecuritySection t={t} darkMode={darkMode} settings={settings} updateSetting={updateSetting} />
      </div>

      <div style={{ ...styles.saveBar, background: t.card, border: `1px solid ${t.border}` }}>
        <span style={{ color: savedMessage ? "#10B981" : t.muted }}>
          {savedMessage || "Changes are saved locally until backend settings API is connected."}
        </span>
        <button style={styles.saveBtn} onClick={saveSettings}>
          <Save size={16} /> Save Settings
        </button>
      </div>
    </div>
  );
}

function SecuritySection({ t, darkMode, settings, updateSetting }) {
  const [showForm, setShowForm] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const handleChangePassword = async () => {
    setError("");
    setSuccess("");

    if (!currentPw.trim()) { setError("Current password is required."); return; }
    if (!newPw.trim()) { setError("New password is required."); return; }
    if (newPw.length < 6) { setError("New password must be at least 6 characters."); return; }
    if (newPw !== confirmPw) { setError("New passwords do not match."); return; }
    if (currentPw === newPw) { setError("New password must be different from current password."); return; }

    setLoading(true);
    try {
      await changePassword(currentPw, newPw);
      setSuccess("Password changed successfully!");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setTimeout(() => { setShowForm(false); setSuccess(""); }, 2000);
    } catch (err) {
      setError(err.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "10px",
    border: `1px solid ${t.border}`,
    background: t.input,
    color: t.text,
    fontSize: "14px",
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
    marginTop: "6px",
    paddingRight: "40px",
  };

  const eyeIconStyle = {
    position: "absolute",
    right: "12px",
    top: "38px",
    cursor: "pointer",
    color: t.muted,
  };

  return (
    <section style={{ ...styles.card, background: t.card, border: `1px solid ${t.border}` }}>
      <div style={styles.cardHeader}>
        <Lock size={22} color="#0F5FFF" />
        <div>
          <h2 style={{ ...styles.cardTitle, color: t.text }}>Security</h2>
          <p style={{ ...styles.cardSub, color: t.muted }}>Password and account safety</p>
        </div>
      </div>

      <SettingRow
        label="Two-step Verification"
        description="Adds an extra layer of security to your account."
        checked={settings.twoStepVerification}
        onChange={() => updateSetting("twoStepVerification")}
        t={t}
      />

      {!showForm ? (
        <button style={styles.secondaryBtn} onClick={() => { setShowForm(true); setError(""); setSuccess(""); }}>
          Change Password
        </button>
      ) : (
        <div style={{ marginTop: "18px", borderTop: `1px solid ${t.border}`, paddingTop: "18px" }}>
          <div style={{ marginBottom: "14px", position: "relative" }}>
            <label style={{ fontSize: "13px", fontWeight: 700, color: t.text }}>Current Password</label>
            <input type={showCurrentPw ? "text" : "password"} style={inputStyle} value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="Enter current password" />
            <div style={eyeIconStyle} onClick={() => setShowCurrentPw(!showCurrentPw)}>
              {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </div>
          </div>
          <div style={{ marginBottom: "14px", position: "relative" }}>
            <label style={{ fontSize: "13px", fontWeight: 700, color: t.text }}>New Password</label>
            <input type={showNewPw ? "text" : "password"} style={inputStyle} value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Enter new password" />
            <div style={eyeIconStyle} onClick={() => setShowNewPw(!showNewPw)}>
              {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </div>
          </div>
          <div style={{ marginBottom: "14px", position: "relative" }}>
            <label style={{ fontSize: "13px", fontWeight: 700, color: t.text }}>Confirm New Password</label>
            <input type={showConfirmPw ? "text" : "password"} style={inputStyle} value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Re-enter new password" />
            <div style={eyeIconStyle} onClick={() => setShowConfirmPw(!showConfirmPw)}>
              {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </div>
          </div>

          {error && <div style={{ color: "#E24B4A", fontSize: "13px", marginBottom: "12px", fontWeight: 600 }}>{error}</div>}
          {success && <div style={{ color: "#10B981", fontSize: "13px", marginBottom: "12px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}><CheckCircle size={14} /> {success}</div>}

          <div style={{ display: "flex", gap: "10px" }}>
            <button style={{ ...styles.secondaryBtn, flex: 1, borderColor: t.border, color: t.body }} onClick={() => { setShowForm(false); setError(""); setSuccess(""); setCurrentPw(""); setNewPw(""); setConfirmPw(""); }}>Cancel</button>
            <button style={{ ...styles.saveBtn, flex: 1, marginTop: "14px" }} onClick={handleChangePassword} disabled={loading}>
              {loading ? "Changing..." : "Update Password"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function SettingRow({ label, description, checked, onChange, t }) {
  return (
    <div style={{ ...styles.settingRow, borderTop: `1px solid ${t.border}` }}>
      <div>
        <div style={{ ...styles.settingLabel, color: t.text }}>{label}</div>
        <div style={{ ...styles.settingDesc, color: t.muted }}>{description}</div>
      </div>

      <button
        onClick={onChange}
        style={{
          ...styles.switch,
          background: checked ? "#0F5FFF" : t.border,
          justifyContent: checked ? "flex-end" : "flex-start",
        }}
      >
        <span style={styles.switchDot} />
      </button>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "10px 20px 40px",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  header: {
    marginBottom: "26px",
  },
  title: {
    fontSize: "34px",
    fontWeight: 800,
    margin: "0 0 8px",
  },
  subtitle: {
    margin: 0,
    fontSize: "15px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px",
  },
  card: {
    borderRadius: "18px",
    padding: "22px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
    transition: "background 0.3s, border-color 0.3s",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px",
  },
  cardTitle: {
    margin: 0,
    fontSize: "19px",
    fontWeight: 800,
  },
  cardSub: {
    margin: "3px 0 0",
    fontSize: "13px",
  },
  infoBox: {
    borderRadius: "14px",
    padding: "14px",
    margin: "16px 0",
  },
  infoText: {
    margin: "6px 0",
    fontSize: "14px",
  },
  settingRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    padding: "16px 0 0",
    marginTop: "16px",
  },
  settingLabel: {
    fontSize: "14px",
    fontWeight: 800,
  },
  settingDesc: {
    fontSize: "12px",
    lineHeight: 1.45,
    marginTop: "3px",
  },
  switch: {
    width: "48px",
    height: "26px",
    borderRadius: "999px",
    border: "none",
    padding: "3px",
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    flexShrink: 0,
  },
  switchDot: {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    background: "#ffffff",
    boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
  },
  secondaryBtn: {
    marginTop: "14px",
    padding: "10px 16px",
    borderRadius: "10px",
    border: "1px solid #0F5FFF",
    background: "transparent",
    color: "#0F5FFF",
    fontWeight: 800,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  saveBar: {
    marginTop: "22px",
    borderRadius: "16px",
    padding: "16px 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    fontSize: "13px",
  },
  saveBtn: {
    padding: "11px 16px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(90deg, #0F5FFF, #4A8BFF)",
    color: "#ffffff",
    fontWeight: 800,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontFamily: "inherit",
  },
};
