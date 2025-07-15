import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const Slideshow = () => {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const baseURL = import.meta.env.VITE_API_BASE_URL

  useEffect(() => {
    fetch(`${baseURL}/get-slides`)
      .then(res => res.json())
      .then(data => setSlides(data))
      .catch(err => console.error('Error fetching slides:', err));
  }, []);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1
    );
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === slides.length - 1 ? 0 : prevIndex + 1
    );
  };

  if (slides.length === 0) {
    return (
      <div className="w-full flex justify-center items-center px-4 py-8">
        <div className="text-center text-gray-600">
          <div className="animate-pulse">Loading slides...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center px-2 sm:px-4 py-4 sm:py-8">
      <div className="relative max-w-6xl w-full h-[300px] sm:h-[400px] md:h-[450px] lg:h-[500px] xl:h-[550px] mx-auto my-4 sm:my-8 lg:my-12 overflow-hidden rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
        <div
          className="flex h-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div key={index} className="flex flex-col md:flex-row w-full h-full min-w-full">
              {/* Image section */}
              <div className="w-full md:w-2/3 h-1/2 md:h-full order-1 md:order-1">
                <img
                  src={encodeURI(slide.image)}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
  
              {/* Text section */}
              <div className="w-full md:w-1/3 h-1/2 md:h-full flex items-center justify-center bg-emerald-700 text-white p-3 sm:p-4 md:p-6 order-2 md:order-2">
                <p className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-center leading-relaxed">
                  {slide.text}
                </p>
              </div>
            </div>
          ))}
        </div>
  
        {/* Left Arrow */}
        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-2 sm:left-4 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 sm:p-3 rounded-full transition-colors duration-200 z-10"
          aria-label="Previous slide"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="text-sm sm:text-base" />
        </button>
  
        {/* Right Arrow */}
        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-2 sm:right-4 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 sm:p-3 rounded-full transition-colors duration-200 z-10"
          aria-label="Next slide"
        >
          <FontAwesomeIcon icon={faChevronRight} className="text-sm sm:text-base" />
        </button>

        {/* Dot indicators */}
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors duration-200 ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Slideshow;