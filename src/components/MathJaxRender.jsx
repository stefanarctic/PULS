import { useEffect } from "react";

/**
 * @param {{ rerun?: unknown }} [props] — la fiecare schimbare a lui `rerun` se reîncearcă typeset (ex. după traducere).
 */
function MathJaxRender(props) {
  const rerun = props?.rerun;
  useEffect(() => {
    let canceled = false;
    function tryTypeset() {
      if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise().catch(() => {});
      } else if (!canceled) {
        setTimeout(tryTypeset, 100);
      }
    }
    tryTypeset();
    return () => { canceled = true; };
  }, [rerun]);
  return null;
}

export default MathJaxRender;