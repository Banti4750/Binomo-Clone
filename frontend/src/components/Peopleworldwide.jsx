import React from 'react'

const Peopleworldwide = () => {
    return (
        <div className="bg-gradient-to-tr from-black via-blue-950 to-black h-[600px] p-8 md:p-12 relative overflow-hidden mx-auto  flex justify-center items-center">
            <div className="w-full max-w-6xl">
                <h1 className='text-5xl font-bold text-white text-center mb-12'>
                    People worldwide earn with Binomo
                </h1>

                <div className='max-w-4xl mx-auto mb-12'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                        {/* Left Column */}
                        <div className='space-y-3'>
                            {/* Active Users Card - Large */}
                            <div className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-8 flex items-center gap-6 h-48'>
                                <div className='w-20 h-20 bg-white/10 rounded-full flex items-center justify-center'>
                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div className='text-left'>
                                    <div className='text-4xl md:text-5xl font-bold text-white'>30 lakh+</div>
                                    <div className='text-gray-300 text-xl'>Active users</div>
                                </div>
                            </div>

                            {/* Countries and Trading Assets Row */}
                            <div className='grid grid-cols-2 gap-4'>
                                {/* Countries Card */}
                                <div className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center h-32'>
                                    <div className='w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-3'>
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className='text-2xl font-bold text-white'>130</div>
                                    <div className='text-gray-300 text-sm'>Countries</div>
                                </div>

                                {/* Trading Assets Card */}
                                <div className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center h-32'>
                                    <div className='w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-3'>
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <div className='text-2xl font-bold text-white'>70+</div>
                                    <div className='text-gray-300 text-sm'>Trading assets</div>
                                </div>
                            </div>
                        </div>
                        <div className='space-y-3'>
                            {/* Countries and Trading Assets Row */}
                            <div className='grid grid-cols-2 gap-4'>
                                {/* Countries Card */}
                                <div className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center h-32'>
                                    <div className='w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-3'>
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                    </div>
                                    <div className='text-2xl font-bold text-white'>₹80</div>
                                    <div className='text-gray-300 text-sm'>Minimum trade</div>
                                </div>

                                {/* Minimum Deposit Card */}
                                <div className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center h-32'>
                                    <div className='w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-3'>
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <div className='text-2xl font-bold text-white'>₹500</div>
                                    <div className='text-gray-300 text-sm'>Minimum deposit</div>
                                </div>
                            </div>
                            {/* Active Users Card - Large */}
                            <div className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-8 flex items-center gap-6 h-48'>
                                <div className='w-20 h-20 bg-white/10 rounded-full flex items-center justify-center'>
                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <div className='text-left'>
                                    <div className='text-4xl md:text-5xl font-bold text-white'>₹170 crore</div>
                                    <div className='text-gray-300 text-xl'>Monthly payouts</div>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>

                {/* Join Us Button */}
                <div className="text-center">
                    <button className='bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-xl px-12 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-2xl'>
                        Join us →
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Peopleworldwide