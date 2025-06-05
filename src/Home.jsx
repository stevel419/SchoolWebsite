import AboutHome from './AboutHome';
import Offer from './Offer';
import Accomp from './Accomplishments';
import Landing from "./LandingHome";
import Slideshow from './Slideshow';

function Home() {
  return (
    <>
      <Landing />
      <AboutHome />
      <Offer />
      <Accomp />
      <Slideshow/>
    </>
  );
}

export default Home;