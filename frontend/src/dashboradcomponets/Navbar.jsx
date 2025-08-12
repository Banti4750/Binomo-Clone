import { Plus } from 'lucide-react'
import React from 'react'

const Navbar = () => {
    return (
        <div className='bg-gray-900 p-4 flex justify-between items-center shadow-lg border-b border-gray-700'>
            {/* Left part */}
            <div className='flex items-center gap-4'>
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-yellow-400 rounded flex items-center justify-center transform rotate-12">
                        <span className="text-black font-bold text-lg">⚡</span>
                    </div>
                    <span className="text-white text-xl font-bold tracking-wide">
                        binomo
                    </span>
                </div>

                {/* Add trading modal */}
                <button className='bg-gray-800 hover:bg-gray-700 p-2 rounded-xl text-white border border-gray-600 transition-colors'>
                    <Plus size={20} />
                </button>

                {/* Active trade */}
                <div className='bg-gray-800 px-3 py-2 rounded-xl text-white border border-gray-600'>
                    <div className='flex items-center gap-3'>
                        {/* Symbol */}
                        <span className='font-semibold text-yellow-400'>BTC</span>
                        {/* Percentage profit */}
                        <span className='text-green-400 font-medium'>+82%</span>
                    </div>
                </div>
            </div>

            {/* Right part */}
            <div className='flex items-center gap-4'>
                {/* Balance */}
                <div className='text-white'>
                    <span className='text-gray-400 text-sm'>Balance: </span>
                    <span className='text-xl font-bold text-green-400'>$10,000</span>
                </div>

                {/* Deposit button */}
                <button className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'>
                    Deposit
                </button>

                {/* Withdraw button */}
                <button className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'>
                    Withdraw
                </button>

                {/* Profile user */}
                <div className='bg-gray-800 border border-gray-600 w-10 h-10 rounded-full text-white flex items-center justify-center font-bold cursor-pointer hover:bg-gray-700 transition-colors'>
                    BK
                </div>
            </div>
        </div>
    )
}

export default Navbar