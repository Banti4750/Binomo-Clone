import React, { useEffect, useRef, useState } from "react";
import { BarChart3, Maximize2, Settings, TrendingUp, TrendingDown, Volume2, Eye, EyeOff, Wifi, WifiOff } from "lucide-react";
import { useAssets } from "../context/useGetAssets";

// const TradingViewChart = ({ symbol = "BINANCE:BTCUSDT" }) => {
const TradingViewChart = () => {
    const { activeAsset } = useAssets();
    const containerRef = useRef();
    const chartRef = useRef();
    const [isLoading, setIsLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [chartInterval, setChartInterval] = useState("5m");
    const [showVolume, setShowVolume] = useState(true);
    const symbol = activeAsset?.symbol || "BINANCE:BTCUSDT"
    // Real-time price data state
    const [priceData, setPriceData] = useState({
        price: 0,
        change24h: 0,
        changePercent24h: 0,
        high24h: 0,
        low24h: 0,
        volume24h: 0,
        marketCap: 0,
        open: 0,
        high: 0,
        low: 0,
        close: 0,
        lastUpdate: new Date()
    });
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState(null);

    // Symbol mapping for TradingView to CoinGecko
    const symbolMap = {
        'BINANCE:BTCUSDT': 'bitcoin',
        'BINANCE:ETHUSDT': 'ethereum',
        'BINANCE:ADAUSDT': 'cardano',
        'BINANCE:BNBUSDT': 'binancecoin',
        'BINANCE:XRPUSDT': 'ripple',
        'BINANCE:SOLUSDT': 'solana',
        'BINANCE:DOTUSDT': 'polkadot',
        'BINANCE:DOGEUSDT': 'dogecoin',
        'BINANCE:AVAXUSDT': 'avalanche-2',
        'BINANCE:MATICUSDT': 'matic-network',
        'BINANCE:LINKUSDT': 'chainlink',
        'BINANCE:LTCUSDT': 'litecoin',
        'BINANCE:UNIUSDT': 'uniswap',
        'BINANCE:ATOMUSDT': 'cosmos',
        'BINANCE:VETUSDT': 'vechain'
    };

    // Extract symbol for API calls
    const getApiSymbol = (tradingViewSymbol) => {
        return symbolMap[tradingViewSymbol] || 'bitcoin'; // fallback to bitcoin
    };

    const intervals = [
        { label: "1m", value: "1" },
        { label: "5m", value: "5" },
        { label: "15m", value: "15" },
        { label: "30m", value: "30" },
        { label: "1h", value: "60" },
        { label: "4h", value: "240" },
        { label: "1D", value: "D" }
    ];

    // Fetch real-time price data
    const fetchPriceData = async (coinGeckoSymbol) => {
        try {
            setConnectionError(null);

            // Using CoinGecko API with correct symbol
            const response = await fetch(
                `https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoSymbol}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true&include_last_updated_at=true`,
                {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('API Response:', data);

            const coinData = data[coinGeckoSymbol];

            if (coinData) {
                // Calculate actual change amount from percentage
                const currentPrice = coinData.usd;
                const changePercent = coinData.usd_24h_change || 0;
                const change24h = currentPrice * (changePercent / 100);

                // Calculate 24h high/low from current price and change
                const priceYesterday = currentPrice - change24h;
                const high24h = changePercent >= 0 ? currentPrice : priceYesterday;
                const low24h = changePercent >= 0 ? priceYesterday : currentPrice;

                setPriceData({
                    price: currentPrice,
                    change24h: change24h,
                    changePercent24h: changePercent,
                    high24h: high24h,
                    low24h: low24h,
                    volume24h: coinData.usd_24h_vol || 0,
                    marketCap: coinData.usd_market_cap || 0,
                    open: priceYesterday,
                    high: high24h,
                    low: low24h,
                    close: currentPrice,
                    lastUpdate: new Date(coinData.last_updated_at * 1000) // Convert timestamp
                });
                setIsConnected(true);
                console.log('Price data updated successfully');
            } else {
                throw new Error('No data received for symbol');
            }
        } catch (error) {
            console.error('Error fetching price data:', error);
            setConnectionError(`Failed to fetch ${coinGeckoSymbol} data`);
            setIsConnected(false);

            // Fallback to demo data
            setPriceData({
                price: 45240.50,
                change24h: 1078.32,
                changePercent24h: 2.4,
                high24h: 45890.50,
                low24h: 44780.30,
                volume24h: 1200000000,
                marketCap: 875400000000,
                open: 45120.00,
                high: 45890.50,
                low: 44780.30,
                close: 45240.50,
                lastUpdate: new Date()
            });
        }
    };

    // Set up real-time data fetching
    useEffect(() => {
        const coinGeckoSymbol = getApiSymbol(symbol);
        console.log('Fetching data for:', coinGeckoSymbol, 'from TradingView symbol:', symbol);

        // Initial fetch
        fetchPriceData(coinGeckoSymbol);

        // Set up interval for real-time updates (every 30 seconds to avoid rate limits)
        const interval = setInterval(() => {
            fetchPriceData(coinGeckoSymbol);
        }, 30000);

        return () => clearInterval(interval);
    }, [symbol]);

    // Format numbers
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price);
    };

    const formatLargeNumber = (num) => {
        if (num >= 1e12) {
            return (num / 1e12).toFixed(1) + 'T';
        } else if (num >= 1e9) {
            return (num / 1e9).toFixed(1) + 'B';
        } else if (num >= 1e6) {
            return (num / 1e6).toFixed(1) + 'M';
        } else if (num >= 1e3) {
            return (num / 1e3).toFixed(1) + 'K';
        }
        return num.toFixed(0);
    };

    const formatPercentage = (percent) => {
        const isPositive = percent >= 0;
        return `${isPositive ? '+' : ''}${percent.toFixed(2)}%`;
    };

    useEffect(() => {
        if (chartRef.current) {
            chartRef.current.remove();
        }

        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/tv.js";
        script.async = true;
        script.onload = () => {
            if (window.TradingView && containerRef.current) {
                try {
                    new window.TradingView.widget({
                        width: "100%",
                        height: "100%",
                        symbol: symbol,
                        interval: chartInterval,
                        timezone: "Etc/UTC",
                        theme: "dark",
                        style: "1",
                        locale: "en",
                        toolbar_bg: "#1f2937",
                        enable_publishing: false,
                        withdateranges: true,
                        hide_side_toolbar: false,
                        allow_symbol_change: false,
                        details: true,
                        hotlist: true,
                        calendar: false,
                        studies: showVolume ? ["Volume@tv-basicstudies"] : [],
                        container_id: "tradingview_chart_container",
                        autosize: true,
                        disabled_features: [
                            "header_symbol_search",
                            "header_screenshot",
                            "header_chart_type",
                            "header_compare",
                            "header_undo_redo"
                        ],
                        enabled_features: [
                            "study_templates"
                        ],
                        overrides: {
                            "paneProperties.background": "#111827",
                            "paneProperties.vertGridProperties.color": "#374151",
                            "paneProperties.horzGridProperties.color": "#374151",
                            "symbolWatermarkProperties.transparency": 90,
                            "scalesProperties.textColor": "#9CA3AF"
                        }
                    });
                    setIsLoading(false);
                } catch (error) {
                    console.error("TradingView widget failed to load:", error);
                    setIsLoading(false);
                }
            }
        };

        script.onerror = () => {
            console.error("Failed to load TradingView script");
            setIsLoading(false);
        };

        chartRef.current = script;
        containerRef.current?.appendChild(script);

        return () => {
            if (chartRef.current && chartRef.current.parentNode) {
                chartRef.current.parentNode.removeChild(chartRef.current);
            }
        };
    }, [symbol, chartInterval, showVolume]);

    const handleIntervalChange = (interval) => {
        setChartInterval(interval);
        setIsLoading(true);
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const toggleVolume = () => {
        setShowVolume(!showVolume);
        setIsLoading(true);
    };

    return (
        <div className={`relative bg-gradient-to-br from-gray-900 via-gray-950 to-black rounded-lg border border-gray-700 overflow-hidden ${isFullscreen ? 'fixed inset-0 ' : 'h-full'}`}>
            {/* Enhanced Header */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-950 to-black border-b border-gray-600 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="text-yellow-400" size={24} />
                            <h2 className="text-white text-xl font-bold">{symbol.replace('BINANCE:', '').replace(':', '/')}</h2>
                            {/* Connection Status */}
                            <div className="flex items-center ml-2">
                                {isConnected ? (
                                    <Wifi size={16} className="text-green-400" title="Live data connected" />
                                ) : (
                                    <WifiOff size={16} className="text-red-400" title="Connection error" />
                                )}
                            </div>
                        </div>

                        {/* Real-time Price Info */}
                        <div className="flex items-center gap-3 ml-4">
                            <span className="text-white text-lg font-semibold">
                                {formatPrice(priceData.price)}
                            </span>
                            <div className="flex items-center gap-1">
                                {priceData.changePercent24h >= 0 ? (
                                    <TrendingUp size={16} className="text-green-400" />
                                ) : (
                                    <TrendingDown size={16} className="text-red-400" />
                                )}
                                <span className={`text-sm font-medium ${priceData.changePercent24h >= 0 ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                    {formatPercentage(priceData.changePercent24h)} ({formatPrice(priceData.change24h)})
                                </span>
                            </div>

                            {/* Live indicator */}
                            <div className="flex items-center gap-1 ml-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-green-400 text-xs font-medium">LIVE</span>
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-3">
                        {/* Interval Selector */}
                        <div className="flex items-center gap-1 bg-gray-700 rounded-lg p-1">
                            {intervals.map((interval) => (
                                <button
                                    key={interval.value}
                                    onClick={() => handleIntervalChange(interval.value)}
                                    className={`px-3 py-1 text-sm font-medium rounded transition-all duration-200 ${chartInterval === interval.value
                                        ? 'bg-yellow-500 text-black shadow-lg'
                                        : 'text-gray-300 hover:text-white hover:bg-gray-600'
                                        }`}
                                >
                                    {interval.label}
                                </button>
                            ))}
                        </div>

                        {/* Additional Controls */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleVolume}
                                className={`p-2 rounded-lg transition-colors ${showVolume
                                    ? 'bg-yellow-500 text-black hover:bg-yellow-600'
                                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                    }`}
                                title={showVolume ? "Hide Volume" : "Show Volume"}
                            >
                                <Volume2 size={16} />
                            </button>

                            <button
                                onClick={toggleFullscreen}
                                className="p-2 bg-gray-600 hover:bg-gray-500 text-gray-300 hover:text-white rounded-lg transition-colors"
                                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                            >
                                <Maximize2 size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Market Status Indicator */}
                <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-green-400 text-sm font-medium">Market Open</span>
                        </div>
                        <div className="text-gray-400 text-sm">
                            Last updated: {priceData.lastUpdate.toLocaleTimeString()}
                        </div>
                        {connectionError && (
                            <div className="text-red-400 text-sm">
                                {connectionError}
                            </div>
                        )}
                    </div>

                    {/* 24h Stats */}
                    <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-400">
                            24h High: <span className="text-green-400 font-medium">{formatPrice(priceData.high24h)}</span>
                        </span>
                        <span className="text-gray-400">
                            24h Low: <span className="text-red-400 font-medium">{formatPrice(priceData.low24h)}</span>
                        </span>
                        <span className="text-gray-400">
                            24h Vol: <span className="text-white font-medium">{formatLargeNumber(priceData.volume24h)}</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Chart Container */}
            <div className="relative" style={{ height: isFullscreen ? 'calc(100vh - 140px)' : 'calc(100% - 140px)' }}>
                {isLoading && (
                    <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-10">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
                            <p className="text-gray-400">Loading chart...</p>
                        </div>
                    </div>
                )}

                <div
                    ref={containerRef}
                    className="tradingview-widget-container h-full w-full"
                >
                    <div
                        id="tradingview_chart_container"
                        className="h-full w-full"
                    />
                </div>

                {/* Chart Overlay - Real-time OHLC data */}
                <div className="absolute top-4 left-4 bg-black bg-opacity-60 rounded-lg p-3 backdrop-blur-sm border border-gray-600">
                    <div className="text-white text-sm space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400">O:</span>
                            <span className="text-white font-medium">{formatPrice(priceData.open)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400">H:</span>
                            <span className="text-green-400 font-medium">{formatPrice(priceData.high)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400">L:</span>
                            <span className="text-red-400 font-medium">{formatPrice(priceData.low)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400">C:</span>
                            <span className={`font-medium ${priceData.changePercent24h >= 0 ? 'text-green-400' : 'text-red-400'
                                }`}>
                                {formatPrice(priceData.close)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer - Real-time Additional Info */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-950 to-black border-t border-gray-600 px-4 py-2">
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                        <span className="text-gray-400">
                            Volume: <span className="text-white font-medium">{formatLargeNumber(priceData.volume24h)}</span>
                        </span>
                        <span className="text-gray-400">
                            Market Cap: <span className="text-white font-medium">{formatLargeNumber(priceData.marketCap)}</span>
                        </span>
                        <span className="text-gray-400">
                            Updated: <span className="text-yellow-400 font-medium">{priceData.lastUpdate.toLocaleTimeString()}</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400">Powered by</span>
                        <span className="text-white font-medium">TradingView & CoinGecko</span>
                        {isConnected && (
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-2"></div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TradingViewChart;