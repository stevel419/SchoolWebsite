import React from 'react';
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNewspaper, faGraduationCap, faAddressCard } from '@fortawesome/free-solid-svg-icons';

const Landing = () => {
  return (
    <section
      className="w-full h-[85vh] md:h-screen bg-cover bg-bottom bg-no-repeat relative text-white flex flex-col justify-between"
      style={{ backgroundImage: "url('/landingHome.jpg')" }}
    >
      {/* Hero Title */}
      <div className="flex-grow flex items-center justify-center bg-black/40 px-4">
        <div className="bg-opacity-50 p-8 rounded-xl text-center">
          <h1 className="text-3xl md:text-6xl font-bold drop-shadow-md">
            Kigurunyembe Secondary School
          </h1>
          <p className="mt-4 text-lg md:text-2xl font-light drop-shadow">
            Education is the best inheritance
          </p>
        </div>
      </div>

      {/* Rounded Icon Box */}
      <div className="bg-black/40">
        <div className="bg-white rounded-3xl shadow-xl py-6 px-8 md:px-16 grid grid-cols-3 text-center text-emerald-700 w-11/12 md:w-2/3 mx-auto mb-8">
          <Link to="/about" className="hover:text-emerald-500 transition duration-300">
            <div>
              <h3 className="font-bold mb-2">About Us</h3>
              <FontAwesomeIcon icon={faNewspaper} size="2x" />
            </div>
          </Link>

          <Link to="/academics" className="hover:text-emerald-500 transition duration-300">
            <div>
              <h3 className="font-bold mb-2">Academics</h3>
              <FontAwesomeIcon icon={faGraduationCap} size="2x" />
            </div>
          </Link>

          <Link to="/admission" className="hover:text-emerald-500 transition duration-300">
            <div>
              <h3 className="font-bold mb-2">Admission</h3>
              <FontAwesomeIcon icon={faAddressCard} size="2x" />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Landing;
