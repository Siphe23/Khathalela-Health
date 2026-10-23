// Honest label shown under screens that use fictional data
function DemoNote({ children }) {
  return (
    <p className="demo-note">
      {children || 'Demo data: all names and details on this screen are fictional.'}
    </p>
  );
}

export default DemoNote;
