import db from './db.js';

const SORTS = {
  relevance: 'rating_count DESC',
  rating: 'rating DESC, rating_count DESC',
  time: 'delivery_time ASC',
  price_low: 'price_for_two ASC',
  price_high: 'price_for_two DESC',
};

// Search: Restaurant name / cuisine / area / dish name (similar to Swiggy).
export function listRestaurants({ search = '', cuisine = '', veg = false, minRating = 0, sort = 'relevance' } = {}) {
  const orderBy = SORTS[sort] || SORTS.relevance;
  const restaurants = db
    .prepare(
      `SELECT r.* FROM restaurants r
       WHERE (
         @q = '%%'
         OR r.name LIKE @q OR r.cuisine LIKE @q OR r.cuisine_tags LIKE @q OR r.area LIKE @q
         OR EXISTS (SELECT 1 FROM menu_items m WHERE m.restaurant_id = r.id AND m.name LIKE @q)
       )
       AND (@cuisine = '' OR r.cuisine = @cuisine)
       AND (@veg = 0 OR r.is_pure_veg = 1)
       AND r.rating >= @minRating
       ORDER BY ${orderBy}`
    )
    .all({ q: `%${search.trim()}%`, cuisine, veg: veg ? 1 : 0, minRating: Number(minRating) || 0 });

  // For a dish name search, we can also display matching dishes from the restaurants that match the search.
  let dishMatches = {};
  if (search.trim().length >= 2) {
    const rows = db
      .prepare(
        `SELECT restaurant_id, name FROM menu_items WHERE name LIKE @q ORDER BY is_bestseller DESC`
      )
      .all({ q: `%${search.trim()}%` });
    for (const row of rows) {
      (dishMatches[row.restaurant_id] ||= []);
      if (dishMatches[row.restaurant_id].length < 3) dishMatches[row.restaurant_id].push(row.name);
    }
  }

  const cuisines = db
    .prepare('SELECT cuisine, COUNT(*) AS n FROM restaurants GROUP BY cuisine ORDER BY n DESC')
    .all()
    .map((r) => r.cuisine);

  return {
    restaurants: restaurants.map((r) => ({ ...r, matched_dishes: dishMatches[r.id] || [] })),
    cuisines,
  };
}
