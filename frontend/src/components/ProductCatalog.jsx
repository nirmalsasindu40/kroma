import { useState, useMemo, useRef, useEffect } from 'react';
import ProductCard from './ProductCard';
import { getProducts, resolveImageUrl } from '../services/api';

// ---- Typo-tolerant matching helpers ----

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

function toleranceFor(len) {
  if (len <= 3) return 1;
  if (len <= 5) return 2;
  if (len <= 7) return 3;
  return 4;
}

function bestWordDistance(word, targetWords) {
  let best = Infinity;
  for (const w of targetWords) best = Math.min(best, levenshtein(word, w));
  return best;
}

function fuzzyScore(query, text) {
  const q = query.trim().toLowerCase();
  const t = text.toLowerCase();
  if (!q) return 0;
  if (t.includes(q)) return 0;

  const targetWords = t.split(/\s+/);
  const queryWords = q.split(/\s+/);
  const worst = Math.max(...queryWords.map((qw) => bestWordDistance(qw, targetWords)));
  const merged = levenshtein(q, t.replace(/\s+/g, ''));
  return Math.min(worst, merged);
}

function isFuzzyMatch(query, text) {
  const q = query.trim().toLowerCase();
  const t = text.toLowerCase();
  if (!q) return true;
  if (t.includes(q)) return true;

  const targetWords = t.split(/\s+/);
  const queryWords = q.split(/\s+/);
  const allWordsMatch = queryWords.every(
    (qw) => bestWordDistance(qw, targetWords) <= toleranceFor(qw.length)
  );
  if (allWordsMatch) return true;

  const merged = t.replace(/\s+/g, '');
  return levenshtein(q, merged) <= toleranceFor(q.length);
}

export default function ProductCatalog({ onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeCategories, setActiveCategories] = useState([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [sortBy, setSortBy] = useState('featured');
  const searchWrapRef = useRef(null);

  // Fetch products once on mount
  useEffect(() => {
    getProducts()
      .then((data) => {
        const normalized = data.map((p) => ({
          ...p,
          id: p._id,
          image: resolveImageUrl(p.image),
        }));
        setProducts(normalized);

        if (normalized.length > 0) {
          const prices = normalized.map((p) => p.price);
          setMinPrice(Math.floor(Math.min(...prices)));
          setMaxPrice(Math.ceil(Math.max(...prices)));
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const allCategories = useMemo(
    () => [...new Set(products.map((p) => p.category))],
    [products]
  );
  const PRICE_MIN = useMemo(
    () => (products.length ? Math.floor(Math.min(...products.map((p) => p.price))) : 0),
    [products]
  );
  const PRICE_MAX = useMemo(
    () => (products.length ? Math.ceil(Math.max(...products.map((p) => p.price))) : 100),
    [products]
  );

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleCategory = (cat) => {
    setActiveCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const resetFilters = () => {
    setSearchTerm('');
    setActiveCategories([]);
    setMinPrice(PRICE_MIN);
    setMaxPrice(PRICE_MAX);
    setSortBy('featured');
  };

  const suggestions = useMemo(() => {
    const q = searchTerm.trim();
    if (q.length < 2) return [];

    const candidates = [
      ...allCategories.map((c) => ({ type: 'category', value: c })),
      ...products.map((p) => ({ type: 'product', value: p.name })),
    ];

    return candidates
      .map((c) => ({ ...c, score: fuzzyScore(q, c.value) }))
      .filter((c) => c.score <= toleranceFor(q.length) + 1)
      .sort((a, b) => a.score - b.score)
      .slice(0, 6);
  }, [searchTerm, allCategories, products]);

  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      const matchesCategory =
        activeCategories.length === 0 || activeCategories.includes(p.category);
      const matchesPrice = p.price >= minPrice && p.price <= maxPrice;
      const matchesSearch =
        !searchTerm.trim() || isFuzzyMatch(searchTerm, `${p.name} ${p.category}`);
      return matchesCategory && matchesPrice && matchesSearch;
    });

    switch (sortBy) {
      case 'price-asc':
        result = result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result = result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result = result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result = result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        result = result.sort((a, b) => (b.tag === 'Bestseller') - (a.tag === 'Bestseller'));
    }
    return result;
  }, [products, activeCategories, minPrice, maxPrice, searchTerm, sortBy]);

  const closestSuggestion = useMemo(() => {
    if (filteredProducts.length > 0 || !searchTerm.trim()) return null;
    let best = null;
    let bestScore = Infinity;
    for (const p of products) {
      const score = fuzzyScore(searchTerm, p.name);
      if (score < bestScore) {
        bestScore = score;
        best = p.name;
      }
    }
    return bestScore <= 4 ? best : null;
  }, [filteredProducts, searchTerm, products]);

  const filtersActive =
    activeCategories.length > 0 ||
    searchTerm.trim() !== '' ||
    minPrice > PRICE_MIN ||
    maxPrice < PRICE_MAX ||
    sortBy !== 'featured';

  if (loading) {
    return (
      <section className="section catalog" id="catalog">
        <div className="container">
          <p>Loading products...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="section catalog" id="catalog">
        <div className="container">
          <p>Couldn't load products: {error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section catalog" id="catalog">
      <div className="container">
        <div className="section-head">
          <div>
            <p className="eyebrow">Full catalog</p>
            <h2>Browse all products</h2>
          </div>
        </div>

        <div className="catalog-toolbar">
          <div className="catalog-search" ref={searchWrapRef}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search products... (try a typo, e.g. 'hoodie')"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
            />
            {searchTerm && (
              <button
                type="button"
                className="search-clear"
                aria-label="Clear search"
                onClick={() => setSearchTerm('')}
              >
                &times;
              </button>
            )}

            {showSuggestions && suggestions.length > 0 && (
              <ul className="search-suggestions">
                {suggestions.map((s) => (
                  <li key={`${s.type}-${s.value}`}>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm(s.value);
                        setShowSuggestions(false);
                      }}
                    >
                      {s.type === 'category' && <span className="suggestion-tag">Category</span>}
                      {s.value}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="catalog-sort">
            <label htmlFor="catalog-sort-select">Sort by</label>
            <select
              id="catalog-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A–Z</option>
              <option value="name-desc">Name: Z–A</option>
            </select>
          </div>
        </div>

        <div className="catalog-layout">
          <aside className="catalog-filters">
            <div className="filter-group">
              <h4>Category</h4>
              {allCategories.map((cat) => (
                <label className="filter-checkbox" key={cat}>
                  <input
                    type="checkbox"
                    checked={activeCategories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                  />
                  {cat}
                </label>
              ))}
            </div>

            <div className="filter-group">
              <h4>Price range</h4>
              <div className="price-inputs">
                <input
                  type="number"
                  min={PRICE_MIN}
                  max={maxPrice}
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                />
                <span>&ndash;</span>
                <input
                  type="number"
                  min={minPrice}
                  max={PRICE_MAX}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                />
              </div>
            </div>

            {filtersActive && (
              <button type="button" className="filter-reset" onClick={resetFilters}>
                Clear all filters
              </button>
            )}
          </aside>

          <div className="catalog-results">
            <p className="catalog-count">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
            </p>

            {filteredProducts.length > 0 ? (
              <div className="product-grid">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
                ))}
              </div>
            ) : (
              <div className="catalog-empty">
                <p>No products matched &ldquo;{searchTerm}&rdquo;.</p>
                {closestSuggestion && (
                  <p>
                    Did you mean{' '}
                    <button type="button" onClick={() => setSearchTerm(closestSuggestion)}>
                      {closestSuggestion}
                    </button>
                    ?
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}