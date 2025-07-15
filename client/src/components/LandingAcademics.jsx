import React from 'react';

const LandingAcademics = () => {
  return (
    <section className="w-full flex flex-col lg:flex-row pt-16 md:pt-20 lg:pt-24">
      {/* Left Side: Text Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white text-black p-6 sm:p-8 md:p-10 lg:p-12 min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]">
        <div className="max-w-lg xl:max-w-xl text-left">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            Academics at Kigurunyembe
          </h1>
          <p className="text-base sm:text-lg md:text-xl leading-relaxed text-gray-700">
            Empowering students through quality education, curiosity, and a strong academic foundation. 
            Kigurunyembe offers a rich academic environment designed to unlock potential and build a lifelong passion for learning.
          </p>
        </div>
      </div>

      {/* Right Side: Responsive Image with Rounded Corners */}
      <div className="w-full lg:w-1/2 min-h-[300px] sm:min-h-[400px] md:min-h-[500px] lg:min-h-[600px] p-4 sm:p-6 lg:p-0">
        <img
          src="/schoolTempBackground.jpg"
          alt="School Building"
          className="w-full h-full object-cover rounded-lg sm:rounded-xl lg:rounded-r-none lg:rounded-l-xl shadow-lg lg:shadow-none"
        />
      </div>
    </section>
  );
};

export default LandingAcademics;