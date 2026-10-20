// A "thunk" is just a function that returns an async function. Redux Toolkit
// already supports them. We use plain thunks (not createAsyncThunk) on purpose:
// createAsyncThunk puts the arguments, including the password, inside the
// actions that Redux DevTools displays. This way the password only ever
// travels to Firebase and is never part of a Redux action or state.
import * as authService from './authService';
import { getAuthErrorMessage } from './authErrors';
import { authRequested, authSucceeded, authFinished, authFailed, loggedOut } from './authSlice';

export const register = (data) => async (dispatch) => {
  dispatch(authRequested());
  try {
    const user = await authService.registerUser(data);
    dispatch(authSucceeded(user));
    return true;
  } catch (error) {
    dispatch(authFailed(getAuthErrorMessage(error)));
    return false;
  }
};

export const login = (email, password) => async (dispatch) => {
  dispatch(authRequested());
  try {
    const user = await authService.loginUser(email, password);
    dispatch(authSucceeded(user));
    return true;
  } catch (error) {
    dispatch(authFailed(getAuthErrorMessage(error)));
    return false;
  }
};

export const logout = () => async (dispatch) => {
  dispatch(authRequested());
  try {
    await authService.logoutUser();
    dispatch(loggedOut());
    return true;
  } catch (error) {
    dispatch(authFailed('We could not log you out. Please try again.'));
    return false;
  }
};

export const requestPasswordReset = (email) => async (dispatch) => {
  dispatch(authRequested());
  try {
    await authService.sendResetEmail(email);
  } catch (error) {
    // Never reveal whether an email has an account: treat "no such user" like success.
    if (!error || error.code !== 'auth/user-not-found') {
      dispatch(authFailed(getAuthErrorMessage(error)));
      return false;
    }
  }
  dispatch(authFinished());
  return true;
};
