"use client";

import { useState } from "react";
import Button from "@/components/ui/Button/Button";
import styles from "./ContactForm.module.css";

type ContactFormProps = {
  labels: {
    heading: string;
    description: string;
    fullName: string;
    companyName: string;
    emailAddress: string;
    phoneNumber: string;
    subject: string;
    message: string;
    submit: string;
    subjects: {
      inquiry: string;
      consultation: string;
      quote: string;
      support: string;
      other: string;
    };
  };
};

export default function ContactForm({ labels }: ContactFormProps) {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const company = formData.get("company") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    const body = encodeURIComponent(
      `Name: ${name}\nCompany: ${company}\nEmail: ${email}\nPhone: ${phone}\n\n${message}`
    );
    const mailto = `mailto:sales@lihe-preform.com?subject=${encodeURIComponent(subject)}&body=${body}`;

    window.location.href = mailto;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className={styles.success}>
        <div className={styles.successIcon}>&#10003;</div>
        <p>Thank you for your message. We will respond within 24 business hours.</p>
      </div>
    );
  }

  return (
    <div className={styles.formSection}>
      <h2 className={styles.formHeading}>{labels.heading}</h2>
      <p className={styles.formDescription}>{labels.description}</p>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label htmlFor="name" className={styles.label}>
              {labels.fullName} <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="company" className={styles.label}>
              {labels.companyName} <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="company"
              name="company"
              required
              className={styles.input}
            />
          </div>
        </div>
        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              {labels.emailAddress} <span className={styles.required}>*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="phone" className={styles.label}>
              {labels.phoneNumber}
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className={styles.input}
            />
          </div>
        </div>
        <div className={styles.field}>
          <label htmlFor="subject" className={styles.label}>
            {labels.subject} <span className={styles.required}>*</span>
          </label>
          <select
            id="subject"
            name="subject"
            required
            className={styles.select}
            defaultValue=""
          >
            <option value="" disabled>
              -- Select --
            </option>
            <option value={labels.subjects.inquiry}>{labels.subjects.inquiry}</option>
            <option value={labels.subjects.consultation}>{labels.subjects.consultation}</option>
            <option value={labels.subjects.quote}>{labels.subjects.quote}</option>
            <option value={labels.subjects.support}>{labels.subjects.support}</option>
            <option value={labels.subjects.other}>{labels.subjects.other}</option>
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="message" className={styles.label}>
            {labels.message} <span className={styles.required}>*</span>
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={6}
            className={styles.textarea}
          />
        </div>
        <Button type="submit" variant="primary" size="lg">
          {labels.submit}
        </Button>
      </form>
    </div>
  );
}
