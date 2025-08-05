import React, { useState, useEffect, useRef } from 'react';

// Custom Candlestick component
const Candlestick = ({ data, width, height, maxPrice, minPrice }) => {
    const candleWidth = width * 0.6;
    const wickWidth = 2;
    const yScale = height / (maxPrice - minPrice);

    const isGreen = data.close >= data.open;
    const candleColor = isGreen ? '#10b981' : '#ef4444';
    const wickColor = '#6b7280';

    const highY = height - (data.high - minPrice) * yScale;
    const lowY = height - (data.low - minPrice) * yScale;
    const openY = height - (data.open - minPrice) * yScale;
    const closeY = height - (data.close - minPrice) * yScale;

    const candleTop = Math.min(openY, closeY);
    const candleHeight = Math.abs(openY - closeY);

    return (
        <g>
            {/* Wick */}
            <line
                x1={width / 2}
                y1={highY}
                x2={width / 2}
                y2={lowY}
                stroke={wickColor}
                strokeWidth={wickWidth}
            />
            {/* Candle body */}
            <rect
                x={(width - candleWidth) / 2}
                y={candleTop}
                width={candleWidth}
                height={Math.max(candleHeight, 1)}
                fill={isGreen ? candleColor : candleColor}
                stroke={candleColor}
                strokeWidth={1}
            />
        </g>
    );
};

