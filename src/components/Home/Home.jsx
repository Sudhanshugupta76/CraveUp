import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import burger from "../../assets/burger.webp";
import cappuccino from "../../assets/cappuccino.webp";
import cake from "../../assets/cake.webp";
import chickenCurry from "../../assets/Chicken curry.webp";
import cholabhatura from "../../assets/cholabhatura.webp";
import dalmakhani from "../../assets/dalmakhani.webp";
import dosa from "../../assets/dosa.webp";
import gulabjamun from "../../assets/gulabjamun.webp";
import HANDIPANEER from "../../assets/HANDIPANEER.webp";
import idli from "../../assets/idli.webp";
import kajukatli from "../../assets/kajukatli.webp";
import khichdi from "../../assets/khichdi.webp";
import manchuriyan from "../../assets/manchuriyan.webp";
import momos from "../../assets/momos.webp";
import panipuri from "../../assets/panipuri.webp";
import poha from "../../assets/Poha.webp";
import rasmalai from "../../assets/rasmalai.webp";
import roll from "../../assets/Roll.webp";
import samosa from "../../assets/samosa.webp";
import sandwiches from "../../assets/sandwiches.webp";
import vadapav from "../../assets/vadapav.webp";
import VegBiryani from "../../assets/VegBiryani.webp";
import vegthali from "../../assets/vegthali.webp";
import Southindianthali from "../../assets/Southindianthali.webp";

import "./Home.css";
import Card from "../Card/Card";

const getCategory = (item) => {
  const name = item.name.toLowerCase();
  if (name === "cappuccino") return "Beverages";
  if (["cake", "gulabjamun", "kajukatli", "rasmalai"].includes(name)) return "Desserts";
  if (["dosa", "idli", "poha", "cholabhatura"].includes(name)) return "Breakfast";
  if (["manchuriyan", "momos"].includes(name)) return "Chinese";
  if (["burger", "panipuri", "samosa", "sandwiches", "vadapav", "roll"].includes(name)) return "Snacks";
  return "Meals";
};

