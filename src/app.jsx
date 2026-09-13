 
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Home from "./components/Home/Home";
import About from "./components/About/About";
import Contact from "./components/Contact/Contact";
import CartSidebar from "./components/CartSidebar/CartSidebar";
import Footer from "./components/footer/footer";
import Login from "./components/login/login";
import Location from "./components/Location/Location";
import Intro from "./components/Intro/Intro";
import Payment from "./components/Payment/Payment";
import Profile from "./components/Profile/Profile";
import Toast from "./components/Toast/Toast";
import { apiFetch, clearSession } from "./lib/api";
import { useEffect, useState } from "react";

const getSavedCart = () => {
  try {
    return JSON.parse(localStorage.getItem("craveUpCart") || "[]");
  } catch {
    return [];
  }
};

const getSavedValue = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
};

const App = () => {
  const [cart, setCart] = useState(getSavedCart);
  const [showIntro, setShowIntro] = useState(true);
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState(() => getSavedValue("craveUpFavorites", []));
  const [favoriteItems, setFavoriteItems] = useState(() => getSavedValue("craveUpFavoriteItems", []));
  const [toast, setToast] = useState(null);

  useEffect(() => {
    localStorage.setItem("craveUpCart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const token = localStorage.getItem("craveUpToken");
    if (!token) return;
    Promise.all([apiFetch("/api/auth/me"), apiFetch("/api/orders")])
      .then(([account, orderData]) => {
        setUser(account.user);
        setOrders(orderData.orders);
      })
      .catch(() => {
        clearSession();
        setUser(null);
        setOrders([]);
      });
  }, []);

  useEffect(() => {
    if (!user) return undefined;
    const refreshOrders = () => {
      apiFetch("/api/orders").then((orderData) => setOrders(orderData.orders)).catch(() => {});
    };
    const timer = window.setInterval(refreshOrders, 15000);
    return () => window.clearInterval(timer);
  }, [user]);

  useEffect(() => {
    localStorage.setItem("craveUpFavorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem("craveUpFavoriteItems", JSON.stringify(favoriteItems));
  }, [favoriteItems]);

  const notify = (message, type = "success") => {
    setToast({ id: Date.now(), message, type });
  };

  return (
     <BrowserRouter>
  {showIntro && <Intro onFinish={() => setShowIntro(false)} />}
  <Navbar cart={cart} user={user} />
     <Routes>
        <Route path="/" element={<Home cart={cart} setCart={setCart} favorites={favorites} setFavorites={setFavorites} favoriteItems={favoriteItems} setFavoriteItems={setFavoriteItems} notify={notify} />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login user={user} onLogin={setUser} notify={notify} />} />
        <Route path="/location" element={<Location />} />
        <Route
          path="/cart"
          element={<CartSidebar cart={cart} setCart={setCart} />}
        />
        <Route
          path="/payment"
          element={<Payment cart={cart} setCart={setCart} user={user} setOrders={setOrders} notify={notify} />}
        />
        <Route path="/profile" element={<Profile user={user} orders={orders} favorites={favorites} favoriteItems={favoriteItems} setUser={setUser} setOrders={setOrders} onLogin={setUser} notify={notify} />} />
        <Route path="/orders" element={<Profile user={user} orders={orders} favorites={favorites} favoriteItems={favoriteItems} setUser={setUser} setOrders={setOrders} onLogin={setUser} notify={notify} />} />
     </Routes>
     <Footer />
     <Toast toast={toast} onClose={() => setToast(null)} />
     </BrowserRouter>
    )
}

export default App;