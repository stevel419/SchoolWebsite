import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from './components/Home.jsx';
import About from './components/About.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Accomplishments from './components/Accomplishments.jsx';
import Offer from './components/Offer.jsx';
import Admission from './components/Admission.jsx';
import Academics from './components/Academics.jsx';
import PortalLogin from './PortalLogin.jsx';
import PortalSignupGate from './PortalSignupGate.jsx';
import PortalSignup from "./PortalSignup.jsx";
import Portal from "./Portal.jsx";
import PortalHeader from './PortalHeader.jsx';
import PortalStudentRecords from "./PortalStudentRecords.jsx";
import PortalGrades from "./PortalGrades.jsx";
import PortalAttendance from "./PortalAttendance.jsx";
import UpdateWebsite from './components/UpdateWebsite.jsx';
import ExamResults from './PortalExamResults';
function App() {
  const location = useLocation();

  const noLayoutRoutes = [
    "/PortalLogin",
    "/PortalSignup",
    "/PortalSignupGate"
  ];

  const isNoLayout = noLayoutRoutes.includes(location.pathname);

  const isPortalRoute = location.pathname.startsWith("/Portal") || 
  ["/PortalStudentRecords", "/PortalGrades", "/PortalAttendance"].includes(location.pathname);

  return (
      <div>
        {!isNoLayout && (isPortalRoute ? <PortalHeader /> : <Header />)}
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/About" element={<About />} />
            <Route path="/Accomplishments" element={<Accomplishments />} />
            <Route path="/Offer" element={<Offer />} />
            <Route path="/Admission" element={<Admission />} />
            <Route path="/Academics" element={<Academics />} />
            <Route path="/PortalLogin" element={<PortalLogin />} />
            <Route path="/PortalSignupGate" element={<PortalSignupGate />} />
            <Route path="/PortalSignup" element={<PortalSignup />} />
            <Route path="/Portal" element={<Portal />} />
            <Route path="/PortalStudentRecords" element={<PortalStudentRecords />} />
            <Route path="/PortalGrades" element={<PortalGrades />} />
            <Route path="/PortalAttendance" element={<PortalAttendance />} />
            <Route path="/update-website" element={<UpdateWebsite />} />
            <Route path="/PortalExamResults" element={<ExamResults />} />
            </Routes>
        </main>
        {!isNoLayout && !isPortalRoute && <Footer />}
      </div>
  );
}

export default App;