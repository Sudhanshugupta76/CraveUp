import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import QRCode from "react-qr-code";
import { apiFetch } from "../../lib/api";
import { getCardNetwork } from "../../lib/cardNetwork";
import "./Payment.css";

const paymentMethods = [
  { id: "upi", label: "UPI", icon: "UPI" },
  { id: "card", label: "Credit card", icon: "CC" },
  { id: "debit", label: "Debit card", icon: "DC" },
  { id: "emi", label: "EMI", icon: "EMI" },
];

const upiApps = ["Google Pay", "PhonePe", "Paytm", "BHIM", "Amazon Pay"];

const loadRazorpay = () => new Promise((resolve, reject) => {
  if (window.Razorpay) {
    resolve();
    return;
  }
  const script = document.createElement("script");
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.onload = resolve;
  script.onerror = () => reject(new Error("Payment checkout could not load."));
  document.body.appendChild(script);
});

const Payment = ({ cart = [], setCart, user, setOrders, notify }) => {
  const location = useLocation();
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [selectedUpiApp, setSelectedUpiApp] = useState("Google Pay");
  const [showScanner, setShowScanner] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [upiId, setUpiId] = useState("");
  const [message, setMessage] = useState("");
  const pricing = location.state?.pricing;
  const total = pricing?.subtotal ?? cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const offerDiscount = pricing?.offerDiscount ?? 0;
  const couponDiscount = pricing?.couponDiscount ?? 0;
  const discountedSubtotal = pricing?.discountedSubtotal ?? total;
  const gst = pricing?.gst ?? Math.round(discountedSubtotal * 0.05);
  const packagingFee = pricing?.packagingFee ?? 20;
  const deliveryFee = pricing?.deliveryFee ?? 40;
  const passFee = pricing?.passFee ?? 0;
  const finalTotal = pricing?.finalTotal ?? discountedSubtotal + gst + packagingFee + deliveryFee + passFee;
  const paymentUrl = `upi://pay?pa=sudhanshugupta527-5@oksbi&pn=CraveUp&am=${finalTotal}&cu=INR`;

  const placeOrder = async (paymentId) => {
    const orderData = await apiFetch("/api/orders", {
      method: "POST",
      body: JSON.stringify({
        items: cart,
        total: finalTotal,
        address: location.state?.address,
        paymentId,
      }),
    });
    setOrders((currentOrders) => [orderData.order, ...currentOrders]);
    setCart([]);
    setOrderPlaced(true);
    notify("Order placed! Track it from your profile.");
  };

  const handlePayment = async () => {
    if (!user) {
      setMessage("Please login from your profile before placing an order.");
      return;
    }
    if (!location.state?.address) {
      setMessage("Please select a delivery address before payment.");
      return;
    }
    if ((paymentMethod === "card" || paymentMethod === "debit") &&
      (cardNumber.replace(/\D/g, "").length < 12 || !/^\d{2}\/\d{2}$/.test(cardExpiry) ||
        !/^\d{3,4}$/.test(cardCvv) || !cardName.trim())) {
      setMessage("Please enter valid card number, expiry, CVV and cardholder name.");
      return;
    }

    if (paymentMethod === "upi" && upiId && !/^[\w.-]+@[\w.-]+$/.test(upiId)) {
      setMessage("Please enter a valid UPI ID, for example name@bank.");
      return;
    }

    try {
      setMessage("Opening secure payment checkout...");
      const { order, keyId } = await apiFetch("/api/payments/create-order", {
        method: "POST",
        body: JSON.stringify({ amount: finalTotal }),
      });
      await loadRazorpay();
      const checkout = new window.Razorpay({
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: "CraveUp",
        description: "Food delivery order",
        order_id: order.id,
        prefill: { name: user.name, email: user.email },
        theme: { color: "#ff6b35" },
        handler: async (payment) => {
          try {
            await apiFetch("/api/payments/verify", { method: "POST", body: JSON.stringify(payment) });
            await placeOrder(payment.razorpay_payment_id);
          } catch (error) {
            setMessage(error.message);
          }
        },
      });
      checkout.on("payment.failed", () => setMessage("Payment failed. Please try again."));
      checkout.open();
    } catch (error) {
      setMessage(error.message);
    }
  };

  if (orderPlaced) {
    return (
      <main className="paymentPage">
        <section className="paymentSuccess">
          <span className="successMark">&#10003;</span>
          <h1>Payment successful</h1>
          <p>Your order has been placed and your food is on the way.</p>
          <Link to="/" className="paymentHomeLink">Continue shopping</Link>
        </section>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="paymentPage">
        <section className="paymentSuccess">
          <h1>Your cart is empty</h1>
          <p>Add something delicious before going to payment.</p>
          <Link to="/" className="paymentHomeLink">Back to home</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="paymentPage">
      <div className="paymentHeader">
        <Link to="/cart" className="backToCart">&#8592; Back to cart</Link>
        <span className="secureLabel">Secure checkout</span>
      </div>
      <div className="paymentLayout">
        <section className="paymentCard">
          <p className="paymentEyebrow">CraveUp checkout</p>
          <h1>Choose payment method</h1>
          {location.state?.address && <p className="deliveryPreview">Delivering to: {location.state.address}</p>}
          <div className="paymentMethods" role="tablist" aria-label="Payment methods">
            {paymentMethods.map(({ id, label, icon }) => (
              <button
                type="button"
                role="tab"
                aria-selected={paymentMethod === id}
                className={`paymentMethod ${paymentMethod === id ? "selected" : ""}`}
                key={id}
                onClick={() => {
                  setPaymentMethod(id);
                  setShowScanner(false);
                  setMessage("");
                }}
              >
                <span>{icon}</span>
                {label}
              </button>
            ))}
          </div>

          {paymentMethod === "upi" && (
            <div className="paymentOptionBody">
              <button type="button" className="scannerBtn" onClick={() => setShowScanner((isOpen) => !isOpen)}>
                {showScanner ? "Close scanner" : "Open UPI scanner"}
              </button>
              {showScanner && (
                <div className="scannerPanel">
                  <h2>Scan and pay</h2>
                  <QRCode value={paymentUrl} size={190} bgColor="#ffffff" fgColor="#2b170b" />
                  <p>Scan this QR with any UPI app to pay securely.</p>
                </div>
              )}
              <p className="optionHint">Pay using your preferred UPI app</p>
              <div className="upiApps">
                {upiApps.map((app) => (
                  <button
                    type="button"
                    className={selectedUpiApp === app ? "selected" : ""}
                    key={app}
                    onClick={() => setSelectedUpiApp(app)}
                  >
                    {app}
                  </button>
                ))}
              </div>
              <input className="paymentInput" type="text" placeholder="Enter UPI ID (optional)" aria-label="UPI ID" value={upiId} onChange={(event) => setUpiId(event.target.value)} />
            </div>
          )}

          {(paymentMethod === "card" || paymentMethod === "debit") && (
            <div className="paymentOptionBody paymentForm">
              <input className="paymentInput" type="text" inputMode="numeric" maxLength={19} placeholder={`${paymentMethod === "card" ? "Credit" : "Debit"} card number`} value={cardNumber} onChange={(event) => setCardNumber(event.target.value.replace(/[^\d\s]/g, ""))} />
              {cardNumber.replace(/\D/g, "").length >= 4 && (
                <span className="cardNetwork" aria-live="polite">
                  {getCardNetwork(cardNumber)}
                </span>
              )}
              <div className="paymentInputRow">
                <input className="paymentInput" type="text" placeholder="MM/YY" aria-label="Card expiry" maxLength={5} value={cardExpiry} onChange={(event) => setCardExpiry(event.target.value.replace(/[^\d/]/g, ""))} />
                <input className="paymentInput" type="password" placeholder="CVV" aria-label="Card CVV" maxLength={4} value={cardCvv} onChange={(event) => setCardCvv(event.target.value.replace(/\D/g, ""))} />
              </div>
              <input className="paymentInput" type="text" placeholder="Name on card" aria-label="Name on card" value={cardName} onChange={(event) => setCardName(event.target.value)} />
              <p className="optionHint">Your bank may ask for an OTP to complete this payment.</p>
            </div>
          )}

          {paymentMethod === "emi" && (
            <div className="paymentOptionBody paymentForm">
              <select className="paymentInput" aria-label="EMI bank"><option>Select EMI bank</option><option>HDFC Bank</option><option>ICICI Bank</option><option>SBI Card</option><option>Axis Bank</option></select>
              <select className="paymentInput" aria-label="EMI duration"><option>Choose EMI duration</option><option>3 months</option><option>6 months</option><option>9 months</option><option>12 months</option></select>
            </div>
          )}

          {message && <p className="paymentMessage">{message}</p>}
          <button type="button" className="payNowButton" onClick={handlePayment}>Pay &#8377; {finalTotal}</button>
        </section>

        <aside className="orderSummary">
          <p className="paymentEyebrow">Your order</p>
          <h2>Order summary</h2>
          {cart.map((item) => (
            <div className="summaryItem" key={item.id}>
              <span>{item.name} x {item.quantity}</span>
              <strong>&#8377; {item.price * item.quantity}</strong>
            </div>
          ))}
          <div className="summaryLine"><span>Subtotal</span><span>&#8377; {total}</span></div>
          {offerDiscount > 0 && <div className="summaryLine discountLine"><span>Offer discount</span><span>- &#8377; {offerDiscount}</span></div>}
          {couponDiscount > 0 && <div className="summaryLine discountLine"><span>Coupon discount</span><span>- &#8377; {couponDiscount}</span></div>}
          <div className="summaryLine"><span>GST</span><span>&#8377; {gst}</span></div>
          <div className="summaryLine"><span>Packaging</span><span>&#8377; {packagingFee}</span></div>
          <div className="summaryLine"><span>Delivery</span><span>{deliveryFee ? `₹ ${deliveryFee}` : "Free"}</span></div>
          {passFee > 0 && <div className="summaryLine"><span>Delivery pass</span><span>&#8377; {passFee}</span></div>}
          <div className="summaryTotal"><span>Total</span><strong>&#8377; {finalTotal}</strong></div>
        </aside>
      </div>
    </main>
  );
};

export default Payment;
