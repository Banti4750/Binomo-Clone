import React from 'react'

const Binomomakescard = ({ image, buttonName, description, title }) => {
    return (
        <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 rounded-2xl p-8 md:p-12 relative overflow-hidden max-w-6xl mx-auto">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-400 rounded-full blur-3xl"></div>
                <div className="absolute bottom-10 right-20 w-40 h-40 bg-green-400 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-blue-400 rounded-full blur-2xl"></div>
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between">
                {/* Left Content */}
                <div className="flex-1 mb-8 lg:mb-0 lg:pr-12">
                    {/* Small Label */}
                    <div className="inline-block mb-6">
                        <span className="text-yellow-400 text-sm font-semibold tracking-widest uppercase bg-yellow-400/10 px-4 py-2 rounded-full border border-yellow-400/20">
                            Binomo Trading Platform
                        </span>
                    </div>

                    {/* Main Heading - Using the title prop */}
                    <h2 className="text-white text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-8">
                        {title || "Trade with confidence and earn up to"}{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-green-400">
                            $100
                        </span>{' '}
                        daily
                    </h2>

                    {/* Description - Using the description prop */}
                    {description && (
                        <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                            {description}
                        </p>
                    )}

                    {/* CTA Button - Using the buttonName prop */}
                    <button className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold text-lg px-8 py-4 rounded-xl transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-yellow-400/25">
                        {buttonName || "Start Trading"}
                    </button>
                </div>

                {/* Right Graphics */}
                <div className="flex-shrink-0 relative">
                    {/* If image is provided, show it, otherwise show 3D coins */}
                    {image ? (
                        <div className="relative w-64 h-64 lg:w-80 lg:h-80">
                            <img
                                src={image}
                                alt={title || "Trading"}
                                className="w-full h-full object-cover rounded-2xl shadow-2xl"
                            />
                            {/* Overlay gradient for better text readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl"></div>
                        </div>
                    ) : (
                        /* 3D Coin Stack */
                        <div className="relative w-64 h-64 lg:w-80 lg:h-80">
                            {/* Back coins */}
                            <div className="absolute top-8 right-8 w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full transform rotate-12 opacity-80 shadow-2xl"></div>
                            <div className="absolute top-12 right-12 w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full transform -rotate-6 opacity-70 shadow-xl"></div>

                            {/* Middle coins */}
                            <div className="absolute top-16 right-4 w-28 h-28 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full transform rotate-6 shadow-2xl">
                                <div className="absolute inset-2 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-full"></div>
                                <div className="absolute inset-4 bg-gradient-to-br from-yellow-100 to-yellow-300 rounded-full flex items-center justify-center">
                                    <span className="text-yellow-800 font-bold text-lg">$</span>
                                </div>
                            </div>

                            <div className="absolute top-20 right-16 w-24 h-24 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full transform -rotate-12 shadow-xl">
                                <div className="absolute inset-2 bg-gradient-to-br from-gray-200 to-gray-400 rounded-full"></div>
                            </div>

                            {/* Front coins */}
                            <div className="absolute top-24 right-8 w-32 h-32 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full transform rotate-3 shadow-2xl z-10">
                                <div className="absolute inset-2 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full"></div>
                                <div className="absolute inset-4 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-full"></div>
                                <div className="absolute inset-6 bg-gradient-to-br from-yellow-100 to-yellow-300 rounded-full flex items-center justify-center">
                                    <span className="text-yellow-800 font-bold text-2xl">$</span>
                                </div>
                            </div>

                            {/* Green Plus Symbol */}
                            <div className="absolute bottom-4 right-4 w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-lg transform rotate-12 shadow-2xl flex items-center justify-center z-20">
                                <span className="text-white font-bold text-3xl">+</span>
                            </div>

                            {/* Floating elements */}
                            <div className="absolute top-4 left-8 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                            <div className="absolute bottom-8 left-4 w-2 h-2 bg-green-400 rounded-full animate-pulse delay-300"></div>
                            <div className="absolute top-1/2 left-12 w-4 h-4 bg-blue-400 rounded-full animate-pulse delay-700"></div>
                        </div>
                    )}
                </div>
            </div>

            {/* Subtle grid pattern overlay */}
            <div className="absolute inset-0 opacity-5">
                <div className="w-full h-full" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: '60px 60px'
                }}></div>
            </div>
        </div>
    )
}

export default Binomomakescard

