import { useEffect } from "react";

const MathJaxRender = () => {
  useEffect(() => {
    if (window.MathJax) {
      window.MathJax.typesetPromise();
    }
  });
  return null;
};

export default MathJaxRender;