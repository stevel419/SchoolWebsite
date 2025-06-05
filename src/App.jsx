import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './Home.jsx';
import About from './About.jsx';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import Accomplishments from './Accomplishments.jsx';
import Offer from './Offer.jsx';
import Admission from './Admission.jsx';
import Academics from './Academics.jsx';

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
          </Routes>
        </main>
        <Footer />
      </div>
  );
}

export default App;