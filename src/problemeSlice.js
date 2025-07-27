import { createSlice } from '@reduxjs/toolkit';

const problemsSlice = createSlice({
  name: 'problems',
  initialState: {
    userProblems: [], // sau favorite, rezolvate etc.
    favorites: [],
  },
  reducers: {
    addProblem: (state, action) => {
      state.userProblems.push(action.payload);
    },
    removeProblem: (state, action) => {
      state.userProblems = state.userProblems.filter(
        (problem) => problem.id !== action.payload
      );
    },
    setProblems: (state, action) => {
      state.userProblems = action.payload;
    },
    setFavorites: (state, action) => {
      state.favorites = action.payload;
    },
    addFavorite: (state, action) => {
      if (!state.favorites.includes(action.payload)) {
        state.favorites.push(action.payload);
      }
    },
    removeFavorite: (state, action) => {
      state.favorites = state.favorites.filter(id => id !== action.payload);
    },
    setUserProblems: (state, action) => {
      state.userProblems = action.payload;
    },
  },
});

export const { addProblem, removeProblem, setProblems, setFavorites, addFavorite, removeFavorite, setUserProblems } = problemsSlice.actions;
export default problemsSlice.reducer;
