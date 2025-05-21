import React, { useEffect, useRef, useState } from "react";

const images = [
  {
    url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    alt: "Wave dynamics simulation",
  },
  {
    url: "https://images.unsplash.com/photo-1636633762833-5d1658f1e29b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    alt: "Quantum physics visualization",
  },
  {
    url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    alt: "Laboratory equipment",
  },
  {
    url: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    alt: "Scientific research",
  },
  {
    url: "https://images.unsplash.com/photo-1606763105076-0015b1289822?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    alt: "Physics principles illustration",
  },
];

const Slideshow = () => {
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
    const timeout = setTimeout(handleTransition, 250); // match your scroll duration

    return () => clearTimeout(timeout);
  }, [current, extendedImages.length, images.length]);

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
                    "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80";
                  e.target.alt = "Physics concept visualization";
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
