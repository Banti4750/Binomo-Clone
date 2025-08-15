import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Create context
const ActiveTradesContext = createContext();

// Custom hook to use the context
export const useActiveTrades = () => {
    const context = useContext(ActiveTradesContext);
    if (context === undefined) {
        throw new Error("useActiveTrades must be used within an ActiveTradesProvider");
    }
    return context;
};

// Provider component
export const ActiveTradesProvider = ({ children }) => {
    const [activeTrades, setActiveTrades] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Function to fetch active trades using token
    const fetchActiveTrades = async () => {
        setLoading(true);
        setError(null);

        try {
            // Get token from localStorage, sessionStorage, or context
            const token = localStorage.getItem('authToken') ||
                sessionStorage.getItem('authToken');

            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await axios.get(
                "http://localhost:5000/api/trading/trades/user/me", // Using 'me' endpoint
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setActiveTrades(response.data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to fetch active trades"
            );
            console.error("Error fetching active trades:", err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch trades data on mount
    useEffect(() => {
        fetchActiveTrades();
    }, []);

    const value = {
        activeTrades,
        loading,
        error,
        fetchActiveTrades,
    };

    return (
        <ActiveTradesContext.Provider value={value}>
            {children}
        </ActiveTradesContext.Provider>
    );
};

export default ActiveTradesProvider;