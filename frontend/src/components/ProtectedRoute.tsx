import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getRole, isAuthenticated } from "../services/auth";
import api from "../services/api";

interface UserResponse {
    phone: string | null;
}

function ProtectedRoute() {
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [profileComplete, setProfileComplete] = useState(false);

    useEffect(() => {
        let active = true;

        async function checkProfile() {
            if (!isAuthenticated()) {
                if (active) setLoading(false);
                return;
            }

            if (getRole() !== "CLIENT") {
                if (active) {
                    setProfileComplete(true);
                    setLoading(false);
                }
                return;
            }

            if (location.pathname === "/complete-profile") {
                if (active) setLoading(false);
                return;
            }

            try {
                const response = await api.get<UserResponse>("/users/me");
                const phone = response.data.phone;

                if (active) {
                    setProfileComplete(
                        typeof phone === "string" &&
                        /^07\d{8}$/.test(phone.replace(/\s/g, ""))
                    );
                }
            } catch {
                if (active) setProfileComplete(false);
            } finally {
                if (active) setLoading(false);
            }
        }

        setLoading(true);
        void checkProfile();

        return () => {
            active = false;
        };
    }, [location.pathname]);

    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    if (loading) {
        return null;
    }

    if (
        getRole() === "CLIENT" &&
        !profileComplete &&
        location.pathname !== "/complete-profile"
    ) {
        return <Navigate to="/complete-profile" replace />;
    }

    if (
        getRole() === "CLIENT" &&
        profileComplete &&
        location.pathname === "/complete-profile"
    ) {
        return <Navigate to="/welcome-reward" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;
