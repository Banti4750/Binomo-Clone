import { Search } from 'lucide-react';
import React, { useState } from 'react';
import { useAssets } from '../context/useGetAssets';

const AssetsCard = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const { assets, setActiveAssetById } = useAssets()

    // Filter assets based on search term
    const filteredAssets = assets.filter(asset =>
        asset.asset_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAssetClick = (asset) => {
        setActiveAssetById(asset.id);
    };

    return (
        <div className='bg-gray-950 w-full max-w-md h-96 p-4 rounded-lg text-white '>
            {/* Search Section */}
            <div className='flex items-center gap-2 mb-4 bg-gray-800 rounded-lg px-3 py-2'>
                <Search className="w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search assets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent outline-none flex-1 text-white placeholder-gray-400"
                />
            </div>

            {/* Header */}
            <div className='flex justify-between items-center mb-4 text-sm text-gray-300'>
                <p className="font-medium">Assets</p>
                <p className="font-medium">Payout %</p>
            </div>

            {/* Assets List */}
            <div className='space-y-2 overflow-y-auto max-h-64 no-scrollbar '>
                {filteredAssets.length > 0 ? (
                    filteredAssets.map((asset) => (
                        <div key={asset.id} className='flex justify-between  items-center p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors'
                            onClick={() => handleAssetClick(asset)}
                        >
                            <div className='flex items-center gap-3'>
                                <img
                                    src={asset.symbol_url}
                                    alt={asset.asset_name}
                                    className="w-8 h-8 rounded-full"
                                    onError={(e) => {
                                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='%23666'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Ctext x='12' y='16' text-anchor='middle' fill='white' font-size='10'%3E%24%3C/text%3E%3C/svg%3E";
                                    }}
                                />
                                <div>
                                    <p className="font-medium text-white">{asset.asset_name}</p>
                                    <p className="text-xs text-gray-400">{asset.symbol}</p>
                                </div>
                            </div>
                            <div className='text-right'>
                                <p className="text-green-400 font-medium">{asset.payout_percentage}%</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className='text-center text-gray-400 py-8'>
                        <p>No assets found</p>
                        <p className="text-sm">Try searching for a different term</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssetsCard;