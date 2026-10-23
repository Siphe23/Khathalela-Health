function Switch({ checked, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label}
      className={checked ? 'switch on' : 'switch'} onClick={onChange}>
      <span className="switch-knob" />
    </button>
  );
}

export default Switch;