const Home = ({ setCart, favorites = [], setFavorites, setFavoriteItems, notify }) => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("popular");
  const [vegOnly, setVegOnly] = useState(false);

  const cardData = [
    { id: 1, name: "burger", image: burger, price: 60, description: "Juicy veggie burger with fresh salad and a soft toasted bun." },
    { id: 2, name: "cappuccino", image: cappuccino, price: 110, description: "Smooth espresso topped with creamy steamed milk foam." },
    { id: 3, name: "cake", image: cake, price: 150, description: "Soft and moist cake with a rich, sweet cream topping." },
    { id: 4, name: "cholabhatura", image: cholabhatura, price: 120, description: "Fluffy bhatura served with spicy and comforting chole." },
    { id: 23, name: "Chicken curry", image: chickenCurry, price: 220, description: "Tender chicken simmered in a fragrant, homestyle curry." },
    { id: 5, name: "dalmakhani", image: dalmakhani, price: 200, description: "Slow-cooked black lentils finished with butter and cream." },
    { id: 6, name: "dosa", image: dosa, price: 80, description: "Crispy golden South Indian crepe with a savory filling." },
    { id: 7, name: "gulabjamun", image: gulabjamun, price: 50, description: "Soft milk dumplings soaked in warm rose-flavored syrup." },
    { id: 8, name: "HANDIPANEER", image: HANDIPANEER, price: 180, description: "Cottage cheese cooked in a rich, smoky handi-style gravy." },
    { id: 9, name: "idli", image: idli, price: 40, description: "Light and fluffy steamed rice cakes served for a wholesome bite." },
    { id: 10, name: "kajukatli", image: kajukatli, price: 499, description: "Delicate cashew fudge with a smooth texture and silver leaf." },
    { id: 11, name: "khichdi", image: khichdi, price: 120, description: "Comforting rice and lentils cooked with mild aromatic spices." },
    { id: 12, name: "manchuriyan", image: manchuriyan, price: 150, description: "Crispy vegetable balls tossed in a tangy Indo-Chinese sauce." },
    { id: 13, name: "momos", image: momos, price: 100, description: "Steamed dumplings filled with seasoned vegetables and herbs." },
    { id: 14, name: "panipuri", image: panipuri, price: 60, description: "Crisp puris filled with zesty mint water, potato and spices." },
    { id: 15, name: "poha", image: poha, price: 80, description: "Light flattened rice breakfast with peanuts, onion and lemon." },
    { id: 16, name: "rasmalai", image: rasmalai, price: 380, description: "Soft cheese dumplings soaked in chilled saffron milk." },
    { id: 24, name: "Roll", image: roll, price: 90, description: "Flavorful filling wrapped in a soft roll for an easy meal." },
    { id: 17, name: "samosa", image: samosa, price: 20, description: "Crispy pastry filled with spiced potatoes and green peas." },
    { id: 18, name: "sandwiches", image: sandwiches, price: 100, description: "Fresh bread layered with crunchy vegetables and tasty spread." },
    { id: 19, name: "vadapav", image: vadapav, price: 30, description: "Spiced potato fritter tucked into a soft bun with chutneys." },
    { id: 20, name: "VegBiryani", image: VegBiryani, price: 170, description: "Fragrant basmati rice layered with vegetables and whole spices." },
    { id: 21, name: "VegThali", image: vegthali, price: 150, description: "A satisfying platter of wholesome curries, rice, bread and sides." },
    { id: 22, name: "Southindianthali", image: Southindianthali, price: 200, description: "A traditional South Indian platter with flavorful regional dishes." },
  ];

  const categories = ["All", ...new Set(cardData.map(getCategory))];
  const filteredCards = cardData
    .filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(search.trim().toLowerCase());
      const matchesCategory = category === "All" || getCategory(item) === category;
      const matchesVeg = !vegOnly || item.name.toLowerCase() !== "chicken curry";
      return matchesSearch && matchesCategory && matchesVeg;
    })
    .sort((first, second) => {
      if (sortBy === "price-low") return first.price - second.price;
      if (sortBy === "price-high") return second.price - first.price;
      return first.id - second.id;
    });

  const toggleFavorite = (id) => {
    const selectedItem = cardData.find((item) => item.id === id);
    setFavorites((currentFavorites) => {
      const isFavorite = currentFavorites.includes(id);
      notify(isFavorite ? "Removed from wishlist." : "Added to wishlist.");
      setFavoriteItems((currentItems) => isFavorite
        ? currentItems.filter((item) => item.id !== id)
        : [...currentItems.filter((item) => item.id !== id), selectedItem]);
      return isFavorite
        ? currentFavorites.filter((favoriteId) => favoriteId !== id)
        : [...currentFavorites, id];
    });
  };

  return (
    <div>
      <div className="search">
        <div className="searchBar">
          <FaSearch />
          <input
            type="text"
            placeholder="search Food Item"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="catalogControls" aria-label="Food filters">
        <div className="categoryFilters" role="group" aria-label="Food categories">
          {categories.map((itemCategory) => (
            <button type="button" key={itemCategory} className={category === itemCategory ? "active" : ""} onClick={() => setCategory(itemCategory)}>{itemCategory}</button>
          ))}
        </div>
        <div className="catalogOptions">
          <label className="vegToggle"><input type="checkbox" checked={vegOnly} onChange={(event) => setVegOnly(event.target.checked)} /> Veg only</label>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Sort food">
            <option value="popular">Sort: Popular</option>
            <option value="price-low">Price: Low to high</option>
            <option value="price-high">Price: High to low</option>
          </select>
        </div>
      </div>
      <Card cardData={filteredCards} setCart={setCart} favorites={favorites} toggleFavorite={toggleFavorite} notify={notify} />
    </div>
  );
};

export default Home;