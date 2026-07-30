import { useEffect, useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { getLocations, predictPrice } from "../api/predictionClient";
import type { HouseFeatures } from "../types/prediction";

const FURNISHING_OPTIONS = ["Furnished", "Semi-Furnished", "Unfurnished"];
const TRANSACTION_OPTIONS = ["New Property", "Resale"];
const OWNERSHIP_OPTIONS = [
  "Freehold",
  "Leasehold",
  "Co-operative Society",
  "Power Of Attorney",
];
const FACING_OPTIONS = [
  "East",
  "West",
  "North",
  "South",
  "North-East",
  "North-West",
  "South-East",
  "South-West",
];

export default function PredictionForm() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<string[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    carpet_area_sqft: "",
    floor_num: "",
    Bathroom: "",
    Balcony: "",
    Car_Parking: "",
    location_grouped: "",
    Furnishing: "",
    Transaction: "",
    Ownership: "",
    facing: "",
  });

  useEffect(() => {
    getLocations()
      .then(setLocations)
      .catch(() =>
        setError("Failed to load locations. Make sure the server is running on port 8000.")
      )
      .finally(() => setLoadingLocations(false));
  }, []);

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const area = Number(form.carpet_area_sqft);
    if (!area || area <= 0) {
      setError("Area must be a number greater than zero");
      return;
    }
    if (
      !form.location_grouped ||
      !form.Furnishing ||
      !form.Transaction ||
      !form.Ownership ||
      !form.facing
    ) {
      setError("Please fill in all required fields");
      return;
    }

    const payload: HouseFeatures = {
      carpet_area_sqft: area,
      floor_num: Number(form.floor_num) || 0,
      Bathroom: Number(form.Bathroom) || 0,
      Balcony: Number(form.Balcony) || 0,
      "Car Parking": Number(form.Car_Parking) || 0,
      location_grouped: form.location_grouped,
      Furnishing: form.Furnishing,
      Transaction: form.Transaction,
      Ownership: form.Ownership,
      facing: form.facing,
    };

    setSubmitting(true);
    try {
      const result = await predictPrice(payload);
      navigate("/result", { state: { price: result.predicted_price } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="prediction-form">
      <div className="form-row">
        <label>Carpet Area (sqft)</label>
        <input
          type="number"
          name="carpet_area_sqft"
          value={form.carpet_area_sqft}
          onChange={handleChange}
          min={1}
          required
        />
      </div>

      <div className="form-row">
        <label>Floor Number</label>
        <input
          type="number"
          name="floor_num"
          value={form.floor_num}
          onChange={handleChange}
        />
      </div>

      <div className="form-row">
        <label>Bathrooms</label>
        <input
          type="number"
          name="Bathroom"
          value={form.Bathroom}
          onChange={handleChange}
          min={0}
        />
      </div>

      <div className="form-row">
        <label>Balconies</label>
        <input
          type="number"
          name="Balcony"
          value={form.Balcony}
          onChange={handleChange}
          min={0}
        />
      </div>

      <div className="form-row">
        <label>Car Parking Spots</label>
        <input
          type="number"
          name="Car_Parking"
          value={form.Car_Parking}
          onChange={handleChange}
          min={0}
        />
      </div>

      <div className="form-row">
        <label>Location</label>
        <select
          name="location_grouped"
          value={form.location_grouped}
          onChange={handleChange}
          disabled={loadingLocations}
        >
          <option value="">Select location</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <label>Furnishing</label>
        <select
          name="Furnishing"
          value={form.Furnishing}
          onChange={handleChange}
        >
          <option value="">Select</option>
          {FURNISHING_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <label>Transaction Type</label>
        <select
          name="Transaction"
          value={form.Transaction}
          onChange={handleChange}
        >
          <option value="">Select</option>
          {TRANSACTION_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <label>Ownership</label>
        <select
          name="Ownership"
          value={form.Ownership}
          onChange={handleChange}
        >
          <option value="">Select</option>
          {OWNERSHIP_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <label>Facing</label>
        <select name="facing" value={form.facing} onChange={handleChange}>
          <option value="">Select</option>
          {FACING_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="error-message">{error}</p>}

      <button type="submit" disabled={submitting}>
        {submitting ? "Calculating..." : "Predict Price"}
      </button>
    </form>
  );
}