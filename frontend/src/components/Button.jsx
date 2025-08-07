import React from 'react'

const Button = ({ text, variant = "primary", onClick, className = "" }) => {
    const baseClasses = " cursor-pointer font-semibold px-6 py-2 rounded-lg text-sm transition-all duration-300 transform hover:scale-105";

    const variants = {
        primary: "bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-black shadow-lg hover:shadow-xl",
        secondary: "border-2 border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black bg-transparent",
        ghost: "text-white hover:text-amber-400 bg-transparent hover:bg-white hover:bg-opacity-10"
    };

    return (
        <button
            className={`${baseClasses} ${variants[variant]} ${className}`}
            onClick={onClick}
        >
            {text}
        </button>
    );
};

export default Button