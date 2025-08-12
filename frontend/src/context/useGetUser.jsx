import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Create context
const UserContext = createContext();

// Custom hook to use the context
export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};

// Provider component
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Function to fetch user profile from the API
    const fetchUserProfile = async () => {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");

        if (!token) {
            setError("No authentication token found");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(
                "http://localhost:5000/api/user/profile",
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`, // ✅ attach token
                    },
                }
            );

            setUser(response.data); // adjust based on your backend response
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to fetch user profile"
            );
            console.error("Error fetching user profile:", err);
        } finally {
            setLoading(false);
        }
    };

    // Function to update user data locally
    const updateUser = (updatedData) => {
        if (user) {
            setUser({ ...user, ...updatedData });
        }
    };

    // Fetch user data on mount if needed
    useEffect(() => {
        fetchUserProfile();
    }, []);

    const value = {
        user,
        setUser,
        loading,
        error,
        fetchUserProfile,
        updateUser,
    };

    return (
        <UserContext.Provider value={value}>{children}</UserContext.Provider>
    );
};

export default UserProvider;
