import { Clock, DollarSign, TrendingUp } from 'lucide-react'
import { useState, useEffect } from 'react'

const TradePage = () => {
    const [amount, setAmount] = useState('');
    const [selectedTime, setSelectedTime] = useState(1); // Default to 2m
    const [activeTrades, setActiveTrades] = useState([
        {
            id: 1,
            pair: 'BTC/USD',
            direction: 'UP',
            amount: 10450,
            timeLeft: '2:34',
            progress: 75
        },
        {
            id: 1,
            pair: 'BTC/USD',
            direction: 'UP',
            amount: 10450,
            timeLeft: '2:34',
            progress: 75
        },
        {
            id: 1,
            pair: 'BTC/USD',
            direction: 'UP',
            amount: 10450,
            timeLeft: '2:34',
            progress: 75
        },
        {
            id: 1,
            pair: 'BTC/USD',
            direction: 'UP',
            amount: 10450,
            timeLeft: '2:34',
            progress: 75
        },
        {
            id: 1,
            pair: 'BTC/USD',
            direction: 'UP',
            amount: 10450,
            timeLeft: '2:34',
            progress: 75
        },


    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState(null);

    // Mock user data - in real app, get from auth context/state
    const userId = "6"; // Replace with actual user ID from authentication
    const assetSymbol = "BTC/USD"; // Could be dynamic based on selected pair

    // Show notification
    const showNotification = (message, type = 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    function handleSelectTime(time) {
        setSelectedTime(time);
    }

    // API call to execute trade
    const handleTrade = async (tradeType) => {
        if (!amount || amount <= 0) {
            showNotification('Please enter a valid amount', 'error');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/trading/trades', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add authorization header if needed
                    // 'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify({
                    userId,
                    assetSymbol,
                    tradeType: tradeType.toUpperCase() === "UP" ? "CALL" : "PUT", // 'CALL' or 'PUT'
                    stakeAmount: parseFloat(amount),
                    duration: selectedTime // in minutes
                })
            });

            const data = await response.json();

            if (data.success) {
                // Add trade to local state with server response data
                const newTrade = {
                    id: data.tradeId || Date.now(),
                    pair: `${assetSymbol}/USD`,
                    direction: tradeType.toUpperCase(),
                    amount: parseFloat(amount),
                    timeLeft: `${selectedTime}:00`,
                    progress: 0,
                    expiresAt: data.data?.expiresAt
                };

                setActiveTrades(prev => [newTrade, ...prev]);
                setAmount(''); // Clear amount after successful trade
                showNotification(`${tradeType} trade placed successfully!`, 'success');
            } else {
                showNotification(data.message || 'Trade failed', 'error');
            }
        } catch (error) {
            console.error('Trade execution error:', error);
            showNotification('Network error. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // // Handle trade execution
    // function handleTrade(direction) {
    //     const tradeType = direction === 'UP' ? 'CALL' : 'PUT';
    //     executeTrade(tradeType);
    // }

    // function handleTrade(direction) {
    //     if (!amount || amount <= 0) {
    //         alert('Please enter a valid amount');
    //         return;
    //     }

    //     const newTrade = {
    //         id: Date.now(),
    //         pair: 'BTC/USD',
    //         direction: direction,
    //         amount: parseFloat(amount),
    //         timeLeft: `${selectedTime}:00`,
    //         progress: 0
    //     };

    //     setActiveTrades(prev => [...prev, newTrade]);
    //     setAmount(''); // Clear amount after trade
    // }


    // Update trade timers
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveTrades(prevTrades =>
                prevTrades.map(trade => {
                    if (trade.expiresAt) {
                        const timeLeft = new Date(trade.expiresAt) - new Date();
                        const minutes = Math.floor(timeLeft / 60000);
                        const seconds = Math.floor((timeLeft % 60000) / 1000);

                        if (timeLeft <= 0) {
                            return { ...trade, timeLeft: '0:00', progress: 100 };
                        }

                        const totalDuration = selectedTime * 60 * 1000;
                        const elapsed = totalDuration - timeLeft;
                        const progress = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));

                        return {
                            ...trade,
                            timeLeft: `${minutes}:${seconds.toString().padStart(2, '0')}`,
                            progress
                        };
                    }
                    return trade;
                })
            );
        }, 1000);

        return () => clearInterval(interval);
    }, [selectedTime]);


    const timeOptions = [
        { value: 1, label: '1m' },
        { value: 2, label: '2m' },
        { value: 3, label: '3m' },
        { value: 5, label: '5m' }
    ];

    return (
        <div className='w-full max-w-sm bg-black p-4 relative'>
            {/* Notification */}
            {notification && (
                <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg flex items-center gap-2 ${notification.type === 'success' ? 'bg-green-600' :
                    notification.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
                    } text-white text-sm shadow-lg`}>
                    {notification.type === 'success' && <CheckCircle size={16} />}
                    {notification.type === 'error' && <AlertCircle size={16} />}
                    {notification.message}
                </div>
            )}

            <div className='h-full flex flex-col gap-4'>
                {/* Trading Controls */}
                <div className='bg-gradient-to-br from-gray-900 via-gray-950 to-black rounded-lg p-4 border border-gray-700'>
                    <h3 className='text-white font-semibold mb-4 flex items-center gap-2'>
                        <TrendingUp size={20} className='text-yellow-400' />
                        Quick Trade
                    </h3>

                    {/* Amount Input */}
                    <div className='mb-4'>
                        <label className='text-gray-400 text-sm block mb-2'>Amount (USD)</label>
                        <div className='relative'>
                            <DollarSign className='absolute left-3 top-3 text-gray-400' size={16} />
                            <input
                                type='number'
                                placeholder='100'
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                disabled={isLoading}
                                className='w-full bg-gray-700 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-600 focus:border-yellow-400 focus:outline-none transition-colors disabled:opacity-50'
                            />
                        </div>
                    </div>

                    {/* Time Selection */}
                    <div className='mb-4'>
                        <label className='text-gray-400 text-sm block mb-2'>Duration</label>
                        <div className='grid grid-cols-4 gap-2'>
                            {timeOptions.map((option) => (
                                <button
                                    key={option.value}
                                    disabled={isLoading}
                                    className={`py-2 rounded text-sm font-medium transition-all disabled:opacity-50 ${selectedTime === option.value
                                        ? 'bg-yellow-500 text-black shadow-lg'
                                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                                        }`}
                                    onClick={() => handleSelectTime(option.value)}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Trade Buttons */}
                    <div className='grid grid-cols-2 gap-3'>
                        <button
                            disabled={isLoading}
                            className='bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-all hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                            onClick={() => handleTrade('UP')}
                        >
                            {isLoading ? <Loader className="animate-spin" size={16} /> : null}
                            CALL ↑
                        </button>
                        <button
                            disabled={isLoading}
                            className='bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-all hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                            onClick={() => handleTrade('DOWN')}
                        >
                            {isLoading ? <Loader className="animate-spin" size={16} /> : null}
                            PUT ↓
                        </button>
                    </div>
                </div>

                {/* Active Trades */}
                <div className='bg-gradient-to-br from-gray-900 via-gray-950 to-black rounded-lg p-4 border border-gray-700 flex-1'>
                    <h3 className='text-white font-semibold mb-4 flex items-center gap-2'>
                        <Clock size={20} className='text-yellow-400' />
                        Active Trades
                        <span className='bg-yellow-400 text-black text-xs px-2 py-1 rounded-full ml-auto'>
                            {activeTrades.length}
                        </span>
                    </h3>

                    {/* Active Trades List */}
                    <div className='space-y-3 max-h-72 overflow-y-auto'>
                        {activeTrades.map((trade) => (
                            <div key={trade.id} className='bg-gradient-to-br from-gray-900 via-gray-950 to-black rounded-lg p-3 border border-gray-600'>
                                <div className='flex justify-between items-center mb-2'>
                                    <span className='text-yellow-400 font-semibold'>{trade.pair}</span>
                                    <span className={`text-sm font-medium ${trade.direction === 'CALL' || trade.direction === 'UP' ? 'text-green-400' : 'text-red-400'
                                        }`}>
                                        {trade.direction} {(trade.direction === 'CALL' || trade.direction === 'UP') ? '↑' : '↓'}
                                    </span>
                                </div>
                                <div className='flex justify-between items-center text-sm mb-2'>
                                    <span className='text-gray-400'>${trade.amount}</span>
                                    <span className='text-white font-mono'>{trade.timeLeft}</span>
                                </div>
                                <div className='w-full bg-gray-600 rounded-full h-2'>
                                    <div
                                        className={`h-2 rounded-full transition-all duration-1000 ${(trade.direction === 'CALL' || trade.direction === 'UP') ? 'bg-green-400' : 'bg-red-400'
                                            }`}
                                        style={{ width: `${trade.progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {activeTrades.length === 0 && (
                        <div className='text-center text-gray-500 mt-8'>
                            <div className='w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3'>
                                <TrendingUp size={24} className='text-gray-500' />
                            </div>
                            <p className='text-sm'>No active trades</p>
                            <p className='text-xs text-gray-600 mt-1'>Place your first trade to get started</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}


export default TradePage