import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPackage, FiTruck, FiCreditCard, FiCalendar } from 'react-icons/fi';
import API from '../api';
import Navbar from '../components/Navbar';
import PageTransition from '../components/PageTransition';
import { useCurrency } from '../context/CurrencyContext';

const OrderHistory = () => {
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await API.get('/api/order');
      
      setOrders(response.data.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Failed to load orders');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const response = await API.get(`/api/order/${orderId}`);
      setSelectedOrder(response.data);
      setShowOrderDetails(true);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Failed to load order details');
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <PageTransition>
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/profile')}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <FiArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiPackage size={32} className="text-gray-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">No orders yet</h2>
              <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
              <Link 
                to="/shop"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <FiPackage className="text-blue-600" size={20} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Order #{order.id}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {formatDate(order.orderedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        <button
                          onClick={() => fetchOrderDetails(order.id)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          View Details
                        </button>
                      </div>
                    </div>

                                         <div className="flex items-center justify-between">
                       <div className="text-sm text-gray-600">
                         Total: <span className="font-semibold text-gray-900">{formatCurrency(order.total_price)}</span>
                       </div>
                       {order.order_note && (
                         <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                           Has Notes
                         </div>
                       )}
                     </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Order #{selectedOrder.order_id} Details
                  </h2>
                  <button
                    onClick={() => setShowOrderDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                                 {/* Order Summary */}
                 <div className="bg-gray-50 rounded-lg p-4">
                   <h3 className="text-lg font-medium text-gray-900 mb-3">Order Summary</h3>
                   <div className="grid grid-cols-2 gap-4 text-sm">
                     <div>
                       <span className="text-gray-600">Order Date:</span>
                       <p className="font-medium">{formatDate(selectedOrder.orderedAt)}</p>
                     </div>
                     <div>
                       <span className="text-gray-600">Status:</span>
                       <p className="font-medium">{selectedOrder.status}</p>
                     </div>
                     <div>
                       <span className="text-gray-600">Total Amount:</span>
                       <p className="font-medium">{formatCurrency(selectedOrder.total_price)}</p>
                     </div>
                     <div>
                       <span className="text-gray-600">Items:</span>
                       <p className="font-medium">{selectedOrder.items_count}</p>
                     </div>
                   </div>
                 </div>

                 {/* Order Notes */}
                 {selectedOrder.order_note && (
                   <div>
                     <h3 className="text-lg font-medium text-gray-900 mb-3">Order Notes</h3>
                     <div className="bg-gray-50 rounded-lg p-4">
                       <p className="text-gray-700 whitespace-pre-wrap">{selectedOrder.order_note}</p>
                     </div>
                   </div>
                 )}

                {/* Order Items */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          <p className="text-sm text-gray-600">Price: {formatCurrency(item.price)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{formatCurrency(item.item_total)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Information */}
                {selectedOrder.shipping_info && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <FiTruck className="mr-2" />
                      Shipping Information
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Name:</span>
                          <p className="font-medium">
                            {selectedOrder.shipping_info.first_name} {selectedOrder.shipping_info.last_name}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Email:</span>
                          <p className="font-medium">{selectedOrder.shipping_info.email}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Phone:</span>
                          <p className="font-medium">{selectedOrder.shipping_info.phone}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Country:</span>
                          <p className="font-medium">{selectedOrder.shipping_info.country}</p>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-gray-600">Address:</span>
                          <p className="font-medium">{selectedOrder.shipping_info.address}</p>
                          <p className="font-medium">
                            {selectedOrder.shipping_info.city}, {selectedOrder.shipping_info.state} {selectedOrder.shipping_info.zip_code}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Information */}
                {selectedOrder.payment_info && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <FiCreditCard className="mr-2" />
                      Payment Information
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Card Type:</span>
                          <p className="font-medium">{selectedOrder.payment_info.card_type}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Card Number:</span>
                          <p className="font-medium">**** **** **** {selectedOrder.payment_info.card_last_four}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Payment Status:</span>
                          <p className="font-medium">{selectedOrder.payment_info.payment_status}</p>
                        </div>
                        {selectedOrder.payment_info.transaction_id && (
                          <div>
                            <span className="text-gray-600">Transaction ID:</span>
                            <p className="font-medium text-xs">{selectedOrder.payment_info.transaction_id}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </PageTransition>
    </div>
  );
};

export default OrderHistory; 