import React from 'react'

const Joinsuccessfultraders = () => {
    return (
        <div className="bg-black min-h-screen relative overflow-hidden">
            {/* Animated gradient waves background */}
            <div className="absolute inset-0">
                {/* Wave 1 */}
                <div className="absolute w-[100%] h-[100%] -top-1/2 -left-1/4 opacity-30">
                    <div className="w-full h-full bg-gradient-to-br from-teal-400 via-blue-500 to-purple-600 rounded-full blur-3xl animate-pulse transform rotate-45"></div>
                </div>

                {/* Wave 2 */}
                <div className="absolute w-[80%] h-[80%] -top-1/3 -right-1/4 opacity-25">
                    <div className="w-full h-full bg-gradient-to-bl from-purple-500 via-pink-500 to-teal-400 rounded-full blur-3xl animate-pulse  transform -rotate-12" style={{ animationDelay: '1s' }}></div>
                </div>

                {/* Wave 3 */}
                <div className="absolute w-[60%] h-[60%] top-1/2 -left-1/3 opacity-20">
                    <div className="w-full h-full bg-gradient-to-tr from-blue-400 via-teal-500 to-purple-400 rounded-full blur-3xl animate-pulse  transform rotate-90" style={{ animationDelay: '2s' }}></div>
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10 p-8 md:p-12 flex flex-col items-center justify-center min-h-screen">
                {/* Main heading */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-gray-300 to-gray-100 bg-clip-text text-transparent">
                        Join successful traders
                    </h2>
                </div>

                {/* Success stories cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
                    {/* Card 1 */}
                    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:bg-gray-800/50 transition-all duration-300">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center mr-4">
                                <span className="text-white text-lg font-bold">AK</span>
                            </div>
                            <div>
                                <h3 className="text-white text-xl font-semibold mb-1">Bought a bicycle for grandson</h3>
                            </div>
                        </div>
                        <p className="text-gray-300 mb-4 leading-relaxed">
                            Trading on Binomo seems easier than on other platforms. Earned $10 on the first day,
                            and within a month, reached $200. It was enough for a gift to my grandson, and now I'm
                            saving for a gift for my wife
                        </p>
                        <div className="flex items-center">
                            <div className="w-6 h-4 bg-red-500 mr-2 flex items-center justify-center">
                                <span className="text-white text-xs">🇹🇷</span>
                            </div>
                            <span className="text-gray-400 text-sm">Abdulla K., 60 yo.</span>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:bg-gray-800/50 transition-all duration-300">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center mr-4">
                                <span className="text-white text-lg font-bold">BM</span>
                            </div>
                            <div>
                                <h3 className="text-white text-xl font-semibold mb-1">Saving for my house</h3>
                            </div>
                        </div>
                        <p className="text-gray-300 mb-4 leading-relaxed">
                            With my main job, a side hustle, a small business, and a Binomo account, I'm seeing
                            success. I'm planning to replace the side hustle with trading on Binomo for more freedom
                        </p>
                        <div className="flex items-center">
                            <div className="w-6 h-4 bg-orange-500 mr-2 flex items-center justify-center">
                                <span className="text-white text-xs">🇮🇳</span>
                            </div>
                            <span className="text-gray-400 text-sm">Babar M., 22 yo.</span>
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:bg-gray-800/50 transition-all duration-300">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center mr-4">
                                <span className="text-white text-lg font-bold">ET</span>
                            </div>
                            <div>
                                <h3 className="text-white text-xl font-semibold mb-1">Paying for education</h3>
                            </div>
                        </div>
                        <p className="text-gray-300 mb-4 leading-relaxed">
                            Have been trading on Binomo for 3 years. Realized I've saved up for education with salary,
                            trading, and parental support. Successfully studying and striving for further development
                        </p>
                        <div className="flex items-center">
                            <div className="w-6 h-4 bg-green-500 mr-2 flex items-center justify-center">
                                <span className="text-white text-xs">🇲🇽</span>
                            </div>
                            <span className="text-gray-400 text-sm">Enrique T., 25 yo.</span>
                        </div>
                    </div>
                </div>

                {/* CTA Button */}
                <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
                    Start for free →
                </button>
            </div>
        </div>
    )
}

export default Joinsuccessfultraders