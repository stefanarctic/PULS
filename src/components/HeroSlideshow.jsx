import React, { useState, useEffect } from "react";

const slides = [
    {
        image: "./rasdsaes/architecture_indoors2.jpg",
        caption: "Laboratory equipment"
    },
    {
        image: "./rsdasdsaes/architecture_indoors3.jpg",
        caption: "Physics in action"
    },
    {
        image: "./rasdsaes/architecture_indoors1.jpg",
        caption: "Interactive simulations"
    }
];

const HeroSlideshow = () => {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearTimeout(timer);
    }, [current]);

    return (
        <div className="hero-slideshow">
            <div className="hero-slideshow-image-container">
                <img
                    src={slides[current].image}
                    alt={slides[current].caption}
                    className="hero-slideshow-image"
                />
                <div className="hero-slideshow-caption">
                    {slides[current].caption}
                </div>
            </div>
            <div className="hero-slideshow-dots">
                {slides.map((_, idx) => (
                    <span
                        key={idx}
                        onClick={() => setCurrent(idx)}
                        className={`hero-slideshow-dot${idx === current ? " active" : ""}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroSlideshow;