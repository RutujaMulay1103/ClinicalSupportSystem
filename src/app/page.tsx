'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppContext } from '@/context/AppContext';

export default function Home() {
  const router = useRouter();
  const { theme, toggleTheme } = useAppContext();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="neo-header">
        <div className="neo-container flex justify-between items-center">
          <h1 className="text-2xl font-bold text-accent">Clinical Decision Support System</h1>
          <div className="flex items-center space-x-4">
            <button onClick={toggleTheme} className="neo-button">
              {theme === 'white-theme' ? 'Dark Mode' : 'Light Mode'}
            </button>
            <nav className="flex space-x-4">
              <Link href="/" className="neo-button">
                Home
              </Link>
              <Link href="/signin" className="neo-button">
                Sign In
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 md:py-20">
        <div className="neo-container">
          <div className="neo-card">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-accent mb-4">
                AI-Powered Clinical Support
              </h2>
              <p className="text-lg mb-8">
                Empower clinicians with AI-driven insights for better patient care
              </p>
              <button 
                onClick={() => router.push('/signin')} 
                className="neo-button text-lg px-8 py-3"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16">
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

      {/* Footer */}
      <footer className="neo-footer mt-auto">
        <div className="neo-container text-center">
          <p>&copy; {new Date().getFullYear()} Clinical Decision Support System</p>
          <div className="flex justify-center space-x-4 mt-2">
            <Link href="#" className="text-accent underline">
              Contact
            </Link>
            <Link href="#" className="text-accent underline">
              Privacy Policy
            </Link>
            <Link href="#" className="text-accent underline">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
} 