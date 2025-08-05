import Button from './Button'

const NavBar = () => {
    return (
        <>
            <nav className="bg-black/60 bg-opacity-90 p-1  fixed w-full top-0 z-50 border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">

                        {/* Logo Section */}
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-yellow-400 rounded flex items-center justify-center transform rotate-12">
                                    <span className="text-black font-bold text-lg">⚡</span>
                                </div>
                                <span className="text-white text-xl font-bold tracking-wide">
                                    binomo
                                </span>
                            </div>
                        </div>

                        {/* Desktop Navigation Links */}
                        <div className="hidden md:flex items-center space-x-8">
                            <ul className="flex items-center space-x-6">
                                <li>
                                    <a href="#" className="text-white hover:text-amber-400 transition-colors duration-300 font-medium flex items-center space-x-1">
                                        <span>VIP</span>
                                        <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-0.5 rounded-full font-bold">PRO</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-white hover:text-amber-400 transition-colors duration-300 font-medium">
                                        Statuses
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-white hover:text-amber-400 transition-colors duration-300 font-medium">
                                        Info
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-white hover:text-amber-400 transition-colors duration-300 font-medium">
                                        Blog
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Desktop Auth Buttons */}
                        <div className="hidden md:flex items-center space-x-3">
                            <Button text="Log In" variant="ghost" />
                            <Button text="Register" variant="primary" />
                        </div>
                    </div>
                </div>

            </nav >
        </>
    )
}

export default NavBar