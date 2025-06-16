import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { faTimes, faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PortalNav from "./PortalNav.jsx";

const PortalHeader = () => {
    const [isOpen, setIsOpen] = useState(false);
    const toggleMenu = () => {
        setIsOpen(prev => !prev);
    };

    return (
        <header className="w-full fixed top-0 left-0 z-50 flex items-center justify-between px-4 md:px-10 h-20 bg-white text-black shadow-lg">
            <Link to="/Portal" className="pl-2 md:pl-4">
                <img 
                    src="/KIGURUNYEMBE LOGO.png" 
                    alt="Logo" 
                    className="w-17.5 md:w-17.5" 
                />
            </Link>
            <PortalNav isOpen={isOpen} toggleMenu={toggleMenu}/>
            
            <div className="absolute right-4 top-5 md:hidden">
                <button onClick={toggleMenu} className= "">
                    {isOpen ? (
                        <FontAwesomeIcon icon={faTimes} size="2x" className="text-emerald-600 font-semibold hover:text-emerald-800 transition-colors duration-300"  />
                    ) : (
                        <FontAwesomeIcon icon={faBars} size="2x" className="text-emerald-600 font-semibold hover:text-emerald-800 transition-colors duration-300"/>
                    )}
                </button>
            </div>
        </header>
    );
};

export default PortalHeader;