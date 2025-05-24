import About from "@/components/About";
import Achievements from "@/components/Achievements";
import ContactUs from "@/components/ContactUs";
import Home from "@/components/Home";
import OurWork from "@/components/OurWork";
import Services from "@/components/Services";
import Testimonials from "@/components/Testimonials";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import $ from 'jquery';

import './scss/style.scss';
import Index from "./components/pages/Index";
import SimulariPage from "./Simulari"; 
import PendulePage from "./components/pages/pendule"; 
import UndePage from "./components/pages/unde";
import LissajousPage from "./components/pages/lissajous"; 
import SeismePage from "./components/pages/seism"; 
import ScrollToTop from "./components/ScrollToTop";

const App = () => {

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

  $((() => {
    // For scroll animation
    const hiddenElements = document.querySelectorAll('.hidden');
    hiddenElements.forEach(el => observer.observe(el));


    // Add shadow and blur effect to header when page is scrolled
    // if ($(document).scrollTop() > 100) {
    //   $('nav').css('backdrop-filter', 'blur(2px)');
    //   $('nav').css('background', 'linear-gradient(to bottom, rgba(0, 0, 0, 0.74), rgba(0, 0, 0, 0))');
    // }

    // Sets up the navbar links for proper scrolling on click
    const navLinks = document.querySelectorAll("#nav-list li a");
    navLinks.forEach(a => {
      a.addEventListener('click', e => {
        openURL(e.target);
      })
    })
    navLinks[0].addEventListener('click', e => {
      const header = document.querySelector('header');
      header.scrollIntoView(true);
    })
  }));

  const openURL = linkElement => {
    const linkId = linkElement.dataset.href.split('#').join('');

    const openedSection = document.getElementById(linkId);
    openedSection.scrollIntoView(false);

    console.log(`Scrolled to ${openedSection.id}`);
  }

  // Change header on scroll
  $(document).on("scroll", () => {
    console.log('Scrolled');
    if ($(document).scrollTop() <= 100) {
      $('nav').css('backdrop-filter', `blur(${0.2 * ($(document).scrollTop() / 10)}px)`);
      $('nav').css('background', `linear-gradient(to bottom, rgba(0, 0, 0, ${$(document).scrollTop() / 100 * 0.74}), rgba(0, 0, 0, 0))`);
    }
    else {
      $('nav').css('backdrop-filter', 'blur(2px)');
      $('nav').css('background', 'linear-gradient(to bottom, rgba(0, 0, 0, 0.74), rgba(0, 0, 0, 0))');
    }
  });


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

  setTimeout(() => {
    // convertRem(2); // 32 (px)
    console.log(convertRem(3.3));
  }, 1000);

  return (
    <Router>
      <ScrollToTop />
      <div className="App">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/Simulari" element={<SimulariPage />} />
          <Route path="/Simulari/pendule" element={<PendulePage />} />
          <Route path="/Simulari/unde" element={<UndePage />} />
          <Route path="/Simulari/lissajous" element={<LissajousPage />} />
          <Route path="/Simulari/seism" element={<SeismePage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App;