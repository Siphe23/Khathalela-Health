import { useState } from 'react';
import { useSelector } from 'react-redux';
import AppShell from '../components/AppShell';
import useAsyncAction from '../hooks/useAsyncAction';
import { requestUrgentHelp } from '../features/care/careService';
import { EMERGENCY } from '../config/booking';
import { millisToISO, formatDate } from '../utils/format';

function UrgentHelp() {
  const user = useSelector((state) => state.auth.user);
  const { helpRequests } = useSelector((state) => state.care);
  const { run, busy, error } = useAsyncAction();
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const mine = [...helpRequests].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 5);
  const waiting = mine.some((r) => r.status === 'open');

  const send = async (event) => {
    event.preventDefault();
    const ok = await run(() => requestUrgentHelp(user, message.trim().slice(0, 300)));
    if (ok) { setMessage(''); setSent(true); }
  };

  return (
    <AppShell title="Need help now" backTo="/dashboard" subtitle="You do not need an appointment to ask for help.">
      <section className="card card-urgent" aria-labelledby="emergency">
        <h2 id="emergency" className="card-title">In a life-threatening emergency</h2>
        <p>Do not wait for the app. Call an ambulance straight away.</p>
        <div className="btn-pair">
          <a className="btn-sm solid" href={`tel:${EMERGENCY.ambulance}`}>Call {EMERGENCY.ambulance} (ambulance)</a>
          <a className="btn-sm" href={`tel:${EMERGENCY.cellphone}`}>Call {EMERGENCY.cellphone} (any cellphone)</a>
        </div>
      </section>

      <section className="card" aria-labelledby="ask">
        <h2 id="ask" className="card-title">Ask your clinic for help today</h2>
        <p className="muted">
          Your request goes to the top of the nurse's screen. They will phone you on {user.phone || 'your number'}.
          This does not replace the emergency numbers above.
        </p>
        {error && <div className="banner banner-error" role="alert">{error}</div>}
        {(sent || waiting) && (
          <div className="banner banner-success" role="status">
            Your request was sent. The clinic will contact you. Keep your phone near you.
          </div>
        )}
        <form onSubmit={send} className="note-form">
          <label htmlFor="msg">What is happening? (optional)</label>
          <textarea id="msg" rows="3" maxLength="300" value={message} onChange={(e) => setMessage(e.target.value)}
            placeholder="For example: I ran out of medication, or I feel dizzy." />
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Sending…' : 'Send urgent request'}
          </button>
        </form>
      </section>

      {mine.length > 0 && (
        <>
          <h2 className="section-title">Your recent requests</h2>
          <ul className="plain-list">
            {mine.map((r) => (
              <li key={r.id} className="card tight">
                <div className="appt-row">
                  <span className="row-text">
                    <strong>{r.createdAt ? formatDate(millisToISO(r.createdAt)) : 'Just now'}</strong>
                    <span>{r.message || 'No message'}</span>
                  </span>
                  <span className={r.status === 'open' ? 'badge requested' : 'badge'}>{r.status === 'open' ? 'Waiting' : 'Helped'}</span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </AppShell>
  );
}

export default UrgentHelp;
