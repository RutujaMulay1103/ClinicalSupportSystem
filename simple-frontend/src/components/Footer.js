import React from 'react';

function Footer() {
  return (
    <footer className="neo-footer mt-auto">
      <div className="neo-container text-center">
        <p>&copy; {new Date().getFullYear()} Clinical Decision Support System</p>
        <div className="flex justify-center space-x-4 mt-2">
          <a href="#" className="text-accent">
            Contact
          </a>
          <a href="#" className="text-accent">
            Privacy Policy
          </a>
          <a href="#" className="text-accent">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 