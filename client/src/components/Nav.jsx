import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const Nav = ({isOpen, toggleMenu}) => {
    const navItems = [
        {id: 1, text: 'Home', slug: '/'},  
        {id: 2, text: 'About', slug: '/About'},
        {id: 3, text: 'Offer', slug: '/Offer'},
        {id: 4, text: 'Achievements', slug: '/Accomplishments'},
        {id: 5, text: 'KPortal', slug: '../PortalLogin'}
    ];
    
    return (
        <nav
            className={`w-full md:w-1/2 px-4 py-6 md:px-10 bg-white md:justify-end absolute md:static top-20 left-0 ${isOpen ? "flex" : "hidden"} md:flex`}
        >

        <ul className= "flex flex-col md:flex-row gap-6 md:gap-6 w-full md:w-auto">
            {navItems.map((item) => (
                <li key={item.id}>
                    <Link 
                        onClick = {toggleMenu}
                        to={item.slug}
                        className="text-emerald-700 hover:text-emerald-900 text-lg md:text-xl font-semibold transition-colors duration-300"
                    >
                        {item.text}

                    </Link>
                </li>
            ))}
        </ul>
        


        </nav>
    )
}

Nav.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggleMenu: PropTypes.func.isRequired
};

export default Nav;