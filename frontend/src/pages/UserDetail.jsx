import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../config/api';
import { getImageUrl } from '../utils/imageHelper';
import Button from '../components/ui/Button';
import Toast from '../components/ui/Toast';

const UserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`/users/${userId}`);
        setUser(response.data.data.user);
      } catch (err) {
        setToast({
          type: 'error',
          message: err.response?.data?.error?.message || 'Failed to load user'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleRoleChange = async (action) => {
    try {
      setActionLoading(true);
      const endpoint = action === 'promote' 
        ? `/users/${userId}/promote-admin` 
        : `/users/${userId}/demote-admin`;
      
      const response = await api.patch(endpoint);
      setUser(response.data.data.user);
      setToast({
        type: 'success',
        message: action === 'promote' ? 'User promoted to admin' : 'Admin privileges removed'
      });
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.error?.message || 'Failed to update role'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await api.delete(`/users/${userId}`);
      setToast({ type: 'success', message: 'User deleted successfully' });
      setTimeout(() => {
        navigate('/admin');
      }, 1500);
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.error?.message || 'Failed to delete user'
      });
      setActionLoading(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">User not found</p>
          <Button onClick={() => navigate('/admin')}>Back to Admin Panel</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              User Management System - User Details
            </h1>
            <Button variant="outline" onClick={() => navigate('/admin')}>
              Back to Admin Panel
            </Button>
          </div>
        </div>
      </nav>

      {/* User Details */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-12">
            <div className="flex items-center space-x-6">
              <div className="relative">
                {user.profile_image ? (
                  <img
                    src={getImageUrl(user.profile_image)}
                    alt={user.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white flex items-center justify-center shadow-lg">
                    <span className="text-5xl font-bold text-white">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="text-white">
                <h2 className="text-3xl font-bold mb-2">{user.name}</h2>
                <p className="text-blue-100 text-lg">{user.email}</p>
                <div className="mt-3">
                  <span className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-semibold capitalize">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="px-8 py-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Profile Information</h3>
              <Button onClick={() => navigate(`/admin/user/${user._id}/edit`)}>
                Edit Profile
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">{user.name && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-lg text-gray-900">{user.name}</p>
                </div>
              )}

              {user.email && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-lg text-gray-900">{user.email}</p>
                </div>
              )}

              {user.phone && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-lg text-gray-900">{user.phone}</p>
                </div>
              )}

              {user.state && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">State</label>
                  <p className="text-lg text-gray-900">{user.state}</p>
                </div>
              )}

              {user.city && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">City</label>
                  <p className="text-lg text-gray-900">{user.city}</p>
                </div>
              )}

              {user.country && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Country</label>
                  <p className="text-lg text-gray-900">{user.country}</p>
                </div>
              )}

              {user.pincode && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Pincode</label>
                  <p className="text-lg text-gray-900">{user.pincode}</p>
                </div>
              )}

              {user.address && (
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="text-lg text-gray-900">{user.address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Admin Actions */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Actions</h3>
            <div className="flex flex-wrap gap-3">
              {user.role === 'admin' ? (
                <Button
                  variant="outline"
                  onClick={() => handleRoleChange('demote')}
                  disabled={actionLoading}
                  className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
                >
                  {actionLoading ? 'Processing...' : 'Dismiss Admin'}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => handleRoleChange('promote')}
                  disabled={actionLoading}
                  className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                >
                  {actionLoading ? 'Processing...' : 'Make Admin'}
                </Button>
              )}
              <Button
                variant="danger"
                onClick={() => setShowDeleteModal(true)}
                disabled={actionLoading}
              >
                Delete User
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
              Delete User?
            </h3>
            <p className="text-gray-600 text-center mb-8">
              This action cannot be undone. The user's data will be permanently removed.
            </p>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                disabled={actionLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={actionLoading}
                className="flex-1"
              >
                {actionLoading ? 'Deleting...' : 'Yes, Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetail;
