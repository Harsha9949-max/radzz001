import React, { useState, FormEvent, useEffect } from 'react';
import { AuthMode, User } from '../types';
import { Icon } from '../components/Icon';

interface AuthPageProps {
  mode: AuthMode;
  onAuthSuccess: (user: User) => void;
  onSwitchMode: (mode: AuthMode) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ mode, onAuthSuccess, onSwitchMode }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({ name: '', email: '', password: '', form: '' });
  const [touched, setTouched] = useState({ name: false, email: false, password: false });
  const [isLoading, setIsLoading] = useState(false);
  const isLogin = mode === 'login';

  useEffect(() => {
    setFormData({ name: '', email: '', password: '' });
    setErrors({ name: '', email: '', password: '', form: '' });
    setTouched({ name: false, email: false, password: false });
  }, [mode]);

  const validate = () => {
    const newErrors = { name: '', email: '', password: '', form: '' };
    if (!isLogin && !formData.name.trim()) {
      newErrors.name = 'Full Name is required.';
    }
    if (!formData.email) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid.';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    }
    setErrors(newErrors);
    return !newErrors.name && !newErrors.email && !newErrors.password;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validate();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true });
    if (!validate()) {
      setErrors(prev => ({ ...prev, form: 'Please correct the errors above.' }));
      return;
    }
    
    setErrors(prev => ({...prev, form: ''}));
    setIsLoading(true);
    
    // Simulate API call and create user object
    setTimeout(() => {
      setIsLoading(false);
      const user: User = {
          name: isLogin ? 'Operator' : formData.name,
          email: formData.email,
          isPremium: false,
          premiumTrials: 6,
          studyBuddyTrials: 49,
      };
      onAuthSuccess(user);
    }, 1500);
  };

  const title = isLogin ? 'Welcome Back, Operator' : 'Create Your Account';
  const subtitle = isLogin ? 'Authenticate to access the system.' : 'Register for your AI companion.';
  const buttonText = isLogin ? 'Log In' : 'Sign Up';
  const switchText = isLogin ? "Don't have an account?" : "Already have an account?";
  const switchLinkText = isLogin ? "Sign Up" : "Log In";
  const switchModeTarget: AuthMode = isLogin ? 'signup' : 'login';

  const getInputClass = (field: 'name' | 'email' | 'password') => {
    if (!touched[field]) return 'stylized-3d-input';
    return errors[field] ? 'stylized-3d-input input-error' : 'stylized-3d-input input-success';
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md auth-card">
        <div className="p-8 md:p-10">
          <div className="text-center mb-8 animate-fade-in-down">
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="text-[var(--text-dark-color)] mt-2">{subtitle}</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className={`transition-all duration-500 ease-in-out ${isLogin ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-24'}`}>
              <label htmlFor="name" className="sr-only">Full Name</label>
              <div className="relative">
                <Icon name="user" className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-dark-color)] z-10 pointer-events-none" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={getInputClass('name')}
                  aria-invalid={!!errors.name}
                  aria-describedby="name-error"
                />
              </div>
              {touched.name && errors.name && <p id="name-error" className="text-sm text-[var(--error-color)] mt-1">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="sr-only">Email Address</label>
              <div className="relative">
                <Icon name="mail" className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-dark-color)] z-10 pointer-events-none" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={getInputClass('email')}
                  aria-invalid={!!errors.email}
                  aria-describedby="email-error"
                />
              </div>
              {touched.email && errors.email && <p id="email-error" className="text-sm text-[var(--error-color)] mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="relative">
                <Icon name="lock" className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-dark-color)] z-10 pointer-events-none" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={getInputClass('password')}
                  aria-invalid={!!errors.password}
                  aria-describedby="password-error"
                />
              </div>
              {touched.password && errors.password ? (
                <p id="password-error" className="text-sm text-[var(--error-color)] mt-1">{errors.password}</p>
              ) : (
                <p className="text-xs text-[var(--text-dark-color)] mt-1">Password must be at least 8 characters.</p>
              )}
            </div>
            
            {errors.form && <div className="bg-red-500/20 text-red-300 p-3 rounded-md text-center text-sm">{errors.form}</div>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full stylized-3d-btn flex items-center justify-center mt-4 !h-12"
            >
              {isLoading ? <div className="w-6 h-6 border-2 border-gray-500 border-t-[var(--secondary-color)] rounded-full animate-spin"></div> : buttonText}
            </button>
          </form>

          <p className="text-center text-[var(--text-dark-color)] mt-8">
            {switchText}{' '}
            <button onClick={() => onSwitchMode(switchModeTarget)} className="font-semibold text-[var(--secondary-color)] hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--secondary-color)] rounded">
              {switchLinkText}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;