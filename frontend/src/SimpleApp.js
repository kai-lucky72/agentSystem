import React, { useState, useEffect } from 'react';
import axios from 'axios';

function SimpleApp() {
  const [apiStatus, setApiStatus] = useState('Loading...');
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  useEffect(() => {
    // Check API health
    const checkApi = async () => {
      try {
        const response = await axios.get('/health/');
        setApiStatus('Connected');
        setResponse(response.data);
      } catch (err) {
        console.error('API connection error:', err);
        setApiStatus('Disconnected');
        setError(err.message || 'Error connecting to API');
      }
    };

    checkApi();
  }, []);

  // Styles
  const containerStyle = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '40px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
  };

  const headerStyle = {
    color: '#2a4365',
    borderBottom: '2px solid #e2e8f0',
    paddingBottom: '10px',
    textAlign: 'center'
  };

  const statusContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '20px 0',
    padding: '10px',
    borderRadius: '5px',
    backgroundColor: apiStatus === 'Connected' ? '#e6fffa' : '#fed7d7'
  };

  const statusIconStyle = {
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    marginRight: '10px',
    backgroundColor: apiStatus === 'Connected' ? '#38b2ac' : '#e53e3e'
  };

  const featureStyle = {
    padding: '10px',
    margin: '5px 0',
    borderRadius: '5px',
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0'
  };

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>Team Management System</h1>
      
      <div style={statusContainerStyle}>
        <div style={statusIconStyle}></div>
        <span>Backend API: {apiStatus}</span>
      </div>
      
      {error && (
        <div style={{ padding: '10px', margin: '10px 0', backgroundColor: '#fed7d7', color: '#742a2a', borderRadius: '5px' }}>
          {error}
        </div>
      )}
      
      {response && (
        <div style={{ padding: '10px', margin: '10px 0', backgroundColor: '#e6fffa', color: '#234e52', borderRadius: '5px' }}>
          API Response: {JSON.stringify(response)}
        </div>
      )}
      
      <div>
        <h2>Features</h2>
        <div style={featureStyle}>✅ User Management - Hierarchical role-based user administration</div>
        <div style={featureStyle}>✅ Attendance Tracking - Record and monitor team attendance</div>
        <div style={featureStyle}>✅ Client Management - Manage client information and contacts</div>
        <div style={featureStyle}>✅ Reporting System - Submit and review team reports</div>
        <div style={featureStyle}>✅ Performance Metrics - Visualize team performance data</div>
      </div>

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <p>Login to the admin panel: <a href="/admin/" target="_blank" rel="noopener noreferrer">Admin Panel</a></p>
        <p>View API endpoints: <a href="/api/" target="_blank" rel="noopener noreferrer">API Endpoints</a></p>
      </div>
    </div>
  );
}

export default SimpleApp;