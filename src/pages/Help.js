import AppShell from '../components/AppShell';
import ListRow from '../components/ListRow';
import { CONTACT } from '../config/contact';

const FAQS = [
  ['How do I check in at the clinic?', 'On your Home screen, tap the QR icon on the Next Clinic Visit card, then scan the QR code at the clinic.'],
  ['I forgot my password.', 'On the Log In screen choose Forgot password. We will email you a link to choose a new one.'],
  ['Can I change my language?', 'You can pick a language under Profile, then Settings. Full translations are coming soon.'],
  ['What information do you keep about me?', 'Only your name, contact details, role and appointment information. Your clinic keeps your medical records.'],
];

function Help() {
  const mailto = `mailto:${CONTACT.supportEmail}?subject=${encodeURIComponent('Problem report')}`;

  return (
    <AppShell title="Need Help?" backTo="/dashboard">
      <p className="muted">We're here for you.</p>
      <div className="list-card">
        <ListRow icon="phone" tone="dark" title="Call Clinic" subtitle={CONTACT.clinicPhoneDisplay}
          href={`tel:${CONTACT.clinicPhoneTel}`} />
        <ListRow icon="chat" tone="dark" title="WhatsApp Support" subtitle={CONTACT.whatsappDisplay}
          href={`https://wa.me/${CONTACT.whatsappNumber}`} />
        <ListRow icon="alert" tone="gold" title="Report a Problem" subtitle="Get in touch" href={mailto} />
      </div>

      <h2 className="section-title">FAQs</h2>
      <div className="list-card">
        {FAQS.map(([question, answer]) => (
          <details key={question} className="faq">
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </AppShell>
  );
}

export default Help;
