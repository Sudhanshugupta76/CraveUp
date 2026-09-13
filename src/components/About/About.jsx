// import React from "react";
import './About.css'
import img from '../../assets/Roll.webp'

const About = () => {
  return (
    <section className="about">
      <div className="about-container">
        <div className="about-text">
          <h1>About US </h1>
          <p>
            CraveUp brings together your favorite local meals, snacks, and desserts in one smooth food-ordering experience. We focus on taste, speed, and convenience for busy everyday living.
          </p>
          <p>
            We specialixe in Ra=eact Developement , Ui design , and creating
            respponsive webstes that work with modern technologies
          </p>

          <button className="about-btn">Learn More  </button>
        </div>

        <div className="about-image">
          <img src={img} alt="about" />
      </div>

      </div>
    </section>
  );
};
export default About;
