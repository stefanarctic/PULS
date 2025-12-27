import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc, getDoc, query, where } from 'firebase/firestore';
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

// Async thunk to update a problem in Firestore
export const updateProblem = createAsyncThunk('problems/updateProblem', async ({ problemId, problemData }, { rejectWithValue }) => {
  try {
    // Check if user is authenticated
    if (!auth.currentUser) {
      throw new Error('Utilizatorul nu este autentificat. Te rugăm să te conectezi pentru a modifica probleme.');
    }

    // Verify user is admin
    const userRef = doc(db, 'users', auth.currentUser.uid);
    const userSnap = await getDoc(userRef);
    const isAdmin = userSnap.exists() && userSnap.data().isAdmin === true;

    if (!isAdmin) {
      return rejectWithValue('Nu ai permisiuni pentru a modifica această problemă. Doar administratorii pot modifica probleme.');
    }

    // Update the document
    const problemRef = doc(db, 'problems', problemId);
    await updateDoc(problemRef, problemData);

    // Fetch the updated document to return complete data
    const updatedSnap = await getDoc(problemRef);
    if (!updatedSnap.exists()) {
      throw new Error('Problema nu a fost găsită după actualizare.');
    }
    
    return { id: problemId, ...updatedSnap.data() };
  } catch (error) {
    console.error('Error updating problem:', error);
    if (error.code === 'permission-denied') {
      return rejectWithValue('Nu ai permisiuni pentru a modifica această problemă. Verifică că ești conectat ca administrator.');
    } else if (error.code === 'unauthenticated') {
      return rejectWithValue('Utilizatorul nu este autentificat. Te rugăm să te conectezi.');
    } else {
      return rejectWithValue(error.message || 'A apărut o eroare la modificarea problemei.');
    }
  }
});

// Async thunk to delete a problem from Firestore
export const deleteProblem = createAsyncThunk('problems/deleteProblem', async (problemIdentifier, { rejectWithValue }) => {
  try {
    // Check if user is authenticated
    if (!auth.currentUser) {
      console.error('User not authenticated when trying to delete problem');
      throw new Error('Utilizatorul nu este autentificat. Te rugăm să te conectezi pentru a șterge probleme.');
    }

    // Handle both string ID and object with id/index
    const problemId = typeof problemIdentifier === 'string' ? problemIdentifier : problemIdentifier.id;
    const problemIndex = typeof problemIdentifier === 'object' ? problemIdentifier.index : null;
    
    console.log('Deleting problem with ID:', problemId, 'Index:', problemIndex, 'User:', auth.currentUser.uid);
    console.log('User email:', auth.currentUser.email);
    
    // Verify user is admin by checking Firestore
    const userRef = doc(db, 'users', auth.currentUser.uid);
    const userSnap = await getDoc(userRef);
    const isAdmin = userSnap.exists() && userSnap.data().isAdmin === true;
    console.log('User isAdmin status:', isAdmin);
    
    if (!isAdmin) {
      console.error('User is not admin, cannot delete problem');
      return rejectWithValue('Nu ai permisiuni pentru a șterge această problemă. Doar administratorii pot șterge probleme.');
    }
    
    // First, try to find the document by ID
    let problemRef = doc(db, 'problems', problemId);
    let problemSnap = await getDoc(problemRef);
    
      // If document doesn't exist with that ID, try to find it by index
      if (!problemSnap.exists()) {
        console.log(`Document with ID "${problemId}" not found, searching by index...`);
        
        const problemsCollection = collection(db, 'problems');
        let indexToSearch = problemIndex;
        
        // If we don't have index from parameter, try to extract it from problemId
        if (!indexToSearch && typeof problemId === 'string' && problemId.startsWith('bac-')) {
          const indexMatch = problemId.match(/bac-(\d+)/);
          if (indexMatch) {
            indexToSearch = parseInt(indexMatch[1]);
          }
        }
        
        // If still no index, try parsing problemId as number
        if (!indexToSearch) {
          const parsedIndex = parseInt(problemId);
          if (!isNaN(parsedIndex)) {
            indexToSearch = parsedIndex;
          }
        }
        
        if (indexToSearch !== null && indexToSearch !== undefined) {
          console.log(`Searching for problem with index: ${indexToSearch}`);
          const q = query(problemsCollection, where('index', '==', indexToSearch));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            // Found it! Use the first matching document
            const foundDoc = querySnapshot.docs[0];
            problemRef = doc(db, 'problems', foundDoc.id);
            problemSnap = foundDoc;
            console.log(`Found document with Firestore ID: ${foundDoc.id}, index: ${indexToSearch}`);
          } else {
            console.error(`No document found with index: ${indexToSearch}`);
          }
        }
        
        // If still not found, return error
        if (!problemSnap.exists()) {
          console.error('Document does not exist with ID or index:', problemId, problemIndex);
          return rejectWithValue(`Problema cu ID-ul "${problemId}" (index: ${problemIndex || 'N/A'}) nu există în baza de date.`);
        }
      }
    
    console.log('Document found, deleting...', problemSnap.data());
    console.log('Firestore document ID:', problemRef.id);
    
    // Delete the document using the correct Firestore document ID
    await deleteDoc(problemRef);
    
    // Verify deletion by checking if document still exists
    const verifySnap = await getDoc(problemRef);
    if (verifySnap.exists()) {
      console.error('Document still exists after deletion!');
      return rejectWithValue('Eroare: Problema nu a fost ștearsă din baza de date. Te rugăm să încerci din nou.');
    }
    
    console.log('Problem deleted successfully from Firestore and verified');
    return problemRef.id; // Return the actual Firestore document ID
  } catch (error) {
    console.error('Error deleting problem:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Handle specific Firebase errors
    if (error.code === 'permission-denied') {
      return rejectWithValue('Nu ai permisiuni pentru a șterge această problemă. Verifică că ești conectat ca administrator.');
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
    updateStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    updateError: null,
    deleteStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    deleteError: null,
  },
  reducers: {
    clearAddStatus: (state) => {
      state.addStatus = 'idle';
      state.addError = null;
    },
    clearUpdateStatus: (state) => {
      state.updateStatus = 'idle';
      state.updateError = null;
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
      // Update problem
      .addCase(updateProblem.pending, (state) => {
        state.updateStatus = 'loading';
        state.updateError = null;
      })
      .addCase(updateProblem.fulfilled, (state, action) => {
        state.updateStatus = 'succeeded';
        const index = state.value.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.value[index] = action.payload;
        }
      })
      .addCase(updateProblem.rejected, (state, action) => {
        state.updateStatus = 'failed';
        state.updateError = action.error.message;
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

export const { clearAddStatus, clearUpdateStatus, clearDeleteStatus } = problemsSlice.actions;
export default problemsSlice.reducer; 