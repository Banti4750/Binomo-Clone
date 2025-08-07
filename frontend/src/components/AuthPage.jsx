import React, { useState } from 'react';
import { User, Lock, Mail, Gift } from 'lucide-react';

const AuthPage = () => {
    const [authMode, setAuthMode] = useState('login'); // 'login', 'register', 'forgot'
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        referralCode: ''
    });

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = () => {
        if (authMode === 'forgot') {
            console.log('Password reset request for:', formData.email);
            // Add password reset logic here
        } else {
            console.log(authMode === 'login' ? 'Login attempt:' : 'Registration attempt:', formData);
            // Add your authentication logic here
        }
    };

    const handleAuthModeChange = (mode) => {
        setAuthMode(mode);
        setFormData({ email: '', password: '', referralCode: '' }); // Reset form
    };

    return (
        <>
            {/* navbar */}
            <div className='flex bg-black justify-between items-center p-2 '>

                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-yellow-400 rounded flex items-center justify-center transform rotate-12">
                        <span className="text-black font-bold text-lg">⚡</span>
                    </div>
                    <span className="text-white text-xl font-bold tracking-wide">
                        binomo
                    </span>
                </div>

                <span className="text-yellow-400 text-2xl font-bold tracking-wide">
                    Trade Now 🎉
                </span>
            </div>

            <div className="min-h-screen  bg-gray-900 flex items-center justify-center p-4">
                <div className="w-full max-w-md">



                    {/* Auth Form Card */}
                    <div className="bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-700/50 p-8">
                        {/* Toggle Tabs - Only show for login/register */}
                        {authMode !== 'forgot' && (
                            <div className="flex bg-gray-700/50 rounded-lg p-1 mb-6">
                                <button
                                    onClick={() => handleAuthModeChange('login')}
                                    className={`flex-1 py-3 px-4 rounded-md text-sm font-semibold transition-all duration-300 ${authMode === 'login'
                                        ? 'bg-yellow-400 text-gray-900 shadow-lg'
                                        : 'text-gray-300 hover:text-white hover:bg-gray-600/30'
                                        }`}
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => handleAuthModeChange('register')}
                                    className={`flex-1 py-3 px-4 rounded-md text-sm font-semibold transition-all duration-300 ${authMode === 'register'
                                        ? 'bg-yellow-400 text-gray-900 shadow-lg'
                                        : 'text-gray-300 hover:text-white hover:bg-gray-600/30'
                                        }`}
                                >
                                    Register
                                </button>
                            </div>
                        )}

                        {/* Back button for forgot password */}
                        {authMode === 'forgot' && (
                            <div className="mb-6">
                                <button
                                    onClick={() => handleAuthModeChange('login')}
                                    className="flex items-center text-yellow-400 hover:text-yellow-300 transition-colors duration-200 font-medium"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Back to Login
                                </button>
                            </div>
                        )}

                        {/* Form Fields */}
                        <div className="space-y-6">
                            {/* Email Input */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-200 mb-3">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200 text-base"
                                        placeholder="Enter your email"
                                    />
                                </div>
                            </div>

                            {/* Password Input - Hidden for forgot password */}
                            {authMode !== 'forgot' && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-200 mb-3">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200 text-base"
                                            placeholder="Enter your password"
                                        />
                                    </div>

                                </div>
                            )}

                            {/* Referral Code Input - Only for registration */}
                            {authMode === 'register' && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-200 mb-3">
                                        Referral Code
                                        <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                                    </label>
                                    <div className="relative">
                                        <Gift className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="referralCode"
                                            value={formData.referralCode}
                                            onChange={handleInputChange}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200 text-base"
                                            placeholder="Enter referral code"
                                        />
                                    </div>
                                    <p className="text-yellow-300 text-sm mt-2 flex items-center">
                                        <Gift className="w-4 h-4 mr-1" />
                                        Get $100 by applying a valid referral code!
                                    </p>
                                </div>
                            )}

                            {/* Forgot Password Link - Only for login */}
                            {authMode === 'login' && (
                                <div className="text-right">
                                    <button
                                        onClick={() => handleAuthModeChange('forgot')}
                                        className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors duration-200 font-medium"
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                onClick={handleSubmit}
                                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-bold py-4 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-800 shadow-lg text-lg"
                            >
                                {authMode === 'login' ? 'Start Trading' :
                                    authMode === 'register' ? 'Create Account' :
                                        'Send Reset Link'}
                            </button>
                        </div>

                        {/* Additional Register Info */}
                        {authMode === 'register' && (
                            <div className="mt-6 p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
                                <p className="text-yellow-300 text-sm text-center">
                                    🎉 Get up to 100% bonus on your first deposit!
                                </p>
                            </div>
                        )}

                        {/* Divider - Hide for forgot password */}
                        {authMode !== 'forgot' && (
                            <div className="my-8 flex items-center">
                                <div className="flex-1 border-t border-gray-600"></div>
                                <span className="px-4 text-sm text-gray-400 font-medium">or</span>
                                <div className="flex-1 border-t border-gray-600"></div>
                            </div>
                        )}

                        {/* Toggle Auth Mode - Hide for forgot password */}
                        {authMode !== 'forgot' && (
                            <div className="text-center">
                                <p className="text-gray-300">
                                    {authMode === 'login' ? "New to Binomo?" : "Already have an account?"}
                                    <button
                                        onClick={() => handleAuthModeChange(authMode === 'login' ? 'register' : 'login')}
                                        className="ml-2 text-yellow-400 hover:text-yellow-300 font-semibold transition-colors duration-200"
                                    >
                                        {authMode === 'login' ? 'Create Account' : 'Sign In'}
                                    </button>
                                </p>
                            </div>
                        )}

                        {/* Success message for forgot password */}
                        {authMode === 'forgot' && (
                            <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                                <p className="text-green-300 text-sm text-center">
                                    If an account with that email exists, we'll send you a password reset link.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-8 text-gray-400 text-sm">
                        <p>By continuing, you agree to Binomo's <span className="text-yellow-400 hover:text-yellow-300 cursor-pointer">Terms of Service</span> and <span className="text-yellow-400 hover:text-yellow-300 cursor-pointer">Privacy Policy</span></p>
                        <p className="mt-2 text-xs">Risk Warning: Trading involves risk. Only invest what you can afford to lose.</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AuthPage;