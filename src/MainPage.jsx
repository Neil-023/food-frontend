import React, { useState, useContext } from 'react';
import { useEffect } from 'react';
import { useCart } from './CartContext';
import Navbar from './Navbar';
import './MainPage.css';

function MainPage({ sellerId }) {
  const { cartBySeller, addToCart, loadCart } = useCart();
  const cartItems = cartBySeller.flatMap(seller => seller.items);
  const cartIds = new Set(cartItems.map(i => i.product_id));
  const [foodData, setFoodData] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(null);
  const [direction, setDirection] = useState('next');
  const [isExiting, setIsExiting] = useState(false);
  const [cardStartIndex, setCardStartIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [category, setCategory] = useState('1');
  const [categories, setCategories] = useState([]);
  const [stockData, setStockData] = useState({});
  const apiBase = import.meta.env.VITE_API_URL?.replace(/\/$/, '');
  const items = stockData[category] || [];
  const currentItem = items[activeIndex] || {};
  const isInCart = currentItem.product_id ? cartIds.has(currentItem.product_id) : false;
  const availableCategories = categories.filter(cat =>
    Array.isArray(stockData[cat.category_id]) && stockData[cat.category_id].length > 0
  );
  const isOutOfStock = currentItem.stock === 0;
  const isOverQuantity = quantity > currentItem.stock;
  const handleAddToCart = async (pizza) => {
    if (pizza.stock >= quantity) {
      try {
        const response = await fetch(`${apiBase}/api/cart/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: JSON.stringify({
            product_id: pizza.product_id,
            quantity: quantity,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          console.log('Item added to cart', data);

          // Ensure product_img is a fully qualified URL


          loadCart();

        } else {
          console.error('Failed to add item to cart:', data.message);
        }
      } catch (error) {
        console.error('Error adding to cart:', error);
      }
    }
  };


  const fullImageUrl = `${apiBase}/storage/${currentItem?.image}`;
  const changeSlide = (dir) => {
    if (isExiting) return;
    setDirection(dir);
    setIsExiting(true);
    setPrevIndex(activeIndex);

    setTimeout(() => {
      setActiveIndex((prev) =>
        dir === 'next'
          ? (prev + 1) % items.length
          : (prev - 1 + items.length) % items.length
      );
      setIsExiting(false);
    }, 800);
  };


  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
        const data = await res.json();
        console.log('Raw API Response:', data);
        setFoodData(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch products', error);
      }
    }

    fetchProducts();
  }, [sellerId]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch(`${apiBase}/api/categories`);
        const data = await response.json();
        console.log('Fetched Categories:', data); // check if categories are coming
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories', error);
      }
    }

    fetchCategories();
  }, []);

  useEffect(() => {
    if (availableCategories.length > 0) {
      setCategory(String(availableCategories[0].category_id));
    }
  }, [categories, stockData]);

  useEffect(() => {
    if (Array.isArray(foodData)) {
      const grouped = {};
      foodData.forEach(item => {
        const cat = item.category_id;
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push({
          ...item,
          stock: item.stock,
          image: item.image,
        });
      });

      setStockData(grouped);
    } else {
    }
  }, [foodData]);


  useEffect(() => {
    setActiveIndex(0);
    setPrevIndex(null);
    setCardStartIndex(0);
  }, [category]);

  useEffect(() => {
    if (activeIndex < cardStartIndex) {
      setCardStartIndex(activeIndex); // scroll back
    } else if (activeIndex >= cardStartIndex + 5) {
      setCardStartIndex(activeIndex - 4); // shift forward to make room for the new active
    }
  }, [activeIndex, cardStartIndex]);

  const handlePreviewClick = (newIndex) => {
    if (isExiting || newIndex === activeIndex) return;
    setDirection(newIndex > activeIndex ? 'next' : 'prev');
    setIsExiting(true);
    setPrevIndex(activeIndex);

    setTimeout(() => {
      setActiveIndex(newIndex);
      setIsExiting(false);
    }, 800);
  };

  if (items.length === 0) {
    return (
      <div className="main-page">
        <p>No items available in this category.</p>
      </div>
    );
  }

  let nameParts = [];
  let labelText = '';

  if (currentItem && currentItem.product_name) {
    nameParts = currentItem.product_name.split(' ');
    labelText = nameParts[1] || nameParts[0]; // Use the second word or fallback to the first
  }


  return (
    <div className="main-page">

      <Navbar />
      <div className="carousel-container">
        <div className='circle'></div>
        {/* Exiting Slide */}
        {isExiting && prevIndex !== null && (
          <div className={`slide exit ${direction}`}>
            <img
              src={fullImageUrl}
              alt={`Item ${activeIndex + 1}`}
              onError={(e) => {
                e.target.onerror = null; // Prevent infinite loop if default image fails
              }}
            />
          </div>
        )}

        {/* Entering Slide */}
        {!isExiting && (
          <div className={`slide enter ${direction}`}>
            <img
              src={fullImageUrl}
              alt={`Item ${activeIndex + 1}`}
              onError={(e) => {
                e.target.onerror = null; // Prevent infinite loop if default image fails
              }}
            />
          </div>
        )}

        <div className="pizza-name">
          <h2>
            <span className="top-label">
              {`Top ${activeIndex + 1} Best Seller`.split('').map((char, i) => (
                <span
                  key={i}
                  className={`letter ${isExiting ? 'fade-out' : 'fade-in'} ${char === ' ' ? 'space' : ''}`}
                  style={{ animationDelay: `${1000 + i * 30}ms` }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </span>

            <br />
            <span className="pizza-title">
              {currentItem && currentItem.product_name
                ? currentItem.product_name.split(' ')[0].split('').map((char, i) => (
                  <span
                    key={i}
                    className={`letter ${isExiting ? 'fade-out' : 'fade-in'} ${char === ' ' ? 'space' : ''}`}
                    style={{ animationDelay: `${1000 + i * 30}ms` }}
                  >
                    {char}
                  </span>
                ))
                : null}
            </span>
            <br />
            <span
              className="pizza-label"
              style={{
                fontSize: `${Math.max(1.2, 5.5 - 0.1 * (labelText.length - 6))
                  }rem`, // Scale gradually and cap at minimum size
                transition: 'font-size 0.3s ease',
              }}
            >
              {labelText.split('').map((char, i) => (
                <span
                  key={i}
                  className={`letter ${isExiting ? 'fade-out' : 'fade-in'}`}
                  style={{ animationDelay: `${1000 + (i + currentItem.product_name.length) * 30}ms` }}
                >
                  {char}
                </span>
              ))}
            </span>
          </h2>
        </div>
      </div>

      <div className="pizza-details-card">
        <p className="product-desc">Overview</p>

        <div className="price fade-in-up" key={`price-${activeIndex}`}>
          <p>₱{currentItem.price}</p>
        </div>

        <h3 className="fade-in-left" key={currentItem.product_name}>{currentItem.product_name}</h3>

        <p className="fade-in-left" key={`desc-${activeIndex}`}>
          {currentItem.product_desc}
        </p>
        <p>Stock left: {currentItem.stock}</p>

        <div className='quantity-container'>
          <p>Quantity: </p>
          <div className="quantity-control">
            <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
            <span>{quantity}</span>
            <button
              onClick={() => setQuantity(q => Math.min(q + 1, currentItem.stock))}
              disabled={quantity >= currentItem.stock}
            >
              +
            </button>
          </div>
        </div>
        <button
          className="add-to-cart-btn"
          onClick={() => handleAddToCart(currentItem)}
          disabled={isExiting || isOutOfStock || isInCart}
        >
          <span className="material-symbols-outlined">shopping_cart</span>
          {isOutOfStock
            ? 'Out of Stock'
            : isInCart
              ? 'Already in Cart'
              : 'Add to Cart'
          }
        </button>
      </div>

      <div className="bottom-carousel">
        <button className="small-nav" id="prev" onClick={() => changeSlide('prev')}>
          <span className="material-symbols-outlined">
            chevron_left
          </span>
        </button>

        <div className="preview-cards">
          {items.slice(cardStartIndex, cardStartIndex + 5).map((pizza, index) => {
            const previewImageUrl = `${apiBase}/storage/${pizza.image}`;
            return (
              <div
                key={index}
                className={`preview-card ${activeIndex === cardStartIndex + index ? 'active-preview' : ''}`}
                onClick={() => handlePreviewClick(cardStartIndex + index)}
              >
                <img src={previewImageUrl} alt={pizza.product_name} />
                <p>{pizza.product_name}</p>
              </div>
            );
          })}

        </div>

        <button className="small-nav" id="next" onClick={() => changeSlide('next')}>
          <span className="material-symbols-outlined">
            chevron_right
          </span>
        </button>

      </div>
      <div className="dots-container">
        {items.map((_, i) => (
          <div
            key={i}
            className={`dot ${i === activeIndex ? 'active-dot' : ''}`}
            onClick={() => handlePreviewClick(i)}
          />
        ))}
      </div>

      <div className="bottom-nav-bar">
        {availableCategories.map((cat) => (
          <button
            key={cat.category_id}
            className={`category-btn ${category === String(cat.category_id) ? 'active-category' : ''}`}
            onClick={() => {
              if (category === String(cat.category_id)) return;

              // Trigger exit animation
              setIsExiting(true);
              setPrevIndex(activeIndex);

              setTimeout(() => {
                setCategory(String(cat.category_id));
                setActiveIndex(0);
                setIsExiting(false);
              }, 800); // Match your animation timeout
            }}
          >
            <span className="material-symbols-outlined">{cat.icon_name}</span>
            {cat.category_name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default MainPage;
