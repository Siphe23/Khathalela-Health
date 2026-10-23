import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AppShell from '../components/AppShell';
import { ROLES } from '../config/roles';

function ProfileSection() {
  const { section } = useParams();
  const user = useSelector((state) => state.auth.user);
  const role = user.role ? ROLES[user.role] : null;

  let title = 'Profile';
  let rows = [];
  let body = null;

  if (section === 'personal') {
    title = 'Personal Information';
    rows = [['Full name', user.displayName || 'Not set'], ['Account type', role ? role.label : 'Unknown']];
    if (role) {
      role.fields.forEach((field) => {
        if (user.details && user.details[field.name] !== undefined && user.details[field.name] !== '') rows.push([field.label, user.details[field.name]]);
      });
    }
    if (user.role === 'worker') {
      rows.push(['Verification', user.verificationStatus === 'verified' ? 'Verified' : 'Pending check']);
    }
  } else if (section === 'contact') {
    title = 'Contact Details';
    rows = [['Email', user.email || 'Not set'], ['Phone', user.phone || 'Not set']];
  } else if (section === 'health') {
    title = 'Health Information';
    body = (
      <div className="banner banner-info" role="note">
        This app does not store your medical records. Your clinic keeps them. Only your name,
        contact details and appointment information are used here.
      </div>
    );
  } else {
    body = <p className="empty">That page does not exist. <Link to="/profile">Back to profile</Link></p>;
  }

  return (
    <AppShell title={title} backTo="/profile">
      {rows.length > 0 && (
        <dl className="details-list">
          {rows.map(([label, value]) => (
            <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
          ))}
        </dl>
      )}
      {body}
    </AppShell>
  );
}

export default ProfileSection;
