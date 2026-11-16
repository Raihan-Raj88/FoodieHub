import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaSearch, FaFilter, FaSortAmountDown } from 'react-icons/fa';
import { getFoods } from '../services/foodService';
import { getCategories } from '../services/categoryService';
import FoodCard from '../components/FoodCard';
import './MenuPage.css';

const MenuPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategories();
        setCategories(res.data.categories);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchFoods = async () => {
      setLoading(true);
      try {
        const params = {};
        if (search) params.search = search;
        if (selectedCategory) params.category = selectedCategory;
        if (sort) params.sort = sort;

        const res = await getFoods(params);
        setFoods(res.data.foods);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchFoods, 400); // debounce search
    return () => clearTimeout(timer);
  }, [search, selectedCategory, sort]);

  const handleCategoryClick = (catId) => {
    setSelectedCategory(catId === selectedCategory ? '' : catId);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  return (
    <div className="menu-page">
      <div className="menu-hero">
        <div className="container">
          <h1>Our <span>Menu</span></h1>
          <p>Discover our wide range of delicious food items</p>
        </div>
      </div>

      <div className="container menu-content">
        {/* Filters Bar */}
        <div className="filters-bar">
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search food items..."
              value={search}
              onChange={handleSearchChange}
              aria-label="Search food"
            />
            {search && (
              <button onClick={() => setSearch('')} className="clear-search" aria-label="Clear search">×</button>
            )}
          </div>

          <div className="sort-select">
            <FaSortAmountDown />
            <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort by">
              <option value="">Sort by</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="category-filters">
          <button
            className={`cat-pill ${selectedCategory === '' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('')}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              className={`cat-pill ${selectedCategory === cat._id ? 'active' : ''}`}
              onClick={() => handleCategoryClick(cat._id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Results info */}
        {!loading && (
          <p className="results-info">
            {foods.length} item{foods.length !== 1 ? 's' : ''} found
            {search && ` for "${search}"`}
          </p>
        )}

        {/* Food Grid */}
        {loading ? (
          <div className="loading-container">
            <div className="spinner" />
            <p>Loading menu...</p>
          </div>
        ) : foods.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🍽️</div>
            <h3>No food items found</h3>
            <p>Try a different search or category filter</p>
            <button className="btn btn-primary" onClick={() => { setSearch(''); setSelectedCategory(''); }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="menu-food-grid">
            {foods.map((food) => (
              <FoodCard key={food._id} food={food} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;
