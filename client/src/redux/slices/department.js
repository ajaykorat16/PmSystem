import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { isValidToken, setSession } from 'src/utils/jwt';


const initialState = {
  isLoading: false,
  error: null,
  departments: [],
};

const slice = createSlice({
  name: 'department',
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },

    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    getDepartmentsSuccess(state, action) {
      state.isLoading = false;
      state.departments = action.payload;
    },
  },
});

export const { startLoading, hasError, getDepartmentsSuccess } = slice.actions;

export default slice.reducer;

export const getDepartments = () => async (dispatch) => {
  dispatch(startLoading());

  try {
    const accessToken = window.localStorage.getItem('accessToken');
    if (accessToken && isValidToken(accessToken)) {
      setSession(accessToken);
      const headers = {
        Authorization: `Bearer ${accessToken}`
      };
      const response = await axios.get('/department', {
        headers: headers
      });
      dispatch(getDepartmentsSuccess(response.data.getAllDepartments));
    }
  } catch (error) {
    dispatch(hasError(error.message));
  }
};
