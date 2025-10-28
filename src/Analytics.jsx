import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import pizza1 from './assets/pizza1.png';
import './Analytics.css';
import { Link } from 'react-router-dom';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import axios from 'axios';

// register the parts of Chart.js we need
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function Analytics() {
  const [topProducts, setTopProducts] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);  // <-- array of 3
  const [animatedSpent, setAnimatedSpent] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);
  const [combos, setCombos] = useState([]);
  const categoryColors = ['#c47b08', '#ffb52e', '#ffd182', '#ffe6a7'];
  const apiBase = import.meta.env.VITE_API_URL?.replace(/\/$/, '');
  const catTotal = topCategories
    .reduce((sum, c) => sum + (+c.total_revenue), 0)
    .toLocaleString();
  const centerText = `₱${catTotal}`;

  // estimate a font size (in rem) so that longer strings get smaller
  // assume a 150px container and ~0.6em per character
  const charCount = centerText.length;
  const baseRem = 2;              // your normal 2rem
  const shrinkFactor = 0.15;           // rem to subtract per extra char
  const fontSizeRem = Math.max(
    1,                                  // don’t go below 1rem
    baseRem - (charCount - 3) * shrinkFactor
  );

  useEffect(() => {
    const token = localStorage.getItem('auth_token');

    axios.get(`${apiBase}/api/analytics/top-products`).then(r => setTopProducts(r.data));
    axios.get(`${apiBase}/api/analytics/top-categories`).then(r => setTopCategories(r.data));
    axios.get(`${apiBase}/api/analytics/top-customers`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setTopCustomers(r.data))
      .catch(() => null);
    axios.get(`${apiBase}/api/analytics/frequent-combos`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
    })
      .then(r => setCombos(r.data))
      .catch(err => console.error('combos error', err.response || err));
    axios.get(`${apiBase}/api/analytics/recent-orders`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
    })
      .then(r => setRecentOrders(r.data))
      .catch(err => console.error('recent orders error', err));

  }, [apiBase]);


  // donut‑1: total sold per top product
  const prodDonutData = {
    labels: topProducts.map(p => p.product_name),
    datasets: [{
      data: topProducts.map(p => p.total_sold),
      backgroundColor: [
        '#c47b08',
        '#ffb52e',
        '#ffd182',
        '#ffe6a7',
      ],
      borderWidth: 0,
    }]
  };

  // donut‑2: revenue per top category
  const catDonutData = {
    labels: topCategories.map(c => c.category_name),
    datasets: [{
      data: topCategories.map(c => c.total_revenue),
      backgroundColor: [
        '#c47b08',
        '#ffb52e',
        '#ffd182',
        '#ffe6a7',
      ],
      borderWidth: 0,
    }]
  };

  // — Top 3 customers bar chart data —
  const custsBarData = {
    labels: topCustomers.map(c => c.full_name),
    datasets: [{
      label: '₱ Spent',
      data: topCustomers.map(c => c.total_spent),
      backgroundColor: topCustomers.map((_, i) => categoryColors[i % categoryColors.length]),
      borderWidth: 1
    }]
  };

  const MAX_CHARS = 20;

  const comboBarData = {
    labels: combos.map(c => {
      const full = `${c.product1_name} & ${c.product2_name}`;
      // break into chunks of up to MAX_CHARS
      const chunks = full.match(new RegExp(`(.{1,${MAX_CHARS}})(\\s|$)`, 'g'));
      // trim any trailing whitespace on each chunk
      return chunks.map(s => s.trim());
    }),
    datasets: [{
      label: 'Times Bought Together',
      data: combos.map(c => c.count),
      backgroundColor: combos.map((_, i) => categoryColors[i % categoryColors.length]),
      borderColor: combos.map((_, i) => categoryColors[i % categoryColors.length]),
      borderWidth: 1
    }]
  };



  return (
    <div className='analytics-body'>
      <Navbar />
      <h2 className='analytics-title'>Analytics</h2>
      <div className='analytics-container'>
        <div className='analytics-cards'>
          <div className='analytics-graph'>
            {/* ——— Card #1: Top Products Donut ——— */}
            <div className="card">
              <h3 className="card__title">Top Products Sold</h3>

              <div className="donut-container">
                <div className="donut-chart">
                  <Doughnut
                    data={prodDonutData}
                    options={{
                      maintainAspectRatio: false,   // fill the container
                      cutout: '60%',               // match your ::before hole (20% inset → 60% ring)
                      rotation: -90,               // start at top (optional)
                      plugins: {
                        legend: { display: false },// hide Chart.js legend
                        tooltip: { enabled: true } // hide built‑in tooltips
                      }
                    }}
                  />
                </div>
                <div className="donut-center">
                  {topProducts.reduce((sum, p) => sum + (+p.total_sold), 0)}
                </div>
              </div>

              <ul className="legend">
                {topProducts.map((p, i) => (
                  <li key={i} className="legend__item">
                    <span className={`legend__dot dot--${i + 1}`}></span>
                    {p.product_name} ({p.total_sold})
                  </li>
                ))}
              </ul>
            </div>

            {/* ——— Card #2: Top Categories Donut ——— */}
            <div className="card">
              <h3 className="card__title">Top Categories by Revenue</h3>
              <div className="donut-container">
                <Doughnut
                  data={catDonutData}
                  options={{
                    maintainAspectRatio: false,   // fill the container
                    cutout: '60%',               // match your ::before hole (20% inset → 60% ring)
                    rotation: -90,               // start at top (optional)
                    plugins: {
                      legend: { display: false },// hide Chart.js legend
                      tooltip: { enabled: true } // hide built‑in tooltips
                    }
                  }}
                />
                <div
                  className="donut-center"
                  style={{ fontSize: `${fontSizeRem}rem` }}
                >
                  {centerText}
                </div>
              </div>
              <ul className="legend">
                {topCategories.map((c, i) => (
                  <li key={i} className="legend__item">
                    <span className={`legend__dot dot--${i + 1}`}></span>
                    {c.category_name} (₱{parseFloat(c.total_revenue).toLocaleString()})
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className='analytics-stats'>
            {/* ——— Card #3: Top Customer Bar ——— */}
            {/* ——— Card #3: Top 3 Customers Bar ——— */}
            <div className="card">
              <h3 className="card__title title3">Top 3 Customers</h3>
              {topCustomers.length > 0 ? (
                <div style={{ height: 150 }}>  {/* adjust height */}
                  <Bar
                    data={custsBarData}
                    options={{
                      maintainAspectRatio: false,
                      scales: {
                        y: { beginAtZero: true, ticks: { callback: v => `₱${v}` } }
                      },
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          callbacks: {
                            label: ctx => `₱${ctx.parsed.y.toLocaleString()}`
                          }
                        }
                      }
                    }}
                  />
                </div>
              ) : (
                <p>No sales data yet.</p>
              )}
            </div>



            {/* ——— Card #4: Frequent Combos List ——— */}
            <div className="card">
              <h3 className="card__title">Frequently Bought Together</h3>
              <div style={{ height: 200 }}>
                {combos.length > 0 ? (
                  <Bar
                    data={comboBarData}
                    options={{
                      indexAxis: 'y',
                      maintainAspectRatio: false,
                      scales: {
                        x: { beginAtZero: true },
                        y: { ticks: { autoSkip: false } }
                      },
                      plugins: { legend: { display: false }, tooltip: { enabled: true } }
                    }}
                  />
                ) : (
                  <p className="muted">No frequent‑combo data to display.</p>
                )}
              </div>
            </div>


          </div>
        </div>

        {/* ——— Recent orders stays exactly the same ——— */}
        <div className='order-history'>
          <div className="orders-card">
            <div className="orders-card__header">
              <h3>Most Recent Orders</h3>
              <svg className="icon-clock" viewBox="0 0 24 24">
                <path d="M12 8v4l2 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <ul className="orders-list">
              {recentOrders.map((order, idx) => (
                console.log(order.product_img),
                <li className="order-item" key={idx}>
                  <div className="order-text">
                    <p className="order-title">
                      {order.quantity} {order.product_name}
                    </p>
                    <p className="order-sub">Ordered by {order.full_name}</p>
                  </div>
                  <img className="order-img" src={`${apiBase}${order.product_img}`} alt="product" />

                </li>
              ))}
            </ul>

            <div className="orders-card__footer">
              <Link to="/SellerOrderPage">
                <a href="#">View More Details</a>
              </Link>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

