import { createSlice } from "@reduxjs/toolkit";

// Base API URL configuration
const API_BASE_URL = "http://localhost:5000";

const initialState = {
    user: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
    isCheckingAuth: true,
    message: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        authStart(state) {
            state.isLoading = true;
            state.error = null;
        },
        authSuccess(state, action) {
            state.user = action.payload.user;
            state.isAuthenticated = true; 
            state.isLoading = false;
            state.error = null;
            state.isCheckingAuth = false;
        },
        authFailure(state, action) {
            state.isLoading = false;
            state.error = action.payload;
            state.isAuthenticated = false;
            state.isCheckingAuth = false;
        },
        userLogout(state) { 
            state.user = null;
            state.isLoading = false;
            state.error = null;
        },
    },
});

export const checkAuth = () => async (dispatch) => {
    try {
        dispatch(authStart());

        const response = await fetch(`${API_BASE_URL}/api/auth/check-auth`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Authentication check failed");
        }

        dispatch(authSuccess({ user: data.user }));
    } catch (error) {
        dispatch(authFailure(error.message));
    }
};

export const signup = (userData) => async (dispatch) => {
    try {
        dispatch(authStart());

        const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Signup failed");
        }

        dispatch(authSuccess({ user: data.user}));
    } catch (error) {
        dispatch(authFailure(error.message));
    }
};

export const login = (credentials) => async (dispatch) => {
    try {
        dispatch(authStart());

        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials),
        });

        const data = await response.json();
        console.log(data, "from login")

        if (!response.ok) {
            throw new Error(data.message || "Login failed");
        }

        dispatch(authSuccess({ user: data.user }));
    } catch (error) {
        dispatch(authFailure(error.message));
    }
};

export const logoutUser = () => async (dispatch) => {
    try {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        });
        dispatch(authSlice.actions.userLogout());
    } catch (error) {
        console.error('Logout error:', error);
    }
};



export const { authStart, authSuccess, authFailure, userLogout } = authSlice.actions;
export default authSlice.reducer;
