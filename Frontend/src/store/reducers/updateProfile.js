import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

export const submitUserData = createAsyncThunk(
    'onboarding/submit',
    async (formData, thunkAPI) => {
        try {
            const response = await axios.patch(`${API_BASE_URL}/api/update-profile`, formData, {
                withCredentials: true, // Include cookies/auth headers
            });
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);


const updateProfileSlice = createSlice({
    name: 'updateProfile',
    initialState: {
        isLoading: false,
        success: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(submitUserData.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(submitUserData.fulfilled, (state, action) => {
                state.isLoading = false;
                state.success = true;
            })
            .addCase(submitUserData.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Something went wrong';
            });
    }
})

export default updateProfileSlice.reducer;