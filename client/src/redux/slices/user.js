import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { dispatch } from '../store';
import { isValidToken, setSession } from 'src/utils/jwt';

const initialState = {
  isLoading: false,
  error: null,
  users: [],
};

const slice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // START LOADING
    startLoading(state) {
      state.isLoading = true;
    },

    // HAS ERROR
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    //ADD USER
    addUserSuccess(state, action) {
      state.users.push(action.payload);
    },

    //UPDATE USER PROFILE
    updateUserSuccess(state, action) {
      state.users.pull(action.payload);
      state.users.push(action.payload);
    },
  },
});

export default slice.reducer;

export const { addUserSuccess, updateUserSuccess } = slice.actions;

export function addUser(user) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const accessToken = window.localStorage.getItem('accessToken');
      if (accessToken && isValidToken(accessToken)) {
                setSession(accessToken);

        const headers = {
          Authorization: `Bearer ${accessToken}`
        };
        const { firstname, lastname, email, phone, address, department, dateOfBirth, dateOfJoining, password } = user;
        const response = await axios.post('/user/adduser', { firstname, lastname, email, phone, address, department, dateOfBirth, dateOfJoining, password }, {
          headers: headers
        });
        const { data } = response;
        await new Promise((resolve) => setTimeout(resolve, 1000));
        dispatch(addUserSuccess(data.user));
      }
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function upadteUserProfile(user) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const accessToken = window.localStorage.getItem('accessToken');
      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken);

        const headers = {
          Authorization: `Bearer ${accessToken}`
        };

        const { firstname, lastname, email, phone, address, department, dateOfBirth, dateOfJoining, password } = user;

        const updateUserData = new FormData()
        updateUserData.append("firstname", firstname)
        updateUserData.append("lastname", lastname)
        updateUserData.append("email", email)
        updateUserData.append("phone", phone)
        updateUserData.append("address", address)
        updateUserData.append("department", department)
        updateUserData.append("dateOfBirth", dateOfBirth)
        updateUserData.append("dateOfJoining", dateOfJoining)
        updateUserData.append("password", password)

        const response = await axios.put('/user/updateProfile', updateUserData, {
          headers: headers,
        });
        const { data } = response;
        dispatch(slice.actions.updateUserSuccess(data.user));
      }
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}





