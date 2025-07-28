import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiCalendar, FiEdit3, FiArrowLeft, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import API from '../api';
import Navbar from '../components/Navbar';
import PageTransition from '../components/PageTransition';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    fetchUserProfile();
  }, [navigate]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Ensure token is set in headers
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in.');
        return;
      }
      
      // Set token in API headers
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const response = await API.get('/api/user/profile');
      console.log('Profile data received:', response.data);
      setUser(response.data);
      setEditForm({
        name: response.data.name || '',
        email: response.data.email || '',
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error('Error fetching user profile:', err);
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
        // Clear invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete API.defaults.headers.common['Authorization'];
        // Redirect to login after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(err.response?.data?.message || 'Failed to load profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', editForm);
    
    // Basic validation for name and email
    if (!editForm.name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!editForm.email.trim()) {
      setError('Email is required.');
      return;
    }
    
    // Validate password fields if user is changing password
    if (editForm.newPassword || editForm.confirmPassword || editForm.oldPassword) {
      if (!editForm.oldPassword) {
        setError('Old password is required to change password.');
        return;
      }
      if (!editForm.newPassword) {
        setError('New password is required.');
        return;
      }
      if (editForm.newPassword.length < 6) {
        setError('New password must be at least 6 characters long.');
        return;
      }
      if (editForm.newPassword !== editForm.confirmPassword) {
        setError('New password and confirm password do not match.');
        return;
      }
    }
    
    try {
      setLoading(true);
      
      // Ensure token is set in headers
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in.');
        return;
      }
      
      // Set token in API headers
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Prepare data to send (only include password fields if they're filled)
      const updateData = {
        name: editForm.name,
        email: editForm.email
      };
      
      if (editForm.oldPassword && editForm.newPassword) {
        updateData.oldPassword = editForm.oldPassword;
        updateData.newPassword = editForm.newPassword;
      }
      
      console.log('Sending update data to API:', updateData);
      console.log('Making API call to /api/user/profile');
      
      try {
        const response = await API.put('/api/user/profile', updateData);
        console.log('API response received:', response.data);
        
        // Update local state immediately
        setUser(response.data);
        setIsEditing(false);
        setError('');
        setSuccess('Profile updated successfully!');
        
        // Clear password fields
        setEditForm(prev => ({
          ...prev,
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        
        // Update localStorage with new user data
        localStorage.setItem('user', JSON.stringify(response.data));
        console.log('Updated localStorage with:', response.data);
        
        // Force page reload to update navbar
        window.location.reload();
        
      } catch (apiError) {
        console.error('API call failed:', apiError);
        throw apiError;
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
        // Clear invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete API.defaults.headers.common['Authorization'];
        // Redirect to login after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      name: user?.name || '',
      email: user?.email || '',
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setError('');
    setSuccess('');
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-700 mb-4">{error}</p>
            <Link 
              to="/"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiArrowLeft className="mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation Bar */}
      <Navbar />

      <PageTransition>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md">
          {/* Profile Header */}
          <div className="px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                {user?.profileImage ? (
                  <img 
                    src={user.profileImage} 
                    alt={user.name} 
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{user?.name}</h2>
                  <p className="text-gray-600 mt-1">{user?.email}</p>
                  {user?.createdAt && (
                    <p className="text-sm text-gray-500 mt-2">
                      Member since {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              {!isEditing && (
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setSuccess('');
                    setError('');
                  }}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 active:scale-95"
                >
                  <FiEdit3 className="mr-2" size={16} />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Profile Details */}
          <div className="px-6 py-8">
            {error && (
              <div className="mb-6 bg-red-50 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-6 bg-green-50 text-green-700 px-4 py-3 rounded-md">
                {success}
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleEditSubmit} className="space-y-6 animate-fadeInUp transition-all duration-500 ease-in-out transform">
                <div className="transform transition-all duration-300 ease-in-out">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2 transition-colors duration-200">
                    Full Name
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={editForm.name}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:border-gray-400"
                      placeholder="Enter your full name"
                      required
                    />
                    <FiUser className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-colors duration-200 group-focus-within:text-blue-500" />
                  </div>
                </div>

                 <div className="transform transition-all duration-300 ease-in-out">
                   <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 transition-colors duration-200">
                     Email Address
                   </label>
                   <div className="relative group">
                     <input
                       type="email"
                       id="email"
                       name="email"
                       value={editForm.email}
                       onChange={handleEditChange}
                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:border-gray-400"
                       placeholder="Enter your email"
                       required
                     />
                     <FiMail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-colors duration-200 group-focus-within:text-blue-500" />
                   </div>
                 </div>

                 {/* Password Change Section */}
                 <div className="pt-6 transform transition-all duration-300 ease-in-out">
                   <h3 className="text-lg font-semibold text-gray-900 mb-4 transition-colors duration-200">Change Password</h3>
                   <p className="text-sm text-gray-600 mb-4 transition-colors duration-200">Leave blank if you don't want to change your password.</p>
                   
                                        <div className="space-y-4">
                       <div className="transform transition-all duration-300 ease-in-out">
                         <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-2 transition-colors duration-200">
                           Current Password
                         </label>
                         <div className="relative group">
                           <input
                             type={showOldPassword ? 'text' : 'password'}
                             id="oldPassword"
                             name="oldPassword"
                             value={editForm.oldPassword}
                             onChange={handleEditChange}
                             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:border-gray-400"
                             placeholder="Enter your current password"
                           />
                           <button
                             type="button"
                             className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300 group-focus-within:text-blue-500"
                             onClick={() => setShowOldPassword(!showOldPassword)}
                           >
                             {showOldPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                           </button>
                         </div>
                       </div>

                                            <div className="transform transition-all duration-300 ease-in-out">
                         <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2 transition-colors duration-200">
                           New Password
                         </label>
                         <div className="relative group">
                           <input
                             type={showNewPassword ? 'text' : 'password'}
                             id="newPassword"
                             name="newPassword"
                             value={editForm.newPassword}
                             onChange={handleEditChange}
                             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:border-gray-400"
                             placeholder="Enter your new password"
                           />
                           <button
                             type="button"
                             className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300 group-focus-within:text-blue-500"
                             onClick={() => setShowNewPassword(!showNewPassword)}
                           >
                             {showNewPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                           </button>
                         </div>
                       </div>

                                            <div className="transform transition-all duration-300 ease-in-out">
                         <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2 transition-colors duration-200">
                           Confirm New Password
                         </label>
                         <div className="relative group">
                           <input
                             type={showConfirmPassword ? 'text' : 'password'}
                             id="confirmPassword"
                             name="confirmPassword"
                             value={editForm.confirmPassword}
                             onChange={handleEditChange}
                             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:border-gray-400"
                             placeholder="Confirm your new password"
                           />
                           <button
                             type="button"
                             className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300 group-focus-within:text-blue-500"
                             onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                           >
                             {showConfirmPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                           </button>
                         </div>
                       </div>
                   </div>
                 </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={loading}
                    onClick={() => console.log('Save button clicked')}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Saving...
                      </span>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-all duration-300 transform hover:scale-105 active:scale-95"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6 animate-fadeInUp transition-all duration-500 ease-in-out transform">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg transition-all duration-300 hover:bg-gray-100 hover:shadow-md transform hover:scale-105">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-blue-200">
                      <FiUser className="text-blue-600 transition-colors duration-300" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 transition-colors duration-200">Full Name</p>
                      <p className="font-medium text-gray-900 transition-colors duration-200">{user?.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg transition-all duration-300 hover:bg-gray-100 hover:shadow-md transform hover:scale-105">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-blue-200">
                      <FiMail className="text-blue-600 transition-colors duration-300" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 transition-colors duration-200">Email Address</p>
                      <p className="font-medium text-gray-900 transition-colors duration-200">{user?.email}</p>
                    </div>
                  </div>

                  {user?.createdAt && (
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg transition-all duration-300 hover:bg-gray-100 hover:shadow-md transform hover:scale-105">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-blue-200">
                        <FiCalendar className="text-blue-600 transition-colors duration-300" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 transition-colors duration-200">Member Since</p>
                        <p className="font-medium text-gray-900 transition-colors duration-200">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional sections can be added here */}
                <div className="pt-6 transform transition-all duration-300 ease-in-out">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 transition-colors duration-200">Account Actions</h3>
                  <div className="space-y-3">
                    <Link 
                      to="/orders"
                      className="block w-full text-left p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 hover:shadow-md"
                    >
                      <p className="font-medium text-gray-900 transition-colors duration-200">View Order History</p>
                      <p className="text-sm text-gray-500 transition-colors duration-200">Check your past orders and their status</p>
                    </Link>
                    <Link 
                      to="/wishlist"
                      className="block w-full text-left p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 hover:shadow-md"
                    >
                      <p className="font-medium text-gray-900 transition-colors duration-200">My Wishlist</p>
                      <p className="text-sm text-gray-500 transition-colors duration-200">View your saved items</p>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </PageTransition>
    </div>
  );
}

export default Profile; 