import React from 'react';

const LandingAdmission = () => {
  return (
    <section
      className="w-full h-[75vh] bg-cover bg-center bg-no-repeat relative text-black flex items-center justify-center px-4"
      style={{ backgroundImage: "url('/schoolTempBackground.jpg')" }}
    >
      <div className="bg-white/70 backdrop-blur-sm p-8 rounded-xl text-center w-full max-w-xl">
        <h1 className="text-3xl md:text-6xl font-bold drop-shadow-sm">
          Admission
        </h1>
        <p className="mt-4 text-lg">
          Learn about our admission process, requirements, and how to join the Kigurunyembe academic family.
        </p>
      </div>
    </section>
  );
};

export default LandingAdmission;

