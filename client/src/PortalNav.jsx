import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const PortalNav = ({ isOpen, toggleMenu }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    navigate('/');
  };

  const navItems = [
    { id: 1, text: 'Attendance', slug: '/PortalAttendance' },
    { id: 2, text: 'Grades', slug: '/PortalGrades' },
    { id: 3, text: 'Exam Results', slug: '/PortalExamResults' },
    { id: 4, text: 'Student Records', slug: '/StudentRecords' }
  ];

  return (
    <nav
      className={`w-full md:w-1/2 px-4 py-2 md:px-10 bg-white md:justify-end absolute md:static top-20 left-0 ${
        isOpen ? 'flex' : 'hidden'
      } md:flex`}
    >
      <ul className="flex flex-col md:flex-row gap-6 md:gap-6 w-full md:w-auto items-center">
        {navItems.map((item) => (
          <li key={item.id}>
            <Link
              onClick={toggleMenu}
              to={item.slug}
              className="text-emerald-700 hover:text-emerald-900 text-lg md:text-xl font-semibold transition-colors duration-300"
            >
              {item.text}
            </Link>
          </li>
        ))}
        <li>
          <button
            onClick={handleLogout}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm md:text-base font-semibold px-4 py-2 rounded transition duration-300"
          >
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
};

PortalNav.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggleMenu: PropTypes.func.isRequired,
};

export default PortalNav;
