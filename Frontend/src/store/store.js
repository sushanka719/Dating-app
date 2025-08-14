import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducers/authSlice';
import onboardingReducer from '../store/reducers/UserSlice'; 
import settingReducer from '../store/reducers/SettingSlics'
import chatReducer from '../store/reducers/chatSlice'
import userFeedReducer from '../store/reducers/userFeedSlice'

const store = configureStore({
    reducer: {
        auth: authReducer,
        onboarding: onboardingReducer,
        settings: settingReducer,
        chats: chatReducer,
        userFeed: userFeedReducer
    },
});

export default store;
