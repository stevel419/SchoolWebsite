import { useEffect, useState } from 'react';

const ExamResults = () => {
  const [results, setResults] = useState([]);
  const baseURL = import.meta.env.VITE_API_BASE_URL
  useEffect(() => {
    fetch(`${baseURL}/get-exam-results`)
      .then(res => res.json())
      .then(data => setResults(data));
  }, []);

  return (
    <section className="w-full bg-white py-16 px-6 md:px-12">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-8 text-emerald-700">Exam Results</h2>
        <p className="text-lg mb-12 text-gray-600">
          Browse the latest academic performance records and official results.
        </p>

        <div className="flex flex-col gap-4 items-center">
          {results.map((item, index) => (
            <a
              key={index}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-96 flex items-center justify-between bg-gray-100 border border-gray-200 rounded-md px-4 py-3 hover:bg-emerald-50 hover:border-emerald-500 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-3 text-left">
                <span className="text-emerald-800 font-medium">{item.year} Exam Results</span>
              </div>
              <span className="text-sm text-blue-600 hover:underline">View</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExamResults;
