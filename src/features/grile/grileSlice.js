import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

// Async thunk to fetch grile from Firestore
export const fetchGrile = createAsyncThunk('grile/fetchGrile', async () => {
  const querySnapshot = await getDocs(collection(db, 'grile'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
});

// Async thunk to add a new grila to Firestore
export const addGrila = createAsyncThunk('grile/addGrila', async (grilaData) => {
  const docRef = await addDoc(collection(db, 'grile'), grilaData);
  return { id: docRef.id, ...grilaData };
});

const grileSlice = createSlice({
  name: 'grile',
  initialState: {
    value: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    addStatus: 'idle',
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
      .addCase(fetchGrile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchGrile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const seenIds = new Set();
        const uniqueGrile = [];
        for (const grila of action.payload) {
          const grilaId = grila.id;
          if (grilaId && !seenIds.has(grilaId)) {
            seenIds.add(grilaId);
            uniqueGrile.push(grila);
          }
        }
        state.value = uniqueGrile;
      })
      .addCase(fetchGrile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addGrila.pending, (state) => {
        state.addStatus = 'loading';
        state.addError = null;
      })
      .addCase(addGrila.fulfilled, (state, action) => {
        state.addStatus = 'succeeded';
        state.value.push(action.payload);
      })
      .addCase(addGrila.rejected, (state, action) => {
        state.addStatus = 'failed';
        state.addError = action.error.message;
      });
  },
});

export const { clearAddStatus } = grileSlice.actions;

export default grileSlice.reducer;
