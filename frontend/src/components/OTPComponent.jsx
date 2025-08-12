import React, { useState, useRef, useEffect } from 'react';

const OTPComponent = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isComplete, setIsComplete] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    // Check if OTP is complete
    const isOtpComplete = otp.every(digit => digit !== '');
    setIsComplete(isOtpComplete);

    if (isOtpComplete) {
      console.log('OTP entered:', otp.join(''));
      // Here you would typically call your verification API
    }
  }, [otp]);

  const handleChange = (index, value) => {
    // Only allow digits
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
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

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');

    // Only process if it's 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      // Focus the last input
      inputRefs.current[5]?.focus();
    }
  };

  const clearOtp = () => {
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  const handleVerify = async () => {
    if (isComplete && !isVerifying) {
      setIsVerifying(true);
      // Simulate API call
      setTimeout(() => {
        alert(`Verifying OTP: ${otp.join('')}`);
        setIsVerifying(false);
        // Add your verification logic here
      }, 2000);
    }
  };

  const handleResend = () => {
    alert('Resending OTP...');
    clearOtp();
    // Add your resend logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-yellow-300/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Main container */}
      <div className="relative bg-gradient-to-b from-gray-800/95 to-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md border border-gray-700/50">
        {/* Binomo-inspired header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-2">
            Verify Your Identity
          </h2>
          <p className="text-gray-300 text-lg">Enter the 6-digit code sent to your device</p>
        </div>

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
              onChange={e => handleChange(index, e.target.value)}
              onKeyDown={e => handleKeyDown(index, e)}
              onPaste={handlePaste}
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

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleVerify}
            disabled={!isComplete || isVerifying}
            className={`
              w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 relative overflow-hidden
              ${isComplete && !isVerifying
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
              onClick={handleResend}
              className="flex-1 py-3 px-4 border-2 border-yellow-400 text-yellow-400 rounded-xl font-semibold hover:bg-yellow-400/10 hover:border-yellow-300 transition-all duration-200 hover:scale-[1.02]"
            >
              Resend
            </button>
          </div>
        </div>

        {/* Enhanced Status Indicator */}
        <div className="mt-8 text-center">
          <div className={`
            inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-500 border
            ${isComplete
              ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border-green-400/50 shadow-lg shadow-green-400/20'
              : 'bg-gray-700/50 text-gray-400 border-gray-600/50'
            }
          `}>
            <div className={`
              w-3 h-3 rounded-full mr-3 transition-all duration-300
              ${isComplete
                ? 'bg-green-400 shadow-lg shadow-green-400/50 animate-pulse'
                : 'bg-gray-500'
              }
            `}></div>
            {isComplete ? (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Code Complete
              </span>
            ) : (
              `${otp.filter(d => d).length}/6 digits entered`
            )}
          </div>
        </div>

        {/* Timer or additional info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Didn't receive the code? Check your spam folder or{' '}
            <button onClick={handleResend} className="text-yellow-400 hover:text-yellow-300 underline transition-colors">
              request a new one
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPComponent;