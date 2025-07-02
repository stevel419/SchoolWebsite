import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const Slideshow = () => {
  const [slides, setSlides] = useState([]);       // <- make this state
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

  if (slides.length === 0) return <div>Loading slides...</div>;

  return (
    <div className="w-full flex justify-center px-4 py-8">
      <div className="relative max-w-6xl w-full h-[500px] mx-auto my-12 overflow-hidden rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
        <div
          className="flex h-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div key={index} className="flex w-full h-full min-w-full">
              {/* Image section */}
              <div className="w-2/3 h-full">
                <img
                  src={encodeURI(slide.image)}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
  
              {/* Text section */}
              <div className="w-1/3 h-full flex items-center justify-center bg-emerald-700 text-white p-6">
                <p className="text-xl font-semibold text-center">{slide.text}</p>
              </div>
            </div>
          ))}
        </div>
  
        {/* Left Arrow */}
        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black/40 text-white p-2 rounded-full"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
  
        {/* Right Arrow */}
        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/40 text-white p-2 rounded-full"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    </div>
  );
  
    
};

export default Slideshow;
