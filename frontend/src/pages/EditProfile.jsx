import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import { getImageUrl } from '../utils/imageHelper';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Toast from '../components/ui/Toast';

const schema = yup.object().shape({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  phone: yup.string()
    .matches(/^[0-9]{10}$/, 'Phone must be 10 digits')
    .required('Phone is required'),
  state: yup.string().required('State is required'),
  city: yup.string().required('City is required'),
  country: yup.string().required('Country is required'),
  pincode: yup.string()
    .matches(/^[0-9]{6}$/, 'Pincode must be 6 digits')
    .required('Pincode is required'),
  address: yup.string(),
  profile_image: yup.mixed()
    .test('fileSize', 'File size must be less than 2MB', (value) => {
      if (!value || !value[0]) return true;
      return value[0].size <= 2 * 1024 * 1024;
    })
    .test('fileType', 'Only JPG and PNG images are allowed', (value) => {
      if (!value || !value[0]) return true;
      return ['image/jpeg', 'image/png', 'image/jpg'].includes(value[0].type);
    }),
});

const EditProfile = () => {
  const navigate = useNavigate();
  const { userId } = useParams(); // For admin editing
  const location = useLocation();
  const { user: loggedInUser, updateUser, refreshUserData, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(false);
  const [toast, setToast] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editUser, setEditUser] = useState(null);

  // Determine if admin is editing another user
  const isAdminEditing = isAdmin() && userId && userId !== loggedInUser._id;
  const currentUser = isAdminEditing ? editUser : loggedInUser;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      phone: '',
      state: '',
      city: '',
      country: '',
      pincode: '',
      address: '',
    },
  });

  // Fetch user data if admin is editing another user
  useEffect(() => {
    if (isAdminEditing) {
      const fetchUserData = async () => {
        try {
          setFetchingUser(true);
          const response = await api.get(`/users/${userId}`);
          setEditUser(response.data.data.user);
        } catch (err) {
          setToast({
            type: 'error',
            message: err.response?.data?.error?.message || 'Failed to load user data'
          });
          setTimeout(() => navigate('/admin'), 2000);
        } finally {
          setFetchingUser(false);
        }
      };
      fetchUserData();
    }
  }, [userId, isAdminEditing, navigate]);

  useEffect(() => {
    if (currentUser) {
      reset({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        state: currentUser.state || '',
        city: currentUser.city || '',
        country: currentUser.country || '',
        pincode: currentUser.pincode || '',
        address: currentUser.address || '',
      });
      
      if (currentUser.profile_image) {
        setImagePreview(getImageUrl(currentUser.profile_image));
      }
    }
  }, [currentUser, reset]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      console.log('📝 Submitting form data:', data);

      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('phone', data.phone);
      formData.append('state', data.state);
      formData.append('city', data.city);
      formData.append('country', data.country);
      formData.append('pincode', data.pincode);
      if (data.address) formData.append('address', data.address);
      if (data.profile_image && data.profile_image[0]) {
        formData.append('profile_image', data.profile_image[0]);
      }

      const targetUserId = isAdminEditing ? userId : loggedInUser._id;
      console.log('🎯 Updating user ID:', targetUserId);
      
      // Log FormData contents for debugging
      console.log('📦 FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value instanceof File ? `File: ${value.name}` : value);
      }

      // Don't manually set Content-Type for FormData
      // Let axios set it automatically with the correct boundary
      const response = await api.put(`/users/${targetUserId}`, formData);

      console.log('✅ Update response:', response.data);

      const updatedUser = response.data.data.user;
      
      // Update context and refresh user data
      if (!isAdminEditing) {
        console.log('🔄 Updating context for logged-in user');
        updateUser(updatedUser);
        // Force refresh user data from backend
        if (refreshUserData) {
          await refreshUserData();
        }
      }
      
      setToast({ type: 'success', message: 'Profile updated successfully!' });
      setTimeout(() => {
        if (isAdminEditing) {
          console.log('↩️ Redirecting to admin panel');
          navigate('/admin');
        } else {
          console.log('↩️ Redirecting to profile');
          navigate('/profile');
        }
      }, 1500);
    } catch (err) {
      console.error('❌ Update error:', err);
      setToast({ 
        type: 'error', 
        message: err.response?.data?.error?.message || 'Update failed. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (isAdminEditing) {
      navigate(`/admin/user/${userId}`);
    } else {
      navigate('/profile');
    }
  };

  if (fetchingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
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
              {isAdminEditing ? 'User Management System - Edit User' : 'User Management System - Edit Profile'}
            </h1>
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Profile Image */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile Preview"
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 border-4 border-gray-200 flex items-center justify-center">
                    <span className="text-4xl font-bold text-blue-600">
                      {currentUser.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                  Profile Picture
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  {...register('profile_image')}
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    cursor-pointer"
                />
                {errors.profile_image && (
                  <p className="text-red-500 text-xs mt-1 text-center">{errors.profile_image.message}</p>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                type="text"
                {...register('name')}
                error={errors.name?.message}
                required
              />

              <Input
                label="Phone Number"
                type="tel"
                {...register('phone')}
                error={errors.phone?.message}
                placeholder="10 digit number"
                required
              />

              <Input
                label="State"
                type="text"
                {...register('state')}
                error={errors.state?.message}
                required
              />

              <Input
                label="City"
                type="text"
                {...register('city')}
                error={errors.city?.message}
                required
              />

              <Input
                label="Country"
                type="text"
                {...register('country')}
                error={errors.country?.message}
                required
              />

              <Input
                label="Pincode"
                type="text"
                {...register('pincode')}
                error={errors.pincode?.message}
                required
              />
            </div>

            <Input
              label="Address (Optional)"
              type="text"
              {...register('address')}
              error={errors.address?.message}
            />

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditProfile;
