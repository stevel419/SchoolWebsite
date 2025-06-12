import { Link } from 'react-router-dom';

const PortalHeader = () => {
  return (
    <header className="bg-emerald-700 text-white py-4 shadow-md">
      <div className="container mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img
            src="/KIGURUNYEMBE_LOGO.png"
            alt="School Logo"
            className="w-12 h-12 object-contain"
          />
          <h1 className="text-lg font-bold">KSS Teacher Portal</h1>
        </div>

        <nav className="flex gap-6 text-sm md:text-base">
          <Link to="/Attendance" className="hover:text-gray-200 transition duration-200">
            Attendance
          </Link>
          <Link to="/Grades" className="hover:text-gray-200 transition duration-200">
            Grades
          </Link>
          <Link to="/ExamResults" className="hover:text-gray-200 transition duration-200">
            Exam Results
          </Link>
          <Link to="/StudentRecords" className="hover:text-gray-200 transition duration-200">
            Student Records
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default PortalHeader;
