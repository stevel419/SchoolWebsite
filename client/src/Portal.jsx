import React from 'react';
import { Link } from 'react-router-dom';
import { faUserPlus, faClipboardList, faGraduationCap, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const portalTiles = [
  { title: "Admission", icon: faUserPlus, route: "/Admission" },
  { title: "Attendance", icon: faClipboardList, route: "/Attendance" },
  { title: "Academics", icon: faGraduationCap, route: "/Academics" },
  { title: "Exam Results", icon: faFileAlt, route: "/ExamResults" }
];

const Portal = () => {
  return (
    <section className="min-h-screen pt-24 bg-gray-100 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {portalTiles.map((tile, idx) => (
          <Link 
            to={tile.route}
            key={idx}
            className="bg-white rounded-lg shadow-lg hover:shadow-xl transition p-6 flex flex-col items-center text-center border hover:border-emerald-600"
          >
            <FontAwesomeIcon icon={tile.icon} size="3x" className="text-emerald-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800">{tile.title}</h3>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default Portal;
