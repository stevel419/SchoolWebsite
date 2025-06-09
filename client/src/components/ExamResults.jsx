import React from 'react';

const ExamResults = () => {
  const results = [
    {
      title: 'Exam Results',
      image: '/placeholder1.jpg',
      link: '/placeholder'
    },
    {
        title: 'Exam Results',
        image: '/placeholder1.jpg',
        link: '/placeholder'
    },
    {
        title: 'Exam Results',
        image: '/placeholder1.jpg',
        link: '/placeholder'
    }
  ];

  return (
    <section className="w-full bg-white py-16 px-6 md:px-12">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-8 text-emerald-700">Exam Results</h2>
        <p className="text-lg mb-12 text-gray-600">
          Browse the latest academic performance records and official results.
        </p>

        <div className="flex flex-col gap-12">
          {results.map((item, index) => (
            <a
              key={index}
              href={item.link}
              className="block rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-72 object-cover"
              />
              <div className="p-6 bg-gray-50 text-left">
                <h3 className="text-2xl font-semibold text-gray-800">
                  {item.title}
                </h3>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExamResults;
