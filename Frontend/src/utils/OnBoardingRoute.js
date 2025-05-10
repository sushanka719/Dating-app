// utils/OnboardingRoute.js
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const OnboardingRoute = ({ element }) => {
    const { isAuthenticated, user, isCheckingAuth } = useSelector((state) => state.auth);

    if (isCheckingAuth) return <div>Loading...</div>;

    if (!isAuthenticated) return <Navigate to="/login" />;
    if (!user?.isVerified) return <Navigate to="/verify-email" />;
    if (user?.isOnboarded) return <Navigate to="/dating-app" />;

    return element;
};

export default OnboardingRoute;
