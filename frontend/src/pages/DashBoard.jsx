import React from 'react'
import { Plus, TrendingUp, DollarSign, Clock, BarChart3 } from 'lucide-react'
import Navbar from '../dashboradcomponets/Navbar'
import UserProvider from '../context/useGetUser'
import AssetsProvider from '../context/useGetAssets'

const DashBoard = () => {
    return (
        <AssetsProvider>
            <UserProvider>
                <div className='min-h-screen bg-gray-950'>
                    <Navbar />
                    <div className='flex h-[calc(100vh-80px)]'>
                        {/* Trading Chart Section - 80% width */}
                        <div className='w-4/5 bg-gray-950 p-4 border-r border-gray-700'>
                            <div className='h-full bg-gray-900 rounded-lg border border-gray-700 flex flex-col'>
                                {/* Chart Header */}
                                <div className='p-4 border-b border-gray-700 flex justify-between items-center'>
                                    <div className='flex items-center gap-4'>
                                        <h2 className='text-white text-xl font-bold'>BTC/USD</h2>
                                        <span className='text-green-400 text-lg font-semibold'>$45,240.50</span>
                                        <span className='text-green-400 text-sm'>+2.4%</span>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <button className='text-gray-400 hover:text-white p-2 rounded'>1m</button>
                                        <button className='text-white bg-gray-700 p-2 rounded'>5m</button>
                                        <button className='text-gray-400 hover:text-white p-2 rounded'>15m</button>
                                        <button className='text-gray-400 hover:text-white p-2 rounded'>1h</button>
                                    </div>
                                </div>

                                {/* Chart Area */}
                                <div className='flex-1 p-4 flex items-center justify-center'>
                                    <div className='text-gray-500 text-center'>
                                        <BarChart3 size={64} className='mx-auto mb-4 opacity-50' />
                                        <p className='text-lg'>Trading Chart</p>
                                        <p className='text-sm'>Chart visualization will be implemented here</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Trading Actions Panel - 20% width */}
                        <div className='w-1/5 bg-gray-900 p-4'>
                            <div className='h-full flex flex-col gap-4'>
                                {/* Trading Controls */}
                                <div className='bg-gray-800 rounded-lg p-4 border border-gray-700'>
                                    <h3 className='text-white font-semibold mb-4 flex items-center gap-2'>
                                        <TrendingUp size={20} />
                                        Quick Trade
                                    </h3>

                                    {/* Amount Input */}
                                    <div className='mb-4'>
                                        <label className='text-gray-400 text-sm block mb-2'>Amount</label>
                                        <div className='relative'>
                                            <DollarSign className='absolute left-3 top-3 text-gray-400' size={16} />
                                            <input
                                                type='number'
                                                placeholder='100'
                                                className='w-full bg-gray-700 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-600 focus:border-yellow-400 focus:outline-none'
                                            />
                                        </div>
                                    </div>

                                    {/* Time Selection */}
                                    <div className='mb-4'>
                                        <label className='text-gray-400 text-sm block mb-2'>Time</label>
                                        <div className='flex gap-2'>
                                            <button className='flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded text-sm transition-colors'>1m</button>
                                            <button className='flex-1 bg-yellow-500 text-black py-2 rounded text-sm font-semibold'>5m</button>
                                            <button className='flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded text-sm transition-colors'>15m</button>
                                        </div>
                                    </div>

                                    {/* Trade Buttons */}
                                    <div className='grid grid-cols-2 gap-2'>
                                        <button className='bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors'>
                                            UP ↑
                                        </button>
                                        <button className='bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors'>
                                            DOWN ↓
                                        </button>
                                    </div>
                                </div>

                                {/* Active Trades */}
                                <div className='bg-gray-800 rounded-lg p-4 border border-gray-700 flex-1'>
                                    <h3 className='text-white font-semibold mb-4 flex items-center gap-2'>
                                        <Clock size={20} />
                                        Active Trades
                                    </h3>

                                    {/* Sample Active Trade */}
                                    <div className='bg-gray-700 rounded-lg p-3 mb-2'>
                                        <div className='flex justify-between items-center mb-2'>
                                            <span className='text-yellow-400 font-semibold'>BTC/USD</span>
                                            <span className='text-green-400 text-sm'>UP ↑</span>
                                        </div>
                                        <div className='flex justify-between items-center text-sm'>
                                            <span className='text-gray-400'>$100</span>
                                            <span className='text-white'>2:34</span>
                                        </div>
                                        <div className='w-full bg-gray-600 rounded-full h-2 mt-2'>
                                            <div className='bg-green-400 h-2 rounded-full w-3/4'></div>
                                        </div>
                                    </div>

                                    {/* Empty State */}
                                    <div className='text-center text-gray-500 mt-8'>
                                        <p className='text-sm'>No more active trades</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </UserProvider>
        </AssetsProvider>
    )
}

export default DashBoard