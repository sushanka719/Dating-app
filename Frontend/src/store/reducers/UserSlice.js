// features/onboarding/onboardingSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = "http://localhost:5000";

// Async thunk for final form submission
export const submitOnboarding = createAsyncThunk(
    'onboarding/submit',
    async (formData, thunkAPI) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/basicUserInfo`, formData, {
                withCredentials: true, // Include cookies/auth headers
            });
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

const onboardingSlice = createSlice({
    name: 'onboarding',
    initialState: {
        isLoading: false,
        success: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(submitOnboarding.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(submitOnboarding.fulfilled, (state, action) => {
                state.isLoading = false;
                state.success = true;
            })
            .addCase(submitOnboarding.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Something went wrong';
            });
    },
});

export default onboardingSlice.reducer;
