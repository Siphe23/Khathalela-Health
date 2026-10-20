// One reusable text box or dropdown with label, hint and error message.
function FormField({
  id, label, type = 'text', value, onChange, error, hint,
  options = [], autoComplete, inputMode, optional = false,
}) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const shared = {
    id,
    name: id,
    value,
    onChange,
    'aria-invalid': error ? 'true' : 'false',
    'aria-describedby': describedBy,
  };

  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {optional && <span className="optional"> (optional)</span>}
      </label>

      {type === 'select' ? (
        <select {...shared}>
          <option value="">Select…</option>
          {options.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input {...shared} type={type} autoComplete={autoComplete} inputMode={inputMode} />
      )}

      {hint && !error && <p id={`${id}-hint`} className="field-hint">{hint}</p>}
      {error && <p id={`${id}-error`} className="field-error" role="alert">{error}</p>}
    </div>
  );
}

export default FormField;
