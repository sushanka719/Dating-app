import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ element }) => {
    const { isAuthenticated, user, isCheckingAuth } = useSelector((state) => state.auth);

    if (isCheckingAuth) return <div>Loading...</div>;

    if (!isAuthenticated) return <Navigate to="/login" />;

    if (!user?.isVerified) return <Navigate to="/verify-email" />;

    if (!user?.isOnboarded) return <Navigate to="/onboarding" />;

    return element;
};

export default ProtectedRoute;
