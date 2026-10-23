import { Link } from 'react-router-dom';
import Icon from './Icon';

// A tappable row: icon, title, small text and an arrow.
// Pass `to` for an in-app link, `href` for tel:/mailto:/web links,
// `onClick` for a button, or none of them for a plain row.
function ListRow({ icon, title, subtitle, to, href, onClick, right, tone }) {
  const interactive = Boolean(to || href || onClick);
  const content = (
    <>
      {icon && <span className={tone ? `row-icon ${tone}` : 'row-icon'}><Icon name={icon} /></span>}
      <span className="row-text">
        <strong>{title}</strong>
        {subtitle && <span>{subtitle}</span>}
      </span>
      {right || (interactive && <span className="row-arrow"><Icon name="chevron" size={18} /></span>)}
    </>
  );

  if (to) return <Link className="row" to={to}>{content}</Link>;
  if (href) return <a className="row" href={href}>{content}</a>;
  if (onClick) return <button type="button" className="row" onClick={onClick}>{content}</button>;
  return <div className="row">{content}</div>;
}

export default ListRow;
