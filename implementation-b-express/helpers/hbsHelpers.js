function formatCurrency(value) {
  const amount = Number(value);
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return "\u20B90.00";
  }
  const [whole, decimal] = amount.toFixed(2).split(".");
  const lastThree = whole.length > 3 ? whole.slice(-3) : whole;
  const rest = whole.length > 3 ? whole.slice(0, -3) : "";
  const grouped = rest
    ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree
    : lastThree;
  return `\u20B9${grouped}.${decimal}`;
}

function eq(a, b) {
  return a === b;
}

function formatDate(value) {
  if (!value) return "\u2014";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "\u2014";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function formatDateTime(value) {
  if (!value) return "\u2014";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "\u2014";
  return (
    d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }) +
    " " +
    d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    })
  );
}

function isActive(status) {
  return String(status).toLowerCase() === "active";
}

module.exports = { formatCurrency, eq, formatDate, formatDateTime, isActive };