import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';

function Accomp() {
    return (
        <div className="py-10">
            <h2 className="flex justify-center pt-10 font-bold text-3xl uppercase">Our Achievements</h2>
            <div className="flex flex-col lg:flex-row gap-5 px-10 py-10">
                <div className="text-center flex-1 relative">
                    <div className="w-40 h-40 mx-auto rounded-full border-2 border-yellow-500 shadow-xl/20 shadow-yellow-500 flex flex-col items-center justify-center bg-white mb-10">
                        <h2 className="text-6xl font-bold text-black pb-2">2</h2>
                        <h2 className="text-lg font-semibold text-gray-700">Alumni</h2>
                    </div>
                    <p className="text-black text-lg font-semibold">Serving as ministers in the current government</p>
                </div>
                <div className="text-center flex-1 relative border-y-2 lg:border-x-2 lg:border-y-0 border-dashed border-gray-300 py-5 lg:px-5 lg:py-0">
                    <div className="w-40 h-40 mx-auto rounded-full border-2 border-yellow-500 shadow-xl/20 shadow-yellow-500 flex flex-col items-center justify-center bg-white mb-10">
                        <FontAwesomeIcon icon={faArrowUp} className="text-6xl text-emerald-600 pb-2" />
                        <h2 className="text-lg font-semibold text-gray-700">Growth</h2>
                    </div>
                    <p className="text-black text-lg font-semibold">Increasing opportunities to pursue higher education</p>
                </div>
                <div className="text-center flex-1 relative">
                    <div className="w-40 h-40 mx-auto rounded-full border-2 border-yellow-500 shadow-xl/20 shadow-yellow-500 flex flex-col items-center justify-center bg-white mb-10">
                        <h2 className="text-6xl font-bold text-black pb-2">68%</h2>
                        <h2 className="text-lg font-semibold text-gray-700">Literacy</h2>
                    </div>
                    <p className="text-black text-lg font-semibold">Increased literacy level of students from rural areas</p>
                </div>
            </div>
        </div>
    );
}

export default Accomp;