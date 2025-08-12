import React, { useState, useRef, useEffect } from 'react';
import { User, Lock, Mail, Gift, Eye, EyeOff } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
    const navigate = useNavigate();
    const [authMode, setAuthMode] = useState('login'); // 'login', 'register', 'forgot', 'otp', 'reset'
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        newPassword: '',
        confirmPassword: '',
        referralCode: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // OTP related states
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isOtpComplete, setIsOtpComplete] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [apiResponse, setApiResponse] = useState('');
    const [error, setError] = useState('');
    const inputRefs = useRef([]);

    // API Base URL
    const API_BASE = 'http://localhost:5000/api/auth';

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

    // Navigation function to simulate routing
    const navigateToDashboard = () => {
        // In a real React app with React Router, you would use:
        // navigate('/dashboard');
        // For demo purposes, we'll show a success message
        toast.success("🎉 Redirecting to dashboard...", toastOptions);

        // Simulate navigation after 2 seconds
        setTimeout(() => {
            navigate('/dashboard') // Replace with your actual dashboard route
        }, 2000);
    };

    useEffect(() => {
        // Focus first OTP input when in OTP mode
        if (authMode === 'otp' && inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [authMode]);

    useEffect(() => {
        // Check if OTP is complete
        const isComplete = otp.every(digit => digit !== '');
        setIsOtpComplete(isComplete);

        if (isComplete) {
            console.log('OTP entered:', otp.join(''));
        }
    }, [otp]);



    // API Functions
    const apiCall = async (endpoint, data, method = 'POST') => {
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'API Error');
            }

            return result;
        } catch (err) {
            throw new Error(err.message || 'Network error');
        }
    };

    const handleLogin = async () => {
        setIsLoading(true);
        setError('');
        setApiResponse('');
        try {
            const result = await apiCall('/login', {
                email: formData.email,
                password: formData.password
            });

            // Store token and user data
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));

            // Show success toast
            toast.success(`🎉 Welcome back, ${result.user.username}!`, toastOptions);

            // Navigate to dashboard
            navigateToDashboard();

        } catch (err) {
            setError(err.message);
            toast.error(err.message, toastOptions);
        }
        setIsLoading(false);
    };

    const handleRegister = async () => {
        setIsLoading(true);
        setError('');
        setApiResponse('');
        try {
            const result = await apiCall('/register', {
                email: formData.email,
                password: formData.password,
                referralCode: formData.referralCode || undefined
            });

            toast.success(result.message, toastOptions);

            setTimeout(() => {
                setAuthMode('login');
                toast.info("Please login with your new account", toastOptions);
            }, 2000);
        } catch (err) {
            setError(err.message);
            toast.error(err.message, toastOptions);
        }
        setIsLoading(false);
    };

    const handleSendOtp = async () => {
        setIsLoading(true);
        setError('');
        setApiResponse('');
        try {
            const result = await apiCall('/send-otp-forgot-password', {
                email: formData.email
            });

            toast.success(result.message, toastOptions);
            // For demo purposes, show the OTP (remove in production)
            console.log('Demo OTP:', result.otp);
            setAuthMode('otp');
        } catch (err) {
            setError(err.message);
            toast.error(err.message, toastOptions);
        }
        setIsLoading(false);
    };

    const handleVerifyOtpAndReset = async () => {
        setIsVerifying(true);
        setError('');
        setApiResponse('');
        try {
            const result = await apiCall('/verify-otp-forgot-password', {
                email: formData.email,
                otp: otp.join(''),
                newPassword: formData.newPassword,
                confirmNewPassword: formData.confirmPassword
            });

            toast.success(result.message, toastOptions);

            setTimeout(() => {
                setAuthMode('login');
                setFormData({ email: '', password: '', newPassword: '', confirmPassword: '', referralCode: '' });
                setOtp(['', '', '', '', '', '']);
                toast.info("Please login with your new password", toastOptions);
            }, 2000);
        } catch (err) {
            setError(err.message);
            toast.error(err.message, toastOptions);
        }
        setIsVerifying(false);
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear error when user starts typing
        if (error) setError('');
        if (apiResponse) setApiResponse('');
    };

    const handleSubmit = async () => {
        if (authMode === 'login') {
            await handleLogin();
        } else if (authMode === 'register') {
            await handleRegister();
        } else if (authMode === 'forgot') {
            await handleSendOtp();
        } else if (authMode === 'reset') {
            if (formData.newPassword !== formData.confirmPassword) {
                const errorMsg = 'Passwords do not match!';
                setError(errorMsg);
                toast.error(errorMsg, toastOptions);
                return;
            }
            // This will be handled by OTP verification
        }
    };

    const handleAuthModeChange = (mode) => {
        setAuthMode(mode);
        setFormData({ email: '', password: '', newPassword: '', confirmPassword: '', referralCode: '' });
        setOtp(['', '', '', '', '', '']);
        setIsOtpComplete(false);
        setError('');
        setApiResponse('');
    };

    // OTP handling functions
    const handleOtpChange = (index, value) => {
        if (!/^\d?$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace') {
            if (!otp[index] && index > 0) {
                inputRefs.current[index - 1]?.focus();
            } else {
                const newOtp = [...otp];
                newOtp[index] = '';
                setOtp(newOtp);
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text');

        if (/^\d{6}$/.test(pastedData)) {
            const digits = pastedData.split('');
            setOtp(digits);
            inputRefs.current[5]?.focus();
            toast.info("OTP pasted successfully!", toastOptions);
        }
    };

    const clearOtp = () => {
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        toast.info("OTP cleared", toastOptions);
    };

    const handleVerifyOtp = async () => {
        if (isOtpComplete && !isVerifying) {
            setAuthMode('reset');
            toast.success("OTP verified! Please set your new password.", toastOptions);
        }
    };

    const handleResendOtp = async () => {
        setError('');
        try {
            const result = await apiCall('/send-otp-forgot-password', {
                email: formData.email
            });

            toast.success(`OTP resent to ${formData.email}`, toastOptions);
            // For demo purposes, show the new OTP
            console.log('Demo OTP (resent):', result.otp);
            clearOtp();
        } catch (err) {
            setError(err.message);
            toast.error(err.message, toastOptions);
        }
    };

    const getTitle = () => {
        switch (authMode) {
            case 'otp': return 'Verify Your Email';
            case 'reset': return 'Reset Your Password';
            case 'forgot': return 'Forgot Password';
            default: return authMode === 'login' ? 'Welcome Back' : 'Create Account';
        }
    };

    const getSubtitle = () => {
        switch (authMode) {
            case 'otp': return `Enter the 6-digit code sent to ${formData.email}`;
            case 'reset': return 'Create your new password';
            case 'forgot': return 'Enter your email to receive a reset code';
            default: return authMode === 'login' ? 'Sign in to start trading' : 'Join millions of traders worldwide';
        }
    };

    return (
        <>
            {/* Toast Container */}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
                toastClassName="bg-gray-800 text-white"
                progressClassName="bg-yellow-400"
            />
            {/* Navbar */}
            <div className='flex bg-black w-full fixed top-0 z-50 justify-between items-center p-4'>
                <div className="flex items-center space-x-2 cursor-pointer">
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

            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center p-4 pt-20 relative overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-yellow-300/5 rounded-full blur-3xl animate-pulse delay-500"></div>
                </div>

                <div className="w-full max-w-md relative">
                    {/* Auth Form Card */}
                    <div className="bg-gradient-to-b from-gray-800/95 to-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 p-8">

                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-4 shadow-lg">
                                {authMode === 'otp' ? (
                                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                    </svg>
                                ) : (
                                    <span className="text-white font-bold text-2xl">⚡</span>
                                )}
                            </div>
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-2">
                                {getTitle()}
                            </h2>
                            <p className="text-gray-300 text-lg">{getSubtitle()}</p>
                        </div>



                        {/* Toggle Tabs - Only show for login/register */}
                        {authMode !== 'forgot' && authMode !== 'otp' && authMode !== 'reset' && (
                            <div className="flex bg-gray-700/50 rounded-lg p-1 mb-6">
                                <button
                                    onClick={() => handleAuthModeChange('login')}
                                    className={`flex-1 cursor-pointer py-3 px-4 rounded-md text-sm font-semibold transition-all duration-300 ${authMode === 'login'
                                        ? 'bg-yellow-400 text-gray-900 shadow-lg'
                                        : 'text-gray-300 hover:text-white hover:bg-gray-600/30'
                                        }`}
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => handleAuthModeChange('register')}
                                    className={`flex-1 py-3 cursor-pointer px-4 rounded-md text-sm font-semibold transition-all duration-300 ${authMode === 'register'
                                        ? 'bg-yellow-400 text-gray-900 shadow-lg'
                                        : 'text-gray-300 hover:text-white hover:bg-gray-600/30'
                                        }`}
                                >
                                    Register
                                </button>
                            </div>
                        )}

                        {/* Back button for forgot password, otp, and reset */}
                        {(authMode === 'forgot' || authMode === 'otp' || authMode === 'reset') && (
                            <div className="mb-6">
                                <button
                                    onClick={() => {
                                        if (authMode === 'otp') {
                                            handleAuthModeChange('forgot');
                                        } else if (authMode === 'reset') {
                                            setAuthMode('otp');
                                        } else {
                                            handleAuthModeChange('login');
                                        }
                                    }}
                                    className="flex cursor-pointer items-center text-yellow-400 hover:text-yellow-300 transition-colors duration-200 font-medium"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    {authMode === 'otp' ? 'Back to Email' : authMode === 'reset' ? 'Back to OTP' : 'Back to Login'}
                                </button>
                            </div>
                        )}

                        {/* OTP Mode */}
                        {authMode === 'otp' && (
                            <div className="space-y-6">
                                {/* OTP Input Fields */}
                                <div className="flex justify-center gap-3 mb-8">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={el => inputRefs.current[index] = el}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={e => handleOtpChange(index, e.target.value)}
                                            onKeyDown={e => handleOtpKeyDown(index, e)}
                                            onPaste={handleOtpPaste}
                                            className={`
                                                w-14 h-14 text-center text-2xl font-bold border-2 rounded-xl
                                                transition-all duration-300 outline-none backdrop-blur-sm
                                                ${digit
                                                    ? 'border-yellow-400 bg-gradient-to-b from-yellow-50 to-yellow-100 text-gray-800 shadow-lg shadow-yellow-400/25'
                                                    : 'border-gray-600 bg-gray-700/50 text-white'
                                                }
                                                focus:border-yellow-400 focus:bg-gradient-to-b focus:from-yellow-50 focus:to-yellow-100 focus:text-gray-800 focus:scale-110 focus:shadow-xl focus:shadow-yellow-400/30
                                                hover:border-yellow-300 hover:scale-105
                                            `}
                                        />
                                    ))}
                                </div>

                                {/* OTP Action Buttons */}
                                <button
                                    onClick={handleVerifyOtp}
                                    disabled={!isOtpComplete || isVerifying}
                                    className={`
                                        w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 relative overflow-hidden
                                        ${isOtpComplete && !isVerifying
                                            ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white transform hover:scale-[1.02] shadow-xl shadow-yellow-400/25 hover:shadow-2xl hover:shadow-yellow-400/40'
                                            : 'bg-gray-600/50 text-gray-400 cursor-not-allowed border border-gray-600'
                                        }
                                    `}
                                >
                                    {isVerifying ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                                            Verifying...
                                        </div>
                                    ) : (
                                        'Verify Code'
                                    )}
                                </button>

                                <div className="flex gap-3">
                                    <button
                                        onClick={clearOtp}
                                        className="flex-1 py-3 px-4 border-2 border-gray-600 rounded-xl text-gray-300 font-semibold hover:bg-gray-700 hover:border-gray-500 transition-all duration-200 hover:scale-[1.02]"
                                    >
                                        Clear
                                    </button>
                                    <button
                                        onClick={handleResendOtp}
                                        className="flex-1 py-3 px-4 border-2 border-yellow-400 text-yellow-400 rounded-xl font-semibold hover:bg-yellow-400/10 hover:border-yellow-300 transition-all duration-200 hover:scale-[1.02]"
                                    >
                                        Resend
                                    </button>
                                </div>

                                {/* Status Indicator */}
                                <div className="text-center">
                                    <div className={`
                                        inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-500 border
                                        ${isOtpComplete
                                            ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border-green-400/50 shadow-lg shadow-green-400/20'
                                            : 'bg-gray-700/50 text-gray-400 border-gray-600/50'
                                        }
                                    `}>
                                        <div className={`
                                            w-3 h-3 rounded-full mr-3 transition-all duration-300
                                            ${isOtpComplete
                                                ? 'bg-green-400 shadow-lg shadow-green-400/50 animate-pulse'
                                                : 'bg-gray-500'
                                            }
                                        `}></div>
                                        {isOtpComplete ? 'Code Complete' : `${otp.filter(d => d).length}/6 digits entered`}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Standard Form Fields for non-OTP modes */}
                        {authMode !== 'otp' && (
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
                                            disabled={authMode === 'reset'}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200 text-base disabled:opacity-50"
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                </div>

                                {/* Password Input - Hidden for forgot password */}
                                {authMode !== 'forgot' && authMode !== 'reset' && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-200 mb-3">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                className="w-full pl-12 pr-12 py-4 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200 text-base"
                                                placeholder="Enter your password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* New Password Input - Only for reset mode */}
                                {authMode === 'reset' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-200 mb-3">
                                                New Password
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type={showNewPassword ? "text" : "password"}
                                                    name="newPassword"
                                                    value={formData.newPassword}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-12 pr-12 py-4 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200 text-base"
                                                    placeholder="Enter new password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                                                >
                                                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-200 mb-3">
                                                Confirm New Password
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    name="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-12 pr-12 py-4 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200 text-base"
                                                    placeholder="Confirm new password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                                                >
                                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Reset Password Button */}
                                        <button
                                            onClick={handleVerifyOtpAndReset}
                                            disabled={!formData.newPassword || !formData.confirmPassword || isVerifying}
                                            className={`w-full py-4 px-4 rounded-lg font-bold text-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-800 shadow-lg ${(!formData.newPassword || !formData.confirmPassword || isVerifying)
                                                ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 cursor-pointer'
                                                }`}
                                        >
                                            {isVerifying ? (
                                                <div className="flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400 mr-2"></div>
                                                    Resetting Password...
                                                </div>
                                            ) : (
                                                'Reset Password'
                                            )}
                                        </button>
                                    </>
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
                                            className="text-sm cursor-pointer text-yellow-400 hover:text-yellow-300 transition-colors duration-200 font-medium"
                                        >
                                            Forgot password?
                                        </button>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className={`w-full py-4 px-4 rounded-lg font-bold text-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-800 shadow-lg ${isLoading
                                        ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 cursor-pointer'
                                        }`}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400 mr-2"></div>
                                            {authMode === 'login' ? 'Signing In...' :
                                                authMode === 'register' ? 'Creating Account...' :
                                                    authMode === 'forgot' ? 'Sending Code...' :
                                                        'Processing...'}
                                        </div>
                                    ) : (
                                        authMode === 'login' ? 'Start Trading' :
                                            authMode === 'register' ? 'Create Account' :
                                                authMode === 'forgot' ? 'Send Reset Code' :
                                                    'Reset Password'
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Success message for forgot password */}
                        {authMode === 'forgot' && !error && !apiResponse && (
                            <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                                <p className="text-green-300 text-sm text-center">
                                    Enter your email address and we'll send you a verification code to reset your password.
                                </p>
                            </div>
                        )}



                        {/* Divider - Hide for forgot password and OTP */}
                        {authMode !== 'forgot' && authMode !== 'otp' && authMode !== 'reset' && (
                            <div className="my-8 flex items-center">
                                <div className="flex-1 border-t border-gray-600"></div>
                                <span className="px-4 text-sm text-gray-400 font-medium">or</span>
                                <div className="flex-1 border-t border-gray-600"></div>
                            </div>
                        )}

                        {/* Toggle Auth Mode - Hide for forgot password, OTP, and reset */}
                        {authMode !== 'forgot' && authMode !== 'otp' && authMode !== 'reset' && (
                            <div className="text-center">
                                <p className="text-gray-300">
                                    {authMode === 'login' ? "New to Binomo?" : "Already have an account?"}
                                    <button
                                        onClick={() => handleAuthModeChange(authMode === 'login' ? 'register' : 'login')}
                                        className="ml-2 text-yellow-400 cursor-pointer hover:text-yellow-300 font-semibold transition-colors duration-200"
                                    >
                                        {authMode === 'login' ? 'Create Account' : 'Sign In'}
                                    </button>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default AuthPage;