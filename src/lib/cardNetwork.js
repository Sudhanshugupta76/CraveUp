export const getCardNetwork = (cardNumber) => {
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