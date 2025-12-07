import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/imageHelper';
import Button from '../components/ui/Button';
import Toast from '../components/ui/Toast';
import api from '../config/api';

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, refreshUserData, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(location.state?.welcome || false);
  const [toast, setToast] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (refreshUserData) {
        await refreshUserData();
      }
      setLoading(false);
    };
    loadData();
  }, [refreshUserData]);

  useEffect(() => {
    if (showWelcome && user) {
      setToast({ type: 'success', message: `Welcome ${user.name}!` });
      const timer = setTimeout(() => {
        setShowWelcome(false);
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showWelcome, user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/users/${user._id}`);
      setShowDeleteModal(false);
      setToast({ type: 'success', message: 'Account deleted successfully' });
      // Wait a moment for user to see the toast
      setTimeout(async () => {
        await logout();
        navigate('/register', { state: { message: 'Your account has been deleted. You can register again if you wish.' } });
      }, 1500);
    } catch (error) {
      setToast({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to delete account' 
      });
      setDeleteLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
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
              User Management System
            </h1>
            <div className="flex items-center space-x-4">
              {isAdmin() && (
                <Button
                  variant="outline"
                  onClick={() => navigate('/admin')}
                >
                  Admin Panel
                </Button>
              )}
              <Button
                variant="danger"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-12 relative">
            <button
              onClick={() => navigate('/edit-profile')}
              className="absolute top-6 right-6 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-200"
              title="Edit Profile"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>

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
            <h3 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-lg text-gray-900">{user.name}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-lg text-gray-900">{user.email}</p>
              </div>

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

          {/* Account Actions */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-end">
              <Button
                variant="danger"
                onClick={() => setShowDeleteModal(true)}
              >
                Delete My Account
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
              Delete Your Account?
            </h3>
            <p className="text-gray-600 text-center mb-8">
              This action cannot be undone. All your data will be permanently removed.
            </p>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="flex-1"
              >
                {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
