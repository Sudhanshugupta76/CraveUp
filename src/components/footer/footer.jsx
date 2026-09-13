import'./footer.css'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h2>CraveUp</h2>
          <p>Delicious food delivered to your doorstep.</p>
        </div>
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li>Home</li>
            <li>About</li>
            <li>Menu</li>
            <li>Contact</li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Contact Info</h3>
          <p>Email : info@craveup.com</p>
          <p>Phone: +91 7619868746</p>
          
        </div>
      </div>
      <div className="footer-bottom"> 
      <p>&copy; 2026 fodies. all Right Reserved</p>
      </div>
    </footer>
  )
};

export default Footer;