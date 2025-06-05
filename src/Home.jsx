import { Link } from "react-router-dom";
import Offer from './Offer';
import Accomp from './Accomplishments';
import Landing from "./LandingHome";

function Home() {
  return (
    <>
      <Landing />
      <div className="grid lg:grid-cols-2 grid-cols-1 gap-4 bg-emerald-800/75 place-content-center px-8 py-8 shadow-xl">
        <div className="p-4 rounded-xl border-2 border-black bg-white text-black">
          <h2 className="font-sans text-2xl font-bold text-emerald-700 uppercase">Our Mission</h2>
          <p>
            Kigurunyembe secondary school is a church-based school that intends to provide high quality
            education that produces active, flexible responsible and productive individuals in their daily life
            situations.
          </p>
        </div>
        <div className="p-4 rounded-xl border-2 border-black bg-white text-black">
          <h2 className="font-sans text-2xl font-bold text-emerald-700 uppercase">Our Vision</h2>
          <p>
            Kigurunyembe secondary school will stand at the highest position in giving high quality education
            that enables its scholars to become effective and functional citizens spiritually, economic and social.
          </p>
        </div>
        <div className="lg:col-span-2 col-span-1 p-4 rounded-xl border-2 border-black bg-white text-black">
          <h2 className="font-sans text-2xl font-bold text-emerald-700 uppercase">Background</h2>
          <p>
            Kigurunyembe Secondary School, located in Morogoro, owned by the Catholic Diocese of Morogoro, 
            Tanzania, traces its roots back to 1974. The inception of the school was inspired by the late 
            Fr. J. Franken, who at the time was the Principal of Kigurunyembe Teachers College, currently known 
            as Morogoro Teachers College, Fr Norbert Mpande who is currently working at the Cathedral.
          </p>
          <Link to="/about" className="text-blue-700 font-semibold hover:underline hover:text-blue-500">LEARN MORE →</Link>
        </div>
      </div>
      <Offer />
      <Accomp />
      <footer>
      </footer>
    </>
  );
}

export default Home;