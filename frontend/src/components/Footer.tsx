import React from 'react';

const Footer = () => {
    return (
        <div className=" bg-black flex flex-col ">

            {/* Footer */}
            <footer className="bg-black border-t border-gray-800 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Footer Top Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">

                        {/* Company Info */}
                        <div className="lg:col-span-1">
                            <div className="flex items-center mb-6 gap-2">
                                <div className="w-8 h-8 bg-yellow-400 rounded flex items-center justify-center transform rotate-12">
                                    <span className="text-black font-bold text-lg">⚡</span>
                                </div>
                                <span className="text-xl font-bold">binomo</span>
                            </div>
                            <div className="space-y-3 text-gray-400 text-sm leading-relaxed">
                                <p><strong className="text-white">CONTACTS</strong></p>
                                <p>Email</p>
                                <a href="mailto:support@binomo.com" className="text-yellow-400 hover:underline">
                                    support@binomo.com
                                </a>

                                {/* Social Links */}
                                <div className="flex space-x-3 mt-6">
                                    <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:bg-yellow-400 hover:text-black transition-all duration-300 hover:-translate-y-1">
                                        <span className="text-sm">📺</span>
                                    </a>
                                    <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:bg-yellow-400 hover:text-black transition-all duration-300 hover:-translate-y-1">
                                        <span className="text-sm">📷</span>
                                    </a>
                                    <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:bg-yellow-400 hover:text-black transition-all duration-300 hover:-translate-y-1">
                                        <span className="text-sm">🐦</span>
                                    </a>
                                    <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:bg-yellow-400 hover:text-black transition-all duration-300 hover:-translate-y-1">
                                        <span className="text-sm">✈️</span>
                                    </a>
                                    <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:bg-yellow-400 hover:text-black transition-all duration-300 hover:-translate-y-1">
                                        <span className="text-sm">📘</span>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Column 1 */}
                        <div>
                            <div className="space-y-4 flex flex-col">
                                <a href="#" className=" text-gray-400 hover:text-yellow-400 transition-colors duration-300 text-sm font-medium  pb-1 inline-block">
                                    About us
                                </a>
                                <a href="#" className=" text-gray-400 hover:text-yellow-400 transition-colors duration-300 text-sm font-medium  pb-1 inline-block">
                                    AML policy
                                </a>
                                <a href="#" className=" text-gray-400 hover:text-yellow-400 transition-colors duration-300 text-sm font-medium  pb-1 inline-block">
                                    Tournaments
                                </a>
                                <a href="#" className=" text-gray-400 hover:text-yellow-400 transition-colors duration-300 text-sm font-medium  pb-1 inline-block">
                                    Statuses
                                </a>
                            </div>
                        </div>

                        {/* Column 2 */}
                        <div>
                            <div className="space-y-4 flex flex-col">
                                <a href="#" className=" text-gray-400 hover:text-yellow-400 transition-colors duration-300 text-sm font-medium  pb-1 inline-block">
                                    Regulations
                                </a>
                                <a href="#" className=" text-gray-400 hover:text-yellow-400 transition-colors duration-300 text-sm font-medium  pb-1 inline-block">
                                    VIP
                                </a>
                                <a href="#" className=" text-gray-400 hover:text-yellow-400 transition-colors duration-300 text-sm font-medium  pb-1 inline-block">
                                    Promotions
                                </a>
                                <a href="#" className=" text-gray-400 hover:text-yellow-400 transition-colors duration-300 text-sm font-medium  pb-1 inline-block">
                                    Help Center
                                </a>
                            </div>
                        </div>

                        {/* Column 3 */}
                        <div>
                            <div className="space-y-4 flex flex-col">
                                <a href="#" className=" text-gray-400 hover:text-yellow-400 transition-colors duration-300 text-sm font-medium  pb-1 inline-block">
                                    Client Agreement
                                </a>
                                <a href="#" className=" text-gray-400 hover:text-yellow-400 transition-colors duration-300 text-sm font-medium  pb-1 inline-block">
                                    Prestige Club
                                </a>
                                <a href="#" className=" text-gray-400 hover:text-yellow-400 transition-colors duration-300 text-sm font-medium  pb-1 inline-block">
                                    Strategies
                                </a>
                                <a href="#" className=" text-gray-400 hover:text-yellow-400 transition-colors duration-300 text-sm font-medium  pb-1 inline-block">
                                    Blog
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Footer Bottom Section */}
                    <div className="border-t border-gray-800 pt-8">
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Disclaimer */}
                            <div className="flex-1 min-w-0">
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    The financial operations on this site may involve risks. By using the tools and services provided here, you may
                                    incur financial losses up to a complete loss of the funds on your Binomo account. Please evaluate the risks and
                                    consult with an independent financial advisor before making any trades. Binomo is not responsible for any
                                    direct, indirect, consequential losses, or any other damages resulting from the user's actions on the platform.
                                    From 2018 to the present, Binomo is a category "A" member of the International Financial Commission, which
                                    guarantees our customers high-quality service, transparency, and dispute resolution by an independent
                                    regulator.
                                </p>
                            </div>

                            {/* Company Info */}
                            <div className="lg:w-80">
                                <div className="text-gray-300 text-sm leading-relaxed">
                                    <p className="mb-2">Dolphin Corp LLC</p>
                                    <p className="mb-2">Euro House, Richmond Hill Road,</p>
                                    <p className="mb-4">Kingstown, St. Vincent and Grenadines</p>
                                </div>
                            </div>
                        </div>

                        {/* Copyright */}
                        <div className="border-t border-gray-500 mt-8 pt-8 text-center">
                            <p className="text-gray-500 text-sm">
                                © 2014 - 2025 Binomo. All rights reserved
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Footer;