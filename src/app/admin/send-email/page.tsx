"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav/AdminNav";
import styles from "./page.module.css";

type EmailSignature = {
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  website: string;
};

const defaultSignature: EmailSignature = {
  name: "Lihe Precision Sales Team",
  title: "Sales Department",
  company: "Foshan Lihe Precision Machinery Co., Ltd.",
  email: "sales@lihe-preform.com",
  phone: "+86 757 8555 1234",
  website: "www.lihe-preform.com",
};

export default function SendEmailPage() {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    to: "",
    subject: "",
    body: "",
  });

  const [signature, setSignature] = useState<EmailSignature>(defaultSignature);
  const [useSignature, setUseSignature] = useState(true);

  useEffect(() => {
    // Load saved signature from localStorage
    const saved = localStorage.getItem("email-signature");
    if (saved) {
      try {
        setSignature(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load signature:", e);
      }
    }
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSignatureChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setSignature((prev) => ({ ...prev, [name]: value }));
  }

  function saveSignature() {
    localStorage.setItem("email-signature", JSON.stringify(signature));
    setMessage({ type: "success", text: "Signature saved!" });
    setTimeout(() => setMessage(null), 3000);
  }

  function generateSignatureHTML(): string {
    return `
<div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e2e8f0;">
  <p style="margin: 0; line-height: 1.6;">
    <strong>${signature.name}</strong><br>
    ${signature.title}<br>
    ${signature.company}
  </p>
  <p style="margin: 0.5rem 0 0 0; line-height: 1.6; color: #475569;">
    Email: ${signature.email}<br>
    Phone: ${signature.phone}<br>
    Website: ${signature.website}
  </p>
</div>
`;
  }

  async function handleSendEmail(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setMessage(null);

    try {
      const emailBody = useSignature
        ? formData.body + generateSignatureHTML()
        : formData.body;

      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: formData.to,
          subject: formData.subject,
          html: emailBody,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to send email");
      }

      setMessage({ type: "success", text: "Email sent successfully!" });
      // Reset form
      setFormData({ to: "", subject: "", body: "" });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to send email",
      });
    } finally {
      setSending(false);
    }
  }

  function insertTemplate(template: string) {
    const templates = {
      greeting: "Dear Customer,\n\nThank you for your interest in Lihe Precision.\n\n",
      quote: "Thank you for your inquiry about our PET preform mold solutions.\n\nBased on your requirements, we would like to propose the following:\n\n",
      followup: "I hope this email finds you well.\n\nI wanted to follow up on our previous conversation regarding...\n\n",
      meeting: "Thank you for taking the time to meet with us.\n\nAs discussed, we would like to move forward with...\n\n",
    };

    setFormData((prev) => ({
      ...prev,
      body: prev.body + templates[template as keyof typeof templates],
    }));
  }

  return (
    <div className={styles.container}>
      <AdminNav />
      <div className={styles.contentWrapper}>
        <div className={styles.header}>
          <h1 className={styles.title}>發送官方郵件</h1>
          <p className={styles.subtitle}>使用 sales@lihe-preform.com 發送專業郵件</p>
          <button onClick={() => router.push("/admin")} className={styles.backButton}>
            ← 返回後台
          </button>
        </div>

        <main className={styles.main}>
        {message && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.text}
          </div>
        )}

        <div className={styles.layout}>
          {/* Email Form */}
          <div className={styles.emailForm}>
            <form onSubmit={handleSendEmail}>
              <div className={styles.field}>
                <label className={styles.label}>
                  收件人 Email <span className={styles.required}>*</span>
                </label>
                <input
                  type="email"
                  name="to"
                  value={formData.to}
                  onChange={handleChange}
                  required
                  className={styles.input}
                  placeholder="customer@example.com"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  主旨 <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className={styles.input}
                  placeholder="Email subject"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  郵件內容 <span className={styles.required}>*</span>
                </label>
                <div className={styles.toolbar}>
                  <span className={styles.toolbarLabel}>快速插入:</span>
                  <button
                    type="button"
                    onClick={() => insertTemplate("greeting")}
                    className={styles.toolbarButton}
                  >
                    問候語
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTemplate("quote")}
                    className={styles.toolbarButton}
                  >
                    報價
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTemplate("followup")}
                    className={styles.toolbarButton}
                  >
                    跟進
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTemplate("meeting")}
                    className={styles.toolbarButton}
                  >
                    會議後續
                  </button>
                </div>
                <textarea
                  name="body"
                  value={formData.body}
                  onChange={handleChange}
                  required
                  rows={12}
                  className={styles.textarea}
                  placeholder="Type your email message here..."
                />
              </div>

              <div className={styles.signatureToggle}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={useSignature}
                    onChange={(e) => setUseSignature(e.target.checked)}
                    className={styles.checkbox}
                  />
                  <span>自動附加簽名檔</span>
                </label>
              </div>

              {useSignature && (
                <div className={styles.signaturePreview}>
                  <h3>簽名檔預覽:</h3>
                  <div dangerouslySetInnerHTML={{ __html: generateSignatureHTML() }} />
                </div>
              )}

              <div className={styles.actions}>
                <button
                  type="submit"
                  className={styles.sendButton}
                  disabled={sending}
                >
                  {sending ? "發送中..." : "發送郵件"}
                </button>
              </div>
            </form>
          </div>

          {/* Signature Settings */}
          <aside className={styles.sidebar}>
            <h2 className={styles.sidebarTitle}>簽名檔設定</h2>

            <div className={styles.signatureForm}>
              <div className={styles.field}>
                <label className={styles.label}>姓名</label>
                <input
                  type="text"
                  name="name"
                  value={signature.name}
                  onChange={handleSignatureChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>職稱</label>
                <input
                  type="text"
                  name="title"
                  value={signature.title}
                  onChange={handleSignatureChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>公司名稱</label>
                <input
                  type="text"
                  name="company"
                  value={signature.company}
                  onChange={handleSignatureChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={signature.email}
                  onChange={handleSignatureChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>電話</label>
                <input
                  type="text"
                  name="phone"
                  value={signature.phone}
                  onChange={handleSignatureChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>網站</label>
                <input
                  type="text"
                  name="website"
                  value={signature.website}
                  onChange={handleSignatureChange}
                  className={styles.input}
                />
              </div>

              <button
                type="button"
                onClick={saveSignature}
                className={styles.saveSignatureButton}
              >
                儲存簽名檔
              </button>
            </div>

            <div className={styles.infoBox}>
              <h3>注意事項</h3>
              <ul>
                <li>所有郵件將從 <strong>sales@lihe-preform.com</strong> 發送</li>
                <li>簽名檔會儲存在瀏覽器本地</li>
                <li>支援 HTML 格式內容</li>
                <li>請確保收件人 Email 正確</li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
      </div>
    </div>
  );
}
