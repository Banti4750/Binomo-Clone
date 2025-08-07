import React from 'react'

const Deposit = () => {
    return (
        <>
            <div className="bg-gradient-to-br from-black via-blue-950 to-black h-[600px] p-8 md:p-12  relative overflow-hidden mx-auto  flex justify-center items-center">
                {/* <main className="relative"> */}
                {/* Background gradient */}

                <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
                    {/* Main heading */}
                    <h1 className="text-3xl md:text-5xl text-white font-bold mb-8 max-w-6xl leading-tight">
                        Transparent Deposit, Fast Withdrawal
                    </h1>

                    {/* Subtitle */}
                    <p className="text-xl md:text-2xl text-gray-300 mb-16 max-w-2xl">
                        Transfers safely via familiar payment methods
                    </p>

                    {/* Payment methods */}
                    <div className="flex flex-wrap justify-center items-center gap-8 mb-16 max-w-4xl">
                        {/* UPI */}
                        <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 w-64 h-24 flex items-center justify-center border border-gray-700">
                            <div className="flex items-center space-x-2">
                                <span className="text-white text-2xl font-bold">UPI</span>
                                <div className="flex space-x-1">
                                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                </div>
                            </div>
                        </div>

                        {/* Google Pay */}
                        <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 w-64 h-24 flex items-center justify-center border border-gray-700">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">G</span>
                                </div>
                                <span className="text-white text-xl font-medium">Pay</span>
                            </div>
                        </div>

                        {/* IMPS */}
                        <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 w-64 h-24 flex items-center justify-center border border-gray-700">
                            <div className="flex items-center space-x-2">
                                <span className="text-white text-2xl font-bold">IMPS</span>
                                <div className="flex space-x-1">
                                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <button className="bg-yellow-400 text-black font-bold text-lg px-8 py-4 rounded-lg hover:bg-yellow-300 transition-colors flex items-center space-x-2 mb-20">
                        <span>Try Binomo</span>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
                {/* </main> */}
            </div>
        </>
    )
}

export default Deposit