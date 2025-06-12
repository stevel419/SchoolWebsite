import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import StudentRecords from "./StudentRecords.jsx";

function App() {
  return (
      <div>
        <Header />
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
            <Route path="/StudentRecords" element={<StudentRecords />} />
          </Routes>
        </main>
        <Footer />
      </div>
  );
}

export default App;