import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="py-8">
        <div className="neo-container">
          <div className="neo-card">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-accent mb-4">
                AI-Powered Clinical Support
              </h2>
              <p className="text-lg mb-8">
                Empower clinicians with AI-driven insights for better patient care
              </p>
              <Link to="/signin" className="neo-button text-lg px-4 py-2">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8">
        <div className="neo-container">
          <h2 className="text-2xl font-bold text-center mb-8">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="neo-card">
              <h3 className="text-xl font-bold text-accent mb-3">AI Recommendations</h3>
              <p>
                Get evidence-based clinical recommendations powered by advanced AI algorithms
                to support your decision-making process.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="neo-card">
              <h3 className="text-xl font-bold text-accent mb-3">Patient Management</h3>
              <p>
                Easily manage your patients' information, medical history, and treatment plans
                in one secure platform.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="neo-card">
              <h3 className="text-xl font-bold text-accent mb-3">Clinical Insights</h3>
              <p>
                Access the latest medical knowledge and clinical guidelines to provide the best
                care for your patients.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home; 