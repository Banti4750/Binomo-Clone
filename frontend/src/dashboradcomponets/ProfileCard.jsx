import React, { useState, useRef, useEffect } from 'react';
import { LogOut, User, UserPlus, X, Camera, Calendar, Users, Edit3, Mail, DollarSign, Shield, ShieldCheck } from 'lucide-react';
import { useUser } from '../context/useGetUser';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import ReferralDisplay from './ReferralDisplay ';

// Edit Profile Modal Component
const EditProfileModal = ({ isOpen, onClose, currentProfile = {}, onUpdate }) => {
    const [formData, setFormData] = useState({
        name: '',
        gender: '',
        dob: '',
        profilePicUrl: ''
    });
    const [imagePreview, setImagePreview] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    // Initialize and update form when modal opens or currentProfile changes
    useEffect(() => {
        if (isOpen && currentProfile) {
            console.log('Initializing form with profile:', currentProfile);
            const newFormData = {
                name: currentProfile.name || '',
                gender: currentProfile.gender || '',
                dob: currentProfile.dob || '',
                profilePicUrl: currentProfile.profile_pic_url || ''
            };
            setFormData(newFormData);
            setImagePreview(currentProfile.profile_pic_url || '');
        }
    }, [isOpen, currentProfile]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        console.log(`Input changed: ${name} = ${value}`);
        setFormData(prev => {
            const updated = {
                ...prev,
                [name]: value
            };
            console.log('Updated form data:', updated);
            return updated;
        });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Please select a valid image file.', {
                    position: "top-right",
                    autoClose: 3000,
                    theme: "dark",
                });
                return;
            }

            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB.', {
                    position: "top-right",
                    autoClose: 3000,
                    theme: "dark",
                });
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const imageUrl = event.target.result;
                setImagePreview(imageUrl);
                setFormData(prev => ({
                    ...prev,
                    profilePicUrl: imageUrl
                }));
            };
            reader.onerror = () => {
                toast.error('Failed to read image file.', {
                    position: "top-right",
                    autoClose: 3000,
                    theme: "dark",
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const toastOptions = {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "dark",
        };

        try {
            // Get token from localStorage
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Prepare update data - only include fields that have values
            const updateData = {};
            Object.keys(formData).forEach(key => {
                const value = formData[key];
                if (value && typeof value === 'string' && value.trim() !== '') {
                    // Map profilePicUrl to the correct backend field name
                    if (key === 'profilePicUrl') {
                        updateData['profile_pic_url'] = value;
                    } else {
                        updateData[key] = value;
                    }
                }
            });

            console.log('Sending update data:', updateData);

            const response = await fetch('http://localhost:5000/api/user/update-profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });

            const responseData = await response.json();

            if (response.ok) {
                console.log('Profile updated successfully:', responseData);

                // Call the onUpdate callback to refresh user data
                if (onUpdate) {
                    await onUpdate();
                }

                // Show success toast
                toast.success('Profile updated successfully!', toastOptions);

                // Close modal
                onClose();
            } else {
                throw new Error(responseData.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error.message || 'Failed to update profile. Please try again.', toastOptions);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        // Reset form when closing
        setFormData({
            name: '',
            gender: '',
            dob: '',
            profilePicUrl: ''
        });
        setImagePreview('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-900 via-gray-950 to-black border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                    <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                        type="button"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Profile Picture Section */}
                    <div className="flex flex-col items-center space-y-4">
                        <div className="relative">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-600">
                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt="Profile Preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="w-10 h-10 text-white" />
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute -bottom-2 -right-2 bg-gray-800 border-2 border-gray-600 rounded-full p-2 hover:bg-gray-700 transition-colors shadow-lg"
                            >
                                <Camera className="w-4 h-4 text-gray-300" />
                            </button>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            accept="image/*"
                            className="hidden"
                        />
                        <p className="text-sm text-gray-400 text-center">Click camera icon to change profile picture</p>
                    </div>

                    {/* Name Field */}
                    <div className="space-y-2">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                            Full Name
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                id="name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Enter your full name"
                                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                            />
                        </div>
                    </div>

                    {/* Gender Field */}
                    <div className="space-y-2">
                        <label htmlFor="gender" className="block text-sm font-medium text-gray-300">
                            Gender
                        </label>
                        <div className="relative">
                            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            <select
                                id="gender"
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                            >
                                <option value="">Select gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                                <option value="prefer-not-to-say">Prefer not to say</option>
                            </select>
                            {/* Custom dropdown arrow */}
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Date of Birth Field */}
                    <div className="space-y-2">
                        <label htmlFor="dob" className="block text-sm font-medium text-gray-300">
                            Date of Birth
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                id="dob"
                                type="date"
                                name="dob"
                                value={formData.dob}
                                onChange={handleInputChange}
                                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// Main ProfileCard Component
const ProfileCard = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { user, fetchUserProfile } = useUser();
    const [referralModal, setreferralModal] = useState(false);
    const navigate = useNavigate();

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

    const handleSignout = () => {
        localStorage.removeItem('token');
        navigate('/')
        toast.success("Signed out successfully!", toastOptions)
        // console.log('Signed out successfully!');
        // Add any additional signout logic here (redirect, etc.)
    };

    const handleProfileUpdate = () => {
        console.log('Profile updated, refreshing user data...');
        fetchUserProfile(); // Refresh user data after update
    };

    const openEditModal = () => {
        setIsModalOpen(true);
    };

    const closeEditModal = () => {
        setIsModalOpen(false);
    };



    const getVerificationStatus = () => {
        return user?.is_verified === 1 ? 'Verified' : 'Unverified';
    };

    const formatGender = (gender) => {
        return gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : 'Not specified';
    };

    return (
        <div >
            <div className='bg-gradient-to-br from-gray-900 via-gray-950 to-black p-6 rounded-lg border border-gray-800/50 shadow-2xl backdrop-blur-sm max-w-md'>
                <div className='flex flex-col space-y-4'>
                    {/* Profile Header with Avatar */}
                    <div className='flex items-center space-x-4 border-b border-gray-700 pb-4'>
                        <div className='relative'>
                            {user?.profile_pic_url ? (
                                <img
                                    src={user.profile_pic_url}
                                    alt="Profile"
                                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-600"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                    <User size={24} className="text-white" />
                                </div>
                            )}
                            <button
                                onClick={openEditModal}
                                className="absolute -bottom-1 -right-1 p-1 bg-gray-800 rounded-full border border-gray-600 hover:bg-gray-700 transition-colors"
                                title="Change Avatar"
                            >
                                <Camera size={12} className="text-gray-400 hover:text-white" />
                            </button>
                        </div>
                        <div className='flex-1'>
                            <div className='flex items-center justify-between'>
                                <h2 className='text-white font-semibold text-xl'>
                                    {user?.name || user?.username || "Unknown User"}
                                </h2>
                                <button
                                    onClick={openEditModal}
                                    className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                                    title="Edit Profile"
                                >
                                    <Edit3 size={16} className="text-gray-400 hover:text-white" />
                                </button>
                            </div>
                            <p className='text-gray-400 text-sm'>@{user?.username}</p>
                        </div>
                    </div>



                    {/* User Information */}
                    <div className='space-y-3'>
                        {/* Email */}
                        <div className='flex gap-3 items-center text-gray-300 hover:text-white cursor-pointer transition-colors group'>
                            <Mail size={20} className="text-gray-400 group-hover:text-blue-400" />
                            <div className='flex-1'>
                                <div className='text-sm text-gray-500'>Email</div>
                                <div className='truncate'>{user?.email || "Not provided"}</div>
                            </div>
                        </div>

                        {/* Verification Status */}
                        <div className='flex gap-3 items-center text-gray-300'>
                            {user?.is_verified === 1 ? (
                                <ShieldCheck size={20} className="text-green-400" />
                            ) : (
                                <Shield size={20} className="text-yellow-400" />
                            )}
                            <div className='flex-1'>
                                <div className='text-sm text-gray-500'>Verification Status</div>
                                <div className={`font-medium ${user?.is_verified === 1 ? 'text-green-400' : 'text-yellow-400'}`}>
                                    {getVerificationStatus()}
                                </div>
                            </div>
                        </div>

                        {/* Gender */}
                        <div className='flex gap-3 items-center text-gray-300'>
                            <User size={20} className="text-gray-400" />
                            <div className='flex-1'>
                                <div className='text-sm text-gray-500'>Gender</div>
                                <div>{formatGender(user?.gender)}</div>
                            </div>
                        </div>

                        {/* Date of Birth */}
                        <div className='flex gap-3 items-center text-gray-300'>
                            <Calendar size={20} className="text-gray-400" />
                            <div className='flex-1'>
                                <div className='text-sm text-gray-500'>Date of Birth</div>
                                <div>{user?.dob ? new Date(user.dob).toLocaleDateString() : "Not provided"}</div>
                            </div>
                        </div>


                    </div>

                    {/* Action Items */}
                    <div className='border-t border-gray-700 pt-4 space-y-3'>
                        <div
                            className='flex gap-3 items-center text-gray-300 hover:text-white cursor-pointer transition-colors hover:bg-gray-800/50 rounded-lg p-2'
                            onClick={openEditModal}
                        >
                            <User size={20} />
                            <div>Edit Profile</div>
                        </div>

                        <div className='flex gap-3 items-center text-gray-300   hover:text-white cursor-pointer transition-colors hover:bg-gray-800/50 rounded-lg p-2'
                            onClick={() => setreferralModal(!referralModal)}
                        >
                            <UserPlus size={20} />
                            <div className='flex-1'>Referral Code</div>
                            <div className='bg-gray-800 px-3 py-1 rounded-full text-xs font-mono border border-gray-600'>
                                {user?.referral_code || ""}
                            </div>
                        </div>

                        <div
                            className='flex gap-3 items-center text-red-400 hover:text-red-300 cursor-pointer transition-colors hover:bg-red-900/10 rounded-lg p-2'
                            onClick={handleSignout}
                        >
                            <LogOut size={20} />
                            <div>Sign Out</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            <EditProfileModal
                isOpen={isModalOpen}
                onClose={closeEditModal}
                currentProfile={user}
                onUpdate={handleProfileUpdate}
            />

            {/* reffral modal */}
            {
                referralModal && (
                    <>


                        <div className="absolute  top-16  z-50">
                            <div className="fixed inset-0 z-50  flex items-center justify-center pointer-events-none">
                                <div className="bg-gray-900  rounded-xl border border-gray-700 shadow-2xl max-w-4xl w-full mx-4  overflow-hidden pointer-events-auto">
                                    <div className="flex items-center  justify-between p-4 border-b border-gray-700">
                                        <h2 className="text-xl font-bold text-white">My Referrals</h2>
                                        <button
                                            onClick={() => setreferralModal(!referralModal)}
                                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                        >
                                            <X size={20} className="text-gray-400" />
                                        </button>
                                    </div>
                                    <div className="overflow-y-auto no-scrollbar max-h-[75vh]">
                                        <ReferralDisplay />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </>
                )
            }

        </div>
    );
};

export default ProfileCard;