import { useState } from 'react';
import { useSelector } from 'react-redux';
import AppShell from '../components/AppShell';
import Avatar from '../components/Avatar';
import Icon from '../components/Icon';
import WorkerApprovalCard from '../components/WorkerApprovalCard';
import useAsyncAction from '../hooks/useAsyncAction';
import { setWorkerStatus } from '../features/care/careService';

const FILTERS = ['All', 'Patients', 'Healthcare workers', 'Pending'];

function AdminUsers() {
  const { users, loaded } = useSelector((state) => state.care);
  const { run, busy, error } = useAsyncAction();
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');

  const term = query.trim().toLowerCase();
  const list = users
    .filter((u) => {
      if (filter === 'Patients') return u.role === 'patient';
      if (filter === 'Healthcare workers') return u.role === 'worker';
      if (filter === 'Pending') return u.role === 'worker' && (u.verificationStatus || 'pending') === 'pending';
      return true;
    })
    .filter((u) => `${u.fullName || ''} ${u.email || ''}`.toLowerCase().includes(term))
    .sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));

  const change = (uid, status) => run(() => setWorkerStatus(uid, status));

  return (
    <AppShell wide title="Users" subtitle="Everyone who has an account" backTo="/dashboard">
      {error && <div className="banner banner-error" role="alert">{error}</div>}

      <div className="search">
        <Icon name="search" size={18} />
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email" aria-label="Search users" />
      </div>
      <div className="chips chips-plain" role="group" aria-label="Filter users">
        {FILTERS.map((name) => (
          <button key={name} type="button" className={name === filter ? 'chip active' : 'chip'}
            aria-pressed={name === filter} onClick={() => setFilter(name)}>{name}</button>
        ))}
      </div>

      {!loaded.users && <p className="empty">Loading…</p>}
      {loaded.users && list.length === 0 && <p className="empty">No users match.</p>}

      <ul className="plain-list">
        {list.map((u) => (
          u.role === 'worker' ? (
            <WorkerApprovalCard key={u.id} worker={u} busy={busy} onSetStatus={change} />
          ) : (
            <li key={u.id} className="card tight">
              <div className="appt-row">
                <Avatar name={u.fullName} size={44} />
                <span className="row-text">
                  <strong>{u.fullName || 'No name'}</strong>
                  <span>{u.email}{u.phone ? ` · ${u.phone}` : ''}</span>
                </span>
                <span className="badge past">{u.role === 'admin' ? 'Administrator' : 'Patient'}</span>
              </div>
            </li>
          )
        ))}
      </ul>
    </AppShell>
  );
}

export default AdminUsers;
