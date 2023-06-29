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

    addDepartmentSuccess(state, action) {
      state.departments.push(action.payload);
    },

    updateDepartmentSuccess(state, action) {
      const index = state.departments.findIndex((department) => department.id === action.payload.id);
      if (index !== -1) {
        state.departments[index] = action.payload;
      }
    },

    deleteDepartmentSuccess(state, action) {
      state.departments = state.departments.filter((department) => department.id !== action.payload);
    },
  },
});

export const {
  startLoading,
  hasError,
  getDepartmentsSuccess,
  addDepartmentSuccess,
  updateDepartmentSuccess,
  deleteDepartmentSuccess,
} = slice.actions;

export default slice.reducer;

export const getDepartments = () => async (dispatch) => {
  dispatch(startLoading());

  try {
    const accessToken = window.localStorage.getItem('accessToken');
    if (accessToken && isValidToken(accessToken)) {
      setSession(accessToken);
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };

      const response = await axios.get('/department', {
        headers: headers,
      });
      dispatch(getDepartmentsSuccess(response.data.getAllDepartments));
    }
  } catch (error) {
    dispatch(hasError(error.message));
  }
};

export const addDepartment = (name) => async (dispatch) => {
  dispatch(startLoading());
  try {
    const accessToken = window.localStorage.getItem('accessToken');
    if (accessToken && isValidToken(accessToken)) {
      setSession(accessToken);
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };

      const response = await axios.post('/department/createDepartment', { name }, {
        headers: headers,
      });
      const { data } = response;
      dispatch(addDepartmentSuccess(data.department));
    }
  } catch (error) {
    dispatch(hasError(error));
  }
};

export const updateDepartment = (name, id) => async (dispatch) => {
  dispatch(startLoading());
  try {
    const accessToken = window.localStorage.getItem('accessToken');
    if (accessToken && isValidToken(accessToken)) {
      setSession(accessToken);

      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };

      const response = await axios.put(`/department/updateDepartment/${id}`, { name }, {
        headers: headers,
      });
      const { data } = response;
      dispatch(updateDepartmentSuccess(data.updateDepartment));
    }
  } catch (error) {
    dispatch(hasError(error));
  }
};

export const deleteDepartment = (id) => async (dispatch) => {
  dispatch(startLoading());
  try {
    const accessToken = window.localStorage.getItem('accessToken');
    if (accessToken && isValidToken(accessToken)) {
      setSession(accessToken);

      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };

      await axios.delete(`/department/deleteDepartment/${id}`, {
        headers: headers,
      });
      dispatch(deleteDepartmentSuccess(id));
      dispatch(getDepartments()); 

    }
  } catch (error) {
    dispatch(hasError(error));
  }
};
