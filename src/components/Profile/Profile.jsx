import { Link, useNavigate } from "react-router-dom";
import Login from "../login/login";
import { apiFetch, clearSession } from "../../lib/api";
import "./Profile.css";

const statuses = ["Order placed", "Preparing", "Out for delivery", "Delivered"];

const formatDate = (value) => new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

const Profile = ({ user, orders = [], favorites = [], favoriteItems = [], setUser, setOrders, onLogin, notify }) => {
  const navigate = useNavigate();

  if (!user) {
    return (
      <main className="profilePage">
        <div className="profileLoginHeading">
          <span className="profileEyebrow">Your CraveUp profile</span>
          <h1>Login to manage your account</h1>
          <p>View orders, track deliveries and save favorite dishes.</p>
        </div>
        <Login onLogin={onLogin} notify={notify} />
      </main>
    );
  }

  const logout = () => {
    clearSession();
    setUser(null);
    notify("You have been logged out.");
    navigate("/");
  };

  const cancelOrder = async (orderId) => {
    try {
      const result = await apiFetch(`/api/orders/${orderId}/cancel`, { method: "POST" });
      setOrders((currentOrders) => currentOrders.map((order) => order.id === orderId ? result.order : order));
      notify("Order cancelled successfully.");
    } catch (error) {
      notify(error.message, "error");
    }
  };

  return (
    <main className="profilePage">
      <div className="profileTopline">
        <div>
          <span className="profileEyebrow">Your CraveUp account</span>
          <h1>{user.name || "Food lover"}</h1>
          <p>{user.email}</p>
        </div>
        <button type="button" className="logoutButton" onClick={logout}>Log out</button>
      </div>

      <section className="profileStats">
        <div><strong>{orders.length}</strong><span>Orders</span></div>
        <a className="profileStatLink" href="#favorites"><strong>{favorites.length}</strong><span>Favorites / Wishlist</span></a>
        <div><strong>{orders.filter((order) => !["Delivered", "Cancelled"].includes(order.status)).length}</strong><span>Active</span></div>
      </section>

      <section className="profileSection" id="orders">
        <div className="sectionHeading"><div><span className="profileEyebrow">Your journey</span><h2>Order history & tracking</h2></div><Link to="/" className="profileTextLink">Order more</Link></div>
        {orders.length === 0 ? <p className="profileMuted">No orders yet. Your delicious first order is waiting.</p> : (
          <div className="orderList">
            {orders.map((order) => {
              const activeIndex = statuses.indexOf(order.status);
              return (
                <article className="orderCard" key={order.id}>
                  <div className="orderCardHeader"><div><strong>Order #{order.id.slice(-6)}</strong><span>{formatDate(order.createdAt)}</span></div><strong>₹ {order.total}</strong></div>
                  <p className="orderItems">{order.items.map((item) => `${item.name} × ${item.quantity}`).join(", ")}</p>
                  <div className="trackingSteps">
                    {statuses.map((status, index) => <div className={index <= activeIndex ? "trackingStep done" : "trackingStep"} key={status}><span>{index + 1}</span><small>{status}</small></div>)}
                  </div>
                  <p className={order.status === "Cancelled" ? "orderStatus cancelled" : "orderStatus"}>{order.status === "Delivered" ? "Delivered successfully" : order.status === "Cancelled" ? "Order cancelled" : `${order.status} · expected in ${order.eta} minutes`}</p>
                  {!['Delivered', 'Cancelled'].includes(order.status) && <button type="button" className="cancelOrderButton" onClick={() => cancelOrder(order.id)}>Cancel order</button>}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="profileSection" id="favorites">
        <div className="sectionHeading"><div><span className="profileEyebrow">Saved for later</span><h2>Favorites / Wishlist</h2></div><Link to="/" className="profileTextLink">Browse menu</Link></div>
        {favoriteItems.length ? (
          <div className="favoriteGrid">
            {favoriteItems.map((item) => (
              <article className="favoriteCard" key={item.id}>
                <img src={item.image} alt={item.name} />
                <div><strong>{item.name}</strong><span>₹ {item.price}</span></div>
              </article>
            ))}
          </div>
        ) : (
          <p className="profileMuted">{favorites.length ? "Your saved dishes will appear here after you revisit the menu." : "Tap the heart on any dish to save it here."}</p>
        )}
      </section>
    </main>
  );
};

export default Profile;
