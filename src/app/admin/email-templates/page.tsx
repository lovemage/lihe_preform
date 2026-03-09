"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav/AdminNav";
import styles from "./page.module.css";

type EmailTemplate = {
  id: string;
  name: string;
  subject: {
    en: string;
    ru: string;
    es: string;
  };
  body: {
    en: string;
    ru: string;
    es: string;
  };
  type: "customer_thankyou" | "admin_notification";
  updatedAt?: string;
};

const initialTemplates: EmailTemplate[] = [
  {
    id: "customer-thankyou",
    name: "Customer Thank You Email",
    type: "customer_thankyou",
    subject: {
      en: "Thank You for Your Inquiry - Lihe Precision",
      ru: "Благодарим за обращение - Lihe Precision",
      es: "Gracias por su contacto - Lihe Precision",
    },
    body: {
      en: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2c5aa0; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Thank You for Contacting Lihe Precision</h1>
    </div>
    <div class="content">
      <p>Dear {{firstName}} {{familyName}},</p>
      <p>Thank you for your inquiry regarding our PET preform mold solutions. We have received your request and our team will review it carefully.</p>
      <p><strong>Your Inquiry Details:</strong></p>
      <ul>
        <li><strong>Product Category:</strong> {{productCategory}}</li>
        <li><strong>Country:</strong> {{country}}</li>
      </ul>
      <p>Our sales and engineering team will respond to your inquiry within 24 business hours. We look forward to discussing how Lihe Precision can meet your PET packaging tooling requirements.</p>
      <p>Best regards,<br>
      <strong>Lihe Precision Sales Team</strong><br>
      Foshan Lihe Precision Machinery Co., Ltd.</p>
    </div>
    <div class="footer">
      <p>Email: sales@lihe-preform.com | Phone: +86 757 8555 1234</p>
      <p>Foshan, Guangdong Province, China</p>
    </div>
  </div>
</body>
</html>`,
      ru: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2c5aa0; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Благодарим за обращение в Lihe Precision</h1>
    </div>
    <div class="content">
      <p>Уважаемый(-ая) {{firstName}} {{familyName}},</p>
      <p>Благодарим вас за запрос относительно наших решений для пресс-форм преформ из ПЭТ. Мы получили ваш запрос, и наша команда внимательно его рассмотрит.</p>
      <p><strong>Детали вашего запроса:</strong></p>
      <ul>
        <li><strong>Категория продукта:</strong> {{productCategory}}</li>
        <li><strong>Страна:</strong> {{country}}</li>
      </ul>
      <p>Наша команда продаж и инженеров ответит на ваш запрос в течение 24 рабочих часов. Мы с нетерпением ждем возможности обсудить, как Lihe Precision может удовлетворить ваши требования к инструментам для упаковки из ПЭТ.</p>
      <p>С уважением,<br>
      <strong>Отдел продаж Lihe Precision</strong><br>
      Foshan Lihe Precision Machinery Co., Ltd.</p>
    </div>
    <div class="footer">
      <p>Email: sales@lihe-preform.com | Телефон: +86 757 8555 1234</p>
      <p>Фошань, провинция Гуандун, Китай</p>
    </div>
  </div>
</body>
</html>`,
      es: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2c5aa0; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Gracias por contactar a Lihe Precision</h1>
    </div>
    <div class="content">
      <p>Estimado/a {{firstName}} {{familyName}},</p>
      <p>Gracias por su consulta sobre nuestras soluciones de moldes de preforma PET. Hemos recibido su solicitud y nuestro equipo la revisará cuidadosamente.</p>
      <p><strong>Detalles de su consulta:</strong></p>
      <ul>
        <li><strong>Categoría de producto:</strong> {{productCategory}}</li>
        <li><strong>País:</strong> {{country}}</li>
      </ul>
      <p>Nuestro equipo de ventas e ingeniería responderá a su consulta dentro de las próximas 24 horas hábiles. Esperamos poder discutir cómo Lihe Precision puede satisfacer sus requisitos de herramientas de embalaje PET.</p>
      <p>Atentamente,<br>
      <strong>Equipo de Ventas de Lihe Precision</strong><br>
      Foshan Lihe Precision Machinery Co., Ltd.</p>
    </div>
    <div class="footer">
      <p>Email: sales@lihe-preform.com | Teléfono: +86 757 8555 1234</p>
      <p>Foshan, Provincia de Guangdong, China</p>
    </div>
  </div>
</body>
</html>`,
    },
  },
  {
    id: "admin-notification",
    name: "Admin Notification Email",
    type: "admin_notification",
    subject: {
      en: "New Contact Form Submission from {{firstName}} {{familyName}}",
      ru: "Новое обращение от {{firstName}} {{familyName}}",
      es: "Nueva consulta de {{firstName}} {{familyName}}",
    },
    body: {
      en: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 700px; margin: 0 auto; padding: 20px; }
    .header { background: #2c5aa0; color: white; padding: 20px; }
    .content { padding: 20px; background: #f9f9f9; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #2c5aa0; }
    .value { margin-left: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>New Contact Form Submission</h2>
    </div>
    <div class="content">
      <div class="field">
        <span class="label">Name:</span>
        <span class="value">{{firstName}} {{familyName}}</span>
      </div>
      <div class="field">
        <span class="label">Email:</span>
        <span class="value">{{email}}</span>
      </div>
      <div class="field">
        <span class="label">Phone:</span>
        <span class="value">{{phone}}</span>
      </div>
      <div class="field">
        <span class="label">Country:</span>
        <span class="value">{{country}}</span>
      </div>
      <div class="field">
        <span class="label">Product Category:</span>
        <span class="value">{{productCategory}}</span>
      </div>
      <div class="field">
        <span class="label">Requirements:</span>
        <div class="value" style="margin-top: 10px; white-space: pre-wrap;">{{requirements}}</div>
      </div>
      <div class="field">
        <span class="label">Submitted:</span>
        <span class="value">{{timestamp}}</span>
      </div>
      <div class="field">
        <span class="label">Language:</span>
        <span class="value">{{locale}}</span>
      </div>
    </div>
  </div>
</body>
</html>`,
      ru: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 700px; margin: 0 auto; padding: 20px; }
    .header { background: #2c5aa0; color: white; padding: 20px; }
    .content { padding: 20px; background: #f9f9f9; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #2c5aa0; }
    .value { margin-left: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Новое обращение</h2>
    </div>
    <div class="content">
      <div class="field">
        <span class="label">Имя:</span>
        <span class="value">{{firstName}} {{familyName}}</span>
      </div>
      <div class="field">
        <span class="label">Email:</span>
        <span class="value">{{email}}</span>
      </div>
      <div class="field">
        <span class="label">Телефон:</span>
        <span class="value">{{phone}}</span>
      </div>
      <div class="field">
        <span class="label">Страна:</span>
        <span class="value">{{country}}</span>
      </div>
      <div class="field">
        <span class="label">Категория:</span>
        <span class="value">{{productCategory}}</span>
      </div>
      <div class="field">
        <span class="label">Требования:</span>
        <div class="value" style="margin-top: 10px; white-space: pre-wrap;">{{requirements}}</div>
      </div>
      <div class="field">
        <span class="label">Отправлено:</span>
        <span class="value">{{timestamp}}</span>
      </div>
      <div class="field">
        <span class="label">Язык:</span>
        <span class="value">{{locale}}</span>
      </div>
    </div>
  </div>
</body>
</html>`,
      es: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 700px; margin: 0 auto; padding: 20px; }
    .header { background: #2c5aa0; color: white; padding: 20px; }
    .content { padding: 20px; background: #f9f9f9; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #2c5aa0; }
    .value { margin-left: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Nueva consulta</h2>
    </div>
    <div class="content">
      <div class="field">
        <span class="label">Nombre:</span>
        <span class="value">{{firstName}} {{familyName}}</span>
      </div>
      <div class="field">
        <span class="label">Email:</span>
        <span class="value">{{email}}</span>
      </div>
      <div class="field">
        <span class="label">Teléfono:</span>
        <span class="value">{{phone}}</span>
      </div>
      <div class="field">
        <span class="label">País:</span>
        <span class="value">{{country}}</span>
      </div>
      <div class="field">
        <span class="label">Categoría:</span>
        <span class="value">{{productCategory}}</span>
      </div>
      <div class="field">
        <span class="label">Requisitos:</span>
        <div class="value" style="margin-top: 10px; white-space: pre-wrap;">{{requirements}}</div>
      </div>
      <div class="field">
        <span class="label">Enviado:</span>
        <span class="value">{{timestamp}}</span>
      </div>
      <div class="field">
        <span class="label">Idioma:</span>
        <span class="value">{{locale}}</span>
      </div>
    </div>
  </div>
</body>
</html>`,
    },
  },
];

export default function EmailTemplatesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplate[]>(initialTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [activeTab, setActiveTab] = useState<"en" | "ru" | "es">("en");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    try {
      const res = await fetch("/api/admin/email-templates");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (data.templates && data.templates.length > 0) {
          setTemplates(data.templates);
        }
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!selectedTemplate) return;

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/email-templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templates }),
      });

      if (!res.ok) throw new Error("Failed to save templates");

      setMessage({ type: "success", text: "Email templates saved successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save email templates" });
    } finally {
      setSaving(false);
    }
  }

  function updateSubject(locale: "en" | "ru" | "es", value: string) {
    if (!selectedTemplate) return;
    const updated = templates.map((t) =>
      t.id === selectedTemplate.id
        ? { ...t, subject: { ...t.subject, [locale]: value } }
        : t
    );
    setTemplates(updated);
    setSelectedTemplate(updated.find((t) => t.id === selectedTemplate.id) || null);
  }

  function updateBody(locale: "en" | "ru" | "es", value: string) {
    if (!selectedTemplate) return;
    const updated = templates.map((t) =>
      t.id === selectedTemplate.id
        ? { ...t, body: { ...t.body, [locale]: value } }
        : t
    );
    setTemplates(updated);
    setSelectedTemplate(updated.find((t) => t.id === selectedTemplate.id) || null);
  }

  function getPreviewHtml() {
    if (!selectedTemplate) return "";

    // Sample data for preview
    const sampleData: Record<string, string> = {
      firstName: "John",
      familyName: "Smith",
      email: "john.smith@example.com",
      phone: "+1 234 567 8900",
      country: "United States",
      productCategory: "PET Preform Molds",
      requirements: "I need 32-cavity molds for 500ml water bottle preforms. Please send quotation.",
      timestamp: new Date().toLocaleString(activeTab === "ru" ? "ru-RU" : activeTab === "es" ? "es-ES" : "en-US"),
      locale: activeTab.toUpperCase(),
    };

    let html = selectedTemplate.body[activeTab];

    // Replace all variables with sample data
    Object.entries(sampleData).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
      html = html.replace(regex, value);
    });

    return html;
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <AdminNav />
        <div className={styles.contentWrapper}>
          <div className={styles.header}>
            <h1 className={styles.title}>Email Templates</h1>
          </div>
          <main className={styles.main}>
            <p>Loading...</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <AdminNav />
      <div className={styles.contentWrapper}>
        <div className={styles.header}>
          <h1 className={styles.title}>Email 模板管理 (Resend)</h1>
          <p className={styles.subtitle}>管理聯絡表單的自動回覆和通知郵件模板</p>
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
          {/* Template List */}
          <aside className={styles.sidebar}>
            <h2 className={styles.sidebarTitle}>模板列表</h2>
            <div className={styles.templateList}>
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`${styles.templateItem} ${
                    selectedTemplate?.id === template.id ? styles.active : ""
                  }`}
                >
                  <div className={styles.templateName}>{template.name}</div>
                  <div className={styles.templateType}>
                    {template.type === "customer_thankyou" ? "客戶感謝信" : "管理員通知"}
                  </div>
                </button>
              ))}
            </div>
            <div className={styles.helpBox}>
              <h3>可用變數</h3>
              <ul>
                <li><code>{`{{firstName}}`}</code> - 名</li>
                <li><code>{`{{familyName}}`}</code> - 姓</li>
                <li><code>{`{{email}}`}</code> - Email</li>
                <li><code>{`{{phone}}`}</code> - 電話</li>
                <li><code>{`{{country}}`}</code> - 國家</li>
                <li><code>{`{{productCategory}}`}</code> - 產品類別</li>
                <li><code>{`{{requirements}}`}</code> - 需求內容</li>
                <li><code>{`{{timestamp}}`}</code> - 時間戳</li>
                <li><code>{`{{locale}}`}</code> - 語言代碼</li>
              </ul>
            </div>
          </aside>

          {/* Template Editor */}
          <div className={styles.editor}>
            {selectedTemplate ? (
              <>
                <div className={styles.editorHeader}>
                  <h2>{selectedTemplate.name}</h2>
                  <div className={styles.tabs}>
                    <button
                      onClick={() => setActiveTab("en")}
                      className={`${styles.tab} ${activeTab === "en" ? styles.activeTab : ""}`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => setActiveTab("ru")}
                      className={`${styles.tab} ${activeTab === "ru" ? styles.activeTab : ""}`}
                    >
                      Русский
                    </button>
                    <button
                      onClick={() => setActiveTab("es")}
                      className={`${styles.tab} ${activeTab === "es" ? styles.activeTab : ""}`}
                    >
                      Español
                    </button>
                  </div>
                </div>

                <div className={styles.form}>
                  <div className={styles.field}>
                    <label className={styles.label}>Subject ({activeTab.toUpperCase()})</label>
                    <input
                      type="text"
                      value={selectedTemplate.subject[activeTab]}
                      onChange={(e) => updateSubject(activeTab, e.target.value)}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Email Body (HTML)</label>
                    <textarea
                      value={selectedTemplate.body[activeTab]}
                      onChange={(e) => updateBody(activeTab, e.target.value)}
                      className={styles.textarea}
                      rows={20}
                      spellCheck={false}
                    />
                  </div>

                  <div className={styles.actions}>
                    <button
                      onClick={() => setShowPreview(true)}
                      className={styles.previewButton}
                      type="button"
                    >
                      預覽郵件
                    </button>
                    <button
                      onClick={handleSave}
                      className={styles.saveButton}
                      disabled={saving}
                    >
                      {saving ? "儲存中..." : "儲存模板"}
                    </button>
                  </div>
                </div>

                {/* Preview Modal */}
                {showPreview && (
                  <div className={styles.previewOverlay} onClick={() => setShowPreview(false)}>
                    <div className={styles.previewModal} onClick={(e) => e.stopPropagation()}>
                      <div className={styles.previewHeader}>
                        <h3>郵件預覽 ({activeTab.toUpperCase()})</h3>
                        <div className={styles.previewSubject}>
                          <strong>Subject:</strong>{" "}
                          {selectedTemplate.subject[activeTab].replace(
                            /\{\{(\w+)\}\}/g,
                            (_, key) => {
                              const sampleData: Record<string, string> = {
                                firstName: "John",
                                familyName: "Smith",
                              };
                              return sampleData[key] || `{{${key}}}`;
                            }
                          )}
                        </div>
                        <button
                          onClick={() => setShowPreview(false)}
                          className={styles.previewClose}
                        >
                          &times;
                        </button>
                      </div>
                      <iframe
                        srcDoc={getPreviewHtml()}
                        className={styles.previewFrame}
                        title="Email Preview"
                        sandbox=""
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.emptyState}>
                <p>← 請從左側選擇一個模板進行編輯</p>
              </div>
            )}
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}
