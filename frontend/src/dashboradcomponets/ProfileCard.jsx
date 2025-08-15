import { LogOut, User, UserPlus } from 'lucide-react'
import { useEffect } from 'react'
import { useUser } from '../context/useGetUser';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ProfileCard = () => {
    const { user, fetchUserProfile } = useUser();
    const navigate = useNavigate();


    // Toast configuration
    const toastOptions = {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
    };

    useEffect(() => {
        fetchUserProfile(); // fetch profile when this component loads
    }, []);

    function handleSignout() {
        localStorage.removeItem('token');
        navigate('/');
        toast.success('Successfully signed out!', toastOptions);
    }
    return (
        <>


            <div className='bg-gradient-to-br from-gray-900 via-gray-950 to-black p-4 rounded-lg border border-gray-800/50 shadow-2xl backdrop-blur-sm max-w-sm'>
                <div className='flex flex-col p-2 space-y-4'>
                    {/* name */}
                    <div className='text-white font-semibold text-lg border-b border-gray-700 pb-2'>
                        {user?.name ?? "Unknown User"}
                    </div>

                    <div className='flex gap-3 items-center text-gray-300 hover:text-white cursor-pointer transition-colors'>
                        <User size={20} />
                        <div>Profile</div>
                    </div>

                    <div className='flex gap-3 items-center text-gray-300 hover:text-white cursor-pointer transition-colors'>
                        <UserPlus size={20} />
                        <div>Invite Code</div>
                        <div> {user?.referral_code ?? ""}</div>
                    </div>

                    <div className='flex gap-3 items-center text-gray-300 hover:text-white cursor-pointer transition-colors'>
                        <LogOut size={20} />
                        <div onClick={handleSignout}>Sign Out</div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ProfileCard