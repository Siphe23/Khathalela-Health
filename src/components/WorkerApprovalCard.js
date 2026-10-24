import Avatar from './Avatar';

// One healthcare worker with Approve / Reject buttons. Used by the administrator pages.
function WorkerApprovalCard({ worker, busy, onSetStatus }) {
  const status = worker.verificationStatus || 'pending';
  return (
    <li className="card tight worker-card">
      <div className="appt-row">
        <Avatar name={worker.fullName} size={44} />
        <span className="row-text">
          <strong>{worker.fullName || 'No name'}</strong>
          <span>{worker.jobTitle || 'Job title not given'} · {worker.facilityName || 'Facility not given'}</span>
          <span>Reg. no: {worker.registrationNumber || 'not given'}</span>
          <span>{worker.email}{worker.phone ? ` · ${worker.phone}` : ''}</span>
        </span>
        {status === 'verified' && <span className="badge">Verified</span>}
        {status === 'pending' && <span className="badge requested">Pending</span>}
        {status === 'rejected' && <span className="badge missed">Rejected</span>}
      </div>
      <div className="inline-form">
        {status !== 'verified' && (
          <button type="button" className="btn-sm solid" disabled={busy} onClick={() => onSetStatus(worker.id, 'verified')}>Approve</button>
        )}
        {status === 'pending' && (
          <button type="button" className="btn-sm" disabled={busy} onClick={() => onSetStatus(worker.id, 'rejected')}>Reject</button>
        )}
        {status === 'verified' && (
          <button type="button" className="btn-sm" disabled={busy} onClick={() => onSetStatus(worker.id, 'pending')}>Revoke access</button>
        )}
        {status === 'rejected' && (
          <button type="button" className="btn-sm" disabled={busy} onClick={() => onSetStatus(worker.id, 'pending')}>Move back to pending</button>
        )}
      </div>
    </li>
  );
}

export default WorkerApprovalCard;
