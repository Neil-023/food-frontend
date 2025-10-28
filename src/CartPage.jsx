import react, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CartPage.css';
import { useCart } from './CartContext';
import Navbar from './Navbar';

function CartPage() {
  const { cartBySeller, loadCart, updateQuantity } = useCart();
  const navigate = useNavigate();
  const apiBase = import.meta.env.VITE_API_URL?.replace(/\/$/, '');

  // Flatten all items for receipt/totals
  const allItems = cartBySeller.flatMap(s => s.items);

  const grandTotal = allItems.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * item.quantity,
    0
  );

  useEffect(() => {
    loadCart();
  }, []);

  const handleCheckout = async () => {
    try {
      const res = await fetch(`${apiBase}/api/checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Accept': 'application/json',
        }
      });

      if (res.ok) {
        alert('Checkout successful!');
        loadCart(); // refresh cart
        navigate('/OrderHistory'); // or wherever your history page is
      } else {
        const data = await res.json();
        alert(data.message || 'Checkout failed');
      }
    } catch (err) {
      alert('Error during checkout');
      console.error(err);
    }
  };

  return (
    <div className="cart-page">
      <Navbar />

      <h1 className="cart-title">Your Cart</h1>

      <div className="cart-items">
        {cartBySeller.length === 0 && (
          <p className="empty-cart-msg">Your cart is empty.</p>
        )}

        {cartBySeller.map((seller) => (
          <div key={seller.seller_id} className="seller-group2">
            <h2 className="cart-title2">Shop: {seller.seller_name}</h2>
            <div className='seller-group'>
              {seller.items.map((item) => (
                <div key={item.product_id} className="cart-card">
                  <img src={item.product_img} alt={item.product_name} />
                  <div className="cart-card-details">
                    <h3 className="cart-pizza-name">{item.product_name}</h3>
                    <div className="cart-card-info">
                      <div>
                        <p>Price = ₱{(Number(item.price) || 0).toFixed(2)}</p>
                        <p>
                          Total Price = ₱
                          {((Number(item.price) || 0) * item.quantity).toFixed(2)}
                        </p>
                        <div className="quantity-control">
                          <button
                            onClick={() => {
                              if (item.quantity === 1 && !window.confirm('Remove this item?')) return;
                              updateQuantity(item.product_id, item.quantity - 1);
                            }}
                          >
                            –
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        ))}
      </div>

      <div className="receipt">
        <h2>Receipt</h2>
        <div className="receipt-items">
          {allItems.map((item, idx) => (
            <div className="receipt-item" key={idx}>
              <div className="item-info">
                <p>
                  {item.product_name} × {item.quantity}
                </p>
                <p>
                  ₱{(Number(item.price) || 0).toFixed(2)} × {item.quantity}
                </p>
              </div>
              <div className="item-total">
                <p>₱{((Number(item.price) || 0) * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        <hr />
        <h3 className="total-price">
          Total: ₱{grandTotal.toFixed(2)}
        </h3>
      </div>
      <button className='checkout-btn' onClick={handleCheckout}>
        Proceed to Checkout
      </button>
    </div>

  );
}

export default CartPage;