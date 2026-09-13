import { useState } from "react";
import { Link } from "react-router-dom";
import "./CartSidebar.css";
import QRCode from "react-qr-code";

const creditCardOffers = [
  { bank: "HDFC Bank", rate: 18 },
  { bank: "ICICI Bank", rate: 17 },
  { bank: "SBI Card", rate: 16 },
  { bank: "Axis Bank", rate: 15 },
  { bank: "Kotak Mahindra", rate: 14 },
  { bank: "IndusInd Bank", rate: 13 },
  { bank: "RBL Bank", rate: 12 },
  { bank: "Yes Bank", rate: 11 },
  { bank: "AU Bank", rate: 10 },
  { bank: "HSBC Bank", rate: 9 },
];

const paymentMethods = [
  { id: "upi", label: "UPI", icon: "UPI" },
  { id: "card", label: "Credit card", icon: "CC" },
  { id: "debit", label: "Debit card", icon: "DC" },
  { id: "emi", label: "EMI", icon: "EMI" },
];

const upiApps = ["Google Pay", "PhonePe", "Paytm", "BHIM", "Amazon Pay"];

const getCardBrand = (cardNumber) => {
  const digits = cardNumber.replace(/\D/g, "");
  const firstTwo = Number(digits.slice(0, 2));
  const firstThree = Number(digits.slice(0, 3));
  const firstFour = Number(digits.slice(0, 4));

  if (digits.startsWith("4")) return "Visa";
  if ((firstTwo >= 51 && firstTwo <= 55) || (firstFour >= 2221 && firstFour <= 2720)) return "Mastercard";
  if (digits.startsWith("34") || digits.startsWith("37")) return "American Express";
  if ([60, 65, 81, 82].includes(firstTwo) || firstThree === 508) return "RuPay";
  if ((firstThree >= 300 && firstThree <= 305) || [36, 38].includes(firstTwo)) return "Diners Club";
  return digits.length >= 4 ? "Card network not recognized" : "";
};

