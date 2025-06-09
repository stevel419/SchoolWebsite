import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-black text-white h-14 flex items-center justify-center">
                <p>&copy; {new Date().getFullYear()} Your School Name. All rights reserved.</p>

        </footer>
    );
};

export default Footer;