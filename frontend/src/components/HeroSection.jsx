import React from 'react'
import binomo from '../assets/binomo.png';
import Button from './Button';
import NavBar from './NavBar';
const HeroSection = () => {
    return (
        <>
            <section className="hero-section">
                <div
                    className="h-[600px] bg-cover bg-center"
                    style={{ backgroundImage: `url(${binomo})` }}
                >
                    <NavBar />
                    <div className="relative z-10 h-full flex items-center px-8 lg:px-16">
                        <div className="text-start flex flex-col w-full lg:w-1/2 max-w-2xl">
                            <div className="mb-6">
                                <h1 className="text-5xl lg:text-7xl text-white font-bold  mb-2 animate-fade-in">
                                    <span className="text-amber-300 ">
                                        Frog of Fortune:
                                    </span>
                                </h1>
                                <h1 className="text-5xl lg:text-7xl text-white font-bold leading-tight mb-6">
                                    back again
                                </h1>
                            </div>

                            <p className="text-xl lg:text-2xl text-gray-200 font-semibold mb-8 leading-relaxed">
                                <span className="text-green-400 font-bold">101 prizes*</span>,
                                <span className="text-yellow-400 font-bold"> $50 entry</span> —
                                bigger scale, easier start, more chances to win!
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button text="Join Now!" />
                                <button className="border-2 border-white text-white hover:bg-white hover:text-black font-bold px-8 py-4 rounded-lg text-lg transition-all duration-300">
                                    Learn More
                                </button>
                            </div>

                            <div className="mt-8 flex items-center space-x-4 text-sm text-gray-300">
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                    <span>Live Trading</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                                    <span>24/7 Support</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default HeroSection