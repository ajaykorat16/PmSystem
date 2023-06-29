import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { dispatch } from '../store';
import { isValidToken, setSession } from 'src/utils/jwt';

const initialState = {
    isLoading: false,
    error: null,
    leaves: [],
};

const slice = createSlice({
    name: 'leaves',
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

        //ADD Leave
        createLeaveSuccess(state, action) {
            state.leaves.push(action.payload);
        },
    }
});

export default slice.reducer;

export const { createLeaveSuccess } = slice.actions;


export function createLeave(leaveRecord) {
    return async () => {
        dispatch(slice.actions.startLoading());
        try {
            const accessToken = window.localStorage.getItem('accessToken');
            if (accessToken && isValidToken(accessToken)) {
                setSession(accessToken);

                const headers = {
                    Authorization: `Bearer ${accessToken}`
                };
                const { userId, reasone, startDate, endDate, type, status } = leaveRecord;
                const response = await axios.post('/leaves/createLeave', { userId, reasone, startDate, endDate, type, status }, {
                    headers: headers
                });
                const { data } = response;
                await new Promise((resolve) => setTimeout(resolve, 1000));
                dispatch(createLeaveSuccess(data.leave));
            }
        } catch (error) {
            dispatch(slice.actions.hasError(error));
        }
    };
}






