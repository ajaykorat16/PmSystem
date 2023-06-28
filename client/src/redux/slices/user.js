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

        addUserSuccess(state, action) {
            state.users.push(action.payload);
        },
    },
});

export default slice.reducer;

export const { addUserSuccess } = slice.actions;

export function addUser(user) {
    return async () => {
        dispatch(slice.actions.startLoading());
        try {
            const accessToken = window.localStorage.getItem('accessToken');
            if (accessToken && isValidToken(accessToken)) {
                setSession(accessToken);

                console.log("accessToken", accessToken)
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
