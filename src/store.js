import { configureStore } from '@reduxjs/toolkit';
import problemsReducer from './features/problems/problemsSlice';

const store = configureStore({
  reducer: {
    problems: problemsReducer,
  },
});

export default store; 