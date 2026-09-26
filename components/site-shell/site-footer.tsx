import Link from "next/link";

const inquiries = [["Corporate Event", "/corporateevents"], ["Social Event", "/socialevents"], ["Wedding Planning", "/weddingplanning"], ["Proposal Planning", "/proposalplanning"]] as const;

export function SiteFooter({ proposal = false }: { proposal?: boolean }) {
  return (
    <footer className="site-footer">
      <h2>Let&apos;s Start Planning</h2>
      <p>SCHEDULE A CALL WITH AMBER TO CHAT ABOUT YOUR {proposal ? "PROPOSAL" : "EVENT"}</p>
      <div className="footer-inquiry-links">{inquiries.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</div>
      <span className="footer-or">Or</span>
      <Link className="footer-primary" href="/contact">Inquire Now</Link>
      <a className="footer-social" href="https://www.instagram.com/amberwalkerevents/" target="_blank" rel="noreferrer">Follow us: @AmberWalkerEvents</a>
      <small>Disclaimer: Amber Walker Events may use all photos and videos for promotional use</small>
      <small>Copyright © 2026 - Amber Walker Events. All Rights Reserved</small>
    </footer>
  );
}
