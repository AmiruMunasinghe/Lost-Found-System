import React, { useState } from "react";
import { HelpCircle, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { apiRequest } from "../api/client";

export default function HelpSupport({ darkMode }) {
  const [form, setForm] = useState({ subject: "", message: "" });
  const [sent, setSent] = useState(false);

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

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSent(false);
    setError("");
    setLoading(true);
    
    try {
      await apiRequest("/support", {
        method: "POST",
        body: JSON.stringify({
          subject: form.subject,
          message: form.message
        }),
      });
      setSent(true);
      setForm({ subject: "", message: "" });
    } catch (err) {
      setError(err.message || "Failed to send support request. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const faqs = [
    {
      q: "How do I report a lost item?",
      a: "Open Report Lost from the sidebar, fill the item details, location, date, and submit the report.",
    },
    {
      q: "How do I report a found item?",
      a: "Open Report Found, add a clear description and location, then submit it for review.",
    },
    {
      q: "How do I claim an item?",
      a: "Open Browse Items or Match Results and select the item. You may need to provide proof before it is released.",
    },
    {
      q: "Who approves reports?",
      a: "Admin users review submitted reports before completing or resolving them.",
    },
  ];

  return (
    <div style={{ ...styles.container, background: t.page }}>
      <div style={styles.header}>
        <h1 style={{ ...styles.title, color: t.text }}>Help & Support</h1>
        <p style={{ ...styles.subtitle, color: t.muted }}>
          Help Center and Contact Support are now combined in one page.
        </p>
      </div>

      <div style={styles.grid}>
        <section style={{ ...styles.card, background: t.card, border: `1px solid ${t.border}` }}>
          <div style={styles.cardHeader}>
            <HelpCircle size={24} color="#0F5FFF" />
            <h2 style={{ ...styles.cardTitle, color: t.text }}>Frequently Asked Questions</h2>
          </div>

          <div style={styles.faqList}>
            {faqs.map((faq) => (
              <div key={faq.q} style={{ ...styles.faqItem, borderTop: `1px solid ${t.border}` }}>
                <h3 style={{ ...styles.faqQuestion, color: t.text }}>{faq.q}</h3>
                <p style={{ ...styles.faqAnswer, color: t.muted }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ ...styles.card, background: t.card, border: `1px solid ${t.border}` }}>
          <div style={styles.cardHeader}>
            <MessageCircle size={24} color="#0F5FFF" />
            <h2 style={{ ...styles.cardTitle, color: t.text }}>Contact Support</h2>
          </div>

          <div style={{ ...styles.contactBox, background: t.soft, border: `1px solid ${t.border}` }}>
            <p style={{ ...styles.contactLine, color: t.body }}>
              <Mail size={16} /> lostfound@uom.lk
            </p>
            <p style={{ ...styles.contactLine, color: t.body }}>
              <MapPin size={16} /> University of Moratuwa Lost & Found Office
            </p>
            <p style={{ ...styles.contactLine, color: t.body }}>
              <Phone size={16} /> Monday to Friday, 8.00 AM - 4.00 PM
            </p>
          </div>

          <form onSubmit={submit} style={styles.form}>
            <label style={{ ...styles.label, color: t.text }}>Subject</label>
            <input
              style={{ ...styles.input, background: t.input, color: t.text, border: `1px solid ${t.border}` }}
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="Example: Need help claiming an item"
              required
            />

            <label style={{ ...styles.label, color: t.text }}>Message</label>
            <textarea
              style={{ ...styles.textarea, background: t.input, color: t.text, border: `1px solid ${t.border}` }}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Write your support request here..."
              required
            />

            {error && (
              <p style={{ ...styles.sentMsg, color: "#E24B4A" }}>
                {error}
              </p>
            )}

            <button style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Request"}
            </button>

            {sent && (
              <p style={{ ...styles.sentMsg, color: "#10B981" }}>
                Request sent successfully! Our support team will reply to your email.
              </p>
            )}
          </form>
        </section>
      </div>
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
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
    gap: "22px",
  },
  card: {
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "14px",
  },
  cardTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 800,
  },
  faqList: {
    display: "flex",
    flexDirection: "column",
  },
  faqItem: {
    paddingTop: "16px",
    marginTop: "16px",
  },
  faqQuestion: {
    fontSize: "15px",
    fontWeight: 800,
    margin: "0 0 6px",
  },
  faqAnswer: {
    fontSize: "14px",
    lineHeight: 1.6,
    margin: 0,
  },
  contactBox: {
    borderRadius: "16px",
    padding: "16px",
    marginBottom: "20px",
  },
  contactLine: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    margin: "8px 0",
    fontSize: "14px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  label: {
    fontSize: "13px",
    fontWeight: 800,
  },
  input: {
    padding: "12px 14px",
    borderRadius: "10px",
    outline: "none",
    fontFamily: "inherit",
    fontSize: "14px",
  },
  textarea: {
    minHeight: "120px",
    resize: "vertical",
    padding: "12px 14px",
    borderRadius: "10px",
    outline: "none",
    fontFamily: "inherit",
    fontSize: "14px",
  },
  submitBtn: {
    marginTop: "8px",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(90deg, #0F5FFF, #4A8BFF)",
    color: "#ffffff",
    fontWeight: 800,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  sentMsg: {
    fontSize: "13px",
    fontWeight: 700,
    margin: "8px 0 0",
  },
};
