export function HealthIllustration() {
  return (
    <svg viewBox="0 0 280 220" role="img" aria-label="A heart with a medical cross over green hills">
      <circle cx="140" cy="100" r="85" fill="#e6f0e8" />
      <path d="M0 200 Q70 150 140 185 T280 170 V220 H0 Z" fill="#a8c8ae" />
      <path d="M0 215 Q90 180 180 205 T280 195 V220 H0 Z" fill="#174d3a" opacity="0.85" />
      <path
        d="M140 150 C90 115 80 70 112 58 C128 52 140 62 140 72 C140 62 152 52 168 58 C200 70 190 115 140 150 Z"
        fill="#174d3a"
      />
      <rect x="134" y="82" width="12" height="36" rx="3" fill="#fff" />
      <rect x="122" y="94" width="36" height="12" rx="3" fill="#fff" />
    </svg>
  );
}

export function ScheduleIllustration() {
  return (
    <svg viewBox="0 0 280 220" role="img" aria-label="A calendar with a tick and a medication pill">
      <circle cx="140" cy="105" r="85" fill="#e6f0e8" />
      <rect x="62" y="48" width="130" height="128" rx="14" fill="#fff" stroke="#174d3a" strokeWidth="4" />
      <rect x="62" y="48" width="130" height="34" rx="14" fill="#174d3a" />
      <rect x="62" y="68" width="130" height="14" fill="#174d3a" />
      <circle cx="94" cy="104" r="5" fill="#a8c8ae" />
      <circle cx="127" cy="104" r="5" fill="#a8c8ae" />
      <circle cx="160" cy="104" r="5" fill="#a8c8ae" />
      <circle cx="94" cy="134" r="5" fill="#a8c8ae" />
      <circle cx="127" cy="134" r="16" fill="#174d3a" />
      <path d="M119 134 L125 140 L136 128" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <g transform="rotate(-35 205 150)">
        <rect x="178" y="138" width="54" height="26" rx="13" fill="#d9ae58" />
        <rect x="205" y="138" width="27" height="26" rx="13" fill="#fff" stroke="#d9ae58" strokeWidth="3" />
      </g>
    </svg>
  );
}

export function ConnectIllustration() {
  return (
    <svg viewBox="0 0 280 220" role="img" aria-label="A patient and a nurse connected by a heart">
      <circle cx="140" cy="105" r="85" fill="#e6f0e8" />
      {/* Patient */}
      <circle cx="80" cy="95" r="20" fill="#8a5a3c" />
      <path d="M48 170 Q48 125 80 125 Q112 125 112 170 Z" fill="#d9ae58" />
      {/* Nurse */}
      <circle cx="200" cy="95" r="20" fill="#6b4430" />
      <path d="M168 170 Q168 125 200 125 Q232 125 232 170 Z" fill="#fff" stroke="#174d3a" strokeWidth="3" />
      <rect x="196" y="138" width="8" height="22" rx="2" fill="#174d3a" />
      <rect x="189" y="145" width="22" height="8" rx="2" fill="#174d3a" />
      {/* Connection */}
      <path d="M104 100 Q140 60 176 100" stroke="#174d3a" strokeWidth="3" strokeDasharray="6 6" fill="none" />
      <path
        d="M140 112 C124 100 122 86 131 82 C136 80 140 83 140 87 C140 83 144 80 149 82 C158 86 156 100 140 112 Z"
        fill="#174d3a"
      />
    </svg>
  );
}
