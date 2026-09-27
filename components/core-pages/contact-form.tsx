"use client";

import { useState } from "react";
import type { FormEvent } from "react";

const requiredFields = ["name", "email", "eventType", "message"] as const;
type ContactField = typeof requiredFields[number];

export function ContactForm() {
  const [errors, setErrors] = useState<Partial<Record<ContactField, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const nextErrors: Partial<Record<ContactField, string>> = {};
    for (const name of requiredFields) {
      const value = String(data.get(name) || "").trim();
      if (!value || (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))) nextErrors[name] = name === "email" ? "Enter a valid email address." : "This field is required.";
    }
    setErrors(nextErrors);
    setSubmitted(!Object.keys(nextErrors).length);
    if (Object.keys(nextErrors).length) requestAnimationFrame(() => (form.elements.namedItem(Object.keys(nextErrors)[0]) as HTMLElement | null)?.focus());
  }

  function clear(name: ContactField) {
    setErrors((current) => current[name] ? { ...current, [name]: undefined } : current);
  }

  return <form className="contact-form" onSubmit={submit} noValidate>
    <label>NAME<input name="name" autoComplete="name" aria-invalid={errors.name ? true : undefined} onChange={() => clear("name")} required />{errors.name ? <span>{errors.name}</span> : null}</label>
    <label>EMAIL<input name="email" type="email" autoComplete="email" aria-invalid={errors.email ? true : undefined} onChange={() => clear("email")} required />{errors.email ? <span>{errors.email}</span> : null}</label>
    <label>EVENT TYPE<select name="eventType" defaultValue="" aria-invalid={errors.eventType ? true : undefined} onChange={() => clear("eventType")} required><option value="" disabled>Select an event</option><option>Corporate Event</option><option>Social Event</option><option>Wedding Planning</option><option>Proposal Planning</option></select>{errors.eventType ? <span>{errors.eventType}</span> : null}</label>
    <label>MESSAGE<textarea name="message" rows={5} aria-invalid={errors.message ? true : undefined} onChange={() => clear("message")} required />{errors.message ? <span>{errors.message}</span> : null}</label>
    <button type="submit">SUBMIT</button>
    {submitted ? <p role="status">Thank you. Your message is ready for the Amber Walker Events team.</p> : null}
  </form>;
}
