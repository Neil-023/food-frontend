import { useState } from 'react';
import './App.css';
import pizza from './assets/pizza.svg';
import { useNavigate } from 'react-router-dom';
import { useSeller } from './SellerContext';
import { useCart } from './CartContext';
import axios from 'axios';

function App() {
  const [showRegister, setShowRegister] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const navigate = useNavigate();
  const { setIsSeller } = useSeller();
  const [submittedUsername, setSubmittedUsername] = useState('');
  const { loadCart, setToken } = useCart();
  const apiBase = import.meta.env.VITE_API_URL?.replace(/\/$/, '');

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    address: '',
    contact_number: '',
    email_address: '',
    role: 'buyer',
    shop_name: '',
    image: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const registerData = {
      username: formData.username,
      password: formData.password,
      full_name: formData.full_name,
      address: formData.address,
      contact_number: formData.contact_number,
      email_address: formData.email_address,
      role: 'buyer',
      shop_name: null,
      image: null,
    };

    try {
      const response = await fetch(`${apiBase}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      const result = await response.json();
      if (response.ok) {
        setSubmittedUsername(formData.username);
      }
      else {
        alert(`Registration failed: ${JSON.stringify(result.errors)}`);

      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred during registration');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const username = document.getElementById('uname').value;
    const password = document.getElementById('pword').value;

    try {
      const response = await fetch(`${apiBase}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();
      console.log('Login response:', result); // Debugging: Log the entire response
      if (response.ok) {
        const authToken = result.token;
     
        localStorage.setItem('auth_token', authToken);
        localStorage.setItem('user_id', result.user.user_id);
        setToken(authToken);    
  

        if (!authToken) {
          console.error('Auth token is missing in the response'); // Debugging: Log if token is missing
        } else {
          localStorage.setItem('auth_token', authToken); // Store the token
        }
       
        if (result.user.role === 'seller') {
          setIsSeller(true); // seller
          localStorage.setItem('role', 'seller');
        } else {
          setIsSeller(false); // buyer
          localStorage.setItem('role', 'buyer');
        }
        await loadCart(); 
        navigate('/seller');

      } else {
        alert(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Something went wrong during login.');
    }
  };


  return (
    <div className="login">
      <div className="loginbg">
        <div className="loginbgimg">
          <div className="rotating-container">
            <img src={pizza} className="pizzaimg" />
            <svg className="circular-text-svg" viewBox="0 0 500 500">
              <path
                id="circlePath"
                d="M 250, 250 m -200, 0 a 200,200 0 1,1 400,0 a 200,200 0 1,1 -400,0"
              ></path>
              <text>
                <textPath href="#circlePath" startOffset="50%">
                  Hot & Fresh • Baked with Love • Slice into Happiness • Hot & Fresh • Baked with Love • Slice in •
                </textPath>
              </text>
            </svg>
          </div>
        </div>

        <div className="loginform">
          {showRegister ? (
            <>
              <h1 className="logintext text2">
                Register
                {submittedUsername && (
                  <span style={{ fontSize: '1rem', marginLeft: '0.5rem' }}>
                    ({submittedUsername})
                  </span>
                )}
              </h1>

              <form onSubmit={handleRegister}>
                <div className="float-label" data-placeholder="Email Address">
                  <input
                    type="text"
                    placeholder=""
                    value={formData.email_address}
                    name="email_address"
                    onChange={handleChange}
                  />
                </div>

                <div className="float-label" data-placeholder="Username">
                  <input
                    type="text"
                    placeholder=""
                    value={formData.username}
                    name="username"
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="float-label" data-placeholder="Password">
                  <input
                    type="password"
                    placeholder=""
                    value={formData.password}
                    name="password"
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="float-label" data-placeholder="Full Name">
                  <input
                    type="text"
                    placeholder=""
                    value={formData.full_name}
                    name="full_name"
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="float-label" data-placeholder="Address">
                  <input
                    type="text"
                    placeholder=""
                    value={formData.address}
                    name="address"
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="float-label" data-placeholder="Contact Number">
                  <input
                    type="text"
                    placeholder=""
                    value={formData.contact_number}
                    name="contact_number"
                    onChange={handleChange}
                    required
                  />
                </div>

                <button id="submitbtn" type="submit">Register</button>
                <span className="regtext">
                  Already have an account?
                  <button
                    id="regbtn"
                    type="button"
                    onClick={() => setShowRegister(false)}
                  >
                    Login here!
                  </button>
                </span>
              </form>
            </>
          ) : (
            <>
              <h1 className="logintext">Login</h1>
              <form onSubmit={handleLogin}>

                <div className="float-label" data-placeholder="Username">
                  <input id="uname" type="text" placeholder="" />
                </div>

                <div className="float-label2">
                  <input id="pword" type="password" placeholder="" />
                </div>

                <button id="submitbtn" type="submit">Login</button>
                <span className="regtext">
                  Don't have an account yet?
                  <button
                    id="regbtn"
                    type="button"
                    onClick={() => setShowRegister(true)}
                  >
                    Register here!
                  </button>
                </span>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
