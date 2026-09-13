import { Link } from "react-router-dom";
import { FaCartShopping } from "react-icons/fa6";
import { MdFastfood, MdLocationOn } from "react-icons/md";
import { FaUserCircle } from "react-icons/fa";
import "./Navbar.css";

const Navbar = ({ cart = [], user }) => {
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <div className="mainContainer">
      <nav>
        <div className="logo">
          <div className="foodlogo">
            <MdFastfood />
          </div>
          <div className="logoname">CraveUp</div>
        </div>

        <ul className="listItems">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/contact">Contact</Link></li>
          <li><Link to="/profile" aria-label={user ? "Open profile" : "Login from profile"} title={user ? "Profile" : "Login / Register"}><FaUserCircle />{user && <span className="profileName">{user.name}</span>}</Link></li>
          <li>
            <Link to="/location" aria-label="Delivery location" title="Delivery location">
              <MdLocationOn />
            </Link>
          </li>
          <li>
            <Link to="/cart">
              <FaCartShopping />
              <span>{cartCount}</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Navbar;