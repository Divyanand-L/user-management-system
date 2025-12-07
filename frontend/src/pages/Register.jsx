import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Toast from '../components/ui/Toast';

const schema = yup.object().shape({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  phone: yup.string()
    .matches(/^[0-9]{10}$/, 'Phone must be 10 digits')
    .required('Phone is required'),
  password: yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number'),
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

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [toast, setToast] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

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
      setError('');
      setToast(null);

      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      formData.append('password', data.password);
      formData.append('state', data.state);
      formData.append('city', data.city);
      formData.append('country', data.country);
      formData.append('pincode', data.pincode);
      if (data.address) formData.append('address', data.address);
      if (data.profile_image && data.profile_image[0]) {
        formData.append('profile_image', data.profile_image[0]);
      }

      console.log('Attempting registration...');
      const result = await registerUser(formData);
      console.log('Registration successful');
      
      setToast({ type: 'success', message: 'Account created successfully! Redirecting...' });
      setTimeout(() => {
        // Redirect based on role
        if (result.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/profile', { state: { welcome: true } });
        }
      }, 1500);
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err.response?.data?.error?.message || err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      setToast({ type: 'error', message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="max-w-2xl w-full">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            User Management System
          </h1>
          <p className="text-gray-600">Create your account and get started</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm bg-opacity-95">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
            <p className="mt-2 text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                {...register('name')}
                error={errors.name?.message}
                placeholder="John Doe"
                required
              />

            <Input
              label="Email"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              placeholder="john@example.com"
              required
            />

            <Input
              label="Phone"
              {...register('phone')}
              error={errors.phone?.message}
              placeholder="9876543210"
              required
            />

            <Input
              label="Password"
              type="password"
              {...register('password')}
              error={errors.password?.message}
              placeholder="********"
              required
            />

            <Input
              label="State"
              {...register('state')}
              error={errors.state?.message}
              placeholder="Karnataka"
              required
            />

            <Input
              label="City"
              {...register('city')}
              error={errors.city?.message}
              placeholder="Bangalore"
              required
            />

            <Input
              label="Country"
              {...register('country')}
              error={errors.country?.message}
              placeholder="India"
              required
            />

            <Input
              label="Pincode"
              {...register('pincode')}
              error={errors.pincode?.message}
              placeholder="560001"
              required
            />
          </div>

          <Input
            label="Address (Optional)"
            {...register('address')}
            error={errors.address?.message}
            placeholder="Street, Area, Landmark"
          />

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Profile Image (Optional)
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              {...register('profile_image')}
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            {errors.profile_image && (
              <p className="text-red-500 text-xs italic mt-1">{errors.profile_image.message}</p>
            )}
            {imagePreview && (
              <div className="mt-3">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-32 w-32 object-cover rounded-full border-2 border-gray-300"
                />
              </div>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
            className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
      </div>
      </div>
    </div>
  );
};

export default Register;
