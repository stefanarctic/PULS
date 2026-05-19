import React, { useEffect, useRef, useState } from "react";
import useDarkMode from "@/hooks/useDarkMode";

import SlideImageWhite1 from "../../public/res/Slideshow/Slideshowwhite1.png";
import SlideImageBlack1 from "../../public/res/Slideshow/Slideshowblack1.png";
import SlideImageWhite2 from "../../public/res/Slideshow/Slideshowwhite2.png";
import SlideImageBlack2 from "../../public/res/Slideshow/Slideshowblack2.png";
import SlideImageWhite3 from "../../public/res/Slideshow/Slideshowwhite3.png";
import SlideImageBlack3 from "../../public/res/Slideshow/Slideshowblack3.png";
import SlideImageWhite4 from "../../public/res/Slideshow/Slideshowwhite4.png";
import SlideImageBlack4 from "../../public/res/Slideshow/Slideshowblack4.png";

const Slideshow = () => {
  const darkModeOn = useDarkMode();

  const images = [
    {
      url: darkModeOn ? SlideImageBlack1 : SlideImageWhite1,
      alt: "Simulări interactive",
    },
    {
      url: darkModeOn ? SlideImageBlack2 : SlideImageWhite2,
      alt: "Probleme de fizică",
    },
    {
      url: darkModeOn ? SlideImageBlack3 : SlideImageWhite3,
      alt: "Resurse educaționale",
    },
    {
      url: darkModeOn ? SlideImageBlack4 : SlideImageWhite4,
      alt: "Progres și statistici",
    },
  ];

  // Start at 1 for seamless looping
  const [current, setCurrent] = useState(1);
  const slideshowRef = useRef(null);
  const currentInterval = useRef(null);

  // Clone first and last images for seamless looping
  const extendedImages = [
    images[images.length - 1],
    ...images,
    images[0],
  ];

  // Auto-advance
  useEffect(() => {
    currentInterval.current = setInterval(() => {
      setCurrent((prev) => prev + 1);
    }, 5000);

    return () => clearInterval(currentInterval.current);
  }, [currentInterval.current]);

  // Scroll to current slide
  useEffect(() => {
    if (slideshowRef.current) {
      slideshowRef.current.scrollTo({
        left: slideshowRef.current.clientWidth * current,
        behavior: "smooth",
      });
    }
  }, [current]);

  // Seamless looping logic
  useEffect(() => {
    if (!slideshowRef.current) return;
    const handleTransition = () => {
      if (current === extendedImages.length - 1) {
        // If at the (cloned) last slide, jump to the real first slide
        slideshowRef.current.scrollTo({
          left: slideshowRef.current.clientWidth,
          behavior: "auto",
        });
        setCurrent(1);
      } else if (current === 0) {
        // If at the (cloned) first slide, jump to the real last slide
        slideshowRef.current.scrollTo({
          left: slideshowRef.current.clientWidth * (images.length),
          behavior: "auto",
        });
        setCurrent(images.length);
      }
    };

    // Listen for scroll end (using setTimeout as a simple fallback)
    const timeout = setTimeout(handleTransition, 350); // match your scroll duration

    return () => clearTimeout(timeout);
  }, [current, extendedImages.length, images.length]);

  // Swipe/drag state
  const startX = useRef(null);
  const isDragging = useRef(false);

  // Handle swipe/drag start
  const handleStart = (clientX) => {
    startX.current = clientX;
    isDragging.current = true;
    clearInterval(currentInterval.current); // Pause auto-advance while dragging
  };

  // Handle swipe/drag end
  const handleEnd = (clientX) => {
    if (!isDragging.current || startX.current === null) return;
    const diff = clientX - startX.current;
    const threshold = 50; // Minimum px to consider a swipe
    if (diff > threshold) {
      // Swipe right (previous)
      setCurrent((prev) => prev - 1);
    } else if (diff < -threshold) {
      // Swipe left (next)
      setCurrent((prev) => prev + 1);
    }
    isDragging.current = false;
    startX.current = null;
  };

  // Touch events
  useEffect(() => {
    const node = slideshowRef.current;
    if (!node) return;

    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        handleStart(e.touches[0].clientX);
      }
    };
    const onTouchEnd = (e) => {
      if (e.changedTouches.length === 1) {
        handleEnd(e.changedTouches[0].clientX);
      }
    };

    node.addEventListener('touchstart', onTouchStart, { passive: true });
    node.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      node.removeEventListener('touchstart', onTouchStart);
      node.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  // Mouse events (desktop)
  useEffect(() => {
    const node = slideshowRef.current;
    if (!node) return;
    let mouseDown = false;
    let mouseStartX = null;

    const onMouseDown = (e) => {
      mouseDown = true;
      mouseStartX = e.clientX;
      handleStart(e.clientX);
    };
    const onMouseUp = (e) => {
      if (!mouseDown) return;
      mouseDown = false;
      handleEnd(e.clientX);
    };
    // Optional: allow dragging outside the node
    const onMouseLeave = (e) => {
      if (mouseDown) {
        mouseDown = false;
        handleEnd(e.clientX);
      }
    };

    node.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    node.addEventListener('mouseleave', onMouseLeave);

    return () => {
      node.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      node.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  const handleDotClick = (index) => {
    // Reset the interval on dot click
    clearInterval(currentInterval.current);
    // currentInterval.current = setInterval(() => {
    //   setCurrent((prev) => prev + 1);
    // }, 5000);
    // Set the current slide to the clicked dot
    setCurrent(index + 1); // Offset by 1 due to cloned first slide
  };

  return (
    <div className="slideshow-container">
      <div className="slideshow" ref={slideshowRef}>
        {extendedImages.map((image, index) => (
          <div className="slide" key={index}>
            <div className="image-wrapper">
              <div className="gradient-overlay"></div>
              <img
                src={image.url}
                alt={image.alt}
                loading={index === 1 ? "eager" : "lazy"}
                onError={(e) => {
                  e.target.src =
                    SlideImageWhite1;
                  e.target.alt = "Simuari Interactive";
                }}
              />
              <div className="caption">{image.alt}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dots">
        {images.map((_, index) => (
          <button
            key={index}
            className={`dot ${index + 1 === current ? "active" : ""}`}
            onClick={() => handleDotClick(index)}
            aria-label={`Go to slide ${index + 1}`}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default Slideshow;
