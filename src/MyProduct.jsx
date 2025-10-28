import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import './MyProduct.css';
import axios from 'axios';
import { Link } from 'react-router-dom';
function MyProduct() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products', {
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
      });
      setProducts(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = async (productId) => {
    if (!window.confirm('Remove this product?')) return;

    try {
      await axios.delete(`/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
      });
      // drop it from state so UI updates
      setProducts(prods => prods.filter(p => p.product_id !== productId));
    } catch (err) {
      console.error('Delete failed', err);
      alert('Could not delete—check console.');
    }
  };

  const updateStock = async (productId, operation) => {
    try {
      const response = await axios.patch(`/api/products/${productId}/stock`, {
        operation,
        amount: 1,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
      });

      // Update the specific product in local state
      setProducts(prev =>
        prev.map(p => p.product_id === productId ? { ...p, avail_stocks: response.data.avail_stocks } : p)
      );
    } catch (err) {
      console.error('Stock update failed', err);
      alert('Failed to update stock.');
    }
  };

  return (
    <div className='myproduct-body'>
      <Navbar />
      <div className='myproduct-container'>
        <div className='myproduct-header'>
          <h2>My Products</h2>
        
          <Link to="/add-product">
            <button className='addproduct-btn'>Add Product</button>
          </Link>
        </div>
        <div className='myproduct-contents'>
          {products.length === 0 && <p>No products yet.</p>}
          {products.map(product => (
            <div className="cart-card2" key={product.product_id}>
              <img src={product.product_img} alt={product.product_name} />
              <div className="cart-card-details2">
                <div className='cart-header2'>
                  <h3 className="cart-pizza-name2">{product.product_name}</h3>
                  <h4>{product.category?.category_name || 'Uncategorized'}</h4>
                </div>

                <div className="cart-card-info2">
                  <div>
                    <div className='price-div'>
                      <p>Price</p>
                      <p><b>₱{product.price}</b></p>
                    </div>
                    <p>Stock</p>
                    <div className='stock-counter'>
                      <button onClick={() => updateStock(product.product_id, 'subtract')}>-</button>
                      <p>{product.avail_stocks}</p>
                      <button onClick={() => updateStock(product.product_id, 'add')}>+</button>
                    </div>

                  </div>
                  <div className='line'></div>
                  <div className='product-date'>
                    <div>Added at<br />{new Date(product.created_at).toLocaleDateString()}</div>
                    <div>Updated at<br />{new Date(product.updated_at).toLocaleDateString()}</div>
                  </div>
                </div>

                {/* ── Remove button ── */}
                <button
                  className="removeproduct-btn"
                  onClick={() => handleRemove(product.product_id)}
                >
                  <span class="material-symbols-outlined">
                    delete
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MyProduct;
