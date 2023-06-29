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

    //UPDDATE USER PROFILE BY ADMIN
    updateUserByAdminSuccess(state, action) {
      state.users.pull(action.payload);
      state.users.push(action.payload);
    },

    //GET ALL USERS
    getUsersSuccess(state, action) {
      state.isLoading = false;
      state.users = action.payload;
    },

    //DELETE USER
    deleteUserSuccess(state, action) {
        state.users = state.users.filter((user) => user.id !== action.payload);
    },

    //GET USER PROFILE BY ADMIN
    getUserByAdminSuccess(state, action) {
      state.users = state.users.filter((user) => user.id !== action.payload);
  },  },
});

export default slice.reducer;

export const { addUserSuccess, updateUserSuccess, getUsersSuccess, deleteUserSuccess, getUserByAdminSuccess, updateUserByAdminSuccess } = slice.actions;

export const getUsers = () => async (dispatch) => {
  dispatch(slice.actions.startLoading());

  try {
    const accessToken = window.localStorage.getItem('accessToken');
    if (accessToken && isValidToken(accessToken)) {
      setSession(accessToken);

      const headers = {
        Authorization: `Bearer ${accessToken}`
      };

      const response = await axios.get('/user', {
        headers: headers
      });
      dispatch(getUsersSuccess(response.data.getAllUsers));
    }
  } catch (error) {
    dispatch(slice.actions.hasError(error));
  }
};


export const getUserByAdmin = (id) => async (dispatch) => {
  dispatch(slice.actions.startLoading());

  try {
    const accessToken = window.localStorage.getItem('accessToken');
    if (accessToken && isValidToken(accessToken)) {
      setSession(accessToken);

      const headers = {
        Authorization: `Bearer ${accessToken}`
      };

      const response = await axios.get(`/user/getUserProfile/${id}`, {
        headers: headers
      });
      dispatch(getUserByAdminSuccess(response.data.getProfile));
    }
  } catch (error) {
    dispatch(slice.actions.hasError(error));
  }
};


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


export function upadteUserProfileByAdmin(id, user) {
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

        const response = await axios.put(`/user/updateProfile/${id}`, updateUserData, {
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


export function deleteUser(userId) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const accessToken = window.localStorage.getItem('accessToken');
      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken);

        const headers = {
          Authorization: `Bearer ${accessToken}`
        };

        await axios.delete(`/user/deleteProfile/${userId}`, { headers: headers });
        await axios.get('/user', { headers: headers });
        dispatch(deleteUserSuccess(userId));
        dispatch(getUsers()); 
        
      }
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}





