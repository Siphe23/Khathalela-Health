import { useState } from 'react';
import { useSelector } from 'react-redux';
import AppShell from '../components/AppShell';
import Icon from '../components/Icon';
import DemoNote from '../components/DemoNote';
import { recentMissed } from '../features/care/careSelectors';
import { computeBarriers, suggestionFor } from '../utils/summary';
import { clockTime } from '../utils/format';

function Summary() {
  const { appointments, loaded } = useSelector((state) => state.care);
  const [generatedAt, setGeneratedAt] = useState(clockTime());

  const { total, rows } = computeBarriers(recentMissed(appointments));

  return (
    <AppShell wide title="Summary" backTo="/dashboard">
      <section className="card" aria-labelledby="barriers">
        <h2 id="barriers" className="card-title">Common Barriers (Last 7 Days)</h2>
        {!loaded.appointments ? (
          <p className="muted small">Loading…</p>
        ) : (
          <p className="muted small">Based on {total} missed appointment{total === 1 ? '' : 's'} · generated at {generatedAt}</p>
        )}
        <ul className="bars">
          {rows.map((row) => (
            <li key={row.key}>
              <div className="bar-label"><span>{row.label}</span><strong>{row.percent}%</strong></div>
              <div className="bar-track" role="presentation"><div className="bar-fill" style={{ width: `${row.percent}%` }} /></div>
            </li>
          ))}
        </ul>
      </section>

      <section className="card card-gold">
        <h2 className="card-title"><Icon name="idea" size={20} /> Suggestion</h2>
        <p>{suggestionFor(rows, total)}</p>
      </section>

      <button type="button" className="btn btn-primary btn-block" onClick={() => setGeneratedAt(clockTime())}>
        Generate New Summary
      </button>
      <DemoNote>
        This summary is calculated by counting your real missed-appointment records using simple
        rules. A true AI summary would run on a secure server, never in the browser.
      </DemoNote>
    </AppShell>
  );
}

export default Summary;
