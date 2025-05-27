import About from "@/components/About";
import Achievements from "@/components/Achievements";
import ContactUs from "@/components/ContactUs";
import Home from "@/components/Home";
import OurWork from "@/components/OurWork";
import Services from "@/components/Services";
import Testimonials from "@/components/Testimonials";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import './scss/style.scss';
import Index from "./components/pages/Index";
import Probleme from "./components/pages/Probleme";
import Simulari from "./components/pages/Simulari";
import Resurse from "./components/pages/Resurse";
import Pendule from "./components/pages/resurse/pendule";
import Unde from "./components/pages/resurse/unde";
import Lissajous from "./components/pages/resurse/lissajous";
import Seism from "./components/pages/resurse/seism";
import ScrollToTop from "./components/ScrollToTop";

const App = () => {

  // const toggleOverflow = () => {
  //   if (document.body.style.overflow === 'hidden')
  //     document.body.style.overflow = '';
  //   else
  //     document.body.style.overflow = 'hidden';
  // }

  // document.addEventListener('keydown', e => {
  //   if (e.ctrlKey && e.key === 'k') {
  //     toggleOverflow();
  //   }
  // })

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

  // $((() => {
  //   // For scroll animation
  //   const hiddenElements = document.querySelectorAll('.hidden');
  //   hiddenElements.forEach(el => observer.observe(el));

  //   // Sets up the navbar links for proper scrolling on click
  //   const navLinks = document.querySelectorAll("#nav-list li a");
  //   navLinks.forEach(a => {
  //     a.addEventListener('click', e => {
  //       openURL(e.target);
  //     })
  //   })
  //   navLinks[0].addEventListener('click', e => {
  //     const header = document.querySelector('header');
  //     header.scrollIntoView(true);
  //   })
  // }));

  // const openURL = linkElement => {
  //   const linkId = linkElement.dataset.href.split('#').join('');

  //   const openedSection = document.getElementById(linkId);
  //   openedSection.scrollIntoView(false);

  //   console.log(`Scrolled to ${openedSection.id}`);
  // }


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
          <Route path="/simulari" element={<Simulari />} />
          <Route path="/resurse" element={<Resurse />} />
          <Route path="/resurse/pendule" element={<Pendule />} />
          <Route path="/resurse/unde" element={<Unde />} />
          <Route path="/resurse/lissajous" element={<Lissajous />} />
          <Route path="/resurse/seism" element={<Seism />} />
          <Route path="/about-us" element={<About />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App;