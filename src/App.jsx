import About from "@/components/About";
import Achievements from "@/components/Achievements";
import ContactUs from "@/components/ContactUs";
import Home from "@/components/Home";
import OurWork from "@/components/OurWork";
import Services from "@/components/Services";
import Testimonials from "@/components/Testimonials";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SearchResults from "./components/pages/searchresults";
import './scss/style.scss';
import Index from "./components/pages/Index";
import Probleme from "./components/pages/Probleme";
import ProblemaIndividuala from "./components/pages/ProblemaIndividuala";
import Simulari from "./components/pages/Simulari";
import Resurse from "./components/pages/Resurse";
import Pendule from "./components/pages/resurse/pendule";
import Unde from "./components/pages/resurse/unde";
import Lissajous from "./components/pages/resurse/lissajous";
import Seism from "./components/pages/resurse/seism";
import TermodinamicaPage from "./components/pages/resurse/termodinamica";
import MecanicaPage from "./components/pages/resurse/mecanica";
import ScrollToTop from "./components/ScrollToTop";
import Profile from "./components/pages/Profile";
import ProblemSubmit from "./components/ProblemSubmit";
import { useEffect } from "react";
import uploadProblems from "./components/uploadProblems";
import { useDispatch } from 'react-redux';
import { fetchProblems } from './features/problems/problemsSlice';

const App = () => {
  const dispatch = useDispatch();

  // Fetch problems when app initializes
  useEffect(() => {
    dispatch(fetchProblems());
  }, [dispatch]);

  const toggleOverflow = () => {
    if (document.body.style.overflow === 'hidden')
      document.body.style.overflow = '';
    else
      document.body.style.overflow = 'hidden';
  }

  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key === 'k') {
      toggleOverflow();
    }
  })

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show')
      }
      // else {
      //     entry.target.classList.remove('show')
      // }
    })
  })


  function getRootElementFontSize() {
    // Returns a number
    return parseFloat(
      // of the computed font-size, so in px
      getComputedStyle(
        // for the root <html> element
        document.documentElement
      ).fontSize
    );
  }

  function convertRem(value) {
    return value * getRootElementFontSize();
  }

  useEffect(() => {
    console.log('Website loaded...');
  }, []);

  // setTimeout(() => {
  //   // convertRem(2); // 32 (px)
  //   console.log(convertRem(3.3));
  // }, 1000);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/probleme" element={<Probleme />} />
          <Route path="/probleme/:id" element={<ProblemaIndividuala />} />
          <Route path="/simulari" element={<Simulari />} />
          <Route path="/resurse" element={<Resurse />} />
          <Route path="/resurse/pendule" element={<Pendule />} />
          <Route path="/resurse/unde" element={<Unde />} />
          <Route path="/resurse/lissajous" element={<Lissajous />} />
          <Route path="/resurse/seism" element={<Seism />} />
          <Route path='/resurse/termodinamica' element={<TermodinamicaPage />} />
          <Route path='/resurse/mecanica' element={<MecanicaPage />} />
          <Route path="/about-us" element={<About />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/profil" element={<Profile />} />
          <Route path="/api-test" element={<ProblemSubmit />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App;