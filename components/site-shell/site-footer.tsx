"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import type { FormEvent } from "react";

const inquiries = [["Corporate Event", "/corporateevents"], ["Social Event", "/socialevents"], ["Wedding Planning", "/weddingplanning"], ["Proposal Planning", "/proposalplanning"]] as const;
const validationMessages = {
  name: "Enter a first name.",
  email: "Enter an email address like example@mysite.com.",
  phone: "Enter a phone number.",
  city: "Enter an answer.",
  eventDate: "Choose a date.",
  eventType: "Choose an option.",
  referral: "Choose an option.",
  budget: "Choose an option.",
  message: "Enter an answer.",
} as const;
type InquiryField = keyof typeof validationMessages;

export function SiteFooter({ proposal = false }: { proposal?: boolean }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const eventInquiryRef = useRef<HTMLButtonElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<InquiryField, string>>>({});

  function revealActions() {
    setExpanded(true);
    requestAnimationFrame(() => eventInquiryRef.current?.focus());
  }

  function openInquiry() {
    setSubmitted(false);
    setErrors({});
    dialogRef.current?.showModal();
  }

  function closeInquiry() {
    dialogRef.current?.close();
    setExpanded(false);
  }

  function submitInquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const nextErrors: Partial<Record<InquiryField, string>> = {};
    (Object.keys(validationMessages) as InquiryField[]).forEach((name) => {
      const value = String(data.get(name) || "").trim();
      if (!value || (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))) nextErrors[name] = validationMessages[name];
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setSubmitted(false);
      const firstInvalid = Object.keys(nextErrors)[0];
      requestAnimationFrame(() => (form.elements.namedItem(firstInvalid) as HTMLElement | null)?.focus());
      return;
    }
    setSubmitted(true);
  }

  function fieldProps(name: InquiryField) {
    return {
      "aria-invalid": errors[name] ? true : undefined,
      "aria-describedby": errors[name] ? `inquiry-${name}-error` : undefined,
      onChange: () => setErrors((current) => current[name] ? { ...current, [name]: undefined } : current),
    };
  }

  function fieldError(name: InquiryField) {
    return errors[name] ? <span className="inquiry-error" id={`inquiry-${name}-error`}>{errors[name]}</span> : null;
  }

  return (
    <footer className="site-footer">
      <h2>Let’s Start Planning</h2>
      <p>SCHEDULE A CALL WITH AMBER TO CHAT ABOUT YOUR {proposal ? "PROPOSAL" : "EVENT"}</p>
      <div className="footer-inquiry-links">{inquiries.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</div>
      <span className="footer-or">Or</span>
      <div className={`footer-action-carousel${expanded ? " is-expanded" : ""}`} onMouseEnter={() => setExpanded(true)} onMouseLeave={() => setExpanded(false)}>
        <button className="footer-primary" type="button" aria-expanded={expanded} onClick={revealActions}>Inquire Now</button>
        <div className="footer-secondary-links" aria-hidden={!expanded}>
          <button ref={eventInquiryRef} type="button" onClick={openInquiry}>Event Inquiry</button>
          <a href="mailto:vendors@amberwalkerevents.com?subject=Vendor%20Application%20">Become A Vendor</a>
        </div>
      </div>
      <a className="footer-social" href="https://www.instagram.com/amberwalkerevents/" target="_blank" rel="noreferrer">Follow us: @AmberWalkerEvents</a>
      <small>Disclaimer: Amber Walker Events may use all photos and videos for promotional use</small>
      <small>Copyright © 2026 - Amber Walker Events. All Rights Reserved</small>

      <dialog ref={dialogRef} className="inquiry-modal" aria-labelledby="inquiry-dialog-title" onClose={() => setExpanded(false)}>
        <div className={`inquiry-modal-panel${Object.keys(errors).length ? " has-errors" : ""}`}>
          <div className="inquiry-modal-content">
            <button className="inquiry-modal-close" type="button" aria-label="Close event inquiry" onClick={closeInquiry}>×</button>
            <Image className="inquiry-modal-logo" src="/media/home/display/modal-mark.png" width={136} height={136} priority alt="" />
            <div className="inquiry-modal-heading">
              <h2 id="inquiry-dialog-title">Contact us</h2>
              <a href="mailto:info@amberwalkerevents.com">info@amberwalkerevents.com</a>
              <a href="tel:+16474445599">Canadian - Toronto Office: (647) 444-5599</a>
              <a href="tel:+13107504585">USA - California Office: (310) 750-4585</a>
              <a href="https://www.instagram.com/amberwalkerevents/" target="_blank" rel="noreferrer">Follow us: @AmberWalkerEvents</a>
            </div>
            <form className="inquiry-modal-form" aria-describedby="inquiry-delivery-note" onSubmit={submitInquiry} noValidate>
              <label><span>Full Name</span><input name="name" type="text" placeholder="Full Name" autoComplete="name" required {...fieldProps("name")} />{fieldError("name")}</label>
              <label><span>Email</span><input name="email" type="email" placeholder="Email" autoComplete="email" required {...fieldProps("email")} />{fieldError("email")}</label>
              <label><span>Phone</span><input name="phone" type="tel" placeholder="Phone" autoComplete="tel" required {...fieldProps("phone")} />{fieldError("phone")}</label>
              <label><span>City Of Event</span><input name="city" type="text" placeholder="City Of Event" autoComplete="address-level2" required {...fieldProps("city")} />{fieldError("city")}</label>
              <label><span>Event Date</span><input name="eventDate" type="date" aria-label="Event Date" required {...fieldProps("eventDate")} />{fieldError("eventDate")}</label>
              <label><span>Type of Event</span><select name="eventType" aria-label="Type of Event" defaultValue="" required {...fieldProps("eventType")}><option value="" disabled>Type of Event</option>{inquiries.map(([label]) => <option key={label}>{label}</option>)}</select>{fieldError("eventType")}</label>
              <label><span>How you Found AWE</span><select name="referral" aria-label="How you Found AWE" defaultValue="" required {...fieldProps("referral")}><option value="" disabled>How you Found AWE</option><option>Google</option><option>Instagram</option><option>Referral</option><option>Press</option><option>Other</option></select>{fieldError("referral")}</label>
              <label><span>What is your Budget</span><select name="budget" aria-label="What is your Budget" defaultValue="" required {...fieldProps("budget")}><option value="" disabled>What is your Budget</option><option>Under $10,000</option><option>$10,000 - $25,000</option><option>$25,000 - $50,000</option><option>$50,000 - $100,000</option><option>$100,000+</option></select>{fieldError("budget")}</label>
              <label className="inquiry-message"><span>Tell Us About Your Event</span><textarea name="message" placeholder="Tell Us About Your Event" required {...fieldProps("message")} />{fieldError("message")}</label>
              <button className="inquiry-submit" type="submit">Submit</button>
              <p className="inquiry-delivery-note" id="inquiry-delivery-note">This preview validates your details but does not send them yet. For immediate help, email <a href="mailto:info@amberwalkerevents.com">info@amberwalkerevents.com</a>.</p>
              {submitted ? <p className="inquiry-success" role="status">Your details are valid but have not been sent. Please use the email address above while online delivery is being connected.</p> : null}
            </form>
          </div>
        </div>
      </dialog>
    </footer>
  );
}
