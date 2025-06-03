import { Link } from "react-router-dom";

function Home() {
  return (
    <>
      <div className="Home">
        <header className="Nav-Bar">
          
        </header>
      </div>
      <div className="About">
        <h2>Our Mission</h2>
        <p>
          Kigurunyembe secondary school is a church-based school that intends to provide high quality
          education that produces active, flexible responsible and productive individuals in their daily life
          situations.
        </p>
        <h2>Our Vision</h2>
        <p>
          Kigurunyembe secondary school will stand at the highest position in giving high quality education
          that enables its scholars to become effective and functional citizens spiritually, economic and social.
        </p>
        <h2>Background</h2>
        <p>
          Kigurunyembe Secondary School, located in Morogoro, owned by the Catholic Diocese of Morogoro, 
          Tanzania, traces its roots back to 1974. The inception of the school was inspired by the late 
          Fr. J. Franken, who at the time was the Principal of Kigurunyembe Teachers College, currently known 
          as Morogoro Teachers College, Fr Norbert Mpande who is currently working at the Cathedral.
        </p>
        <Link to="/about"> → Learn more</Link>
      </div>
    </>
  );
}

export default Home;