import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { APP_NAME } from '../config/appInfo';
import { CONTACT_EMAIL, LEGAL_UPDATED } from '../config/legal';

function LegalLayout({ title, children }) {
  const navigate = useNavigate();
  const goBack = () => (window.history.state && window.history.state.idx > 0 ? navigate(-1) : navigate('/'));
  return (
    <main className="legal">
      <div className="legal-inner">
        <button type="button" className="btn btn-text" onClick={goBack}>← Back</button>
        <h1>{title}</h1>
        <p className="muted small">{APP_NAME} · Last updated {LEGAL_UPDATED}</p>
        <div className="banner banner-info">
          This is a prototype built for the FNB App of the Year Hackathon 2026. It uses fictional data only.
          This page has not yet been reviewed by a lawyer. It must be reviewed before the app is used with real patients.
        </div>
        {children}
        <p className="small legal-links">
          <Link to="/terms">Terms of Service</Link> · <Link to="/privacy">Privacy Policy</Link>
        </p>
      </div>
    </main>
  );
}

export function Terms() {
  return (
    <LegalLayout title="Terms of Service">
      <h2>1. What this app is</h2>
      <p>{APP_NAME} helps people living with a chronic illness plan clinic visits, record their medication, and ask a clinic for help. It helps clinic staff see who has arrived, who missed a visit, and who needs follow-up.</p>

      <h2>2. It is not medical advice or emergency care</h2>
      <p>The app does not diagnose, treat or give medical advice. Decisions about your treatment stay with you and your clinic.</p>
      <p><strong>In an emergency, do not wait for the app.</strong> Call the ambulance on <strong>10177</strong>, or <strong>112</strong> from any cellphone. A "Need help now" request only reaches a healthcare worker who has the app open. It can take time, and it may not be seen.</p>

      <h2>3. Your account</h2>
      <ul>
        <li>Give true information when you register, and keep your password to yourself.</li>
        <li>Healthcare workers must give their real professional details. They can see patient information only after an administrator approves them.</li>
        <li>Administrator accounts need an invitation code. Do not share it.</li>
        <li>Tell us if you think someone else has used your account.</li>
      </ul>

      <h2>4. How you may use the app</h2>
      <ul>
        <li>Use it only for its purpose: your own care, or the care you are approved to support.</li>
        <li>Do not look at records you have no reason to see, and do not share what you see with people who should not have it.</li>
        <li>Do not try to break into the app, bypass its limits, or send false help requests or bookings.</li>
      </ul>

      <h2>5. Bookings, check-in and medication records</h2>
      <p>Bookings depend on the clinic. A booked time is not a promise that you will be seen at that time, or that medication will be given. Medication records are what the patient reports, so they do not prove how or when medicine was taken. Calendar links are a one-time export and do not stay in step with the app. Reminders are a saved setting only, and no messages are sent yet.</p>

      <h2>6. Availability</h2>
      <p>This is a prototype. It may be slow, change, or stop working. We do not promise that it will always be available or free of errors.</p>

      <h2>7. Responsibility</h2>
      <p>We work to keep the app and your information safe, but no system is perfectly safe. As far as the law allows, we are not responsible for loss or harm caused by using the app, by it being unavailable, or by relying on it instead of contacting your clinic or emergency services. Nothing here removes rights you have under South African law.</p>

      <h2>8. Changes and ending</h2>
      <p>We may change these terms or the app. We may close an account that breaks these terms. You can stop using the app at any time and ask us to delete your information (see the Privacy Policy).</p>

      <h2>9. Contact</h2>
      <p>Questions: {CONTACT_EMAIL}</p>
    </LegalLayout>
  );
}

export function Privacy() {
  return (
    <LegalLayout title="Privacy Policy">
      <h2>1. Who is responsible</h2>
      <p>{APP_NAME} is run by its developer, the person named in the contact details below. This policy says what information the app keeps, why, and who can see it. We aim to follow the principles of South Africa's Protection of Personal Information Act (POPIA). We have not yet had a legal review, so we do not claim full compliance.</p>

      <h2>2. What we collect</h2>
      <ul>
        <li><strong>Account details:</strong> name, email address, phone number, and your role (patient, healthcare worker or administrator).</li>
        <li><strong>Patients also give:</strong> gender, age, preferred language and preferred clinic.</li>
        <li><strong>Healthcare workers also give:</strong> job title, clinic or facility, and professional registration number.</li>
        <li><strong>Care information:</strong> appointments and check-ins, medication marked Taken or Missed, concerns you report, help requests, and notes from healthcare workers.</li>
        <li><strong>Settings:</strong> your reminder choice.</li>
      </ul>
      <p>Your password is handled by Firebase Authentication. We never see it and we do not store it ourselves. The app does not collect your location, photos, or payment details. The camera is used only to read the clinic QR code on your device. No video or image is saved or sent anywhere.</p>
      <p>Health information is special personal information. We collect only what the care features need.</p>

      <h2>3. Why we use it</h2>
      <ul>
        <li>To let you sign in and use the features for your role.</li>
        <li>To book visits, check you in, and show your clinic who needs follow-up or urgent help.</li>
        <li>To show a care summary to a healthcare worker.</li>
      </ul>
      <p>We do not sell your information and we do not use it for advertising.</p>

      <h2>4. Who can see it</h2>
      <ul>
        <li><strong>You</strong> can see your own information.</li>
        <li><strong>Healthcare workers</strong> can see patient information only after an administrator has approved them.</li>
        <li><strong>Administrators</strong> can see user accounts and activity.</li>
        <li><strong>Service providers:</strong> your information is stored with Google Firebase (sign-in and database) and the app is hosted by Vercel. They process it for us. Their servers may be outside South Africa.</li>
        <li><strong>Google Calendar:</strong> if you press "Add to Google Calendar", the visit details are sent to Google by that link. If you download the calendar file, nothing is sent.</li>
      </ul>

      <h2>5. How we protect it</h2>
      <p>Access is controlled by role, and the database only lets each person reach what their role allows. Sign-in uses Firebase Authentication. These measures reduce risk but cannot remove it. If we learn that your information was exposed, we will tell the people affected.</p>

      <h2>6. How long we keep it</h2>
      <p>We keep your information while your account is open. When you ask us to delete it, we will delete your account details and the records linked to you, unless the law requires us to keep something.</p>

      <h2>7. Your rights</h2>
      <p>You can ask us to show you your information, correct it, or delete it, and you can object to how it is used. Write to the contact below. You may also complain to the Information Regulator of South Africa.</p>

      <h2>8. Children</h2>
      <p>The app is meant for adults. A parent or guardian should register and use it for a child under 18.</p>

      <h2>9. Changes</h2>
      <p>If we change this policy, we will update the date at the top of this page.</p>

      <h2>10. Contact</h2>
      <p>{CONTACT_EMAIL}</p>
    </LegalLayout>
  );
}
