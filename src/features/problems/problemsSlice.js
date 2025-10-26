import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';

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
export const deleteProblem = createAsyncThunk('problems/deleteProblem', async (problemId, { rejectWithValue }) => {
  try {
    // Check if user is authenticated
    if (!auth.currentUser) {
      console.error('User not authenticated when trying to delete problem');
      throw new Error('Utilizatorul nu este autentificat. Te rugăm să te conectezi pentru a șterge probleme.');
    }

    console.log('Deleting problem with ID:', problemId, 'User:', auth.currentUser.uid);
    
    const problemRef = doc(db, 'problems', problemId);
    await deleteDoc(problemRef);
    
    console.log('Problem deleted successfully');
    return problemId;
  } catch (error) {
    console.error('Error deleting problem:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Handle specific Firebase errors
    if (error.code === 'permission-denied') {
      return rejectWithValue('Nu ai permisiuni pentru a șterge această problemă.');
    } else if (error.code === 'unauthenticated') {
      return rejectWithValue('Utilizatorul nu este autentificat. Te rugăm să te conectezi.');
    } else if (error.message.includes('insufficient permissions')) {
      return rejectWithValue('Permisiuni insuficiente. Te rugăm să te conectezi cu un cont valid.');
    } else if (error.code === 'not-found') {
      return rejectWithValue('Problema nu a fost găsită sau a fost deja ștearsă.');
    } else {
      return rejectWithValue(error.message || 'A apărut o eroare la ștergerea problemei.');
    }
  }
});

const problemsSlice = createSlice({
  name: 'problems',
  initialState: {
    value: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    addStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    addError: null,
    deleteStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    deleteError: null,
  },
  reducers: {
    clearAddStatus: (state) => {
      state.addStatus = 'idle';
      state.addError = null;
    },
    clearDeleteStatus: (state) => {
      state.deleteStatus = 'idle';
      state.deleteError = null;
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
      .addCase(deleteProblem.pending, (state) => {
        state.deleteStatus = 'loading';
        state.deleteError = null;
      })
      .addCase(deleteProblem.fulfilled, (state, action) => {
        state.deleteStatus = 'succeeded';
        state.value = state.value.filter(p => p.id !== action.payload);
      })
      .addCase(deleteProblem.rejected, (state, action) => {
        state.deleteStatus = 'failed';
        state.deleteError = action.error.message;
      });
  },
});

export const { clearAddStatus, clearDeleteStatus } = problemsSlice.actions;
export default problemsSlice.reducer; 