import React from 'react';
import { useLocation } from 'react-router-dom';
import Question from '../admin/tracker/questions';
import { useTracker } from '../../hooks/useTracker';

// Helper to get query params
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const AlumniTracker: React.FC = () => {
  const query = useQuery();
  const userId = query.get('user_id');
  const { state } = useTracker(userId);

  // Show loading state
  if (state.loading) {
    return (
      <div style={{ 
        background: '#add8e6', 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ 
          textAlign: 'center', 
          background: 'white', 
          padding: '32px', 
          borderRadius: '16px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)' 
        }}>
          <div style={{ fontSize: '20px', color: '#174f84', marginBottom: '16px' }}>
            Loading tracker form...
          </div>
          <div style={{ fontSize: '16px', color: '#666' }}>
            Please wait while we verify your eligibility.
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (state.error) {
    return (
      <div style={{ background: '#add8e6', minHeight: '100vh', padding: '0', margin: '0' }}>
        <h2 style={{ 
          textAlign: 'center', 
          fontWeight: 'bold', 
          color: '#164B87', 
          margin: '0', 
          padding: '32px 0 8px 0', 
          fontSize: '2rem', 
          letterSpacing: '1px' 
        }}>
          CTU MAIN ALUMNI TRACKER
        </h2>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ 
            textAlign: 'center', 
            marginTop: 40, 
            fontSize: 20, 
            color: '#d32f2f', 
            background: 'white', 
            padding: 32, 
            borderRadius: 16, 
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)' 
          }}>
            <div style={{ marginBottom: '16px' }}>⚠️ Error</div>
            {state.error}
            <div style={{ marginTop: 16, fontSize: 16, color: '#666' }}>
              Please try refreshing the page or contact support if the problem persists.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show message and redirect if already submitted or form is closed
  if (state.showMessage) {
    return (
      <div style={{ background: '#add8e6', minHeight: '100vh', padding: '0', margin: '0' }}>
        <h2 style={{ textAlign: 'center', fontWeight: 'bold', color: '#164B87', margin: '0', padding: '32px 0 8px 0', fontSize: '2rem', letterSpacing: '1px' }}>
          CTU MAIN ALUMNI TRACKER
        </h2>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginTop: 40, fontSize: 20, color: '#174f84', background: 'white', padding: 32, borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            {state.message}
            <div style={{ marginTop: 16, fontSize: 16, color: '#666' }}>
              Redirecting to notifications in 3 seconds...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If form is not accepting responses, show message and redirect
  if (state.accepting === false) {
    return (
      <div style={{ background: '#add8e6', minHeight: '100vh', padding: '0', margin: '0' }}>
        <h2 style={{ textAlign: 'center', fontWeight: 'bold', color: '#164B87', margin: '0', padding: '32px 0 8px 0', fontSize: '2rem', letterSpacing: '1px' }}>
          CTU MAIN ALUMNI TRACKER
        </h2>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginTop: 40, fontSize: 20, color: '#174f84', background: 'white', padding: 32, borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            The tracker form is currently closed. Please check back later.
            <div style={{ marginTop: 16, fontSize: 16, color: '#666' }}>
              Redirecting to notifications in 3 seconds...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#add8e6', minHeight: '100vh', padding: '0', margin: '0' }}>
      {/* Title at the very top, above everything else */}
      <h2 style={{ textAlign: 'center', fontWeight: 'bold', color: '#164B87', margin: '0', padding: '32px 0 8px 0', fontSize: '2rem', letterSpacing: '1px' }}>
        CTU MAIN ALUMNI TRACKER
      </h2>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <Question previewModeFromParent={true} userId={userId} />
      </div>
    </div>
  );
};

export default AlumniTracker; 