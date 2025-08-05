import React, { useState } from 'react'
import Binomomakescard from './Binomomakescard'

const Binomomakes = () => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const cardData = [
        {
            title: "Fast Trading",
            description: "Execute trades in seconds with our lightning-fast platform. Real-time market data and instant order execution.",
            buttonName: "Trade Now",
            image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop&auto=format"
        },
        {
            title: "Advanced Analytics",
            description: "Make informed decisions with comprehensive charts, technical indicators, and market analysis tools.",
            buttonName: "Analyze Markets",
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&auto=format"
        },
        {
            title: "Mobile Trading",
            description: "Trade anywhere, anytime with our powerful mobile app. Full desktop functionality in your pocket.",
            buttonName: "Download App",
            image: "https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?w=400&h=300&fit=crop&auto=format"
        },
        {
            title: "Fast Trading",
            description: "Execute trades in seconds with our lightning-fast platform. Real-time market data and instant order execution.",
            buttonName: "Trade Now",
            image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop&auto=format"
        },
        {
            title: "Advanced Analytics",
            description: "Make informed decisions with comprehensive charts, technical indicators, and market analysis tools.",
            buttonName: "Analyze Markets",
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&auto=format"
        },
        {
            title: "Mobile Trading",
            description: "Trade anywhere, anytime with our powerful mobile app. Full desktop functionality in your pocket.",
            buttonName: "Download App",
            image: "https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?w=400&h=300&fit=crop&auto=format"
        }

    ]

    const nextSlide = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === cardData.length - 1 ? 0 : prevIndex + 1
        )
    }

    const prevSlide = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? cardData.length - 1 : prevIndex - 1
        )
    }

    const goToSlide = (index) => {
        setCurrentIndex(index)
    }

    return (
        <>


            {/* Cards Section */}
            <div className='bg-black h-[800px] flex justify-center items-center'>
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <p className='text-white text-5xl font-bold mb-6'>
                            Binomo makes trading more exciting
                        </p>
                        {/* <p className='text-gray-300 text-xl max-w-2xl mx-auto'>
                            Experience the future of online trading with cutting-edge tools, real-time analytics, and seamless execution
                        </p> */}
                    </div>

                    {/* Cards Carousel */}
                    <div className="relative max-w-6xl mx-auto">
                        {/* Navigation Buttons */}
                        <button
                            onClick={prevSlide}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-all duration-200"
                        >
                            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        <button
                            onClick={nextSlide}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-all duration-200"
                        >
                            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        {/* Cards Container */}
                        <div className="overflow-hidden">
                            <div
                                className="flex transition-transform duration-500 ease-in-out"
                                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                            >
                                {cardData.map((card, index) => (
                                    <div key={index} className="w-full flex-shrink-0 flex justify-center px-4">
                                        <Binomomakescard
                                            image={card.image}
                                            title={card.title}
                                            description={card.description}
                                            buttonName={card.buttonName}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Dots Indicator */}
                        <div className="flex justify-center mt-8 space-x-2">
                            {cardData.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToSlide(index)}
                                    className={`w-3 h-3 rounded-full transition-all duration-200 ${index === currentIndex
                                        ? 'bg-blue-600 scale-125'
                                        : 'bg-gray-300 hover:bg-gray-400'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Binomomakes