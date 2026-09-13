import "./Contact.css";

const Contact = () => {
  return (
    <section className="contact">
      <div className="contact-container">
        <h1>Contact Us</h1>
        <p className="contact-subtext">
          Feel free to reach out to us anytime
        </p>
        <form className="contact-form">
          <input type="text" placeholder="Your Name" required />
          <input type="email" placeholder="Your Email" required />
          <textarea placeholder="Your Message" rows="5" required></textarea>

          <button type="submit">Send Message</button>
        </form>
      </div>
    </section>
  );
};

export default Contact;