import { Link } from "react-router-dom";

function AboutHome() {
    return (
        <div className="grid lg:grid-cols-2 grid-cols-1 gap-4 bg-white place-content-center px-10 pt-15 pb-20 shadow-xl">
            <div className="lg:col-span-2 col-span-1 p-4 text-black text-center">
                <h2 className="font-sans text-3xl font-bold text-black uppercase pb-8">About Kiguruyembe Secondari</h2>
                <p className="pb-4 text-lg">
                Kigurunyembe Secondary School, located in Morogoro, owned by the Catholic Diocese of Morogoro, 
                Tanzania, traces its roots back to 1974. The inception of the school was inspired by the late 
                Fr. J. Franken, who at the time was the Principal of Kigurunyembe Teachers College, currently known 
                as Morogoro Teachers College, Fr Norbert Mpande who is currently working at the Cathedral.
                </p>
                <Link to="/about" className="text-emerald-700 font-semibold text-xl hover:underline hover:text-emerald-500">LEARN MORE →</Link>
            </div>
            <div className="p-4 rounded-xl border-2 border-emerald-700 border-dashed text-black text-center">
                <h2 className="font-sans text-3xl font-bold text-black uppercase pb-4">Our Mission</h2>
                <p className="text-lg">
                Kigurunyembe secondary school is a church-based school that intends to provide high quality
                education that produces active, flexible responsible and productive individuals in their daily life
                situations.
                </p>
            </div>
            <div className="p-4 rounded-xl border-2 border-emerald-700 border-dashed text-black text-center">
                <h2 className="font-sans text-3xl font-bold text-black uppercase pb-4">Our Vision</h2>
                <p className="text-lg">
                Kigurunyembe secondary school will stand at the highest position in giving high quality education
                that enables its scholars to become effective and functional citizens spiritually, economic and social.
                </p>
            </div>
        </div>
    );
}

export default AboutHome;