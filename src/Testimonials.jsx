import { useEffect } from "react";
import { useRef } from "react";

const Testimonials = () => {

    const testimonialsContainer = useRef(null);
    const testimonial = useRef(null);
    const userImage = useRef(null);
    const username = useRef(null);
    const role = useRef(null);
    const btnPrev = useRef(null);
    const btnNext = useRef(null);
    const progressDots = useRef(null);
    
    const testimonials = [
      {
        name: "June Cha",
        position: "Software Engineer",
        photo: "https://randomuser.me/api/portraits/women/44.jpg",
        text:
          "This guy is an amazing frontend developer that delivered the task exactly how we need it, do your self a favor and hire him, you will not be disappointed by the work delivered. He will go the extra mile to make sure that you are happy with your project. I will surely work again with him!"
      },
      {
        name: "Iida Niskanen",
        position: "Data Entry",
        photo: "https://randomuser.me/api/portraits/women/67.jpg",
        text:
          "This guy is a hard worker. Communication was also very good with him and he was very responsive all the time, something not easy to find in many freelancers. We'll definitely repeat with him."
      },
      {
        name: "Renee Sims",
        position: "Receptionist",
        photo: "https://randomuser.me/api/portraits/women/8.jpg",
        text:
          "This guy does everything he can to get the job done and done right. This is the second time I've hired him, and I'll hire him again in the future."
      },
      {
        name: "Sasha Ho",
        position: "Accountant",
        photo:
          "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?h=350&auto=compress&cs=tinysrgb",
        text:
          "This guy is a top notch designer and front end developer. He communicates well, works fast and produces quality work. We have been lucky to work with him!"
      },
      {
        name: "Veeti Seppanen",
        position: "Director",
        photo: "https://randomuser.me/api/portraits/men/97.jpg",
        text:
          "This guy is a young and talented IT professional, proactive and responsible, with a strong work ethic. He is very strong in PSD2HTML conversions and HTML/CSS technology. He is a quick learner, eager to learn new technologies. He is focused and has the good dynamics to achieve due dates and outstanding results."
      }
    ];
    
    let idx = 0;
    
    
    function displayTestimonial() {
      const { name, position, photo, text } = testimonials[idx];
    
      testimonial.current.innerHTML = text;
      userImage.current.src = photo;
      username.current.innerHTML = name;
      role.current.innerHTML = position;
    
      updateProgressDots();
    }
    
    function updateProgressDots() {
      const dots = progressDots.current.children;
      [...dots].forEach((dot) => {
        dot.classList.remove("active");
      });
      dots[idx].classList.add("active");
    }

    useEffect(() => {
        testimonials.forEach((testimonial) => {
            const dot = document.createElement("div");
            dot.classList.add("progress-dot");
            progressDots.current.appendChild(dot);
        });

        btnNext.current.addEventListener("click", () => {
            idx === testimonials.length - 1 ? (idx = 0) : idx++;
            console.log(idx);
          
            displayTestimonial();
        });
          
        btnPrev.current.addEventListener("click", () => {
            idx === 0 ? (idx = testimonials.length - 1) : idx--;
            console.log(idx);
            
            displayTestimonial();
        });

        displayTestimonial();    
    }, []);
    

    return (
        <section id="testimonials" className="hidden hidden-bottom">
            <h1>Testimonials</h1>
            <div className="testimonial-container" ref={testimonialsContainer}>
                <div className="btn" id="btn-prev" ref={btnPrev}>
                    <i className="fa-solid fa-chevron-left" />
                </div>
                <div className="btn" id="btn-next" ref={btnNext}>
                    <i className="fa-solid fa-chevron-right" />
                </div>
                <div className="stars">
                    <i className="fa-solid fa-star" />
                    <i className="fa-solid fa-star" />
                    <i className="fa-solid fa-star" />
                    <i className="fa-solid fa-star" />
                    <i className="fa-solid fa-star" />
                </div>
                <p className="testimonial" ref={testimonial}>
                    I've worked with literally hundreds of HTML/CSS developers and I have to
                    say the top spot goes to this guy. This guy is an amazing developer. He
                    stresses on good, clean code and pays heed to the details. I love
                    developers who respect each and every aspect of a throughly thought out
                    design and do their best to put it in code. He goes over and beyond and
                    transforms ART into PIXELS - without a glitch, every time.
                </p>
                <div className="user">
                    <img
                        src="https://randomuser.me/api/portraits/women/46.jpg"
                        alt="user"
                        className="user-image"
                        ref={userImage}
                    />
                    <div className="user-details">
                        <h4 className="username" ref={username}>Miyah Myles</h4>
                        <p className="role" ref={role}>Marketing</p>
                    </div>
                </div>
                <div className="progress-dots" id="progress-dots" ref={progressDots}/>
            </div>
        </section>
    );
}

export default Testimonials;