import Navbar from '../dashboradcomponets/Navbar'
import UserProvider from '../context/useGetUser'
import AssetsProvider from '../context/useGetAssets'
import TradingViewChart from '../dashboradcomponets/TradingViewChart'
import TradePage from '../dashboradcomponets/TradePage'

const DashBoard = () => {
    return (
        <>

            <AssetsProvider>
                <UserProvider>
                    <div className='min-h-screen bg-gray-950'>
                        <Navbar />
                        <div className='flex h-[calc(100vh-80px)]'>
                            {/* Trading Chart Section - 80% width */}
                            <div className='w-4/5 bg-black p-4 border-r border-gray-700'>
                                <div className='h-full bg-gray-900 rounded-lg border border-gray-700 flex flex-col'>
                                    <TradingViewChart />
                                </div>
                            </div>

                            {/* Trading Actions Panel - 20% width */}
                            <TradePage />
                        </div>
                    </div>
                </UserProvider>
            </AssetsProvider>
        </>
    )
}

export default DashBoard