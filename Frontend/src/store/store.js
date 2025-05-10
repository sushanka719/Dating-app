import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducers/authSlice';
import onboardingReducer from '../store/reducers/UserSlice'; 
import settingReducer from '../store/reducers/SettingSlics'

const store = configureStore({
    reducer: {
        auth: authReducer,
        onboarding: onboardingReducer,
        settings: settingReducer
    },
});

export default store;
