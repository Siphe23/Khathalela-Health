import { useState } from 'react';
import Icon from './Icon';

// A row that opens to show more content (used on Settings and Follow-ups)
function Collapsible({ icon, title, subtitle, right, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="collapsible">
      <button type="button" className="row" aria-expanded={open} onClick={() => setOpen(!open)}>
        {icon && <span className="row-icon"><Icon name={icon} /></span>}
        <span className="row-text">
          <strong>{title}</strong>
          {subtitle && <span>{subtitle}</span>}
        </span>
        {right}
        <span className={open ? 'row-arrow open' : 'row-arrow'}><Icon name="chevron" size={18} /></span>
      </button>
      {open && <div className="collapsible-body">{children}</div>}
    </div>
  );
}

export default Collapsible;
