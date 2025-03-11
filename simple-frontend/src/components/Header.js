import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="neo-header">
      <div className="neo-container flex justify-between items-center">
        <h1 className="text-2xl font-bold text-accent">Clinical Decision Support System</h1>
        <nav className="flex space-x-4">
          <Link to="/" className="neo-button">
            Home
          </Link>
          <Link to="/signin" className="neo-button">
            Sign In
          </Link>
          <Link to="/patients" className="neo-button">
            Patients
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header; 