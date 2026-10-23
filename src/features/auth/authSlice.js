import { createSlice } from '@reduxjs/toolkit';

// Only what the screens need. Never passwords or medical information.
const initialState = {
  user: null,              // { uid, email, displayName, role, verificationStatus, details }
  isAuthenticated: false,
  loading: false,
  error: null,
  authInitialized: false,  // false until Firebase has told us who (if anyone) is signed in
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authRequested(state) {
      state.loading = true;
      state.error = null;
    },
    authSucceeded(state, action) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      state.authInitialized = true;
    },
    authFinished(state) {
      state.loading = false;
    },
    authFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    // Dispatched by the Firebase listener (page refresh, sign in, sign out)
    authStateChanged(state, action) {
      state.user = action.payload;
      state.isAuthenticated = Boolean(action.payload);
      state.authInitialized = true;
      state.loading = false;
    },
    loggedOut(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
});

export const {
  authRequested, authSucceeded, authFinished, authFailed,
  authStateChanged, loggedOut, clearError,
} = authSlice.actions;

export default authSlice.reducer;