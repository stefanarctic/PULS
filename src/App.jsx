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
import uploadProblems from "./components/uploadProblems";
import { Fragment, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { fetchProblems } from './features/problems/problemsSlice';
import AssistantAvatar from "./components/AssistantAvatar";
import { simulationsConfig } from "@/data/simulations";
import { LanguageProvider } from "./i18n/LanguageContext";
import siteEnCatalog from "../public/translations/site.en.json";
import { romanianRelativeRouteToEnglish } from "./i18n/pathLocalization";

const SITE_ROUTING = siteEnCatalog.routing ?? {};

const pairStatic = (englishBranch, roPath, elem) => {
  const enPath = romanianRelativeRouteToEnglish(roPath, SITE_ROUTING);
  if (!englishBranch || roPath === enPath)
    return <Route path={roPath} element={elem} />;
  return (
    <Fragment key={`p-${roPath}`}>
      <Route path={roPath} element={elem} />
      <Route path={enPath} element={elem} />
    </Fragment>
  );
};

const simulationRouteNodes = (englishBranch) =>
  simulationsConfig.flatMap((simulation) => {
    const relativeRo = simulation.route?.startsWith("/")
      ? simulation.route.slice(1)
      : simulation.route;
    const relativeEn = romanianRelativeRouteToEnglish(relativeRo, SITE_ROUTING);
    const paths =
      englishBranch && relativeEn !== relativeRo ? [relativeRo, relativeEn] : [relativeRo];
    return paths.map((relPath) => (
      <Route
        key={`sim-${simulation.id}-${relPath}`}
        path={relPath}
        element={<SimulationPage {...simulation} />}
      />
    ));
  });

// Routes shared by both Romanian (default) and English (/en/...) trees.
// Under /en, Romanian slugs remain valid as aliases alongside English URLs from site.en.json `routing`.
const renderLocalizedRoutes = (englishBranch = false) => (
  <>
    <Route index element={<Index />} />
    {pairStatic(englishBranch, "landing-custom", <Index2 />)}
    {pairStatic(englishBranch, "probleme", <Probleme />)}
    {pairStatic(englishBranch, "probleme/bac", <ProblemeBac />)}
    {pairStatic(englishBranch, "probleme/grile", <ProblemeGrile />)}
    {englishBranch ? (
      <Fragment key="grile-detail">
        <Route path="probleme/grile/:id" element={<GrileIndividuala />} />
        <Route path="problems/quizzes/:id" element={<GrileIndividuala />} />
      </Fragment>
    ) : (
      <Route path="probleme/grile/:id" element={<GrileIndividuala />} />
    )}
    {englishBranch ? (
      <Fragment key="prob-detail">
        <Route path="probleme/:id" element={<ProblemaIndividuala />} />
        <Route path="problems/:id" element={<ProblemaIndividuala />} />
      </Fragment>
    ) : (
      <Route path="probleme/:id" element={<ProblemaIndividuala />} />
    )}
    {pairStatic(englishBranch, "simulari", <Simulari />)}
    {pairStatic(englishBranch, "resurse", <Resurse />)}
    {pairStatic(englishBranch, "resurse/pendule", <Pendule />)}
    {pairStatic(englishBranch, "resurse/unde", <Unde />)}
    {pairStatic(englishBranch, "resurse/lissajous", <Lissajous />)}
    {pairStatic(englishBranch, "resurse/seism", <Seism />)}
    {pairStatic(englishBranch, "resurse/termodinamica", <TermodinamicaPage />)}
    {pairStatic(englishBranch, "resurse/mecanica", <MecanicaPage />)}
    {pairStatic(englishBranch, "resurse/electricitate", <ElectricitatePage />)}
    {pairStatic(englishBranch, "resurse/electromagnetism", <ElectromagnetismPage />)}
    {pairStatic(englishBranch, "resurse/optica", <OpticaPage />)}
    {pairStatic(englishBranch, "resurse/matematica", <MatematicaPage />)}
    {pairStatic(englishBranch, "resurse/astronomie", <AstronomiePage />)}
    {pairStatic(englishBranch, "resurse/atomul", <AtomulPage />)}
    {pairStatic(englishBranch, "resurse/fizica-cuantica", <FizicaCuanticaPage />)}
    {pairStatic(englishBranch, "resurse/fizica-nucleara", <FizicaNuclearaPage />)}
    {pairStatic(englishBranch, "resurse/lasere", <LaserePage />)}
    {simulationRouteNodes(englishBranch)}
    {pairStatic(englishBranch, "about-us", <About />)}
    {pairStatic(englishBranch, "search", <SearchResults />)}
    {pairStatic(englishBranch, "asistent", <AssistantEntryPage />)}
    {pairStatic(englishBranch, "comunitate", <Comunitate />)}
    {englishBranch ? (
      <Fragment key="prof-alias">
        <Route path="profil/:alias" element={<PublicProfile />} />
        <Route path="profile/:alias" element={<PublicProfile />} />
      </Fragment>
    ) : (
      <Route path="profil/:alias" element={<PublicProfile />} />
    )}
    {pairStatic(englishBranch, "profil", <Profile />)}
    {pairStatic(englishBranch, "invite-teacher", <InviteTeacherPage />)}
    {pairStatic(englishBranch, "admin", <AdminDashboard />)}
    {pairStatic(englishBranch, "profesor", <TeacherDashboard />)}
    {englishBranch ? (
      <Fragment key="teacher-class">
        <Route path="profesor/clasa/:classId" element={<TeacherClassPage />} />
        <Route path="teacher/class/:classId" element={<TeacherClassPage />} />
      </Fragment>
    ) : (
      <Route path="profesor/clasa/:classId" element={<TeacherClassPage />} />
    )}
    {pairStatic(englishBranch, "clasa/intra", <ClassJoinPage />)}
    {pairStatic(englishBranch, "clasa", <StudentClassesPage />)}
    {englishBranch ? (
      <Fragment key="student-class">
        <Route path="clasa/:classId" element={<StudentClassPage />} />
        <Route path="class/:classId" element={<StudentClassPage />} />
      </Fragment>
    ) : (
      <Route path="clasa/:classId" element={<StudentClassPage />} />
    )}
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
              {renderLocalizedRoutes(true)}
            </Route>
            <Route path="/" element={<LocaleShell />}>
              {renderLocalizedRoutes(false)}
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
