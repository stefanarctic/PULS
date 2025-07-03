
const OurWork = () => {
    return (
        <section id="our-work" className="hidden hidden-bottom">
            <h1>Our Work</h1>
            <div className="bento-grid-container">
                <div className="col-left">
                    <div className="row1 rect hidden hidden-left rect1">
                        <div className="about-text">
                            <h1>Fancy house</h1>
                            <p>
                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis,
                                necessitatibus!
                            </p>
                        </div>
                        <img src="./res/Horizontal.jpg" alt="" loading="lazy" />
                    </div>
                    <div className="row2 rect hidden hidden-bottom rect2">
                        <div className="about-text">
                            <h1>Fancy villa on the beach</h1>
                            <p>
                                Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                                Eligendi, nesciunt.
                            </p>
                        </div>
                        <img src="./res/Landscape10.jpg" alt="" />
                    </div>
                </div>
                <div className="col-right">
                    <div className="row1">
                        <div className="col-left rect hidden hidden-right rect3">
                            <div className="about-text">
                                <h1>Villa in California</h1>
                                <p>
                                    Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quam,
                                    esse.
                                </p>
                            </div>
                            <img src="./res/Landscape11.jpg" alt="" />
                        </div>
                        <div className="col-right rect hidden hidden-right rect4">
                            <div className="about-text">
                                <h1>House in Georgia</h1>
                                <p>
                                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                                    Aperiam, consequatur?
                                </p>
                            </div>
                            <img src="./res/Landscape12.jpg" alt="" />
                        </div>
                    </div>
                    <div className="row2 rect hidden hidden-bottom rect5">
                        <div className="about-text">
                            <h1>House in Colorado</h1>
                            <p>
                                Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ducimus,
                                deserunt.
                            </p>
                        </div>
                        <img src="./res/Landscape13.jpg" alt="" />
                    </div>
                </div>
            </div>
        </section>
    );
}

export default OurWork;