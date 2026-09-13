import { useState } from "react";
import "./Location.css";

const savedLocation = JSON.parse(localStorage.getItem("craveUpLocation") || "null");

const Location = () => {
  const [address, setAddress] = useState(savedLocation?.address || "");
  const [coordinates, setCoordinates] = useState(savedLocation?.coordinates || null);
  const [saved, setSaved] = useState(Boolean(savedLocation));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setMessage("Your browser does not support location detection.");
      return;
    }

    setLoading(true);
    setMessage("Detecting your current location...");

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const currentCoordinates = {
          latitude: coords.latitude,
          longitude: coords.longitude,
        };
        setCoordinates(currentCoordinates);

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}`
          );
          const data = await response.json();
          setAddress(data.display_name || "Current location detected");
          setMessage("Location detected successfully.");
        } catch {
          setAddress("Current location detected");
          setMessage("Coordinates detected. Please enter your address manually.");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLoading(false);
        setMessage("Location permission denied. Please allow location access.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const saveLocation = (event) => {
    event.preventDefault();

    if (!address.trim()) {
      setMessage("Please enter an address or detect your current location first.");
      return;
    }

    const location = {
      address: address.trim(),
      coordinates,
    };
    localStorage.setItem("craveUpLocation", JSON.stringify(location));
    setSaved(true);
    setMessage("Address saved successfully.");
  };

  const openInGoogleMaps = () => {
    if (!coordinates) return;

    const { latitude, longitude } = coordinates;
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <main className="location-page">
      <section className="location-card">
        <div className="location-heading">
          <span className="location-eyebrow">Delivery location</span>
          <h1>Where should we deliver?</h1>
          <p>Save your address for a faster CraveUp checkout.</p>
        </div>

        <button
          type="button"
          className="detect-button"
          onClick={detectLocation}
          disabled={loading}
        >
          {loading ? "Detecting..." : "Use my current location"}
        </button>

        <form className="location-form" onSubmit={saveLocation}>
          <label htmlFor="delivery-address">Delivery address</label>
          <textarea
            id="delivery-address"
            value={address}
            onChange={(event) => {
              setAddress(event.target.value);
              setSaved(false);
            }}
            placeholder="House no., street, area, city"
            rows="4"
            required
          />
          <button type="submit" className="save-button">Save address</button>
        </form>

        {coordinates && (
          <button type="button" className="map-button" onClick={openInGoogleMaps}>
            Open detected location in Google Maps
          </button>
        )}

        {message && <p className="location-message">{message}</p>}
        {saved && <p className="saved-address">Saved address: {address}</p>}
      </section>
    </main>
  );
};

export default Location;
