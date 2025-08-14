import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

// Thunk to fetch matched users
export const getMatches = createAsyncThunk(
    'chat/getMatches',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/matches`, {
                withCredentials: true,
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch matches'
            );
        }
    }
);

// Thunk to fetch messages with all matches
export const getMessagesWithUser = createAsyncThunk(
    'chat/getMessagesWithUser',
    async (_, { rejectWithValue }) => {
        try {
            console.log('Fetching chats');
            const response = await axios.get(`${API_BASE_URL}/api/matchesChat`, {
                withCredentials: true,
            });
            console.log('Matches chats data:', response.data);

            // ✅ Normalize `seenAt` into ISO strings to avoid Date objects in Redux state
            const normalized = response.data.map(match => ({
                ...match,
                chats: match.chats.map(chat => ({
                    ...chat,
                    seenAt: chat.seenAt ? new Date(chat.seenAt).toISOString() : null
                }))
            }));

            return normalized;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch messages'
            );
        }
    }
);

const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        matches: [],
        messages: {}, // { [matchId]: [messages] }
        isLoading: false,
        error: null,
        selectedUserId: '',
    },
    reducers: {
        setSelectedUser: (state, action) => {
            console.log('Selected user ID:', action.payload);
            state.selectedUserId = action.payload;
        },
        clearSelectedUser: (state) => {
            state.selectedUserId = '';
        },
        addMessage: (state, action) => {
            const { matchId, message } = action.payload;
            if (!state.messages[matchId]) {
                state.messages[matchId] = [];
            }
            state.messages[matchId].push({
                ...message,
                seenAt: message.seenAt ? new Date(message.seenAt).toISOString() : null
            });
        },
        markMessageAsSeen: (state, action) => {
            const { matchId, messageId } = action.payload;
            if (state.messages[matchId]) {
                state.messages[matchId] = state.messages[matchId].map((msg) =>
                    msg._id === messageId
                        ? { ...msg, seen: true, seenAt: new Date().toISOString() } // ✅ store as ISO string
                        : msg
                );
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getMatches.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getMatches.fulfilled, (state, action) => {
                state.isLoading = false;
                state.matches = action.payload;
            })
            .addCase(getMatches.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(getMessagesWithUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getMessagesWithUser.fulfilled, (state, action) => {
                state.isLoading = false;
                action.payload.forEach((match) => {
                    state.messages[match.matchId] = match.chats;
                });
            })
            .addCase(getMessagesWithUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { setSelectedUser, clearSelectedUser, addMessage, markMessageAsSeen } = chatSlice.actions;
export default chatSlice.reducer;
