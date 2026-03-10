"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav/AdminNav";
import styles from "./page.module.css";

type LocalizedString = {
  en: string;
  ru: string;
  es: string;
};

type FooterLink = {
  label: LocalizedString;
  href: string;
};

type SocialLink = {
  platform: string;
  href: string;
};

type FooterSettings = {
  logo: {
    src: string;
    alt: string;
  };
  description: LocalizedString;
  links: FooterLink[];
  contact: {
    phone: string;
    email: string;
    address: LocalizedString;
  };
  social: SocialLink[];
};

export default function FooterSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<FooterSettings | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch("/api/admin/footer-settings");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch settings");
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to load footer settings" });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/footer-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error("Failed to save settings");

      setMessage({ type: "success", text: "Footer settings saved successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save footer settings" });
    } finally {
      setSaving(false);
    }
  }

  function updateLocalizedField(
    path: string[],
    locale: keyof LocalizedString,
    value: string
  ) {
    if (!settings) return;
    const newSettings = { ...settings };
    let obj: any = newSettings;
    for (let i = 0; i < path.length - 1; i++) {
      obj = obj[path[i]];
    }
    obj[path[path.length - 1]][locale] = value;
    setSettings(newSettings);
  }

  function updateField(path: string[], value: any) {
    if (!settings) return;
    const newSettings = { ...settings };
    let obj: any = newSettings;
    for (let i = 0; i < path.length - 1; i++) {
      obj = obj[path[i]];
    }
    obj[path[path.length - 1]] = value;
    setSettings(newSettings);
  }

  function addLink() {
    if (!settings) return;
    setSettings({
      ...settings,
      links: [
        ...settings.links,
        { label: { en: "", ru: "", es: "" }, href: "" },
      ],
    });
  }

  function removeLink(index: number) {
    if (!settings) return;
    setSettings({
      ...settings,
      links: settings.links.filter((_, i) => i !== index),
    });
  }

  function addSocialLink() {
    if (!settings) return;
    setSettings({
      ...settings,
      social: [...settings.social, { platform: "", href: "" }],
    });
  }

  function removeSocialLink(index: number) {
    if (!settings) return;
    setSettings({
      ...settings,
      social: settings.social.filter((_, i) => i !== index),
    });
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <AdminNav />
        <main className={styles.main}>
          <p>Loading...</p>
        </main>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className={styles.container}>
        <AdminNav />
        <main className={styles.main}>
          <p>Failed to load settings</p>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <AdminNav />
      <main className={styles.main}>
        <h1 className={styles.title}>Footer Settings</h1>

        {message && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Logo Section */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Logo</h2>
            <div className={styles.field}>
              <label className={styles.label}>Logo Source (URL or path)</label>
              <input
                type="text"
                value={settings.logo.src}
                onChange={(e) => updateField(["logo", "src"], e.target.value)}
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Logo Alt Text</label>
              <input
                type="text"
                value={settings.logo.alt}
                onChange={(e) => updateField(["logo", "alt"], e.target.value)}
                className={styles.input}
              />
            </div>
          </section>

          {/* Description Section */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Description</h2>
            <div className={styles.field}>
              <label className={styles.label}>English</label>
              <textarea
                value={settings.description.en}
                onChange={(e) =>
                  updateLocalizedField(["description"], "en", e.target.value)
                }
                className={styles.textarea}
                rows={3}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Russian</label>
              <textarea
                value={settings.description.ru}
                onChange={(e) =>
                  updateLocalizedField(["description"], "ru", e.target.value)
                }
                className={styles.textarea}
                rows={3}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Spanish</label>
              <textarea
                value={settings.description.es}
                onChange={(e) =>
                  updateLocalizedField(["description"], "es", e.target.value)
                }
                className={styles.textarea}
                rows={3}
              />
            </div>
          </section>

          {/* Quick Links Section */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Quick Links</h2>
              <button
                type="button"
                onClick={addLink}
                className={styles.addButton}
              >
                + Add Link
              </button>
            </div>
            {settings.links.map((link, index) => (
              <div key={index} className={styles.linkItem}>
                <div className={styles.linkHeader}>
                  <h3 className={styles.linkTitle}>Link {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeLink(index)}
                    className={styles.removeButton}
                  >
                    Remove
                  </button>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Label (EN)</label>
                  <input
                    type="text"
                    value={link.label.en}
                    onChange={(e) => {
                      const newLinks = [...settings.links];
                      newLinks[index].label.en = e.target.value;
                      setSettings({ ...settings, links: newLinks });
                    }}
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Label (RU)</label>
                  <input
                    type="text"
                    value={link.label.ru}
                    onChange={(e) => {
                      const newLinks = [...settings.links];
                      newLinks[index].label.ru = e.target.value;
                      setSettings({ ...settings, links: newLinks });
                    }}
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Label (ES)</label>
                  <input
                    type="text"
                    value={link.label.es}
                    onChange={(e) => {
                      const newLinks = [...settings.links];
                      newLinks[index].label.es = e.target.value;
                      setSettings({ ...settings, links: newLinks });
                    }}
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>URL</label>
                  <input
                    type="text"
                    value={link.href}
                    onChange={(e) => {
                      const newLinks = [...settings.links];
                      newLinks[index].href = e.target.value;
                      setSettings({ ...settings, links: newLinks });
                    }}
                    className={styles.input}
                  />
                </div>
              </div>
            ))}
          </section>

          {/* Contact Section */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Contact Information</h2>
            <div className={styles.field}>
              <label className={styles.label}>Phone</label>
              <input
                type="text"
                value={settings.contact.phone}
                onChange={(e) => updateField(["contact", "phone"], e.target.value)}
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input
                type="email"
                value={settings.contact.email}
                onChange={(e) => updateField(["contact", "email"], e.target.value)}
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Address (EN)</label>
              <input
                type="text"
                value={settings.contact.address.en}
                onChange={(e) =>
                  updateLocalizedField(["contact", "address"], "en", e.target.value)
                }
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Address (RU)</label>
              <input
                type="text"
                value={settings.contact.address.ru}
                onChange={(e) =>
                  updateLocalizedField(["contact", "address"], "ru", e.target.value)
                }
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Address (ES)</label>
              <input
                type="text"
                value={settings.contact.address.es}
                onChange={(e) =>
                  updateLocalizedField(["contact", "address"], "es", e.target.value)
                }
                className={styles.input}
              />
            </div>
          </section>

          {/* Social Links Section */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Social Media Links</h2>
              <button
                type="button"
                onClick={addSocialLink}
                className={styles.addButton}
              >
                + Add Social Link
              </button>
            </div>
            {settings.social.map((social, index) => (
              <div key={index} className={styles.linkItem}>
                <div className={styles.linkHeader}>
                  <h3 className={styles.linkTitle}>Social Link {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeSocialLink(index)}
                    className={styles.removeButton}
                  >
                    Remove
                  </button>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Platform (e.g., WhatsApp, Telegram, X)</label>
                  <input
                    type="text"
                    value={social.platform}
                    onChange={(e) => {
                      const newSocial = [...settings.social];
                      newSocial[index].platform = e.target.value;
                      setSettings({ ...settings, social: newSocial });
                    }}
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>URL</label>
                  <input
                    type="text"
                    value={social.href}
                    onChange={(e) => {
                      const newSocial = [...settings.social];
                      newSocial[index].href = e.target.value;
                      setSettings({ ...settings, social: newSocial });
                    }}
                    className={styles.input}
                  />
                </div>
              </div>
            ))}
          </section>

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Footer Settings"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
