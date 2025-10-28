import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import MainPage from './MainPage';
import './SellerList.css';
import Navbar from './Navbar.jsx';
import pizza3 from './assets/pizza3.png';

export default function SellerList() {
  const { sellerId } = useParams();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  // pagination
  const [page, setPage] = useState(0);
  const perPage = 3;
  const apiBase = import.meta.env.VITE_API_URL?.replace(/\/$/, '');

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Accept': 'application/json'
          }
        });

        if (!res.ok) {
          // Try to read the error body if server sent one
          let errorDetails = await res.text();
          throw new Error(`HTTP error! Status: ${res.status} | Details: ${errorDetails}`);
        }

        const data = await res.json();
        setSellers(data);
      } catch (err) {
        console.error('Fetch error:', err);
        alert(`Failed to load sellers: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchSellers();
  }, []);

  if (sellerId) {
    return <MainPage sellerId={sellerId} />;
  }

  if (loading) return <div>Loading sellers…</div>;

  const totalPages = Math.ceil(sellers.length / perPage);
  const start = page * perPage;
  const pageSellers = sellers.slice(start, start + perPage);

  console.log('Sellers:', sellers);

  return (
    <div className='seller-list'>
      <Navbar />
      <div className='seller-intro'>
        <div className='seller-text'>
          <h2>Deliciously Curated<br />Foods for Every Diet<br />and Lifestyle</h2>
          <p>Choose meals that suit your health needs, dietary preferences,<br />and whatever you crave making everyday eating simple</p>
        </div>
        <div className='seller-image'>
          <img src={pizza3} alt="Pizza" className='pizza-image' />
        </div>
      </div>

      <div className='seller-listview'>
        <h2>Choose a Seller</h2>
        <div className="seller-buttons">
          <button disabled={page === 0} onClick={() => setPage(page - 1)}>
            ‹
          </button>
          {pageSellers.map(seller => {
            const fullLogoUrl = `${apiBase}${seller.logo_url}`;
            console.log('Full Logo URL:', fullLogoUrl);
            return (  
              <Link
                to={`/seller/${seller.user_id}`}
                key={seller.user_id}
                className="seller-button"
              >
                <img
                  src={fullLogoUrl}
                  alt={seller.shop_name || seller.seller_name}
                  className="seller-logo"
                  onError={(e) => {
                    e.target.onerror = null;
                  }}
                />
                <div className="seller-info">
                  <h3>{seller.shop_name || seller.seller_name}</h3>
                  <p>{seller.shop_tagline || ''}</p>
                </div>
              </Link>
            );
          })}

          <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
