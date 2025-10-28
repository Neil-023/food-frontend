import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddProductPage.css';
import Navbar from './Navbar';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function AddProductPage() {
    const navigate = useNavigate();
    const [availableStock, setAvailableStock] = useState('');
    const [categories, setCategories] = useState([]);
    const apiBase = import.meta.env.VITE_API_URL?.replace(/\/$/, '');

    useEffect(() => {
        axios.get(`${apiBase}/api/categories`)
            .then(r => {
                const loaded = r.data.map(c => ({
                    category_id: c.category_id,
                    name: c.category_name,
                    icon: c.icon_name ?? 'more_horiz'
                }));

                const updatedCategories = [
                    ...loaded,
                    { category_id: null, name: 'Other', icon: 'add' }
                ];

                setCategories(updatedCategories);

                if (updatedCategories.length >= 4) {
                    setSelectedIndex(0);
                }
            })
            .catch(console.error);
    }, []);


    // which category button is selected
    const [selectedIndex, setSelectedIndex] = useState(null);

    // modal visibility
    const [showModal, setShowModal] = useState(false);

    // staging values from modal
    const [pendingCategoryName, setPendingCategoryName] = useState('');
    const [pendingCategoryIcon, setPendingCategoryIcon] = useState('more_horiz');

    // product form state
    const [productName, setProductName] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const availableIcons = [
        'local_pizza', 'local_cafe', 'fork_spoon', 'dinner_dining', 'icecream',
        'lunch_dining', 'cookie', 'local_bar', 'bakery_dining', 'kebab_dining',
        'skillet', 'room_service', 'soup_kitchen', 'stockpot', 'egg_alt', 'grocery',
        'blender', 'bento', 'outdoor_grill', 'restaurant', 'tapas', 'nutrition', 'brunch_dining'
    ];

    function handleImageUpload(e) {
        const file = e.target.files[0];
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    }

    // modal save: only stage values
    function handleSaveCategory() {
        if (!pendingCategoryName.trim()) return;
        setShowModal(false);
    }

    // Add Product: commit staged category (if any) then product
    async function handleAddProduct() {
        try {
            let catId;
            let iconName;
            if (pendingCategoryName) {
                // Check if category name (case-insensitive) already exists
                const existingCategory = categories.find(cat =>
                    cat.name.toLowerCase() === pendingCategoryName.trim().toLowerCase()
                );

                if (existingCategory) {
                    // Use existing category
                    catId = existingCategory.category_id;
                } else {
                    // Create new category
                    const catResp = await axios.post(`${apiBase}/api/categories`, {
                        category_name: pendingCategoryName,
                        icon_name: pendingCategoryIcon
                    });
                    catId = catResp.data.category_id;
                    iconName = pendingCategoryIcon;
                    // Update local categories list
                    setCategories(cats => cats.map((c, i) =>
                        i === cats.length - 1
                            ? { category_id: catId, name: pendingCategoryName, icon: pendingCategoryIcon }
                            : c
                    ));
                }
            } else {
                // No new category typed; use selected
                catId = categories[selectedIndex]?.category_id;
                iconName = categories[selectedIndex]?.icon;
            }

            const userId = localStorage.getItem('user_id');
            console.log('Retrieved user ID:', userId); // Debugging: Check if userId is null or undefined

            const form = new FormData();
            form.append('product_name', productName);
            form.append('price', productPrice);
            form.append('product_desc', productDescription);
            form.append('category_id', catId);
            form.append('avail_stocks', availableStock);
            form.append('seller_id', userId);
            console.log('userId:', userId); // Debugging: Log the user ID
            if (imageFile) form.append('product_img', imageFile);
            console.log('Submitting product:', Object.fromEntries(form.entries()));
            const response = await axios.post(
                `${apiBase}/api/products`,
                form,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    }
                }
            );
            toast.success('Product added successfully!', {
                style: {
                  fontSize: '20px', // increase font size
                  minWidth: '500px',
                  minHeight: '100px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              });
              

            // ③ clear all fields
            setProductName('');
            setProductPrice('');
            setProductDescription('');
            setAvailableStock('');
            setImageFile(null);
            setImagePreview(null);
            setSelectedIndex(null);
            setPendingCategoryName('');
            setPendingCategoryIcon('more_horiz');
            setShowModal(false);
        } catch (err) {
            console.error(err);
            alert('Failed to add product');
        }
    }

    return (
        <div className="add-product-page">
            <Navbar />
            <ToastContainer
                position="bottom-right"
                autoClose={6000}
                hideProgressBar
                closeOnClick
                pauseOnHover={false}
            />
            <div className="section1">
                <h2 className="add-product-title">Add New Product</h2>
                <p className="category-title">Category</p>
                <div className="category-container">
                    {categories.slice(0, 4).map((cat, i) => (

                        <button
                            key={cat.category_id}
                            className={`category-btn ${selectedIndex === i ? 'selected' : ''}`}
                            onClick={() => {
                                setSelectedIndex(i);
                                if (i === categories.length - 1) {
                                    setShowModal(true);
                                }
                            }}
                        >
                            <span className="material-symbols-outlined">{cat.icon}</span>
                            {cat.name}
                        </button>
                    ))}
                    {/* 5th button: always "Other" */}
                    <button
                        key="other-category"
                        className={`category-btn ${selectedIndex === 4 ? 'selected' : ''}`}
                        onClick={() => {
                            setSelectedIndex(4);
                            setShowModal(true);
                        }}
                    >
                        <span className="material-symbols-outlined">
                            {pendingCategoryIcon || 'add'}
                        </span>
                        {pendingCategoryName || 'Other'}
                    </button>
                </div>

                <p className='details-title'>Product Details</p>
                <div className="details-container">
                    <div className='input-container container1'>
                        <div className="input-group">
                            <label className="input-label">Product Name</label>
                            <input
                                className="input-field"
                                value={productName}
                                onChange={e => setProductName(e.target.value)}
                                placeholder="Enter product name"
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Product Price</label>
                            <input
                                className="input-field"
                                value={productPrice}
                                onChange={e => setProductPrice(e.target.value)}
                                placeholder="Enter product price"
                            />
                        </div>
                    </div>
                    <div className='input-container'>
                        <div className="input-group">
                            <label className="input-label">Product Description</label>
                            <textarea
                                className="input-field description-field"
                                value={productDescription}
                                onChange={e => setProductDescription(e.target.value)}
                                placeholder="Enter product description"
                            />
                        </div>
                        <div className="input-container">
                            <div className="input-group stock-field">
                                <label className="input-label">Available Stock</label>
                                <input
                                    className="input-field"
                                    type="number"
                                    value={availableStock}
                                    onChange={e => setAvailableStock(e.target.value)}
                                    placeholder="Enter available stock"
                                    min="0" // Ensures only non-negative numbers
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Add a New Category</h2>
                        <div className="input-group">
                            <label className="input-label">Category Name</label>
                            <input
                                className="input-field  cat-name"
                                value={pendingCategoryName}
                                onChange={e => setPendingCategoryName(e.target.value)}
                                placeholder="e.g. ‘Snacks’"
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Choose Icon</label>
                            <div className="icon-grid">
                                {availableIcons.map(icon => (
                                    <button
                                        key={icon}
                                        type="button"
                                        className={`icon-option ${pendingCategoryIcon === icon ? 'selected' : ''}`}
                                        onClick={() => setPendingCategoryIcon(icon)}
                                    >
                                        <span className="material-symbols-outlined">{icon}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                            <button onClick={handleSaveCategory} className="add-product-btn">Save</button>
                            <button onClick={() => setShowModal(false)} className="cancel-btn">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <div className='image-container'>
                <div className="image-container2" onClick={() => document.getElementById('imageInput').click()}>
                    <input
                        id="imageInput"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                    />
                    {imagePreview
                        ? <img src={imagePreview} className="uploaded-image" alt="" />
                        : <div className="upload-placeholder">
                            <span className="material-symbols-outlined">image</span>
                            <p>Click to upload image</p>
                        </div>
                    }
                </div>
                <div className='button-container'>
                    <button onClick={handleAddProduct} className="add-product-btn">Add Product</button>
                    <button className="cancel-btn" onClick={() => navigate('/MainPage')}>Cancel</button>
                </div>
            </div>
        </div>
    );
}

export default AddProductPage;
