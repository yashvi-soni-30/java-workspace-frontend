import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
	children: JSX.Element;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
	const { isAuthenticated, loading } = useAuth();
	const location = useLocation();

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
				Checking session...
			</div>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" replace state={{ from: location }} />;
	}

	return children;
};

export default ProtectedRoute;
