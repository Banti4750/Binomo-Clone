import React, { useState, useEffect } from 'react';
import { Users, Gift, Calendar, Award, AlertCircle } from 'lucide-react';

const ReferralDisplay = () => {
    const [referralData, setReferralData] = useState({
        referrals: [],
        totalBonus: 0,
        totalReferrals: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch referral data from API
    useEffect(() => {
        const fetchReferrals = async () => {
            try {
                setLoading(true);

                // Get token from localStorage (adjust based on where you store it)
                const token = localStorage.getItem('token');

                if (!token) {
                    console.error('No authentication token found');
                    setLoading(false);
                    return;
                }

                const response = await fetch('http://localhost:5000/api/user/refferal', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                if (data.success) {
                    setReferralData({
                        referrals: data.referrals || [],
                        totalBonus: data.totalBonus || 0,
                        totalReferrals: data.totalReferrals || 0
                    });
                } else {
                    // Handle case where API returns referrals in different format
                    const referrals = data.referrals || data.reffers || [];
                    const totalBonus = referrals.reduce((sum, ref) => sum + ref.bonus_given, 0);
                    const totalReferrals = referrals.length;

                    setReferralData({
                        referrals,
                        totalBonus,
                        totalReferrals
                    });
                }
            } catch (error) {
                console.error('Error fetching referrals:', error);
                setError('Failed to load referral data. Please try again.');
                // Set empty state on error
                setReferralData({
                    referrals: [],
                    totalBonus: 0,
                    totalReferrals: 0
                });
            } finally {
                setLoading(false);
            }
        };

        fetchReferrals();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="p-6 bg-gradient-to-br from-gray-900 via-gray-950 to-black max-w-4xl mx-auto min-h-screen">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-700 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-gray-700 rounded"></div>
                        ))}
                    </div>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-gray-700 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-gradient-to-br from-gray-900 via-gray-950 to-black max-w-4xl mx-auto min-h-screen">
                <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 text-center">
                    <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <h2 className="text-lg font-semibold text-red-300 mb-2">Error Loading Referrals</h2>
                    <p className="text-red-400 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white min-h-screen">

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-400">Total Referrals</p>
                            <p className="text-3xl font-bold text-blue-400">{referralData.totalReferrals}</p>
                        </div>
                        <Users className="h-12 w-12 text-blue-500" />
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-400">Total Bonus</p>
                            <p className="text-3xl font-bold text-green-400">₹{referralData.totalBonus}</p>
                        </div>
                        <Gift className="h-12 w-12 text-green-500" />
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-400">Average Bonus</p>
                            <p className="text-3xl font-bold text-purple-400">
                                ₹{referralData.totalReferrals > 0 ? Math.round(referralData.totalBonus / referralData.totalReferrals) : 0}
                            </p>
                        </div>
                        <Award className="h-12 w-12 text-purple-500" />
                    </div>
                </div>
            </div>

            {/* Referrals List */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-900/50 border-b border-gray-700">
                    <h2 className="text-xl font-semibold text-white">Referred Users</h2>
                </div>

                {referralData.referrals.length === 0 ? (
                    <div className="p-12 text-center">
                        <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg">No referrals yet</p>
                        <p className="text-gray-500 text-sm">Start referring friends to earn bonuses!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-700">
                        {referralData.referrals.map((referral, index) => (
                            <div key={referral.id} className="p-6 hover:bg-gray-700/30 transition-colors">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                                {referral.referred_user_name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white">
                                                    {referral.referred_user_name || 'Unknown User'}
                                                </h3>
                                                <p className="text-sm text-gray-400">{referral.referred_user_email}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                <span>Joined: {formatDate(referral.created_at)}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="font-medium">Code:</span>
                                                <span className="bg-gray-700/50 px-2 py-1 rounded text-xs font-mono text-gray-300">
                                                    {referral.referral_code_used}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-green-400">₹{referral.bonus_given}</p>
                                            <p className="text-xs text-gray-500">Bonus Earned</p>
                                        </div>
                                        <Gift className="h-6 w-6 text-green-500" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReferralDisplay;