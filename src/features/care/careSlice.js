import { createSlice } from '@reduxjs/toolkit';

// The lists below are filled by Firestore listeners (components/CareSync.js).
// Pages only READ them. To change data, pages call careService.js and Firestore
// sends the new list back automatically, on every device.
const emptyLists = () => ({
  users: [], // only filled for administrators
  patients: [],
  slots: [],
  doseLogs: [],
  helpRequests: [],
  appointments: [],
  medications: [],
  notes: [],
  loaded: { users: false, slots: false, doseLogs: false, helpRequests: false, patients: false, appointments: false, medications: false, notes: false },
  error: null,
});

const initialState = {
  ...emptyLists(),
  settings: {
    language: 'English',
    notifications: { appointments: true, medication: true },
  },
};

const careSlice = createSlice({
  name: 'care',
  initialState,
  reducers: {
    collectionLoaded(state, action) {
      const { name, items } = action.payload;
      state[name] = items;
      state.loaded[name] = true;
      state.error = null;
    },
    careError(state, action) {
      state.error = action.payload;
    },
    // On sign-out or when a different person signs in: forget the old lists
    clearCare(state) {
      Object.assign(state, emptyLists());
    },
    setLanguage(state, action) {
      state.settings.language = action.payload;
    },
    toggleNotification(state, action) {
      const key = action.payload;
      state.settings.notifications[key] = !state.settings.notifications[key];
    },
  },
});

export const { collectionLoaded, careError, clearCare, setLanguage, toggleNotification } = careSlice.actions;
export default careSlice.reducer;
