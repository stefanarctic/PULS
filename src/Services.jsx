
const Services = () => {
    return (
        <section id="services" className="hidden hidden-bottom">
            <h1>Services</h1>
            <div className="services-parent">
                <div className="service s1">
                    <div className="img-parent">
                        <img src="./res/House_Design_Square.png" alt="" />
                    </div>
                    <div className="text-parent">
                        <h1>House Design</h1>
                        <p>
                            Our expert architects specialize in designing functional and
                            aesthetically pleasing residential structures. From modern
                            minimalist homes to traditional cottages, we tailor our designs to
                            meet your specific needs and preferences.
                        </p>
                    </div>
                </div>
                <div className="service s2">
                    <div className="img-parent">
                        <img src="./res/Office_Design_Square.jpg" alt="" />
                    </div>
                    <div className="text-parent">
                        <h1>Office Design</h1>
                        <p>
                            We design offices that enhance productivity, collaboration, and
                            employee well-being. Our focus on ergonomic layouts, natural light,
                            and visually appealing aesthetics ensures a positive work
                            environment.
                        </p>
                    </div>
                </div>
                <div className="service s3">
                    <div className="img-parent">
                        <img src="./res/Interior_Detailing_Square3.jpg" alt="" />
                    </div>
                    <div className="text-parent">
                        <h1>Interior Detailing</h1>
                        <p>
                            Our interior detailing services add the finishing touches to your
                            project. We specialize in selecting materials, fixtures, and
                            finishes that complement your design and create a harmonious
                            atmosphere.
                        </p>
                    </div>
                </div>
                <div className="service s4">
                    <div className="img-parent">
                        <img src="./res/Paint_Selection_Square.jpg" alt="" />
                    </div>
                    <div className="text-parent">
                        <h1>Paint Selection</h1>
                        <p>
                            Our color experts help you select paint colors that enhance your
                            space's ambiance and reflect your personal style. We consider
                            factors such as natural light, furniture, and overall design
                            aesthetic to create a cohesive and visually appealing interior.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Services;