import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-black text-white h-14 flex items-center justify-center space-x-8">
            <p>&copy; {new Date().getFullYear()} Your School Name. All rights reserved.</p>
            
            <Link
                to="/update-website"
                className="text-white hover:underline hover:text-emerald-400 transition"
            >
                Update Website
            </Link>
        </footer>
    );
};

export default Footer;