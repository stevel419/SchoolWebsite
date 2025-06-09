import React from 'react';

const Calendar = () => {
  return (
    <section className="w-full px-4 md:px-12 py-16 bg-white">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">School Calendar</h2>
        <p className="text-gray-600 mb-8">Stay up-to-date with upcoming academic events, holidays, and exam dates.</p>
        
        <div className="w-full aspect-video rounded-lg overflow-hidden shadow-lg">
          <iframe
            src = "https://calendar.google.com/calendar/embed?src=c_ddda415d8d6539a9384e4ab5d09268142982414f64ea8088557985dd06221bd7%40group.calendar.google.com&ctz=Africa%2FNairobi" width="800" height="600" frameBorder="0"
            title="School Calendar"
            style={{ border: 0 }}
            className="w-full h-full"
            scrolling="no"
          ></iframe>
        </div>
      </div>
    </section>
  );
};

export default Calendar;
