import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useUser } from '../context/useGetUser';
import AssetsCard from './AssetsCard';
import { useAssets } from '../context/useGetAssets';
import ProfileCard from './ProfileCard';

const Navbar = () => {
    const { user, fetchUserProfile } = useUser();
    const [openAssetsModal, setOpenAssetsModal] = useState(false);
    const [openProfileModal, setOpenProfileModal] = useState(false);
    const { activeAsset } = useAssets();

    useEffect(() => {
        fetchUserProfile(); // fetch profile when this component loads
    }, []);

    const toggleAssetsModal = () => {
        setOpenAssetsModal(!openAssetsModal);
    };

    const toggleProfileModal = () => {
        setOpenProfileModal(!openProfileModal);
    };

    return (
        <>

            <div className='relative bg-gradient-to-br from-gray-900 via-gray-950 to-black p-4 flex justify-between items-center shadow-lg border-b border-gray-700'>
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

                    {/* Add trading modal toggle button */}
                    <button
                        className='bg-gray-800 hover:bg-gray-700 p-2 rounded-xl text-white border border-gray-600 transition-colors relative z-50'
                        onClick={toggleAssetsModal}
                    >
                        {openAssetsModal ? <X size={20} /> : <Plus size={20} />}
                    </button>

                    {/* Active trade */}
                    <div className='bg-gray-800 px-3 py-2 rounded-xl text-white border border-gray-600'>
                        <div className='flex items-center gap-3'>
                            {/* Symbol */}
                            <span className='font-semibold text-yellow-400'>{activeAsset?.symbol.slice(8, 11) || "BTC"}</span>
                            {/* Percentage profit */}
                            <span className='text-green-400 font-medium'>{activeAsset?.payout_percentage || "0"}%</span>
                        </div>
                    </div>
                </div>

                {/* Right part */}
                <div className='flex items-center gap-4'>
                    {/* Balance */}
                    <div className='text-white'>
                        <span className='text-gray-400 text-sm'>Balance: </span>
                        <span className="text-xl font-bold text-green-400">
                            ${user?.balance ?? 0}
                        </span>
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
                    <div className='bg-gray-800 border border-gray-600 w-10 h-10 rounded-full text-white flex items-center justify-center font-bold cursor-pointer hover:bg-gray-700 transition-colors'
                        onClick={toggleProfileModal}
                    >
                        {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                    </div>
                </div>

                {/* Assets Modal - positioned absolutely */}
                {openAssetsModal && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 bg-transparent bg-opacity-50 z-40"
                            onClick={toggleAssetsModal}
                        />

                        {/* Modal Content */}
                        <div className="absolute  top-16 left-20 z-50">
                            <AssetsCard />
                        </div>
                    </>
                )}

                {/* Profile Modal  */}
                {openProfileModal && (
                    <>
                        <div
                            className="fixed inset-0 bg-transparent bg-opacity-50 z-40"
                            onClick={toggleProfileModal}
                        />

                        <div className="absolute  top-16 right-5 z-50">
                            <ProfileCard />
                        </div>

                    </>
                )}
            </div>
        </>
    )
}

export default Navbar