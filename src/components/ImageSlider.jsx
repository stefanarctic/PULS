import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import "@/scss/components/_simulari-pages.scss";

const ImageSlider = ({ images, autoPlayInterval = 5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  useEffect(() => {
    if (!autoPlayInterval) return;

    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % images.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlayInterval, images.length]);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="image-slider h-64 md:h-80 relative">
      {/* Navigation Arrows */}
      <button
        className="absolute top-1/2 left-4 -translate-y-1/2 bg-background/80 p-2 rounded-full text-foreground hover:bg-background z-10"
        onClick={prevSlide}
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        className="absolute top-1/2 right-4 -translate-y-1/2 bg-background/80 p-2 rounded-full text-foreground hover:bg-background z-10"
        onClick={nextSlide}
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <div key={index} className="min-w-full h-full flex-shrink-0 flex items-center justify-center">
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-contain mx-auto my-auto"
            />
          </div>
        ))}
      </div>

      {/* Indicators */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 w-2 rounded-full transition-all ${
              index === currentIndex ? 'w-4 bg-white' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;
