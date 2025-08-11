// utils/PriceService.js
import axios from 'axios';
import WebSocket from 'ws';
import { EventEmitter } from 'events';

class PriceService extends EventEmitter {
    constructor() {
        super();
        this.prices = {};
        this.wsConnections = new Set();
        this.updateInterval = null;

        // Free API configuration
        this.apis = {
            // Free tier: 5 API requests per minute, 500 per day
            alphavantage: {
                baseUrl: 'https://www.alphavantage.co/query',
                apiKey: process.env.ALPHAVANTAGE_API_KEY || 'demo', // Get free key from alphavantage.co
            },
            // Completely free, no API key required
            exchangerate: {
                baseUrl: 'https://api.exchangerate-api.com/v4/latest',
            },
            // Free tier: 1000 requests/month
            finhub: {
                baseUrl: 'https://finnhub.io/api/v1',
                apiKey: process.env.FINNHUB_API_KEY || 'demo', // Get free key from finnhub.io
            },
            // Completely free, no limits
            binance: {
                baseUrl: 'https://api.binance.com/api/v3',
            }
        };

        // Asset mapping for different APIs
        this.assetMapping = {
            'EUR/USD': { type: 'forex', symbol: 'EURUSD', binance: 'EURUSDT' },
            'GBP/USD': { type: 'forex', symbol: 'GBPUSD', binance: 'GBPUSDT' },
            'USD/JPY': { type: 'forex', symbol: 'USDJPY', binance: null },
            'BTC/USD': { type: 'crypto', symbol: 'BTC', binance: 'BTCUSDT' },
            'ETH/USD': { type: 'crypto', symbol: 'ETH', binance: 'ETHUSDT' },
            'GOLD': { type: 'commodity', symbol: 'XAU', binance: null },
            'OIL': { type: 'commodity', symbol: 'WTI', binance: null }
        };

        this.initializePrices();
    }

    // Initialize with default prices
    initializePrices() {
        Object.keys(this.assetMapping).forEach(asset => {
            this.prices[asset] = {
                price: this.getDefaultPrice(asset),
                change: 0,
                changePercent: 0,
                timestamp: Date.now(),
                trend: 'neutral'
            };
        });
    }

    // Get default prices (fallback)
    getDefaultPrice(asset) {
        const defaults = {
            'EUR/USD': 1.0875,
            'GBP/USD': 1.2750,
            'USD/JPY': 149.25,
            'BTC/USD': 45000.00,
            'ETH/USD': 2800.00,
            'GOLD': 2050.00,
            'OIL': 85.50
        };
        return defaults[asset] || 100;
    }

    // Fetch forex rates from free API
    async fetchForexRates() {
        try {
            const response = await axios.get(`${this.apis.exchangerate.baseUrl}/USD`, {
                timeout: 5000
            });

            const rates = response.data.rates;

            // Calculate EUR/USD
            if (rates.EUR) {
                this.updatePrice('EUR/USD', 1 / rates.EUR);
            }

            // Calculate GBP/USD
            if (rates.GBP) {
                this.updatePrice('GBP/USD', 1 / rates.GBP);
            }

            // Calculate USD/JPY
            if (rates.JPY) {
                this.updatePrice('USD/JPY', rates.JPY);
            }

            console.log('✅ Forex rates updated from ExchangeRate API');
        } catch (error) {
            console.error('❌ Error fetching forex rates:', error.message);
            this.fallbackToSimulation(['EUR/USD', 'GBP/USD', 'USD/JPY']);
        }
    }

    // Fetch crypto prices from Binance (completely free)
    async fetchCryptoPrices() {
        try {
            const symbols = ['BTCUSDT', 'ETHUSDT'];
            const response = await axios.get(`${this.apis.binance.baseUrl}/ticker/price`, {
                timeout: 5000
            });

            const prices = response.data;

            prices.forEach(item => {
                if (item.symbol === 'BTCUSDT') {
                    this.updatePrice('BTC/USD', parseFloat(item.price));
                }
                if (item.symbol === 'ETHUSDT') {
                    this.updatePrice('ETH/USD', parseFloat(item.price));
                }
            });

            console.log('✅ Crypto prices updated from Binance API');
        } catch (error) {
            console.error('❌ Error fetching crypto prices:', error.message);
            this.fallbackToSimulation(['BTC/USD', 'ETH/USD']);
        }
    }

