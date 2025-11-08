import React from 'react';
import FloorPlanSVG from './FloorPlanSVG';

function Map() {
  return (
    <div style={{
      padding: '40px',
      minHeight: '100vh',
      background: '#f5f5f5'
    }}>
      <div style={{
        maxWidth: '1600px',
        margin: '0 auto'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          marginBottom: '10px',
          color: '#1a1a1a'
        }}>
          Office Floor Plan
        </h1>
        <p style={{
          color: '#666',
          marginBottom: '30px',
          fontSize: '16px'
        }}>
          Complete office workspace layout
        </p>

        <div style={{
          display: 'flex',
          justifyContent: 'center'
        }}>
          <FloorPlanSVG />
        </div>
      </div>
    </div>
  );
}

export default Map;
