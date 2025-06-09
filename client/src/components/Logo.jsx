import React from 'react';
import { Link } from 'react-router-dom';

const Logo = () => {
    return (
        <Link to="/" className="pl-2 md:pl-4">
            <img 
                src="/KIGURUNYEMBE LOGO.png" 
                alt="Logo" 
                className="w-17.5 md:w-17.5" 
            />
        </Link>
    );
};

export default Logo;