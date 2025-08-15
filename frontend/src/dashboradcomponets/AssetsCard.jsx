import { Search, TrendingUp, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';

import { useAssets } from '../context/useGetAssets';

const AssetsCard = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [hoveredAsset, setHoveredAsset] = useState(null);
    const { assets, setActiveAssetById } = useAssets();

    // Filter assets based on search term
    const filteredAssets = assets.filter(asset =>
        asset.asset_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAssetClick = (asset) => {
        setActiveAssetById(asset.id);
    };

    const getPayoutColor = (percentage) => {
        if (percentage >= 85) return 'text-emerald-400';
        if (percentage >= 80) return 'text-green-400';
        if (percentage >= 75) return 'text-yellow-400';
        return 'text-orange-400';
    };

    const getPayoutBadgeColor = (percentage) => {
        if (percentage >= 85) return 'bg-emerald-500/10 border-emerald-500/20';
        if (percentage >= 80) return 'bg-green-500/10 border-green-500/20';
        if (percentage >= 75) return 'bg-yellow-500/10 border-yellow-500/20';
        return 'bg-orange-500/10 border-orange-500/20';
    };

    return (
        <div className='relative bg-gradient-to-br from-gray-900 via-gray-950 to-black w-full max-w-md h-[500px] p-6 rounded-2xl text-white border border-gray-800/50 shadow-2xl backdrop-blur-sm'>
            {/* Decorative background elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent rounded-2xl"></div>
            <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-xl"></div>

            <div className="relative z-10">
                {/* Header with icon */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/20">
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                            Trading Assets
                        </h2>
                        <p className="text-xs text-gray-400">Choose your preferred asset</p>
                    </div>
                </div>

                {/* Enhanced Search Section */}
                <div className='relative mb-6'>
                    <div className='flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm rounded-xl px-4 py-3 border border-gray-700/50 focus-within:border-blue-500/50 focus-within:bg-gray-800/70 transition-all duration-300'>
                        <Search className="w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search assets..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent outline-none flex-1 text-white placeholder-gray-400 text-sm"
                        />
                        {searchTerm && (
                            <div className="text-xs text-blue-400 font-medium">
                                {filteredAssets.length} found
                            </div>
                        )}
                    </div>
                </div>

                {/* Enhanced Header */}
                <div className='flex justify-between items-center mb-4 px-2'>
                    <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Asset</p>
                    <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Payout</p>
                </div>

                {/* Enhanced Assets List */}
                <div className='space-y-2 overflow-y-auto no-scrollbar max-h-[280px] pr-2' >
                    {filteredAssets.length > 0 ? (
                        filteredAssets.map((asset, index) => (
                            <div
                                key={asset.id}
                                className={`group relative flex justify-between items-center p-4 bg-gradient-to-r from-gray-800/40 to-gray-800/20 rounded-xl border border-gray-700/30 hover:from-gray-700/50 hover:to-gray-700/30 hover:border-gray-600/50 transition-all duration-300 cursor-pointer transform hover:scale-[1.02] hover:shadow-lg ${hoveredAsset === asset.id ? 'shadow-lg shadow-blue-500/10' : ''}`}
                                onClick={() => handleAssetClick(asset)}
                                onMouseEnter={() => setHoveredAsset(asset.id)}
                                onMouseLeave={() => setHoveredAsset(null)}
                                style={{
                                    animationDelay: `${index * 50}ms`
                                }}
                            >
                                {/* Subtle hover glow effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                <div className='flex items-center gap-4 relative z-10'>
                                    <div className="relative">
                                        <div className={`absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-sm transition-opacity duration-300 ${hoveredAsset === asset.id ? 'opacity-100' : 'opacity-0'}`}></div>
                                        <img
                                            src={asset.symbol_url}
                                            alt={asset.asset_name}
                                            className="relative w-10 h-10 rounded-full border border-gray-600/50 shadow-md"
                                            onError={(e) => {
                                                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='%23444'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Ctext x='12' y='16' text-anchor='middle' fill='white' font-size='8'%3E%24%3C/text%3E%3C/svg%3E";
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white group-hover:text-blue-100 transition-colors duration-200">
                                            {asset.asset_name}
                                        </p>
                                        <p className="text-xs text-gray-400 font-medium tracking-wide">
                                            {asset.symbol}
                                        </p>
                                    </div>
                                </div>

                                <div className='flex items-center gap-2 relative z-10'>
                                    <div className={`px-3 py-1.5 rounded-lg border ${getPayoutBadgeColor(asset.payout_percentage)} backdrop-blur-sm`}>
                                        <p className={`text-sm font-bold ${getPayoutColor(asset.payout_percentage)}`}>
                                            {asset.payout_percentage}%
                                        </p>
                                    </div>
                                    <ArrowUpRight className={`w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-all duration-200 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5`} />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className='text-center py-12'>
                            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-700/30 to-gray-800/30 rounded-full flex items-center justify-center border border-gray-700/50">
                                <Search className="w-6 h-6 text-gray-500" />
                            </div>
                            <p className="text-gray-400 font-medium mb-1">No assets found</p>
                            <p className="text-sm text-gray-500">Try searching with different keywords</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssetsCard;