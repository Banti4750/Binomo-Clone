import React from 'react'
import HeroSection from '../components/HeroSection'
import Binomomakes from '../components/Binomomakes'
import Peopleworldwide from '../components/Peopleworldwide'
import Joinsuccessfultraders from '../components/Joinsuccessfultraders'
import Deposit from '../components/Deposit'
import Footer from '../components/Footer'

const LandingPage = () => {
    return (
        <>
            <div className='w-full'>
                <HeroSection />
                <Binomomakes />
                <Peopleworldwide />
                {/* for chart testing}
                {/* <ChartComponent /> */}
                <Joinsuccessfultraders />
                <Deposit />
                <Footer />
            </div>
        </>
    )
}

export default LandingPage