import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch paginated user data
export const fetchUsers = createAsyncThunk(
    'userFeed/fetchUsers',
    async ({ page, limit = 4, filters }, { rejectWithValue }) => {
        try {
            const response = await axios.get('http://localhost:5000/api/users', {
                params: {
                    page,
                    limit,
                    ...filters,
                },
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
        }
    }
);

// Async thunk to send user reactions
export const sendReaction = createAsyncThunk(
    'userFeed/sendReaction',
    async ({ targetUserId, action }, { rejectWithValue }) => {
        try {
            await axios.post(
                'http://localhost:5000/api/userReaction',
                { targetUserId, action },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true,
                }
            );
            return { targetUserId, action };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || `Failed to send ${action}`);
        }
    }
);

const initialState = {
    users: [],
    currentUserIndex: 0,
    page: 2,
    loading: false,
    fetchingMore: false,
    error: null,
    match: null,
};

const userFeedSlice = createSlice({
    name: 'userFeed',
    initialState,
    reducers: {
        moveToNextUser: (state) => {
            if (state.currentUserIndex + 1 >= state.users.length) {
                state.page += 1;
                state.currentUserIndex = null; // Reset index until new fetch
            } else {
                state.currentUserIndex += 1;
            }
        },
        resetFeed: (state) => {
            state.users = [];
            state.currentUserIndex = 0;
            state.page = 2;
            state.error = null;
            state.match = null;
        },
        setMatch: (state, action) => {
            state.match = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Users
            .addCase(fetchUsers.pending, (state) => {
                if (state.users.length === 0) {
                    state.loading = true;
                } else {
                    state.fetchingMore = true;
                }
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                const mappedUsers = action.payload.users.map(user => ({
                    id: user._id || Math.random().toString(36).substr(2, 9),
                    name: user.name,
                    age: user.age,
                    location: `${user.location.city}, ${user.location.country}`,
                    height: `${user.height} cm`,
                    zodiac: user.politics || 'Not specified',
                    smoking: user.smoking === 'yes' ? 'Occasionally' : 'Never',
                    gender: user.gender.charAt(0).toUpperCase() + user.gender.slice(1),
                    lookingFor: user.interestedIn === 'everyone'
                        ? 'Something casual'
                        : `Interested in ${user.interestedIn}`,
                    children: user.kids === 'no'
                        ? "Don't want"
                        : user.kids === 'yes'
                            ? 'Want'
                            : 'Maybe',
                    bio: user.bio,
                    images: user.profilePics.length > 0
                        ? user.profilePics
                        : ['https://via.placeholder.com/512'],
                    interests: user.interests || [],
                }));

                state.users = mappedUsers;
                state.currentUserIndex = 0;
                state.loading = false;
                state.fetchingMore = false;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.fetchingMore = false;
                state.error = action.payload;
            })

            // Send Reaction
            .addCase(sendReaction.pending, (state) => {
                state.error = null;
            })
            .addCase(sendReaction.fulfilled, (state, action) => {
                console.log(`${action.payload.action} sent for user ${action.payload.targetUserId}`);
            })
            .addCase(sendReaction.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const { moveToNextUser, resetFeed, setMatch } = userFeedSlice.actions;
export default userFeedSlice.reducer;
