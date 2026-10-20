// One place that describes every role and the EXTRA form fields it needs.
// The Register page reads this list and builds the form from it,
// so adding a new role later means adding an object here, not a new page.

export const LANGUAGES = [
  'English', 'isiZulu', 'isiXhosa', 'Afrikaans', 'Sesotho', 'Setswana',
  'Sepedi', 'Xitsonga', 'Tshivenda', 'siSwati', 'isiNdebele',
];

export const ROLES = {
  patient: {
    id: 'patient',
    label: 'Patient',
    description: 'Manage your appointments, medication and health.',
    // To use your own picture: import it at the top of this file, e.g.
    //   import patientImg from '../assets/images/patient.png';
    // then set  image: patientImg  below. Leave null to use the drawn picture.
    image: null,
    fields: [
      { name: 'preferredLanguage', label: 'Preferred language', type: 'select', options: LANGUAGES, required: true },
      { name: 'preferredClinic', label: 'Preferred clinic', type: 'text', required: false, hint: 'For example: Mthatha Clinic' },
    ],
  },
  worker: {
    id: 'worker',
    label: 'Healthcare Worker',
    description: 'View appointments, track follow-ups and more.',
    image: null,
    fields: [
      {
        name: 'jobTitle', label: 'Job title', type: 'select', required: true,
        options: ['Nurse', 'Doctor', 'Community Health Worker', 'Pharmacist', 'Clinic Administrator', 'Other'],
      },
      { name: 'facilityName', label: 'Clinic or facility', type: 'text', required: true },
      {
        name: 'registrationNumber', label: 'Professional registration number', type: 'text', required: true,
        hint: 'For example your SANC or HPCSA number. We check it before giving you worker access.',
        pattern: /^[A-Za-z0-9/-]{4,20}$/,
        patternMessage: 'Use 4 to 20 letters, numbers, / or - only.',
      },
    ],
  },
};

export const isValidRole = (role) => Object.prototype.hasOwnProperty.call(ROLES, role);
