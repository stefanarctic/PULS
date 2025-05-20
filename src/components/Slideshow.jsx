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
  const [current, setCurrent] = useState(0);
  const slideshowRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (slideshowRef.current) {
      slideshowRef.current.scrollTo({
        left: slideshowRef.current.clientWidth * current,
        behavior: "smooth",
      });
    }
  }, [current]);

  const handleDotClick = (index) => {
    setCurrent(index);
  };

  return (
    <div className="slideshow-container">
      <div className="slideshow" ref={slideshowRef}>
        {images.map((image, index) => (
          <div className="slide" key={index}>
            <div className="image-wrapper">
              <div className="gradient-overlay"></div>
              <img
                src={image.url}
                alt={image.alt}
                loading={index === 0 ? "eager" : "lazy"}
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
            className={`dot ${index === current ? "active" : ""}`}
            onClick={() => handleDotClick(index)}
            aria-label={`Go to slide ${index + 1}`}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default Slideshow;