const CartSidebar = ({ cart = [], setCart }) => {
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [showQr] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [selectedUpiApp, setSelectedUpiApp] = useState("Google Pay");
  const [cardNumber, setCardNumber] = useState("");
  const [cardOtp, setCardOtp] = useState("");
  const [cardOtpCode, setCardOtpCode] = useState("");
  const [cardOtpSent, setCardOtpSent] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [selectedOffer, setSelectedOffer] = useState("none");
  const [selectedCardBank, setSelectedCardBank] = useState(creditCardOffers[0].bank);
  const [couponApplied, setCouponApplied] = useState(false);
  const [freeDeliveryPass, setFreeDeliveryPass] = useState(false);
  const [deliveryAddress] = useState(() => {
    const savedLocation = localStorage.getItem("craveUpLocation");
    return savedLocation ? JSON.parse(savedLocation).address : "";
  });

  const updateQuantity = (id, change) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + change } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id) => {
    setCart((currentCart) => currentCart.filter((item) => item.id !== id));
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const selectedCardOffer = creditCardOffers.find(({ bank }) => bank === selectedCardBank);
  const offerRate = selectedOffer === "bank" ? 5 : selectedOffer === "card" ? selectedCardOffer.rate : 0;
  const offerDiscount = Math.round(total * offerRate / 100);
  const couponDiscount = couponApplied ? 40 : 0;
  const discountedSubtotal = Math.max(0, total - offerDiscount - couponDiscount);
  const gst = Math.round(discountedSubtotal * 0.05);
  const packagingFee = 20;
  const deliveryFee = freeDeliveryPass ? 0 : 40;
  const passFee = freeDeliveryPass ? 1 : 0;
  const finalTotal = discountedSubtotal + gst + packagingFee + deliveryFee + passFee;
  const paymentUrl = `upi://pay?pa=sudhanshugupta527-5@oksbi&pn=CraveUp&am=${finalTotal}&cu=INR`;

  const placeOrder = () => {
    setCart([]);
    setOrderPlaced(true);
  };

  const handlePayment = () => {
    if (paymentMethod !== "card" && paymentMethod !== "debit") {
      placeOrder();
      return;
    }

    if (!cardOtpSent) {
      const generatedOtp = String(Math.floor(100000 + Math.random() * 900000));
      setCardOtpCode(generatedOtp);
      setCardOtp("");
      setCardOtpSent(true);
      setPaymentMessage(`Demo bank OTP: ${generatedOtp}`);
      return;
    }

    if (cardOtp === cardOtpCode) {
      placeOrder();
      return;
    }

    setPaymentMessage("Incorrect OTP. Please enter the OTP sent by your bank.");
  };

  return (
    <main className="sidebar">
      <Link to="/" className="closeBtn" aria-label="Close cart" title="Close cart">
        ✖
      </Link>
      <h2>Your Cart</h2>
      {orderPlaced ? (
        <div className="orderSuccess">
          <h3>Order placed successfully!</h3>
          <p>Your delicious food is on its way.</p>
          <Link to="/" className="continueBtn">Continue Shopping</Link>
        </div>
      ) : cart.length === 0 ? (
        <p className="emptyCart">Your cart is empty.</p>
      ) : (
        <>
          {cart.map((item) => (
            <div className="cartItem" key={item.id}>
              <img src={item.image} alt={item.name} />
              <div className="cartDetails">
                <h3>{item.name}</h3>
                <p>&#8377; {item.price}</p>
                <div className="qtyControls">
                  <button type="button" onClick={() => updateQuantity(item.id, -1)}>-</button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => updateQuantity(item.id, 1)}>+</button>
                </div>
                <button
                  type="button"
                  className="removeBtn"
                  onClick={() => removeItem(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <div className="deliveryAddress">
            <div>
              <h3>Delivery address</h3>
              {deliveryAddress ? (
                <p>{deliveryAddress}</p>
              ) : (
                <p className="addressWarning">Select an address before ordering.</p>
              )}
            </div>
            <Link to="/location" className="changeAddress">
              {deliveryAddress ? "Change" : "Select address"}
            </Link>
          </div>
          <section className="offerSection" aria-labelledby="offers-heading">
            <div className="offerHeading">
              <div>
                <h3 id="offers-heading">Offers for you</h3>
                <p>Choose one offer and save on this order</p>
              </div>
              <span className="offerBadge">Best value</span>
            </div>
            <div className="offerList">
              <label className={`offerCard ${selectedOffer === "none" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="offer"
                  value="none"
                  checked={selectedOffer === "none"}
                  onChange={() => setSelectedOffer("none")}
                />
                <span className="offerIcon">-</span>
                <span className="offerCopy">
                  <strong>No card offer</strong>
                  <small>You can continue without a bank or credit card</small>
                </span>
              </label>
              <label className={`offerCard ${selectedOffer === "bank" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="offer"
                  value="bank"
                  checked={selectedOffer === "bank"}
                  onChange={() => setSelectedOffer("bank")}
                />
                <span className="offerIcon">%</span>
                <span className="offerCopy">
                  <strong>Bank offer: 5% off</strong>
                  <small>Valid on 5 partner banks</small>
                </span>
                <span className="offerSave">-5%</span>
              </label>
              {selectedOffer === "bank" && (
                <div className="bankDetails">
                  <span>HDFC</span><span>ICICI</span><span>SBI</span><span>Axis</span><span>Kotak</span>
                </div>
              )}
              <label className={`offerCard ${selectedOffer === "card" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="offer"
                  value="card"
                  checked={selectedOffer === "card"}
                  onChange={() => setSelectedOffer("card")}
                />
                <span className="offerIcon cardIcon">CC</span>
                <span className="offerCopy">
                  <strong>Credit card offer: up to 18% off</strong>
                  <small>Choose from 10 bank credit cards</small>
                </span>
                <span className="offerSave">Up to 18%</span>
              </label>
              {selectedOffer === "card" && (
                <div className="creditCardDetails">
                  {creditCardOffers.map(({ bank, rate }) => (
                    <button
                      type="button"
                      className={`creditCardRow ${selectedCardBank === bank ? "selected" : ""}`}
                      key={bank}
                      onClick={() => {
                        setSelectedCardBank(bank);
                        setSelectedOffer("card");
                      }}
                    >
                      <span>{bank} credit card</span>
                      <strong>{rate}% off</strong>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              className={`couponBtn ${couponApplied ? "applied" : ""}`}
              onClick={() => setCouponApplied((isApplied) => !isApplied)}
            >
              <span className="couponIcon">&#8377;</span>
              <span>
                <strong>{couponApplied ? "Coupon applied" : "Apply coupon"}</strong>
                <small>{couponApplied ? "CRAVE40 saves &#8377; 40" : "Get &#8377; 40 off on this order"}</small>
              </span>
              <span className="couponAction">{couponApplied ? "Remove" : "Apply"}</span>
            </button>
          </section>
          <section className="deliveryPass" aria-label="Delivery fee options">
            <div>
              <strong>Free delivery for one month</strong>
              <small>Pay &#8377; 1 today and get free delivery on eligible orders for 1 month.</small>
            </div>
            <button
              type="button"
              className={`passToggle ${freeDeliveryPass ? "active" : ""}`}
              onClick={() => setFreeDeliveryPass((isActive) => !isActive)}
              aria-pressed={freeDeliveryPass}
            >
              {freeDeliveryPass ? "Added" : "Add Rs. 1"}
            </button>
          </section>
          <div className="priceSummary">
            <div><span>Subtotal</span><span>&#8377; {total}</span></div>
            {selectedOffer !== "none" && <div className="discountLine"><span>{selectedOffer === "bank" ? "Bank offer (5%)" : `${selectedCardBank} offer (${offerRate}%)`}</span><span>- &#8377; {offerDiscount}</span></div>}
            {couponApplied && <div className="discountLine"><span>Coupon discount</span><span>- &#8377; {couponDiscount}</span></div>}
            <div><span>GST (5%)</span><span>&#8377; {gst}</span></div>
            <div><span>Restaurant packaging fee</span><span>&#8377; {packagingFee}</span></div>
            <div><span>Delivery fee</span><span>{deliveryFee ? <>Rs. {deliveryFee}</> : "Free"}</span></div>
            {freeDeliveryPass && <div className="discountLine"><span>1-month free delivery pass</span><span>&#8377; {passFee}</span></div>}
            <h3 className="total"><span>Total</span><span>&#8377; {finalTotal}</span></h3>
          </div>
          <div className="checkoutAction">
            {deliveryAddress ? (
              <Link
                to="/payment"
                state={{
                  address: deliveryAddress,
                  pricing: {
                    subtotal: total,
                    offerDiscount,
                    couponDiscount,
                    discountedSubtotal,
                    gst,
                    packagingFee,
                    deliveryFee,
                    passFee,
                    finalTotal,
                  },
                }}
                className="orderBtn continuePayment"
              >
                Continue to payment
              </Link>
            ) : (
              <Link to="/location" className="orderBtn continuePayment">
                Select address to continue
              </Link>
            )}
          </div>
          {showQr && (
            <div className="qrBox">
              <h2>Choose payment method</h2>
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
                      setCardOtpSent(false);
                      setCardOtp("");
                      setPaymentMessage("");
                      if (id !== "upi") setShowScanner(false);
                    }}
                  >
                    <span>{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
              {paymentMethod === "upi" && (
                <>
                  <button
                    type="button"
                    className="scannerBtn"
                    onClick={() => setShowScanner((isVisible) => !isVisible)}
                  >
                    {showScanner ? "Close scanner" : "Open scanner"}
                  </button>
                  {showScanner && (
                    <div className="scannerPanel">
                      <h3>Scan and Pay</h3>
                      <QRCode value={paymentUrl} size={180} bgColor="#ffffff" fgColor="#2b170b" />
                      <p>Open any UPI app and scan this QR code.</p>
                    </div>
                  )}
                  <div className="upiApps">
                    <p>Pay with any UPI app</p>
                    <div>
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
                  </div>
                  <input className="paymentInput" type="text" placeholder="Enter UPI ID (optional)" aria-label="UPI ID" />
                </>
              )}
              {(paymentMethod === "card" || paymentMethod === "debit") && (
                <div className="paymentForm">
                  <div className="cardNumberField">
                    <input
                      className="paymentInput"
                      type="text"
                      inputMode="numeric"
                      autoComplete="cc-number"
                      maxLength={19}
                      placeholder={`${paymentMethod === "card" ? "Credit" : "Debit"} card number`}
                      aria-label="Card number"
                      value={cardNumber}
                      onChange={(event) => {
                        const digits = event.target.value.replace(/\D/g, "").slice(0, 16);
                        setCardNumber(digits.replace(/(.{4})/g, "$1 ").trim());
                      }}
                    />
                    {cardNumber.replace(/\D/g, "").length >= 4 && (
                      <span className="cardBrand" aria-live="polite">
                        {getCardBrand(cardNumber)}
                      </span>
                    )}
                  </div>
                  <div className="paymentInputRow">
                    <input className="paymentInput" type="text" placeholder="MM/YY" aria-label="Card expiry" />
                    <input className="paymentInput" type="password" placeholder="CVV" aria-label="Card CVV" />
                  </div>
                  <input className="paymentInput" type="text" placeholder="Name on card" aria-label="Name on card" />
                  {cardOtpSent && (
                    <div className="cardOtpBox">
                      <label htmlFor="card-otp">Bank OTP</label>
                      <input
                        id="card-otp"
                        className="paymentInput"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="Enter 6-digit OTP"
                        value={cardOtp}
                        onChange={(event) => setCardOtp(event.target.value.replace(/\D/g, ""))}
                      />
                      <p>Enter the OTP sent to your bank-registered mobile number.</p>
                    </div>
                  )}
                </div>
              )}
              {paymentMethod === "emi" && (
                <div className="paymentForm">
                  <select className="paymentInput" aria-label="EMI bank">
                    <option>Select EMI bank</option>
                    {creditCardOffers.slice(0, 5).map(({ bank }) => <option key={bank}>{bank}</option>)}
                  </select>
                  <select className="paymentInput" aria-label="EMI duration">
                    <option>Choose EMI duration</option>
                    <option>3 months</option>
                    <option>6 months</option>
                    <option>9 months</option>
                    <option>12 months</option>
                  </select>
                </div>
              )}
              <h3>Total: &#8377; {finalTotal}</h3>
              <p>Selected: {paymentMethod === "upi" ? selectedUpiApp : paymentMethods.find(({ id }) => id === paymentMethod).label}</p>
              {paymentMessage && <p className="paymentMessage">{paymentMessage}</p>}
              <button type="button" className="orderBtn" onClick={handlePayment}>
                {(paymentMethod === "card" || paymentMethod === "debit") && !cardOtpSent ? "Send OTP" : (paymentMethod === "card" || paymentMethod === "debit") ? "Verify OTP" : "Pay"}
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
};

export default CartSidebar;