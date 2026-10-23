import { useSelector } from 'react-redux';

// Shows a message at the top of a screen if live data could not be loaded
function CareStatus() {
  const error = useSelector((state) => state.care.error);
  if (!error) return null;
  return <div className="banner banner-error" role="alert">{error}</div>;
}

export default CareStatus;
