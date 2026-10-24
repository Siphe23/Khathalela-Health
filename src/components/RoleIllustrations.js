// Drawn placeholder pictures for the role cards. Replace by setting
// `image` in src/config/roles.js to your own picture.
export function PatientIllustration() {
  return (
    <svg viewBox="0 0 96 96" aria-hidden="true">
      <rect width="96" height="96" fill="#e6f0e8" />
      <path d="M14 96 Q14 60 48 60 Q82 60 82 96 Z" fill="#d9ae58" />
      <circle cx="48" cy="38" r="15" fill="#8a5a3c" />
      <path d="M31 36 Q32 14 48 14 Q64 14 65 36 Q48 26 31 36 Z" fill="#174d3a" />
      <path d="M48 84 C38 77 36 70 41 68 C44 67 48 69 48 72 C48 69 52 67 55 68 C60 70 58 77 48 84 Z" fill="#174d3a" />
    </svg>
  );
}

export function WorkerIllustration() {
  return (
    <svg viewBox="0 0 96 96" aria-hidden="true">
      <rect width="96" height="96" fill="#e6f0e8" />
      <path d="M12 96 Q12 58 48 58 Q84 58 84 96 Z" fill="#ffffff" stroke="#174d3a" strokeWidth="3" />
      <path d="M38 59 L48 76 L58 59" fill="#174d3a" />
      <circle cx="48" cy="36" r="15" fill="#6b4430" />
      <path d="M32 34 Q34 16 48 16 Q62 16 64 34 Q48 26 32 34 Z" fill="#26332d" />
      <rect x="66" y="74" width="4" height="14" rx="1" fill="#174d3a" />
      <rect x="61" y="79" width="14" height="4" rx="1" fill="#174d3a" />
      <path d="M30 62 Q28 84 40 84" stroke="#d9ae58" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function AdminIllustration() {
  return (
    <svg viewBox="0 0 96 96" aria-hidden="true">
      <rect width="96" height="96" fill="#e6f0e8" />
      <path d="M48 12 L78 24 V46 C78 64 64 77 48 84 C32 77 18 64 18 46 V24 Z" fill="#174d3a" />
      <path d="M48 24 V70 C37 64 28 55 28 46 V31 Z" fill="#1f6149" />
      <path d="M34 47 L44 57 L63 36" fill="none" stroke="#d9ae58" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function RoleImage({ role }) {
  if (role.image) {
    return <img src={role.image} alt="" className="role-img" />;
  }
  if (role.id === 'admin') return <AdminIllustration />;
  return role.id === 'worker' ? <WorkerIllustration /> : <PatientIllustration />;
}
