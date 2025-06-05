
import React from 'react';

const LandingAcademics = () => {
  return (
    <section
      className="w-full h-[75vh] md:h-screen bg-cover bg-center bg-no-repeat relative text-white flex items-center justify-center"
      style={{ backgroundImage: "url('/schoolTempBackground.jpg')" }} 
    >
      <div className="bg-black/40 p-8 rounded-xl text-center">
        <h1 className="text-3xl md:text-6xl font-bold drop-shadow-md">
          Admission
        </h1>
      </div>
    </section>
  );
};

export default LandingAcademics;
