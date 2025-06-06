import AboutHome from './AboutHome';
import Offer from './Offer';
import Accomp from './Accomplishments';
import Landing from "./LandingHome";
import Slideshow from './Slideshow';
import Calendar from './Calendar';

function Home() {
  return (
    <>
      <Landing />
      <AboutHome />
      <Offer />
      <Accomp />
      <Calendar />
      <Slideshow/>
    </>
  );
}

export default Home;