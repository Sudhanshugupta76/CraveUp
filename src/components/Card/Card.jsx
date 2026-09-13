import "./Card.css";

const Card = ({ cardData, setCart, favorites = [], toggleFavorite, notify }) => {
  const addToCart = (product) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.id === product.id);

      if (existingItem) {
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentCart, { ...product, quantity: 1 }];
    });
  };

  return cardData.length === 0 ? (
    <h1>No Item Found</h1>
  ) : (
    <div className="card-container">
      {cardData.map((item) => (
        <div className="card" key={item.id}>
          <button type="button" className={`favoriteButton ${favorites.includes(item.id) ? "active" : ""}`} onClick={() => toggleFavorite(item.id)} aria-label="Toggle wishlist" title="Toggle wishlist">
            {favorites.includes(item.id) ? "♥" : "♡"}
          </button>
          <h1>{item.name}</h1>
          <img src={item.image} alt={item.name} />
          <p>{item.description}</p>
          <p className="price">Price: &#8377; {item.price}</p>
          <button onClick={() => { addToCart(item); notify("Added to cart."); }}>Add to Cart</button>
        </div>
      ))}
    </div>
  );
};

export default Card;