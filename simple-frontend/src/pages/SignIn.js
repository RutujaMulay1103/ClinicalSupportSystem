import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

function SignIn() {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    hospital: '',
    department: '',
  });
  
  // Error state
  const [error, setError] = useState('');
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!formData.username || !formData.email || !formData.password || !formData.hospital || !formData.department) {
      setError('All fields are required');
      return;
    }
    
    // Clear error
    setError('');
    
    // Mock sign-in (in a real app, this would call an API)
    console.log('Sign in data:', formData);
    
    // Navigate to patients page
    navigate('/patients');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Sign In Form */}
      <section className="py-8 flex-grow flex items-center">
        <div className="neo-container" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div className="neo-card">
            <h2 className="text-2xl font-bold text-accent mb-6">Sign In</h2>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="block mb-1">Username / Staff ID</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="neo-input"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block mb-1">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="neo-input"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block mb-1">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="neo-input"
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block mb-1">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="neo-input"
                />
              </div>
              
              <div>
                <label htmlFor="hospital" className="block mb-1">Hospital Name</label>
                <select
                  id="hospital"
                  name="hospital"
                  value={formData.hospital}
                  onChange={handleChange}
                  className="neo-dropdown"
                >
                  <option value="">Select Hospital</option>
                  <option value="General Hospital">General Hospital</option>
                  <option value="City Medical Center">City Medical Center</option>
                  <option value="University Hospital">University Hospital</option>
                  <option value="Community Health Center">Community Health Center</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="department" className="block mb-1">Department</label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="neo-dropdown"
                >
                  <option value="">Select Department</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Oncology">Oncology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Emergency Medicine">Emergency Medicine</option>
                  <option value="Internal Medicine">Internal Medicine</option>
                  <option value="Surgery">Surgery</option>
                </select>
              </div>
              
              <button type="submit" className="neo-button w-full py-2">
                Sign In
              </button>
            </form>
            
            <div className="mt-4 text-center">
              <p>
                Already have an account?{' '}
                <a href="#" className="text-accent">
                  Log in
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default SignIn; 