// Custom Candlestick Chart component
const CandlestickChart = ({ data, width = 800, height = 400 }) => {
    if (!data || data.length === 0) return null;

    const margin = { top: 20, right: 60, bottom: 40, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const maxPrice = Math.max(...data.map(d => d.high));
    const minPrice = Math.min(...data.map(d => d.low));
    const priceRange = maxPrice - minPrice;
    const paddedMax = maxPrice + priceRange * 0.05;
    const paddedMin = minPrice - priceRange * 0.05;

    const candleWidth = chartWidth / data.length;

    // Generate Y-axis labels
    const yTicks = [];
    const tickCount = 8;
    for (let i = 0; i <= tickCount; i++) {
        const value = paddedMin + (paddedMax - paddedMin) * (i / tickCount);
        yTicks.push(value);
    }

    return (
        <div className="w-full overflow-x-auto">
            <svg width={width} height={height} className="bg-white">
                {/* Background grid */}
                <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Chart area */}
                <g transform={`translate(${margin.left}, ${margin.top})`}>
                    {/* Y-axis grid lines and labels */}
                    {yTicks.map((tick, i) => {
                        const y = chartHeight - ((tick - paddedMin) / (paddedMax - paddedMin)) * chartHeight;
                        return (
                            <g key={i}>
                                <line
                                    x1={0}
                                    y1={y}
                                    x2={chartWidth}
                                    y2={y}
                                    stroke="#e5e7eb"
                                    strokeWidth={1}
                                    strokeDasharray="2,2"
                                />
                                <text
                                    x={-10}
                                    y={y + 4}
                                    textAnchor="end"
                                    className="text-xs fill-gray-600"
                                >
                                    ${tick.toFixed(2)}
                                </text>
                            </g>
                        );
                    })}

                    {/* Candlesticks */}
                    {data.map((candle, index) => (
                        <g key={index} transform={`translate(${index * candleWidth}, 0)`}>
                            <Candlestick
                                data={candle}
                                width={candleWidth}
                                height={chartHeight}
                                maxPrice={paddedMax}
                                minPrice={paddedMin}
                            />
                            {/* Time labels (show every 5th) */}
                            {index % 5 === 0 && (
                                <text
                                    x={candleWidth / 2}
                                    y={chartHeight + 20}
                                    textAnchor="middle"
                                    className="text-xs fill-gray-600"
                                >
                                    {new Date(candle.time).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </text>
                            )}
                        </g>
                    ))}
                </g>

                {/* Current price line */}
                {data.length > 0 && (
                    <g transform={`translate(${margin.left}, ${margin.top})`}>
                        <line
                            x1={0}
                            y1={chartHeight - ((data[data.length - 1].close - paddedMin) / (paddedMax - paddedMin)) * chartHeight}
                            x2={chartWidth}
                            y2={chartHeight - ((data[data.length - 1].close - paddedMin) / (paddedMax - paddedMin)) * chartHeight}
                            stroke="#3b82f6"
                            strokeWidth={2}
                            strokeDasharray="5,5"
                        />
                        <text
                            x={chartWidth + 10}
                            y={chartHeight - ((data[data.length - 1].close - paddedMin) / (paddedMax - paddedMin)) * chartHeight + 4}
                            className="text-sm fill-blue-600 font-semibold"
                        >
                            ${data[data.length - 1].close.toFixed(2)}
                        </text>
                    </g>
                )}
            </svg>
        </div>
    );
};

const RealtimeCandlestickApp = () => {
    const [symbol, setSymbol] = useState('AAPL');
    const [candleData, setCandleData] = useState([]);
    const [currentPrice, setCurrentPrice] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const [stats, setStats] = useState({});
    const intervalRef = useRef(null);
    const dataRef = useRef([]);

    // Simulate real-time data generation
    const generateInitialData = (basePrice = 150) => {
        const data = [];
        const now = Date.now();

        for (let i = 29; i >= 0; i--) {
            const time = now - i * 60000; // 1 minute intervals
            const open = basePrice + (Math.random() - 0.5) * 10;
            const volatility = Math.random() * 5;
            const high = open + Math.random() * volatility;
            const low = open - Math.random() * volatility;
            const close = low + Math.random() * (high - low);

            data.push({
                time,
                open: parseFloat(open.toFixed(2)),
                high: parseFloat(high.toFixed(2)),
                low: parseFloat(low.toFixed(2)),
                close: parseFloat(close.toFixed(2)),
                volume: Math.floor(Math.random() * 100000) + 10000
            });

            basePrice = close;
        }

        return data;
    };

    const updateRealtimeData = () => {
        setCandleData(prevData => {
            const lastCandle = prevData[prevData.length - 1];
            if (!lastCandle) return prevData;

            const now = Date.now();
            const timeDiff = now - lastCandle.time;

            let newData = [...prevData];

            if (timeDiff >= 60000) { // Create new candle every minute
                const newOpen = lastCandle.close;
                const volatility = Math.random() * 3;
                const change = (Math.random() - 0.5) * 2;
                const newClose = newOpen + change;
                const newHigh = Math.max(newOpen, newClose) + Math.random() * volatility;
                const newLow = Math.min(newOpen, newClose) - Math.random() * volatility;

                const newCandle = {
                    time: now,
                    open: parseFloat(newOpen.toFixed(2)),
                    high: parseFloat(newHigh.toFixed(2)),
                    low: parseFloat(newLow.toFixed(2)),
                    close: parseFloat(newClose.toFixed(2)),
                    volume: Math.floor(Math.random() * 100000) + 10000
                };

                newData.push(newCandle);

                // Keep only last 30 candles
                if (newData.length > 30) {
                    newData = newData.slice(-30);
                }

                setCurrentPrice(newCandle.close);
            } else {
                // Update current candle
                const updatedCandle = { ...lastCandle };
                const priceChange = (Math.random() - 0.5) * 0.5;
                updatedCandle.close = parseFloat((updatedCandle.close + priceChange).toFixed(2));
                updatedCandle.high = Math.max(updatedCandle.high, updatedCandle.close);
                updatedCandle.low = Math.min(updatedCandle.low, updatedCandle.close);
                updatedCandle.volume += Math.floor(Math.random() * 1000);

                newData[newData.length - 1] = updatedCandle;
                setCurrentPrice(updatedCandle.close);
            }

            dataRef.current = newData;
            return newData;
        });
    };

    const startRealtime = () => {
        setIsConnected(true);
        const initialData = generateInitialData();
        setCandleData(initialData);
        dataRef.current = initialData;
        setCurrentPrice(initialData[initialData.length - 1]?.close || 0);

        intervalRef.current = setInterval(updateRealtimeData, 1000); // Update every second
    };

    const stopRealtime = () => {
        setIsConnected(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const changeSymbol = (newSymbol) => {
        stopRealtime();
        setSymbol(newSymbol);
        setTimeout(() => {
            startRealtime();
        }, 500);
    };

    useEffect(() => {
        startRealtime();
        return () => stopRealtime();
    }, []);

    // Calculate stats
    useEffect(() => {
        if (candleData.length > 0) {
            const latest = candleData[candleData.length - 1];
            const previous = candleData[candleData.length - 2];

            const change = previous ? latest.close - previous.close : 0;
            const changePercent = previous ? (change / previous.close) * 100 : 0;

            setStats({
                change: change.toFixed(2),
                changePercent: changePercent.toFixed(2),
                volume: latest.volume.toLocaleString(),
                high24h: Math.max(...candleData.map(d => d.high)).toFixed(2),
                low24h: Math.min(...candleData.map(d => d.low)).toFixed(2)
            });
        }
    }, [candleData]);

    const popularStocks = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA', 'META', 'BTC'];

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Real-time Candlestick Chart
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'
                                }`}></div>
                            {isConnected ? 'Live' : 'Disconnected'}
                        </div>
                        <button
                            onClick={isConnected ? stopRealtime : startRealtime}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${isConnected
                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                        >
                            {isConnected ? 'Stop' : 'Start'} Stream
                        </button>
                    </div>
                </div>

                {/* Symbol Selection */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                    <div className="flex flex-wrap gap-2">
                        {popularStocks.map((stock) => (
                            <button
                                key={stock}
                                onClick={() => changeSymbol(stock)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${symbol === stock
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {stock}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Current Price & Stats */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-gray-800">{symbol}</h2>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-gray-900">
                                ${currentPrice.toFixed(2)}
                            </div>
                            {stats.change && (
                                <div className={`text-lg font-medium ${parseFloat(stats.change) >= 0 ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    {parseFloat(stats.change) >= 0 ? '+' : ''}{stats.change}
                                    ({parseFloat(stats.changePercent) >= 0 ? '+' : ''}{stats.changePercent}%)
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <span className="text-gray-600">24h High:</span>
                            <div className="font-semibold">${stats.high24h}</div>
                        </div>
                        <div>
                            <span className="text-gray-600">24h Low:</span>
                            <div className="font-semibold">${stats.low24h}</div>
                        </div>
                        <div>
                            <span className="text-gray-600">Volume:</span>
                            <div className="font-semibold">{stats.volume}</div>
                        </div>
                        <div>
                            <span className="text-gray-600">Last Update:</span>
                            <div className="font-semibold">
                                {new Date().toLocaleTimeString()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Candlestick Chart */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-semibold mb-4">1-Minute Chart</h3>
                    {candleData.length > 0 ? (
                        <CandlestickChart data={candleData} width={1000} height={500} />
                    ) : (
                        <div className="flex items-center justify-center h-96 text-gray-500">
                            Loading chart data...
                        </div>
                    )}
                </div>

                {/* Implementation Info */}
                <div className="mt-6 bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4">
                        Real @mathieuc/tradingview Implementation
                    </h3>
                    <div className="space-y-3 text-sm text-blue-700">
                        <pre className="bg-blue-100 p-4 rounded overflow-x-auto text-blue-900">
                            {`// Real-time candlestick data with @mathieuc/tradingview
const TradingView = require('@mathieuc/tradingview');
const client = new TradingView.Client();

const chart = new client.Session.Chart();
chart.setMarket('NASDAQ:AAPL', {
  timeframe: '1', // 1 minute
  range: 300,
});

chart.onUpdate(() => {
  const candleData = chart.periods.map(period => ({
    time: period.time * 1000,
    open: period.open,
    high: period.high,
    low: period.low,
    close: period.close,
    volume: period.volume
  }));

  // Send to frontend via WebSocket
  websocket.send(JSON.stringify(candleData));
});`}
                        </pre>
                        <p>
                            <strong>Note:</strong> This demo simulates real-time data. In production,
                            you'd connect to TradingView's WebSocket API through a backend server
                            and stream the data to your React frontend.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RealtimeCandlestickApp;