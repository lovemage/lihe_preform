"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button/Button";
import styles from "./ContactForm.module.css";

type EnhancedContactFormProps = {
  locale: string;
  productCategories: string[];
  labels: {
    heading: string;
    description: string;
    firstName: string;
    familyName: string;
    email: string;
    phone: string;
    country: string;
    productCategory: string;
    requirements: string;
    captcha: string;
    submit: string;
    sending: string;
    successTitle: string;
    successMessage: string;
    errorMessage: string;
    required: string;
  };
};

const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia", "Australia",
  "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium",
  "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei",
  "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde",
  "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica",
  "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "East Timor", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia",
  "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada",
  "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India",
  "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "North Korea", "South Korea", "Kuwait", "Kyrgyzstan", "Laos",
  "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands",
  "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro",
  "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand",
  "Nicaragua", "Niger", "Nigeria", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea",
  "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino",
  "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore",
  "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "Spain", "Sri Lanka", "Sudan",
  "Suriname", "Swaziland", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand",
  "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine",
  "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City",
  "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

export default function EnhancedContactForm({ locale, productCategories, labels }: EnhancedContactFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captcha, setCaptcha] = useState<{ question: string; token: string } | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    familyName: "",
    email: "",
    phone: "",
    country: "",
    productCategory: "",
    requirements: "",
    captchaAnswer: "",
  });

  useEffect(() => {
    loadCaptcha();
  }, []);

  async function loadCaptcha() {
    try {
      const res = await fetch(`/api/contact/captcha?locale=${locale}`);
      const data = await res.json();
      setCaptcha(data);
    } catch (err) {
      console.error("Failed to load CAPTCHA:", err);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/contact/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          captchaToken: captcha?.token,
          locale,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to submit form");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : labels.errorMessage);
      loadCaptcha(); // Reload CAPTCHA on error
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className={styles.success}>
        <div className={styles.successIcon}>✓</div>
        <h3 className={styles.successTitle}>{labels.successTitle}</h3>
        <p className={styles.successMessage}>{labels.successMessage}</p>
      </div>
    );
  }

  return (
    <div className={styles.formSection}>
      <h2 className={styles.formHeading}>{labels.heading}</h2>
      <p className={styles.formDescription}>{labels.description}</p>

      {error && (
        <div className={styles.errorBox}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label htmlFor="firstName" className={styles.label}>
              {labels.firstName} <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="familyName" className={styles.label}>
              {labels.familyName} <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="familyName"
              name="familyName"
              value={formData.familyName}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              {labels.email} <span className={styles.required}>*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="phone" className={styles.label}>
              {labels.phone} <span className={styles.required}>*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="country" className={styles.label}>
            {labels.country} <span className={styles.required}>*</span>
          </label>
          <select
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
            className={styles.select}
          >
            <option value="">-- {labels.required} --</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="productCategory" className={styles.label}>
            {labels.productCategory} <span className={styles.required}>*</span>
          </label>
          <select
            id="productCategory"
            name="productCategory"
            value={formData.productCategory}
            onChange={handleChange}
            required
            className={styles.select}
          >
            <option value="">-- {labels.required} --</option>
            {productCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="requirements" className={styles.label}>
            {labels.requirements} <span className={styles.required}>*</span>
          </label>
          <textarea
            id="requirements"
            name="requirements"
            value={formData.requirements}
            onChange={handleChange}
            required
            rows={6}
            className={styles.textarea}
            placeholder={locale === 'ru'
              ? 'Опишите ваши требования к продукции...'
              : locale === 'es'
              ? 'Describa sus requisitos de producto...'
              : 'Describe your product requirements...'}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="captchaAnswer" className={styles.label}>
            {labels.captcha} <span className={styles.required}>*</span>
          </label>
          <div className={styles.captchaBox}>
            <p className={styles.captchaQuestion}>{captcha?.question || "Loading..."}</p>
            <input
              type="text"
              id="captchaAnswer"
              name="captchaAnswer"
              value={formData.captchaAnswer}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder={locale === 'ru' ? 'Ваш ответ' : locale === 'es' ? 'Su respuesta' : 'Your answer'}
            />
          </div>
        </div>

        <Button type="submit" variant="primary" size="lg" disabled={loading}>
          {loading ? labels.sending : labels.submit}
        </Button>
      </form>
    </div>
  );
}
