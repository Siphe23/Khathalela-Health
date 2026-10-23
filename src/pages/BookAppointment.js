import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AppShell from '../components/AppShell';
import FormField from '../components/FormField';
import useAsyncAction from '../hooks/useAsyncAction';
import { requestAppointment, DEFAULT_CLINIC } from '../features/care/careService';
import { todayISO } from '../utils/format';

const TYPES = ['General Check-up', 'Medication Collection', 'Follow-up'];

function BookAppointment() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const { run, busy, error } = useAsyncAction();

  const [form, setForm] = useState({
    clinic: (user.details && user.details.preferredClinic) || DEFAULT_CLINIC,
    date: '',
    type: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newErrors = {};
    if (!form.clinic.trim()) newErrors.clinic = 'Please enter the clinic.';
    if (!form.date) newErrors.date = 'Please choose a date.';
    else if (form.date < todayISO()) newErrors.date = 'Please choose a date from today onwards.';
    if (!form.type) newErrors.type = 'Please choose the reason for your visit.';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const ok = await run(() => requestAppointment(user, {
      date: form.date, type: form.type, clinic: form.clinic.trim(),
    }));
    if (ok) navigate('/appointments');
  };

  return (
    <AppShell title="Book Appointment" backTo="/appointments">
      <div className="banner banner-info" role="note">
        This sends a request. Your clinic will confirm the date and time.
      </div>
      {error && <div className="banner banner-error" role="alert">{error}</div>}
      <form onSubmit={handleSubmit} noValidate>
        <FormField id="clinic" label="Clinic" value={form.clinic} onChange={handleChange} error={errors.clinic} />
        <FormField id="type" label="Reason for visit" type="select" options={TYPES}
          value={form.type} onChange={handleChange} error={errors.type} />
        <FormField id="date" label="Preferred date" type="date" value={form.date}
          onChange={handleChange} error={errors.date} />
        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Sending…' : 'Request Appointment'}
        </button>
      </form>
    </AppShell>
  );
}

export default BookAppointment;
