const merchantUpiId = import.meta.env.VITE_CRAVEUP_UPI_ID || "sudhanshugupta527-5@oksbi";

export const createUpiPaymentUrl = (amount) => {
  const params = new URLSearchParams({
    pa: merchantUpiId,
    pn: "CraveUp",
    am: String(amount),
    cu: "INR",
  });

  return `upi://pay?${params.toString()}`;
};