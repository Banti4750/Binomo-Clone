import { useEffect, useState } from 'react'
import { Plus, TrendingUp, User, X } from 'lucide-react'
import { useUser } from '../context/useGetUser';
import AssetsCard from './AssetsCard';
import { useAssets } from '../context/useGetAssets';
import ProfileCard from './ProfileCard';
import ShowAllTrades from './ShowAllTrades';

const Navbar = () => {
    const { user, fetchUserProfile } = useUser();
    const [openAssetsModal, setOpenAssetsModal] = useState(false);
    const [openProfileModal, setOpenProfileModal] = useState(false);
    const { activeAsset } = useAssets();
    const [openAllModal, setOpenAllModal] = useState(false);
    useEffect(() => {
        fetchUserProfile(); // fetch profile when this component loads
    }, []);

    const toggleAssetsModal = () => {
        setOpenAssetsModal(!openAssetsModal);
    };

    const toggleProfileModal = () => {
        setOpenProfileModal(!openProfileModal);
    };

    const toggleAllTradeModal = () => {
        setOpenAllModal(!openAllModal);
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

                    <button
                        className='bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-xl text-yellow-400 border border-gray-600 transition-colors relative z-50 flex items-center gap-2'
                        onClick={toggleAllTradeModal}
                    >
                        <TrendingUp size={16} />
                        <span className="font-medium">P & L</span>
                    </button>

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
                    <div className='bg-gray-800 border border-gray-600 rounded-full text-white flex items-center justify-center font-bold cursor-pointer hover:bg-gray-700 transition-colors'
                        onClick={toggleProfileModal}
                    >
                        {user?.profile_pic_url ? (
                            <img
                                src={user.profile_pic_url}
                                alt="Profile"
                                className="w-10 h-10 rounded-full object-cover border-2 border-gray-600"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <User size={24} className="text-white" />
                            </div>
                        )}
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

                {openAllModal && (
                    <>


                        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                            {/* Modal Box */}
                            <div className="bg-gray-900 rounded-xl border border-gray-700 shadow-2xl max-w-4xl w-full mx-4 overflow-hidden">

                                {/* Header */}
                                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                                    <h2 className="text-xl font-bold text-white">Trading Dashboard</h2>
                                    <button
                                        onClick={toggleAllTradeModal}
                                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        <X size={20} className="text-gray-400" />
                                    </button>
                                </div>

                                {/* Body (scrollable) */}
                                <div className="overflow-y-auto no-scrollbar max-h-[75vh] bg-black p-4">
                                    <ShowAllTrades />
                                </div>
                            </div>
                        </div>


                    </>
                )}
            </div>
        </>
    )
}

export default Navbar