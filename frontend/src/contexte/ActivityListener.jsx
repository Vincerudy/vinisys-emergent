import React, { useEffect } from "react";
import testToken from "./testToken";
import { useAuth } from "./AuthContext"; // ✅ Correct

const ActivityListener = () => {
    const { logout } = useAuth(); // ✅ Utilisation correcte

    useEffect(() => {
        const handleUserActivity = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                await testToken(token, logout);
            }
        };

        window.addEventListener("click", handleUserActivity);
        window.addEventListener("keydown", handleUserActivity);

        return () => {
            window.removeEventListener("click", handleUserActivity);
            window.removeEventListener("keydown", handleUserActivity);
        };
    }, [logout]);

    return null;
};

export default ActivityListener;
