import { Link } from 'react-router-dom';
import { faUserPlus, faClipboardList, faGraduationCap, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const portalTiles = [
  { title: "Attendance", icon: faClipboardList, route: "/PortalAttendance" },
  { title: "Grades", icon: faGraduationCap, route: "/PortalGrades" },
  { title: "Student Records", icon: faUserPlus, route: "/PortalStudentRecords" }
];

const Portal = () => {
  return (
    <section className="min-h-screen pt-40 pb-20 bg-gray-100 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 place-items-center">
        {portalTiles.map((tile, idx) => (
          <Link 
            to={tile.route}
            key={idx}
            className="bg-white rounded-lg shadow-lg hover:shadow-xl transition p-6 flex flex-col items-center justify-center text-center border hover:border-emerald-600 w-75 h-75 lg:w-60 lg:h-60"
          >
            <FontAwesomeIcon icon={tile.icon} size="5x" className="text-emerald-600 mb-4" />
            <h3 className="text-2xl font-semibold text-gray-800">{tile.title}</h3>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default Portal;