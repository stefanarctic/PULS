import { configureStore } from '@reduxjs/toolkit';
import problemsReducer from './features/problems/problemsSlice';
import grileReducer from './features/grile/grileSlice';

const store = configureStore({
  reducer: {
    problems: problemsReducer,
    grile: grileReducer,
  },
});

export default store; 