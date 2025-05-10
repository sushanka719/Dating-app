// redux/slices/settingSlice.js
import { createSlice, createAsyncThunk, isRejected } from '@reduxjs/toolkit';
import axios from 'axios';


// Async thunk to update settings on the server
export const updateSettings = createAsyncThunk(
    'settings/update',
    async (settingsData, { rejectWithValue }) => {
        try {
            const response = await axios.patch('http://localhost:5000/api/settings', settingsData, {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            });
            return response.data.user;
        } catch (error) {
            return rejectWithValue(error.response.data.message || 'Failed to update settings');
        }
    }
);

//async thunk to get the user data from the server 

export const fetchSettings = createAsyncThunk(
    'setthing/fetch',
    async (_, {rejectWithValue}) => {
        try {
            console.log('fetching settings')
            const response = await axios.get('http://localhost:5000/api/profile', {withCredentials: true})
            console.log(response.data.user, "from settings fetch form porfile")
            return response.data.user;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "failed to fetch settings"
            )
        }
    }
)

const initialState = {
    snoozeMode: false,
    interestedIn: 'everyone',
    ageRange: [18, 60],
    connectionType: 'date',
    loading: false,
    error: null,
};

const settingSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setSnoozeMode: (state, action) => {
            state.snoozeMode = action.payload;
        },
        setInterestedIn: (state, action) => {
            state.interestedIn = action.payload;
        },
        setAgeRange: (state, action) => {
            state.ageRange = action.payload;
        },
        setConnectionType: (state, action) => {
            state.connectionType = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(updateSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateSettings.fulfilled, (state, action) => {
                const updated = action.payload;
                state.snoozeMode = updated.snoozeMode;
                state.interestedIn = updated.interestedIn;
                state.ageRange = [updated.preferences?.minAge || 18, updated.preferences?.maxAge || 50];
                state.connectionType = updated.lookingfor;
                state.loading = false;
            })
            .addCase(updateSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSettings.fulfilled, (state, action) => {
                const user = action.payload;

                state.snoozeMode = user.snoozeMode;
                state.interestedIn = user.interestedIn;
                state.connectionType = user.lookingfor;

                // Derived ageRange
                state.ageRange = [
                    user.preferences?.minAge || 18,
                    user.preferences?.maxAge || 50
                ];
                state.loading = false;
            })
            .addCase(fetchSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const {
    setSnoozeMode,
    setInterestedIn,
    setAgeRange,
    setConnectionType,
} = settingSlice.actions;

export default settingSlice.reducer;
