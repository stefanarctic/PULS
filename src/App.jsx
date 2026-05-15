import About from "@/components/About";
import Achievements from "@/components/Achievements";
import ContactUs from "@/components/ContactUs";
import Home from "@/components/Home";
import OurWork from "@/components/OurWork";
import Services from "@/components/Services";
import Testimonials from "@/components/Testimonials";
import { BrowserRouter as Router, Route, Routes, Outlet } from 'react-router-dom';
import SearchResults from "./components/pages/searchresults";
import AssistantEntryPage from "./components/pages/AssistantEntryPage";
import './scss/style.scss';
import Index from "./components/pages/Index";
import Index2 from "./components/pages/Index2";
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
import ElectromagnetismPage from "./components/pages/resurse/electromagnetism";
import OpticaPage from "./components/pages/resurse/optica";
import MatematicaPage from "./components/pages/resurse/matematica";
import AstronomiePage from "./components/pages/resurse/astronomie";
import FizicaCuanticaPage from "./components/pages/resurse/fizica-cuantica";
import AtomulPage from "./components/pages/resurse/atomul";
import FizicaNuclearaPage from "./components/pages/resurse/fizica-nucleara";
import LaserePage from "./components/pages/resurse/lasere";
import SimulationPage from "./components/pages/SimulationPage";
import ScrollToTop from "./components/ScrollToTop";
import Profile from "./components/pages/Profile";
import ProblemSubmit from "./components/ProblemSubmit";
import AdminDashboard from "./components/pages/AdminDashboard";
import TeacherDashboard from "./components/pages/TeacherDashboard";
import TeacherClassPage from "./components/pages/TeacherClassPage";
import ClassJoinPage from "./components/pages/ClassJoinPage";
import StudentClassesPage from "./components/pages/StudentClassesPage";
import StudentClassPage from "./components/pages/StudentClassPage";
import InviteTeacherPage from "./components/pages/InviteTeacherPage";
import Comunitate from "./components/pages/Comunitate";
import PublicProfile from "./components/pages/PublicProfile";
import { useEffect } from "react";
import uploadProblems from "./components/uploadProblems";
import { useDispatch, useSelector } from 'react-redux';
import { fetchProblems } from './features/problems/problemsSlice';
import AssistantAvatar from "./components/AssistantAvatar";
import { simulationsConfig } from "@/data/simulations";
import { LanguageProvider } from "./i18n/LanguageContext";

// Routes shared by both Romanian (default) and English (/en/...) trees.
// Defined as a function so each <Route path="/"> and <Route path="/en"> gets its own JSX nodes.
const renderLocalizedRoutes = () => (
  <>
    <Route index element={<Index />} />
    <Route path="landing-custom" element={<Index2 />} />
    <Route path="probleme" element={<Probleme />} />
    <Route path="probleme/bac" element={<ProblemeBac />} />
    <Route path="probleme/grile" element={<ProblemeGrile />} />
    <Route path="probleme/grile/:id" element={<GrileIndividuala />} />
    <Route path="probleme/:id" element={<ProblemaIndividuala />} />
    <Route path="simulari" element={<Simulari />} />
    <Route path="resurse" element={<Resurse />} />
    <Route path="resurse/pendule" element={<Pendule />} />
    <Route path="resurse/unde" element={<Unde />} />
    <Route path="resurse/lissajous" element={<Lissajous />} />
    <Route path="resurse/seism" element={<Seism />} />
    <Route path="resurse/termodinamica" element={<TermodinamicaPage />} />
    <Route path="resurse/mecanica" element={<MecanicaPage />} />
    <Route path="resurse/electricitate" element={<ElectricitatePage />} />
    <Route path="resurse/electromagnetism" element={<ElectromagnetismPage />} />
    <Route path="resurse/optica" element={<OpticaPage />} />
    <Route path="resurse/matematica" element={<MatematicaPage />} />
    <Route path="resurse/astronomie" element={<AstronomiePage />} />
    <Route path="resurse/atomul" element={<AtomulPage />} />
    <Route path="resurse/fizica-cuantica" element={<FizicaCuanticaPage />} />
    <Route path="resurse/fizica-nucleara" element={<FizicaNuclearaPage />} />
    <Route path="resurse/lasere" element={<LaserePage />} />
    {simulationsConfig.map((simulation) => {
      // simulation.route starts with a leading slash; strip it for nested usage.
      const relativePath = simulation.route?.startsWith('/')
        ? simulation.route.slice(1)
        : simulation.route;
      return (
        <Route
          key={simulation.route}
          path={relativePath}
          element={<SimulationPage {...simulation} />}
        />
      );
    })}
    <Route path="about-us" element={<About />} />
    <Route path="search" element={<SearchResults />} />
    <Route path="asistent" element={<AssistantEntryPage />} />
    <Route path="comunitate" element={<Comunitate />} />
    <Route path="profil/:alias" element={<PublicProfile />} />
    <Route path="profil" element={<Profile />} />
    <Route path="invite-teacher" element={<InviteTeacherPage />} />
    <Route path="admin" element={<AdminDashboard />} />
    <Route path="profesor" element={<TeacherDashboard />} />
    <Route path="profesor/clasa/:classId" element={<TeacherClassPage />} />
    <Route path="clasa/intra" element={<ClassJoinPage />} />
    <Route path="clasa" element={<StudentClassesPage />} />
    <Route path="clasa/:classId" element={<StudentClassPage />} />
  </>
);

const LocaleShell = () => <Outlet />;

const App = () => {
  const dispatch = useDispatch();
  const problemsStatus = useSelector((state) => state.problems.status);

  // Fetch problems when app initializes (skip duplicate dispatch while loading / after success — helps Strict Mode)
  useEffect(() => {
    if (problemsStatus === 'loading' || problemsStatus === 'succeeded') return;
    dispatch(fetchProblems());
  }, [dispatch, problemsStatus]);

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
    })
  })

  function getRootElementFontSize() {
    return parseFloat(
      getComputedStyle(
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

  return (
    <Router>
      <LanguageProvider>
        <div className="App">
          <Routes>
            <Route path="/en" element={<LocaleShell />}>
              {renderLocalizedRoutes()}
            </Route>
            <Route path="/" element={<LocaleShell />}>
              {renderLocalizedRoutes()}
            </Route>
          </Routes>
          {/* În interiorul .App ca să se poată suprapune corect peste avatar (z-index) cu linkuri din pagini */}
          <AssistantAvatar />
        </div>
      </LanguageProvider>
    </Router>
  )
}

export default App;
