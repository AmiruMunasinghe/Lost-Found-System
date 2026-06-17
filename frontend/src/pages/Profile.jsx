import React, { useState, useRef } from "react";
import { Camera, Edit2, Shield, Search, Package, MapPin, CheckCircle, Clock, Lock } from "lucide-react";

import { updateProfile, uploadProfilePhoto } from "../api/auth";

function useDark(dm) {
  return dm ? {
    pageBg: "#0f172a",
    card: "#1e293b",
    border: "#334155",
    text: "#e2e8f0",
    muted: "#94a3b8",
    body: "#cbd5e1",
    inputBg: "#0f172a",
    inputBorder: "#60a5fa",
    statBox: "#0f172a",
    statBorder: "#334155",
  } : {
    pageBg: "transparent",
    card: "#FFFFFF",
    border: "#d0d5dd",
    text: "#0b3470",
    muted: "#667085",
    body: "#344054",
    inputBg: "#fff",
    inputBorder: "#0F5FFF",
    statBox: "#F9FAFB",
    statBorder: "#F2F4F7",
  };
}

export default function Profile({ user, setUser, darkMode }) {
  const t = useDark(darkMode);
  const role = user?.role || "student";
  
  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `http://localhost:8085${url}`;
  };

  // Profile Photo State
  const [profilePhoto, setProfilePhoto] = useState(getImageUrl(user?.profileImageUrl));
  const fileInputRef = useRef(null);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const updatedUser = await uploadProfilePhoto(file);
        setUser(updatedUser);
        setProfilePhoto(getImageUrl(updatedUser.profileImageUrl));
      } catch (err) {
        alert("Failed to upload photo: " + err.message);
      }
    }
  };

  // Edit Information State
  const [isEditing, setIsEditing] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || user?.name || "New User",
    email: user?.email || "No Email",
    phone: user?.phone || "",
    studentId: user?.studentId || "",
    faculty: user?.faculty || "",
    department: user?.department || "",
    year: user?.yearOfStudy || "",
    accountType: role === "admin" ? "Administrator" : "Student",
  });

  const [draftData, setDraftData] = useState(profileData);

  const fields = [
    { key: "fullName", label: "Full Name", editable: true },
    { key: "email", label: "Email", editable: false },
    { key: "phone", label: "Phone Number", editable: true },
    { key: "studentId", label: "Student ID", editable: false },
    { key: "faculty", label: "Faculty", editable: true },
    { key: "department", label: "Department", editable: true },
    { key: "year", label: "Year of Study", editable: true },
    { key: "accountType", label: "Account Type", editable: false },
  ];

  const handleEditClick = () => {
    setDraftData(profileData);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      const updateData = {
        fullName: draftData.fullName,
        phone: draftData.phone,
        studentId: draftData.studentId,
        faculty: draftData.faculty,
        department: draftData.department,
        yearOfStudy: draftData.year,
      };

      const updatedUser = await updateProfile(updateData);
      setUser(updatedUser);

      setProfileData(draftData);
      setIsEditing(false);
      
      // Show toast
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      alert("Failed to update profile: " + err.message);
    }
  };

  const stats = [
    { label: "Items Reported Lost", value: 3, icon: <Search size={18} color="#E24B4A"/>, bg: "#FCEBEB" },
    { label: "Items Reported Found", value: 5, icon: <Package size={18} color="#10B981"/>, bg: "#EAF3DE" },
    { label: "Claims Submitted", value: 2, icon: <MapPin size={18} color="#F59E0B"/>, bg: "#FEF3C7" },
    { label: "Successful Returns", value: 4, icon: <CheckCircle size={18} color="#3B82F6"/>, bg: "#DBEAFE" },
  ];

  const activities = [
    { title: "Reported a found Water Bottle", time: "2 hours ago" },
    { title: "Updated profile information", time: "Yesterday at 4:30 PM" },
    { title: "Claimed a lost Calculator", time: "Jun 12, 2026" },
  ];

  return (
    <div style={styles.container}>
      {/* TOAST NOTIFICATION */}
      {showToast && (
        <div style={styles.toast}>
          <CheckCircle size={18} color="#10B981" />
          <span>Profile updated successfully</span>
        </div>
      )}

      {/* HEADER CARD */}
      <div style={{ ...styles.card, background: t.card, border: `1px solid ${t.border}` }}>
        <div style={styles.headerLayout}>
          <div style={styles.avatarWrapper}>
            <div style={styles.avatar}>
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" style={styles.avatarImg} />
              ) : (
                profileData.fullName.split(" ").map(n => n[0]).join("")
              )}
            </div>
            <button style={{ ...styles.cameraBtn, background: t.card, border: `1px solid ${t.border}` }} onClick={() => fileInputRef.current.click()}>
              <Camera size={14} color={t.muted} />
            </button>
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              style={{ display: "none" }} 
              onChange={handlePhotoUpload} 
            />
          </div>
          <div style={styles.headerInfo}>
            <div style={styles.nameRow}>
              <h2 style={{ ...styles.name, color: t.text }}>{profileData.fullName}</h2>
              <span style={styles.roleBadge}>{role === "admin" ? "Admin" : "Student"}</span>
            </div>
            <div style={{ ...styles.subInfo, color: t.muted }}>
              <span>ID: {profileData.studentId}</span> • <span>{profileData.faculty}</span> • <span>University of Moratuwa</span>
            </div>
            <div style={styles.email}>{profileData.email}</div>
          </div>
        </div>
      </div>

      {/* TWO COLUMN LAYOUT */}
      <div style={styles.twoColumn}>
        {/* LEFT COLUMN */}
        <div style={styles.column}>
          <div style={{ ...styles.card, background: t.card, border: `1px solid ${t.border}` }}>
            <h3 style={{ ...styles.cardTitle, color: t.text }}>Personal Information</h3>
            <div style={styles.infoGrid}>
              {fields.map((f) => (
                <div key={f.key} style={styles.infoRow}>
                  <div style={styles.infoLabelWrapper}>
                    <span style={{ ...styles.infoLabel, color: t.muted }}>{f.label}</span>
                    {!f.editable && isEditing && <Lock size={12} color={t.muted} style={{ marginTop: 2 }} />}
                  </div>
                  {isEditing && f.editable ? (
                    <input 
                      style={{ ...styles.editInput, background: t.inputBg, border: `2px solid ${t.inputBorder}`, color: t.text }}
                      value={draftData[f.key]}
                      onChange={(e) => setDraftData({ ...draftData, [f.key]: e.target.value })}
                    />
                  ) : (
                    <span style={{ ...styles.infoValue, color: t.body }}>{profileData[f.key]}</span>
                  )}
                </div>
              ))}
            </div>

            {isEditing ? (
              <div style={{ display: "flex", gap: "12px" }}>
                <button style={{ ...styles.outlineBtn, border: `1px solid ${t.border}`, color: t.body }} onClick={handleCancel}>Cancel</button>
                <button style={styles.saveBtn} onClick={handleSave}>Save Changes</button>
              </div>
            ) : (
              <button style={{ ...styles.outlineBtn, border: `1px solid ${t.border}`, color: t.body }} onClick={handleEditClick}>Edit Information</button>
            )}
          </div>

          <div style={{ ...styles.card, background: t.card, border: `1px solid ${t.border}` }}>
            <div style={styles.securityRow}>
              <div style={{ ...styles.securityIconBox, background: darkMode ? "#1a2d47" : "#E6F1FB" }}><Shield size={20} color="#0F5FFF" /></div>
              <div>
                <h3 style={{ ...styles.cardTitle, margin: "0 0 4px 0", color: t.text }}>Keep your account secure</h3>
                <p style={{ ...styles.securityDesc, color: t.muted }}>Two-factor authentication adds an extra layer of security to your account.</p>
              </div>
            </div>
            <button style={{ ...styles.outlineBtn, border: `1px solid ${t.border}`, color: t.body }}>Enable 2FA</button>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={styles.column}>
          <div style={{ ...styles.card, background: t.card, border: `1px solid ${t.border}` }}>
            <h3 style={{ ...styles.cardTitle, color: t.text }}>Overview</h3>
            <div style={styles.statsGrid}>
              {stats.map(s => (
                <div key={s.label} style={{ ...styles.statBox, background: t.statBox, border: `1px solid ${t.statBorder}` }}>
                  <div style={{ ...styles.statIcon, background: s.bg }}>{s.icon}</div>
                  <div style={{ ...styles.statVal, color: t.text }}>{s.value}</div>
                  <div style={{ ...styles.statLabel, color: t.muted }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...styles.card, background: t.card, border: `1px solid ${t.border}` }}>
            <h3 style={{ ...styles.cardTitle, color: t.text }}>Recent Activity</h3>
            <div style={styles.activityList}>
              {activities.map((act, i) => (
                <div key={i} style={styles.activityItem}>
                  <div style={styles.activityIcon}><Clock size={16} color={t.muted} /></div>
                  <div>
                    <div style={{ ...styles.activityTitle, color: t.body }}>{act.title}</div>
                    <div style={{ ...styles.activityTime, color: t.muted }}>{act.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1000px",
    margin: "0 auto",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  toast: {
    position: "fixed",
    bottom: "24px",
    right: "32px",
    background: "#FFFFFF",
    borderLeft: "4px solid #10B981",
    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
    padding: "16px 20px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "14px",
    fontWeight: "700",
    color: "#1F2937",
    zIndex: 1000,
    animation: "slideIn 0.3s ease-out forwards",
  },
  card: {
    background: "#FFFFFF",
    borderRadius: "16px",
    border: "1px solid #d0d5dd",
    padding: "24px",
    marginBottom: "24px",
  },
  headerLayout: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
    position: "relative",
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #0F5FFF, #4A8BFF)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    fontWeight: "700",
    overflow: "hidden",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  cameraBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: "white",
    border: "1px solid #d0d5dd",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
    transition: "transform 0.15s",
  },
  headerInfo: {
    flex: 1,
  },
  nameRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "6px",
  },
  name: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "800",
    color: "#0b3470",
  },
  roleBadge: {
    background: "#EAF3DE",
    color: "#3B6D11",
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "700",
  },
  subInfo: {
    fontSize: "14px",
    color: "#667085",
    marginBottom: "4px",
  },
  email: {
    fontSize: "14px",
    color: "#0F5FFF",
    fontWeight: "500",
  },
  editBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    background: "#F9FAFB",
    border: "1px solid #d0d5dd",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#344054",
    cursor: "pointer",
  },
  twoColumn: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
  },
  column: {
    display: "flex",
    flexDirection: "column",
  },
  cardTitle: {
    margin: "0 0 20px 0",
    fontSize: "16px",
    fontWeight: "700",
    color: "#0b3470",
  },
  infoGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginBottom: "24px",
  },
  infoRow: {
    display: "grid",
    gridTemplateColumns: "140px 1fr",
    gap: "12px",
    alignItems: "center",
    minHeight: "34px",
  },
  infoLabelWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  infoLabel: {
    fontSize: "14px",
    color: "#667085",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: "14px",
    color: "#344054",
    fontWeight: "600",
  },
  editInput: {
    width: "100%",
    padding: "6px 10px",
    borderRadius: "6px",
    border: "2px solid #0F5FFF",
    fontSize: "14px",
    fontWeight: "500",
    color: "#1F2937",
    fontFamily: "inherit",
    outline: "none",
  },
  outlineBtn: {
    flex: 1,
    padding: "10px",
    background: "transparent",
    border: "1px solid #d0d5dd",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#344054",
    cursor: "pointer",
  },
  saveBtn: {
    flex: 1,
    padding: "10px",
    background: "#0F5FFF",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#FFFFFF",
    cursor: "pointer",
  },
  securityRow: {
    display: "flex",
    gap: "16px",
    marginBottom: "20px",
  },
  securityIconBox: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "#E6F1FB",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  securityDesc: {
    margin: 0,
    fontSize: "13px",
    color: "#667085",
    lineHeight: "1.5",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  statBox: {
    background: "#F9FAFB",
    border: "1px solid #F2F4F7",
    borderRadius: "12px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  statIcon: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  statVal: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#0b3470",
  },
  statLabel: {
    fontSize: "13px",
    color: "#667085",
    fontWeight: "500",
  },
  activityList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  activityItem: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
  },
  activityIcon: {
    marginTop: "2px",
  },
  activityTitle: {
    fontSize: "14px",
    color: "#344054",
    fontWeight: "600",
    marginBottom: "4px",
  },
  activityTime: {
    fontSize: "12px",
    color: "#667085",
  }
};