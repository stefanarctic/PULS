import { configureStore } from '@reduxjs/toolkit';
import problemsReducer from './problemeSlice';

export default configureStore({
  reducer: {
    problems: problemsReducer,
  },
});

