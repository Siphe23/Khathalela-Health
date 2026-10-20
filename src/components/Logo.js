import { APP_NAME } from '../config/appInfo';

function Logo({ size = 48, showText = true, textSize = '1.4rem', stacked = false }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: stacked ? 'column' : 'row',
        alignItems: 'center',
        gap: stacked ? '12px' : '10px',
      }}
    >
      <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label={`${APP_NAME} logo`}>
        <circle cx="15" cy="9" r="4" fill="#174d3a" />
        <circle cx="33" cy="9" r="4" fill="#174d3a" />
        <path
          d="M24 44 C6 32 2 20 8 15 C12 12 18 14 24 22 C30 14 36 12 40 15 C46 20 42 32 24 44 Z"
          fill="#174d3a"
        />
        <circle cx="24" cy="25" r="3.5" fill="#fff" />
        <path d="M17 36 Q24 27 31 36 Q24 40 17 36 Z" fill="#fff" />
      </svg>
      {showText && (
        <span style={{ fontSize: textSize, fontWeight: 700, color: '#174d3a' }}>
          {APP_NAME}
        </span>
      )}
    </div>
  );
}

export default Logo;
