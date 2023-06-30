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

        //GET ALL LEAVES
        getLeavesSuccess(state, action) {
            state.isLoading = false;
            state.leaves = action.payload;
        },

        //DELETE LEAVES
        deleteLeavesSuccess(state, action) {
            state.leaves = state.leaves.filter((leave) => leave.id !== action.payload);
        },
    }
});

export default slice.reducer;

export const { createLeaveSuccess, getLeavesSuccess, deleteLeavesSuccess } = slice.actions;


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
            dispatch(slice.actions.startLoading());
        }
    };
}

export const getLeaves = () => async (dispatch) => {
    dispatch(slice.actions.startLoading());

    try {
        const accessToken = window.localStorage.getItem('accessToken');
        if (accessToken && isValidToken(accessToken)) {
            setSession(accessToken);
            const headers = {
                Authorization: `Bearer ${accessToken}`,
            };

            const response = await axios.get('/leaves', {
                headers: headers,
            });
            dispatch(getLeavesSuccess(response.data.leaves));
        }
    } catch (error) {
        dispatch(slice.actions.startLoading());
    }
};


export function deleteLeave(userId) {
    return async () => {
        dispatch(slice.actions.startLoading());
        try {
            const accessToken = window.localStorage.getItem('accessToken');
            if (accessToken && isValidToken(accessToken)) {
                setSession(accessToken);

                const headers = {
                    Authorization: `Bearer ${accessToken}`
                };

                await axios.delete(`/leaves/deleteLeave/${userId}`, { headers: headers });
                console.log("hello")
                dispatch(deleteLeavesSuccess(userId));
                dispatch(getLeaves());

            }
        } catch (error) {
            dispatch(slice.actions.hasError(error));
        }
    };
}






