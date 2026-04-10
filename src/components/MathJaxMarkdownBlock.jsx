import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { wrapInlineMathIfNeeded, shouldRenderMathAsPlainText } from '../lib/mathJaxifyPlainMath';
import '../scss/components/_mathjax-markdown-block.scss';

/**
 * Markdown + MathJax. Pentru celule cu formule: fără ReactMarkdown, ca CommonMark să nu
 * „mănânce” backslash-urile din \(...\).
 *
 * @param {object} props
 * @param {string} props.content
 * @param {string} [props.className]
 * @param {boolean} [props.mathJaxify]
 */
const MathJaxMarkdownBlock = React.memo(({ content, className = '', mathJaxify = false }) => {
  const displayContent = mathJaxify ? wrapInlineMathIfNeeded(content) : content;
  const plainMath = shouldRenderMathAsPlainText(displayContent, mathJaxify);
  const contentRef = useRef(null);

  const fixMathJaxLayout = (container) => {
    if (!container) return;
    const mathContainers = container.querySelectorAll('mjx-container, .MathJax, .MathJax_Display');
    mathContainers.forEach((mathEl) => {
      mathEl.style.maxWidth = '100%';
      mathEl.style.overflowX = 'hidden';
      mathEl.style.overflowY = 'hidden';
      const mathContent = mathEl.querySelector('mjx-math');
      if (mathContent && mathContent.getAttribute('display') === 'false') {
        mathEl.style.display = 'inline-block';
        mathEl.style.verticalAlign = 'middle';
      }
    });
  };

  useEffect(() => {
    if (contentRef.current) {
      const timeoutId = setTimeout(() => {
        if (window.MathJax) {
          const typesetPromise = window.MathJax.typesetPromise
            ? window.MathJax.typesetPromise([contentRef.current])
            : Promise.resolve().then(() => {
                if (window.MathJax.typeset) window.MathJax.typeset([contentRef.current]);
              });
          typesetPromise
            .then(() => setTimeout(() => fixMathJaxLayout(contentRef.current), 100))
            .catch(() => setTimeout(() => fixMathJaxLayout(contentRef.current), 200));
        }
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [displayContent, plainMath]);

  useEffect(() => {
    const handleResize = () => {
      if (contentRef.current) {
        setTimeout(() => fixMathJaxLayout(contentRef.current), 100);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (plainMath) {
    return (
      <div ref={contentRef} className={`prose max-w-none mj-plain-math-root ${className}`.trim()}>
        <span className="mj-plain-math-tex">{displayContent}</span>
      </div>
    );
  }

  return (
    <div ref={contentRef} className={`prose max-w-none ${className}`}>
      <ReactMarkdown
        components={{
          a: ({ node, ...props }) => <a {...props} target="_self" rel="noopener noreferrer" />,
        }}
      >
        {displayContent}
      </ReactMarkdown>
    </div>
  );
});

MathJaxMarkdownBlock.displayName = 'MathJaxMarkdownBlock';

export default MathJaxMarkdownBlock;
