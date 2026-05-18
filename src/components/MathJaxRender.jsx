import { useEffect } from "react";

/**
 * @param {{ rerun?: unknown }} [props] — la fiecare schimbare a lui `rerun` se reîncearcă typeset (ex. după traducere).
 */
function MathJaxRender(props) {
  const rerun = props?.rerun;
  useEffect(() => {
    let canceled = false;
    function tryTypeset() {
      const mj = window.MathJax;
      if (mj?.typesetPromise) {
        const run = () => mj.typesetPromise().catch(() => {});
        if (mj.startup?.promise) {
          mj.startup.promise.then(run).catch(run);
        } else {
          run();
        }
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