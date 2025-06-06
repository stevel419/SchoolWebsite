import { Link } from "react-router-dom";
import Values from "./Values.jsx";
import Staff from './Staff.jsx';

function About() {
    return (
        <section>
            <section className="flex flex-col pt-20 px-10">
                <h2 className="uppercase font-bold text-3xl py-5 border-b-2 border-gray-500">Our History</h2>
                <p className="text-lg py-3 font-semibold">
                Kigurunyembe Secondary School, located in Morogoro, owned by the Catholic Diocese of Morogoro, 
                Tanzania, traces its roots back to 1974. The inception of the school was inspired by the late 
                Fr. J. Franken, who at the time was the Principal of Kigurunyembe Teachers College, currently known 
                as Morogoro Teachers College, Fr Norbert Mpande who is currently working at the Cathedral.
                </p>
                <p className="text-lg py-3 font-semibold border-b-2 border-gray-500">
                Fr. Franken's vision was to provide quality secondary education to the youth of Morogoro 
                and its surrounding regions. His dedication to education and community development laid the 
                foundation for what would become a significant educational institution in the area. The school 
                initiated advanced level wing in 1984, with four combinations of HGE, HGL, HKL and EGM.
                </p>
            </section>
            <section className="w-full h-[40vh] md:h-[60vh] lg:h-[80vh] relative text-white flex items-center justify-center px-10 py-5">
                <img 
                    src="/schoolTempBackground.jpg" 
                    alt="School background" 
                    className="w-full h-full object-cover object-center"
                />
            </section>
            <section className="flex flex-col lg:flex-row gap-5 px-10">
                <div className="flex flex-col lg:w-[60%] gap-2">
                    <div className="flex-1">
                        <h2 className="font-bold text-3xl uppercase py-5 border-b-2 border-gray-500">Our Mission</h2>
                        <p className="text-lg py-3 font-semibold border-b-2 border-gray-500">
                        Kigurunyembe secondary school is a church-based school that intends to provide high quality
                        education that produces active, flexible responsible and productive individuals in their daily life
                        situations.
                        </p>
                    </div>
                    <div className="flex-1">
                        <h2 className="font-bold text-3xl uppercase py-5 border-b-2 border-gray-500">Our Vision</h2>
                        <p className="text-lg py-3 font-semibold border-b-2 border-gray-500">
                        Kigurunyembe secondary school will stand at the highest position in giving high quality education
                        that enables its scholars to become effective and functional citizens spiritually, economic and social.
                        </p>
                    </div>
                </div>
                <Values />
            </section>
            <div className="flex justify-center pb-5">
                <Link to="/" className="text-lg font-bold uppercase border-2 border-emerald-700 text-emerald-700 px-4 py-2 hover:underline hover:text-white hover:bg-emerald-700">
                    Back to home →
                </Link>
            </div>
            <Staff />
        </section>
    );
}

export default About;