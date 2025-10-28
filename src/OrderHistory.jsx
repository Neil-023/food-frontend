// OrderHistory.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import OrderHistoryCard from './components/OrderHistoryCard';
import './OrderHistory.css';

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Accept': 'application/json',
        }
      });
      if (res.ok) {
        const data = await res.json();
        console.log("orders from API:", data);
        setOrders(data);
      } else if (res.status === 401) {
        navigate('/login');
      }
    };
    fetchOrders();
  }, [navigate]);                                            // run once on mount :contentReference[oaicite:2]{index=2}

  return (
    <div>
      <Navbar />
      <div className="order-history-body">
        <div className="order-history-container">
          <div className="order-history-title">Order History</div>

          {orders.length === 0 && <p>No past orders found.</p>}

          {orders.map(order => (
            <div key={order.order_id} className="order-group">
              <h2>
                Order #{order.order_id} — {new Date(order.ordered_at).toLocaleDateString()}
                {' '}<span className="status">{order.overall_status}</span>
              </h2>

              <div className="shops-list">
                {order.shops.map(shop => (
                  <OrderHistoryCard
                    key={shop.seller_id}
                    id={order.order_id}
                    shopname={shop.seller_name}
                    date={order.ordered_at}
                    status={shop.status}
                    items={shop.items}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OrderHistory;
