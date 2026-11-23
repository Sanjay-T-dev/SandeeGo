import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getRestaurants, formatCount } from '../api.js';

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'rating', label: 'Rating: High to Low' },
  { value: 'time', label: 'Delivery Time' },
  { value: 'price_low', label: 'Cost: Low to High' },
  { value: 'price_high', label: 'Cost: High to Low' },
];

export default function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [search, setSearch] = useState('');
  const [params] = useSearchParams();
  const urlCuisine = params.get('cuisine') || '';
  const [cuisine, setCuisine] = useState(urlCuisine);
  const [veg, setVeg] = useState(false);
  const [topRated, setTopRated] = useState(false);
  const [sort, setSort] = useState('relevance');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Clicking the footer link (`/?cuisine=Biryani`) will automatically select the corresponding chip.
  useEffect(() => {
    setCuisine(urlCuisine);
  }, [urlCuisine]);

  useEffect(() => {
    setLoading(true);
    // Debounce – Waits until the user stops typing before triggering the action.
    const t = setTimeout(() => {
      getRestaurants({ search, cuisine, veg, minRating: topRated ? 4 : 0, sort })
        .then((d) => {
          setRestaurants(d.restaurants);
          setCuisines(d.cuisines);
          setError('');
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [search, cuisine, veg, topRated, sort]);

  const clearFilters = () => {
    setSearch('');
    setCuisine('');
    setVeg(false);
    setTopRated(false);
    setSort('relevance');
  };

  return (
    <>
      <section className="hero">
        <h1>Pasikkudha? 😋 Order pannunga!</h1>
        <input
          className="search"
          placeholder="Search for a restaurant, dish (biryani, dosa, etc.), or area."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </section>

      <h3 className="section-title">What's on your mind?</h3>
      <div className="chips scroll">
        <button className={`chip ${cuisine === '' ? 'active' : ''}`} onClick={() => setCuisine('')}>All</button>
        {cuisines.map((c) => (
          <button key={c} className={`chip ${cuisine === c ? 'active' : ''}`} onClick={() => setCuisine(cuisine === c ? '' : c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="filter-bar">
        <button className={`chip ${veg ? 'active veg-chip' : ''}`} onClick={() => setVeg(!veg)}>🟢 Pure Veg</button>
        <button className={`chip ${topRated ? 'active' : ''}`} onClick={() => setTopRated(!topRated)}>⭐ Rating 4.0+</button>
        <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <h3 className="section-title">
        {loading ? 'Loading...' : `${restaurants.length} restaurants`}
      </h3>

      {error && <p className="error">{error} (Please check whether the backend is running.)</p>}
      {!loading && !error && restaurants.length === 0 && (
        <div className="empty">
          <p>I couldn't find any restaurants. 😕</p>
          <button className="btn secondary" onClick={clearFilters}>Please clear the filters.</button>
        </div>
      )}

      <div className="grid">
        {restaurants.map((r) => (
          <Link to={`/restaurant/${r.id}`} key={r.id} className="card restaurant-card">
            <div className="emoji-banner">
              {r.emoji}
              {r.offer && <span className="offer-badge">{r.offer}</span>}
              {r.is_pure_veg === 1 && <span className="veg-badge">PURE VEG</span>}
            </div>
            <div className="card-body">
              <div className="title-row">
                <h3>{r.name}</h3>
                <span className="rating-pill">★ {r.rating.toFixed(1)}</span>
              </div>
              <p className="muted">{r.cuisine_tags || r.cuisine}</p>
              <p className="muted">{r.area} • ₹{r.price_for_two} for two</p>
              <div className="meta">
                <span>🕒 {r.delivery_time} min</span>
                <span>{r.delivery_fee === 0 ? '🛵 Free delivery' : `🛵 ₹${r.delivery_fee}`}</span>
                <span className="muted">({formatCount(r.rating_count)} ratings)</span>
              </div>
              {r.matched_dishes.length > 0 && (
                <p className="dish-match">🍽️ {r.matched_dishes.join(', ')}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
