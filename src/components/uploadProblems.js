// uploadProblems.js
import { problemeData } from '../components/problemedata.js';
import { db } from '../lib/firebase.js';
import { collection, addDoc } from 'firebase/firestore';

// Make sure to only call this one time
async function uploadProblems() {
  for (const problem of problemeData) {
    try {
      await addDoc(collection(db, 'problems'), problem);
      console.log(`Added problem: ${problem.titlu}`);
    } catch (error) {
      console.error('Error adding problem:', problem.titlu, error);
    }
  }
}

export default uploadProblems;