import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-emerald-700 text-white py-8 px-4 mt-12">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
                    <div className="flex flex-col items-center md:items-start">
                        <img 
                            src="/KIGURUNYEMBE LOGO.png" 
                            alt="Logo" 
                            className="w-30 md:w-40" 
                        />
                    </div>
                    <div className="text-center md:text-left">
                        <h2 className="text-xl font-bold mb-4 text-white flex items-center justify-center md:justify-start">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Contact Us
                        </h2>
                        <div className="space-y-3 text-emerald-100">
                            <div className="flex items-center justify-center md:justify-start">
                                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <a href="mailto:kigurunyembess@gmail.com" className="hover:text-white transition-colors duration-200">
                                    kigurunyembess@gmail.com
                                </a>
                            </div>
                            <div className="flex items-center justify-center md:justify-start">
                                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <div>
                                    <a href="tel:+255761402400" className="hover:text-white transition-colors duration-200">
                                        +255 761 402 400
                                    </a>
                                    <span className="mx-1">/</span>
                                    <a href="tel:+255657532470" className="hover:text-white transition-colors duration-200">
                                        657 532 470
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-start justify-center md:justify-start">
                                <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>P.O. Box 677, Morogoro, Tanzania</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-center md:text-left">
                        <h2 className="text-xl font-bold mb-4 text-white flex items-center justify-center md:justify-start">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            Quick Links
                        </h2>
                        <div className="space-y-2 text-emerald-100">
                            <div>
                                <Link to="/About" className="hover:text-white transition-colors duration-200 block py-1">
                                    About Us
                                </Link>
                            </div>
                            <div>
                                <Link to="/Academics" className="hover:text-white transition-colors duration-200 block py-1">
                                    Academics
                                </Link>
                            </div>
                            <div>
                                <Link to="/Admission" className="hover:text-white transition-colors duration-200 block py-1">
                                    Admissions
                                </Link>
                            </div>
                            <div>
                                <Link
                                    to="/update-website"
                                    className="text-white hover:underline hover:text-emerald-400 transition"
                                    >
                                    Update Website
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="border-t border-emerald-600 pt-6">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-emerald-100 text-sm mb-4 md:mb-0">
                            &copy; {new Date().getFullYear()} Kiguruyembe Secondary School. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;