    // Fetch commodity prices from Alpha Vantage (limited free tier)
    async fetchCommodityPrices() {
        if (!process.env.ALPHAVANTAGE_API_KEY || process.env.ALPHAVANTAGE_API_KEY === 'demo') {
            console.log('⚠️  Alpha Vantage API key not configured, using simulation for commodities');
            this.fallbackToSimulation(['GOLD', 'OIL']);
            return;
        }

        try {
            // Gold price
            const goldResponse = await axios.get(`${this.apis.alphavantage.baseUrl}`, {
                params: {
                    function: 'CURRENCY_EXCHANGE_RATE',
                    from_currency: 'XAU',
                    to_currency: 'USD',
                    apikey: this.apis.alphavantage.apiKey
                },
                timeout: 10000
            });

            const goldData = goldResponse.data['Realtime Currency Exchange Rate'];
            if (goldData) {
                this.updatePrice('GOLD', parseFloat(goldData['5. Exchange Rate']));
            }

            console.log('✅ Commodity prices updated from Alpha Vantage');
        } catch (error) {
            console.error('❌ Error fetching commodity prices:', error.message);
            this.fallbackToSimulation(['GOLD', 'OIL']);
        }
    }

    // Fallback to price simulation
    fallbackToSimulation(assets) {
        assets.forEach(asset => {
            const currentPrice = this.prices[asset]?.price || this.getDefaultPrice(asset);
            const volatility = this.getVolatility(asset);
            const change = (Math.random() - 0.5) * volatility;
            const newPrice = currentPrice * (1 + change);

            this.updatePrice(asset, newPrice);
        });
    }

    // Get asset volatility for simulation
    getVolatility(asset) {
        const volatilities = {
            'EUR/USD': 0.001,
            'GBP/USD': 0.002,
            'USD/JPY': 0.001,
            'BTC/USD': 0.02,
            'ETH/USD': 0.025,
            'GOLD': 0.005,
            'OIL': 0.01
        };
        return volatilities[asset] || 0.001;
    }

    // Update price and calculate changes
    updatePrice(asset, newPrice) {
        const oldPrice = this.prices[asset]?.price || newPrice;
        const change = newPrice - oldPrice;
        const changePercent = oldPrice > 0 ? ((change / oldPrice) * 100) : 0;

        this.prices[asset] = {
            price: parseFloat(newPrice.toFixed(6)),
            change: parseFloat(change.toFixed(6)),
            changePercent: parseFloat(changePercent.toFixed(3)),
            timestamp: Date.now(),
            trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
        };

        // Emit price update event
        this.emit('priceUpdate', { asset, data: this.prices[asset] });
    }

    // Start real-time updates
    startRealTimeUpdates() {
        // Fetch all prices immediately
        this.fetchAllPrices();

        // Set up intervals for different APIs
        setInterval(() => this.fetchForexRates(), 60000); // Every minute
        setInterval(() => this.fetchCryptoPrices(), 10000); // Every 10 seconds
        setInterval(() => this.fetchCommodityPrices(), 300000); // Every 5 minutes

        // Fallback simulation for more frequent updates
        setInterval(() => {
            Object.keys(this.assetMapping).forEach(asset => {
                // Add small random movements to simulate real-time changes
                if (Math.random() < 0.7) { // 70% chance of price movement
                    this.fallbackToSimulation([asset]);
                }
            });
        }, 2000); // Every 2 seconds

        console.log('🚀 Real-time price updates started');
    }

    // Fetch all prices
    async fetchAllPrices() {
        await Promise.all([
            this.fetchForexRates(),
            this.fetchCryptoPrices(),
            this.fetchCommodityPrices()
        ]);
    }

    // Get current price for a specific asset
    getCurrentPrice(asset) {
        return this.prices[asset]?.price || this.getDefaultPrice(asset);
    }

    // Get all prices
    getAllPrices() {
        return this.prices;
    }

    // Add WebSocket connection
    addWebSocketConnection(ws) {
        this.wsConnections.add(ws);

        // Send current prices immediately
        ws.send(JSON.stringify({
            type: 'prices',
            data: this.prices
        }));

        ws.on('close', () => {
            this.wsConnections.delete(ws);
        });
    }

    // Broadcast price updates to all connected clients
    broadcastPriceUpdate(asset, data) {
        const message = JSON.stringify({
            type: 'priceUpdate',
            asset,
            data
        });

        this.wsConnections.forEach(ws => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(message);
            }
        });
    }
}

export default PriceService;