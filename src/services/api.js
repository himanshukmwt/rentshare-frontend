import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  config.withCredentials = true;
  return config;
});

// Auth
export const register = (data) => API.post('/users/register', data);
export const login = (data) => API.post('/users/login', data);
export const logout = () => API.post('/users/logout', {});
export const getProfile = () => API.get('/users/profile');
export const updateProfile = (data) => API.patch('/users/profile', data);
export const updateLocation = (data) => API.patch('/users/location', data);
export const verifyOTP = (data) => API.post('/users/verify-otp', data);

// Items
export const getItems = () => API.get('/items');
export const getItemById = (id) => API.get(`/items/${id}`);
export const getMyItems = () => API.get('/items/my');
export const createItem = (data) => API.post('/items', data);
export const deleteItem = (id) => API.delete(`/items/${id}`);
export const searchItems = (q) => API.get(`/items/search?q=${encodeURIComponent(q)}`);
export const filterItems = (params) => API.get('/items/filter', { params });

// Cart
export const getMyCart = () => API.get('/cart');
export const addToCart = (itemId) => API.post('/cart/add', { itemId });
export const removeFromCart = (itemId) => API.delete('/cart/remove', { data: { itemId } });
export const clearCart = () => API.delete('/cart/clear');

// Rentals
export const getMyRentals = () => API.get('/rentals/my');
export const getRentalById = (id) => API.get(`/rentals/${id}`);
export const createRental = (data) => API.post('/rentals/direct', data);
export const checkout = (data) => API.post('/checkout', data);
export const completeRental = (rentalId) => API.patch('/rentals/complete', { rentalId });
export const getOwnerRentals = () => API.get('/rentals/owner');
export const returnItem = (rentalId) => API.patch('/rentals/return', { rentalId });
export const ownerRequest = (formData) => API.post('/rentals/owner-request', formData);

// Transactions
export const getMyTransactions = () => API.get('/transactions/my');
export const createOrder = (data) => API.post('/transactions/order', data);
export const verifyPayment = (data) => API.post('/transactions/verify', data);

// Reviews
export const getItemReviews = (itemId) => API.get(`/reviews/${itemId}`);
export const createReview = (data) => API.post('/reviews', data);
export const deleteReview = (id) => API.delete(`/reviews/${id}`);

// KYC
export const submitKYC = (data) => API.post('/kyc/submit', data);
export const getMyKYC = () => API.get('/kyc/my');

// Categories
export const getCategories = () => API.get('/categories');

// Admin
export const deleteUser = (userId) => API.delete(`/admin/users/${userId}`);

export const forgotPassword = (data) => API.post('/users/forgot-password', data);
export const resetPassword  = (data) => API.post('/users/reset-password', data);


export const submitReport = (data) => API.post('/reports', data);
export const getAdminReports = () => API.get('/admin/reports');
export const verifyPickupOTP = (data) => API.post('/rentals/verify-pickup', data);

export default API;
