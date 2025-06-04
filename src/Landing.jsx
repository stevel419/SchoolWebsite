import React from 'react';

const Landing = () => {
    return (
      <section
        className="w-full h-[75vh] md:h-screen bg-cover bg-bottom bg-no-repeat relative text-white flex items-center justify-center"
        style={{ backgroundImage: "url('/schoolTempBackground.jpg')" }}
      >
        <div className="bg-opacity-50 p-8 rounded-xl text-center">
          <h1 className="text-3xl md:text-6xl font-bold drop-shadow-md">
            Kigurunyembe Secondary School
          </h1>
          <p className="mt-4 text-lg md:text-2xl font-light drop-shadow">
          Education is the best inheritance
          </p>
        </div>
      </section>
    );
  };

export default Landing;