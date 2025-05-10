
import './App.css';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import { Routes, Route, Navigate } from 'react-router-dom';
import DatingApp from './pages/DatingApp';
import ProtectedRoute from './utils/ProtectedRoute';
import VerifyEmail from './pages/VerifyEmail';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { checkAuth } from './store/reducers/authSlice';
import Settings from './components/Settings';
import Contacts from './components/Contacts';
import EditProfile from './components/EditProfile';
import BumblePartnerSelector from './components/BumblePartnerSelector';
import Chat from './components/Chat';
import Onboarding from './pages/Onboarding';
import OnboardingRoute from './utils/OnBoardingRoute';

const RedirectAuthenticatedUser = ({ children }) => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
console.log('redirecting logic working')
  // If the user is authenticated and verified, redirect to the homepage
  if (isAuthenticated && user?.isVerified) {
    return <Navigate to="/dating-app" />;
  }
  // Otherwise, render the requested page (login or signup)
  return children;
};

function App() {
  const dispatch = useDispatch();
  const { isCheckingAuth } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
    console.log('refreshing page on app.js')
  }, []);

  if (isCheckingAuth) {
    return <div>Loading app...</div>;
  }
  return (
    <div className="App scroll-container">
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/signup' element={<RedirectAuthenticatedUser><Signup /></RedirectAuthenticatedUser>} />
        <Route path='/login' element={<RedirectAuthenticatedUser><Login /></RedirectAuthenticatedUser>} />
        <Route path='*' element={<NotFound />} />
        <Route path='/onboarding' element={<OnboardingRoute element={<Onboarding />} />} />
        <Route path='/verify-email' element={<RedirectAuthenticatedUser><VerifyEmail/></RedirectAuthenticatedUser>} />
        <Route path='/dating-app' element={<ProtectedRoute element={<DatingApp />} />}>
          <Route index element={<BumblePartnerSelector />} />
          <Route path='settings' element={<Settings />} />     
          <Route path='contacts' element={<Contacts />} />     
          <Route path='editProfile' element={<EditProfile />} /> 
          <Route path='chat' element={<Chat/>} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
