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
import ProblemeBac from "./components/pages/ProblemeBac";
import ProblemeGrile from "./components/pages/ProblemeGrile";
import GrileIndividuala from "./components/pages/GrileIndividuala";
import Simulari from "./components/pages/Simulari";
import Resurse from "./components/pages/Resurse";
import Pendule from "./components/pages/resurse/pendule";
import Unde from "./components/pages/resurse/unde";
import Lissajous from "./components/pages/resurse/lissajous";
import Seism from "./components/pages/resurse/seism";
import TermodinamicaPage from "./components/pages/resurse/termodinamica";
import MecanicaPage from "./components/pages/resurse/mecanica";
import ElectricitatePage from "./components/pages/resurse/electricitate";
import OpticaPage from "./components/pages/resurse/optica";
import MatematicaPage from "./components/pages/resurse/matematica";
import AstronomiePage from "./components/pages/resurse/astronomie";
import FizicaCuanticaPage from "./components/pages/resurse/fizica-cuantica";
import SimulationPage from "./components/pages/SimulationPage";
import ScrollToTop from "./components/ScrollToTop";
import Profile from "./components/pages/Profile";
import ProblemSubmit from "./components/ProblemSubmit";
import AdminDashboard from "./components/pages/AdminDashboard";
import { useEffect } from "react";
import uploadProblems from "./components/uploadProblems";
import { useDispatch } from 'react-redux';
import { fetchProblems } from './features/problems/problemsSlice';
import AssistantAvatar from "./components/AssistantAvatar";
import { simulationsConfig } from "@/data/simulations";

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
    console.log(window.innerWidth, window.innerHeight);
  }, []);

  // useEffect(() => {
  //   console.log(`Width: ${window.innerWidth}, Height: ${window.innerHeight}`)
  // });

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
          <Route path="/probleme/bac" element={<ProblemeBac />} />
          <Route path="/probleme/grile" element={<ProblemeGrile />} />
          <Route path="/probleme/grile/:id" element={<GrileIndividuala />} />
          <Route path="/probleme/:id" element={<ProblemaIndividuala />} />
          <Route path="/simulari" element={<Simulari />} />
          <Route path="/resurse" element={<Resurse />} />
          <Route path="/resurse/pendule" element={<Pendule />} />
          <Route path="/resurse/unde" element={<Unde />} />
          <Route path="/resurse/lissajous" element={<Lissajous />} />
          <Route path="/resurse/seism" element={<Seism />} />
          <Route path='/resurse/termodinamica' element={<TermodinamicaPage />} />
          <Route path='/resurse/mecanica' element={<MecanicaPage />} />
          <Route path='/resurse/electricitate' element={<ElectricitatePage />} />
          <Route path='/resurse/optica' element={<OpticaPage />} />
          <Route path='/resurse/matematica' element={<MatematicaPage />} />
          <Route path='/resurse/astronomie' element={<AstronomiePage />} />
          <Route path='/resurse/fizica-cuantica' element={<FizicaCuanticaPage />} />
          {simulationsConfig.map((simulation) => (
            <Route
              key={simulation.route}
              path={simulation.route}
              element={<SimulationPage {...simulation} />}
            />
          ))}
          <Route path="/about-us" element={<About />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/profil" element={<Profile />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
      <AssistantAvatar />
    </Router>
  )
}

export default App;