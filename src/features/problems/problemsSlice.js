import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

// Async thunk to fetch problems from Firestore
export const fetchProblems = createAsyncThunk('problems/fetchProblems', async () => {
  const querySnapshot = await getDocs(collection(db, 'problems'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
});

// Async thunk to add a new problem to Firestore
export const addProblem = createAsyncThunk('problems/addProblem', async (problemData) => {
  const docRef = await addDoc(collection(db, 'problems'), problemData);
  return { id: docRef.id, ...problemData };
});

// Async thunk to delete a problem from Firestore
export const deleteProblem = createAsyncThunk('problems/deleteProblem', async (problemId) => {
  const problemRef = doc(db, 'problems', problemId);
  await deleteDoc(problemRef);
  return problemId;
});

const problemsSlice = createSlice({
  name: 'problems',
  initialState: {
    value: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    addStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    addError: null,
  },
  reducers: {
    clearAddStatus: (state) => {
      state.addStatus = 'idle';
      state.addError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch problems
      .addCase(fetchProblems.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProblems.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.value = action.payload;
      })
      .addCase(fetchProblems.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // Add problem
      .addCase(addProblem.pending, (state) => {
        state.addStatus = 'loading';
        state.addError = null;
      })
      .addCase(addProblem.fulfilled, (state, action) => {
        state.addStatus = 'succeeded';
        state.value.push(action.payload);
      })
      .addCase(addProblem.rejected, (state, action) => {
        state.addStatus = 'failed';
        state.addError = action.error.message;
      })
      // Delete problem
      .addCase(deleteProblem.fulfilled, (state, action) => {
        state.value = state.value.filter(p => p.id !== action.payload);
      });
  },
});

export const { clearAddStatus } = problemsSlice.actions;
export default problemsSlice.reducer; 