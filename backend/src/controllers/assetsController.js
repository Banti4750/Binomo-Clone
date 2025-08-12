import db from '../config/db.js';
import { Router } from "express";
import dotenv from 'dotenv';
dotenv.config();

const router = Router();
//create new asset
const createAsset = async (req, res) => {
    try {
        const { assetsName, symbol, symbolUrl, payoutPercentage } = req.body;

        // Validate inputs (handle 0 for payoutPercentage)
        if (!assetsName || !symbol || payoutPercentage == null || !symbolUrl) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if asset already exists
        const [existingAsset] = await db.query(
            'SELECT * FROM assets WHERE symbol = ? AND asset_name = ?',
            [symbol, assetsName]
        );

        if (existingAsset.length > 0) {
            return res.status(400).json({ message: 'Asset already exists' });
        }

        // Insert new asset
        const [insertResult] = await db.query(
            'INSERT INTO assets (asset_name, symbol, symbol_url, payout_percentage) VALUES (?, ?, ?, ?)',
            [assetsName, symbol, symbolUrl, payoutPercentage]
        );

        res.status(201).json({
            message: 'Asset created successfully',
            assetId: insertResult.insertId
        });

    } catch (error) {
        console.error('Error creating asset:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


//update existing asset
const updateAsset = async (req, res) => {
    try {
        const { assetId, assetsName, symbol, symbolUrl, payoutPercentage } = req.body;

        // Validate inputs
        if (!assetId || !assetsName || !symbol || payoutPercentage == null || !symbolUrl) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if asset exists
        const [existingAsset] = await db.query('SELECT * FROM assets WHERE id = ?', [assetId]);
        if (existingAsset.length === 0) {
            return res.status(404).json({ message: 'Asset not found' });
        }

        // Update asset
        await db.query(
            'UPDATE assets SET asset_name = ?, symbol = ?, symbol_url = ?, payout_percentage = ? WHERE id = ?',
            [assetsName, symbol, symbolUrl, payoutPercentage, assetId]
        );

        res.status(200).json({ message: 'Asset updated successfully' });

    } catch (error) {
        console.error('Error updating asset:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


//get all assets
const getAllAssets = async (req, res) => {
    try {
        const [assets] = await db.query('SELECT * FROM assets');
        res.status(200).json(assets);
    } catch (error) {
        console.error('Error fetching assets:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

//get asset by id
const getAssetById = async (req, res) => {
    try {
        const { assetId } = req.params;

        // Validate assetId
        if (!assetId) {
            return res.status(400).json({ message: 'Asset ID is required' });
        }

        const [asset] = await db.query('SELECT * FROM assets WHERE id = ?', [assetId]);
        if (asset.length === 0) {
            return res.status(404).json({ message: 'Asset not found' });
        }

        res.status(200).json(asset[0]);
    } catch (error) {
        console.error('Error fetching asset:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


// all routes related to user profile
router.post('/assets', createAsset); // Create new asset
router.put('/assets', updateAsset); // Update existing asset
router.get('/assets', getAllAssets); // Get all assets
router.get('/assets/:assetId', getAssetById); // Get asset by ID


export default router;