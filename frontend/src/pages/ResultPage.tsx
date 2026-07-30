import { useLocation, useNavigate } from "react-router-dom";

function formatPrice(price: number): string {
  if (price >= 10000000) {
    return `₹ ${(price / 10000000).toFixed(2)} Crore`;
  }
  if (price >= 100000) {
    return `₹ ${(price / 100000).toFixed(2)} Lac`;
  }
  return `₹ ${price.toLocaleString()}`;
}

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const price = (location.state as { price?: number } | null)?.price;

  if (price === undefined) {
    return (
      <div className="page">
        <p>No result available, please try again.</p>
        <button onClick={() => navigate("/")}>Back</button>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Predicted Price</h1>
      <p className="predicted-price">{formatPrice(price)}</p>
      <button onClick={() => navigate("/")}>Try Again</button>
    </div>
  );
}