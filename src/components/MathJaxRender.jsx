import { useEffect } from "react";

const MathJaxRender = () => {
  useEffect(() => {
    let canceled = false;
    function tryTypeset() {
      if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise();
      } else if (!canceled) {
        setTimeout(tryTypeset, 100); // Retry until MathJax is loaded
      }
    }
    tryTypeset();
    return () => { canceled = true; };
  }, []);
  return null;
};

export default MathJaxRender;