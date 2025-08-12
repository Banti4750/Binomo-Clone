import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Create context
const AssetsContext = createContext();

// Custom hook to use the context
export const useAssets = () => {
    const context = useContext(AssetsContext);
    if (context === undefined) {
        throw new Error("useAssets must be used within an AssetsProvider");
    }
    return context;
};

// Provider component
export const AssetsProvider = ({ children }) => {
    const [assets, setAssets] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeAsset, setActiveAsset] = useState(null);

    // Function to fetch assets from API
    const fetchAssets = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(
                "http://localhost:5000/api/assets/assets"
            );

            setAssets(response.data);

            // Set the first asset as active by default if no active asset is set
            if (!activeAsset && response.data && response.data.length > 0) {
                setActiveAsset(response.data[0]);
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to fetch assets"
            );
            console.error("Error fetching assets:", err);
        } finally {
            setLoading(false);
        }
    };

    // Function to set active asset (to be called on click)
    const setActiveAssetById = (assetId) => {
        if (assets) {
            const selectedAsset = assets.find(asset => asset.id === assetId);
            if (selectedAsset) {
                setActiveAsset(selectedAsset);
            }
        }
    };

    // Function to set active asset directly
    const handleSetActiveAsset = (asset) => {
        setActiveAsset(asset);
    };

    // Fetch assets data on mount
    useEffect(() => {
        fetchAssets();
    }, []);

    const value = {
        assets,
        setAssets,
        activeAsset,
        setActiveAsset: handleSetActiveAsset,
        setActiveAssetById,
        loading,
        error,
        fetchAssets,
    };

    return (
        <AssetsContext.Provider value={value}>
            {children}
        </AssetsContext.Provider>
    );
};

export default AssetsProvider;