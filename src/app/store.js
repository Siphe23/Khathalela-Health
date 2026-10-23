import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import careReducer from '../features/care/careSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    care: careReducer,
  },
});

export default store;
