import React from 'react';

const LandingAcademics = () => {
  return (
    <section className="w-full flex flex-col md:flex-row pt-24">
      {/* Left Side: Text Section */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white text-black p-10 min-h-[600px]">
        <div className="max-w-xl text-left">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Academics at Kigurunyembe
          </h1>
          <p className="text-lg leading-relaxed">
            Empowering students through quality education, curiosity, and a strong academic foundation. 
            Kigurunyembe offers a rich academic environment designed to unlock potential and build a lifelong passion for learning.
          </p>
        </div>
      </div>

      {/* Right Side: Fixed Height Image with Rounded Corners */}
      <div className="w-full md:w-1/2 min-h-[600px]">
        <img
          src="/schoolTempBackground.jpg"
          alt="School Building"
          className="w-full h-full object-cover rounded-xl"
        />
      </div>
    </section>
  );
};

export default LandingAcademics;
