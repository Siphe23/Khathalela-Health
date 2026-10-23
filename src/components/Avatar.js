import { initials } from '../utils/format';

// A round badge with the person's initials. We use initials, not photos,
// so no personal photos need to be stored.
function Avatar({ name, size = 48 }) {
  return (
    <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.38 }} aria-hidden="true">
      {initials(name)}
    </span>
  );
}

export default Avatar;
