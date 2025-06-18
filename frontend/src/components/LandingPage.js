import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <div className="landing-content">
        <h1 className="landing-title">TradeGPT</h1>
        <p className="landing-description">
          Your intelligent trading companion powered by AI. Get instant answers about exports, imports, logistics, and compliance.
        </p>
        <button
          onClick={() => navigate('/chat')}
          className="try-now-button"
        >
          Try Now
        </button>
      </div>
    </div>
  );
}

export default LandingPage; 