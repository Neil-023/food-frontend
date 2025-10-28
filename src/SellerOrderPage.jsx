// SellerOrderPage.jsx
import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import OrderHistoryCard from './components/OrderHistoryCard';
import './OrderHistory.css';
import './components/OrderHistoryCard.css';
import './components/OrderHistoryItem.css';
import axios from 'axios';

function SellerOrderPage() {
    const [orders, setOrders] = useState([]);

    // fetch pending orders
    useEffect(() => {
        axios.get('/api/seller/orders', {
            headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
        })
            .then(r => setOrders(r.data))
            .catch(console.error);
    }, []);

    // call API and update local state
    const handleStatusChange = (orderId, newStatus) => {
        axios.put(`/api/orders/${orderId}/status`, { status: newStatus }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
        })
            .then(() => {
                setOrders(old =>
                    old.map(o => o.order_id === orderId ? { ...o, status: newStatus } : o)
                );
            })
            .catch(console.error);
    };

    return (
        <div>
            <Navbar />
            <div className="order-history-body">
                <div className="order-history-container">
                    <div className="order-history-title">My Shop's Orders</div>

                    {orders.length === 0 && <p>No orders for your shop yet.</p>}

                    {orders
                        .filter(order => order.status !== 'completed') // hide if this seller’s portion is completed
                        .map(order => (
                            <div key={order.order_id} className="order-group">
                                <h2>
                                    Order #{order.order_id} — {new Date(order.ordered_at).toLocaleDateString()}
                                </h2>

                                <OrderHistoryCard
                                    id={order.order_id}
                                    shopname={order.customer_name}
                                    date={order.ordered_at}
                                    isManager={order.isManager}
                                    status={order.status}
                                    items={order.items}
                                    onStatusChange={handleStatusChange}
                                />
                            </div>
                        ))}

                </div>
            </div>
        </div>
    );
}

export default SellerOrderPage;
