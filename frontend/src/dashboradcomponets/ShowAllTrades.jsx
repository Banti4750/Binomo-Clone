import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, RefreshCw, AlertCircle } from 'lucide-react'

const ShowAllTrades = () => {
    const [trades, setTrades] = useState([])
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [pagination, setPagination] = useState({
        limit: 100,
        offset: 0,
        hasMore: true
    })

    const API_BASE = 'http://localhost:5000/api/trading'

    // Fetch trades data
    const fetchTrades = async (limit = 10, offset = 0, append = false) => {
        try {
            setLoading(true)
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE}/trades/user?status=ALL&limit=${limit}&offset=${offset}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`, // ✅ attach token
                },
            })
            const data = await response.json()

            if (data.success) {
                if (append) {
                    setTrades(prev => [...prev, ...data.trades])
                } else {
                    setTrades(data.trades)
                }

                // Update pagination
                setPagination(prev => ({
                    ...prev,
                    offset: offset,
                    hasMore: data.trades.length === limit
                }))
            } else {
                throw new Error(data.message || 'Failed to fetch trades')
            }
        } catch (err) {
            setError(err.message)
            console.error('Error fetching trades:', err)
        }
    }

    // Fetch stats data
    const fetchStats = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE}/trades/stats`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`, // ✅ attach token
                },
            })
            const data = await response.json()

            if (data.success) {
                setStats(data.stats)
            } else {
                throw new Error(data.message || 'Failed to fetch stats')
            }
        } catch (err) {
            setError(err.message)
            console.error('Error fetching stats:', err)
        }
    }

    // Initial data fetch
    useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            setError(null)

            try {
                await Promise.all([
                    fetchTrades(pagination.limit, 0),
                    fetchStats()
                ])
            } catch (err) {
                setError('Failed to load trading data')
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [])

    // Load more trades
    const loadMoreTrades = async () => {
        if (!pagination.hasMore || loading) return

        const newOffset = pagination.offset + pagination.limit
        await fetchTrades(pagination.limit, newOffset, true)
    }

    // Refresh all data
    const refreshData = async () => {
        setPagination(prev => ({ ...prev, offset: 0, hasMore: true }))
        setTrades([])
        await Promise.all([
            fetchTrades(pagination.limit, 0),
            fetchStats()
        ])
        setLoading(false)
    }

    // Format currency values
    const formatCurrency = (value) => {
        const num = parseFloat(value)
        return num >= 0 ? `+$${num.toFixed(2)}` : `-$${Math.abs(num).toFixed(2)}`
    }

    // Format date/time
    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    // Get status color and styling
    const getStatusStyling = (status) => {
        switch (status) {
            case 'WIN':
                return {
                    bg: 'from-green-900/30 via-green-950/40 to-black',
                    border: 'border-green-600/50',
                    text: 'text-green-400',
                    icon: <TrendingUp size={16} />
                }
            case 'LOSS':
                return {
                    bg: 'from-red-900/30 via-red-950/40 to-black',
                    border: 'border-red-600/50',
                    text: 'text-red-400',
                    icon: <TrendingDown size={16} />
                }
            default:
                return {
                    bg: 'from-gray-900 via-gray-950 to-black',
                    border: 'border-gray-600',
                    text: 'text-gray-400',
                    icon: null
                }
        }
    }

    // Error state
    if (error) {
        return (
            <div className="text-center text-red-400 mt-8">
                <div className='w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-3'>
                    <AlertCircle size={24} className='text-red-400' />
                </div>
                <p className='text-sm mb-3'>Failed to load trading data</p>
                <p className='text-xs text-gray-600 mb-4'>{error}</p>
                <button
                    onClick={refreshData}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                >
                    Try Again
                </button>
            </div>
        )
    }

    return (
        <div className='relative bg-gradient-to-br from-gray-900 via-gray-950 to-black space-y-6 w-full  p-2 rounded-2xl text-white border border-gray-800/50 shadow-2xl backdrop-blur-sm'>
            {/* Header with refresh button */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">P & L</h2>
                <button
                    onClick={refreshData}
                    disabled={loading}
                    className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
                    title="Refresh data"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Summary Stats from API */}
            {stats && (
                <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-lg p-4 border border-gray-700">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-4">
                        <div>
                            <div className="text-sm text-gray-400">Net P&L</div>
                            <div className={`font-bold text-lg ${stats.net_profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {formatCurrency(stats.net_profit)}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-400">Win Rate</div>
                            <div className="font-bold text-lg text-white">{parseFloat(stats.win_rate).toFixed(1)}%</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-400">Total Trades</div>
                            <div className="font-bold text-lg text-blue-400">{stats.total_trades}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-400">Active</div>
                            <div className="font-bold text-lg text-yellow-400">{stats.active_trades}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
                        <div>
                            <div className="text-xs text-gray-500">Wins</div>
                            <div className="text-green-400 font-medium">{stats.wins}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500">Losses</div>
                            <div className="text-red-400 font-medium">{stats.losses}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500">Avg Stake</div>
                            <div className="text-white font-medium">${parseFloat(stats.avg_stake).toFixed(2)}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500">Last Trade</div>
                            <div className="text-gray-300 font-medium">
                                {stats.last_trade_date ? new Date(stats.last_trade_date).toLocaleDateString() : 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading state */}
            {loading && trades.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                    <RefreshCw size={24} className="animate-spin mx-auto mb-3" />
                    <p className="text-sm">Loading trades...</p>
                </div>
            )}

            {/* Trades List */}

            <div className='space-y-3 no-scrollbar max-h-96 overflow-y-auto'>
                {trades.map((trade) => {
                    const styling = getStatusStyling(trade.status)
                    const priceChange = trade.closePrice ?
                        parseFloat(trade.closePrice) - parseFloat(trade.entryPrice) : 0
                    const priceChangePercent = trade.closePrice ?
                        (priceChange / parseFloat(trade.entryPrice) * 100).toFixed(3) : 0

                    return (
                        <div
                            key={trade.id}
                            className={`bg-gradient-to-br ${styling.bg} rounded-lg p-4 border ${styling.border} transition-all hover:border-opacity-80`}
                        >
                            {/* Header */}
                            <div className='flex justify-between items-center mb-3'>
                                <div className="flex items-center gap-2">
                                    <span className='text-yellow-400 font-semibold'>{trade.pair}</span>
                                    <span className='text-xs text-gray-500'>#{trade.id}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {styling.icon}
                                    <span className={`text-sm font-medium ${styling.text}`}>
                                        {trade.status}
                                    </span>
                                </div>
                            </div>

                            {/* Trade Details */}
                            <div className="grid grid-cols-2 gap-4 mb-3">
                                <div>
                                    <div className="text-xs text-gray-400">Direction</div>
                                    <div className={`text-sm font-medium flex items-center gap-1 ${trade.direction === 'CALL' ? 'text-green-400' : 'text-red-400'
                                        }`}>
                                        {trade.direction}
                                        {trade.direction === 'CALL' ? '↑' : '↓'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400">Amount</div>
                                    <div className="text-sm font-medium text-white">${trade.amount}</div>
                                </div>
                            </div>

                            {/* Price Information */}
                            {trade.entryPrice && (
                                <div className="grid grid-cols-2 gap-4 mb-3">
                                    <div>
                                        <div className="text-xs text-gray-400">Entry Price</div>
                                        <div className="text-xs font-mono text-white">
                                            ${parseFloat(trade.entryPrice).toLocaleString()}
                                        </div>
                                    </div>
                                    {trade.closePrice && (
                                        <div>
                                            <div className="text-xs text-gray-400">Close Price</div>
                                            <div className="text-xs font-mono text-white">
                                                ${parseFloat(trade.closePrice).toLocaleString()}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Price Change */}
                            {trade.closePrice && (
                                <div className="mb-3">
                                    <div className="text-xs text-gray-400">Price Change</div>
                                    <div className={`text-sm font-medium ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)} ({priceChangePercent}%)
                                    </div>
                                </div>
                            )}

                            {/* Footer */}
                            <div className='flex justify-between items-center pt-3 border-t border-gray-700/50'>
                                <div>
                                    <div className="text-xs text-gray-400">Time</div>
                                    <div className="text-xs text-gray-300">
                                        {trade.startedAt && formatTime(trade.startedAt)}
                                        {trade.expiresAt && ` - ${formatTime(trade.expiresAt)}`}
                                    </div>
                                </div>
                                {trade.payout && (
                                    <div className="text-right">
                                        <div className="text-xs text-gray-400">Payout</div>
                                        <div className={`font-bold ${parseFloat(trade.payout) >= 0 ? 'text-green-400' : 'text-red-400'
                                            }`}>
                                            {formatCurrency(trade.payout)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Load More Button */}
            {/* {pagination.hasMore && trades.length > 0 && (
                <div className="text-center pt-4">
                    <button
                        onClick={loadMoreTrades}
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <RefreshCw size={16} className="inline animate-spin mr-2" />
                                Loading...
                            </>
                        ) : (
                            'Load More Trades'
                        )}
                    </button>
                </div>
            )} */}

            {/* Empty State */}
            {!loading && trades.length === 0 && !error && (
                <div className='text-center text-gray-500 mt-8'>
                    <div className='w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3'>
                        <TrendingUp size={24} className='text-gray-500' />
                    </div>
                    <p className='text-sm'>No trades found</p>
                    <p className='text-xs text-gray-600 mt-1'>Your trading history will appear here</p>
                </div>
            )}
        </div>
    )
}



export default ShowAllTrades;