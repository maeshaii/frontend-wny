import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTracker } from '../../hooks/useTracker';
import Question from '../admin/tracker/questions';

function useQuery() {
  const [searchParams] = useSearchParams();
  return searchParams.get('user_id');
}

const AlumniTracker: React.FC = () => {
  const query = useQuery();
  const userId = query; // Get user_id from URL parameters
  
  console.log('🔍 Tracker Debug - User ID from URL:', userId);
  
  const { state } = useTracker(userId);

  if (state.loading) {
    return (
      <div style={{ background: '#add8e6', minHeight: '100vh', padding: '0', margin: '0' }}>
        <h2
          style={{
            textAlign: 'center',
            fontWeight: 'bold',
            color: '#164B87',
            margin: '0',
            padding: '32px 0 8px 0',
            fontSize: '2rem',
            letterSpacing: '1px',
          }}
        >
          CTU MAIN ALUMNI TRACKER
        </h2>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div
            style={{
              textAlign: 'center',
              marginTop: 40,
              fontSize: 20,
              color: '#174f84',
              background: 'white',
              padding: 32,
              borderRadius: 16,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            Loading tracker form...
          </div>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div style={{ background: '#add8e6', minHeight: '100vh', padding: '0', margin: '0' }}>
        <h2
          style={{
            textAlign: 'center',
            fontWeight: 'bold',
            color: '#164B87',
            margin: '0',
            padding: '32px 0 8px 0',
            fontSize: '2rem',
            letterSpacing: '1px',
          }}
        >
          CTU MAIN ALUMNI TRACKER
        </h2>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div
            style={{
              textAlign: 'center',
              marginTop: 40,
              fontSize: 20,
              color: '#e74c3c',
              background: 'white',
              padding: 32,
              borderRadius: 16,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            Error: {state.error}
            <div style={{ marginTop: 16, fontSize: 16, color: '#666' }}>
              Please contact support if this persists.
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state.showMessage) {
    return (
      <div style={{ background: '#add8e6', minHeight: '100vh', padding: '0', margin: '0' }}>
        <h2
          style={{
            textAlign: 'center',
            fontWeight: 'bold',
            color: '#164B87',
            margin: '0',
            padding: '32px 0 8px 0',
            fontSize: '2rem',
            letterSpacing: '1px',
          }}
        >
          CTU MAIN ALUMNI TRACKER
        </h2>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div
            style={{
              textAlign: 'center',
              marginTop: 40,
              fontSize: 20,
              color: '#174f84',
              background: 'white',
              padding: 32,
              borderRadius: 16,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            {state.message}
            <div style={{ marginTop: 16, fontSize: 16, color: '#666' }}>
              Redirecting to notifications...
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
        <h2
          style={{
            textAlign: 'center',
            fontWeight: 'bold',
            color: '#164B87',
            margin: '0',
            padding: '32px 0 8px 0',
            fontSize: '2rem',
            letterSpacing: '1px',
          }}
        >
          CTU MAIN ALUMNI TRACKER
        </h2>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div
            style={{
              textAlign: 'center',
              marginTop: 40,
              fontSize: 20,
              color: '#174f84',
              background: 'white',
              padding: 32,
              borderRadius: 16,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
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
      <h2
        style={{
          textAlign: 'center',
          fontWeight: 'bold',
          color: '#164B87',
          margin: '0',
          padding: '32px 0 8px 0',
          fontSize: '2rem',
          letterSpacing: '1px',
        }}
      >
        CTU MAIN ALUMNI TRACKER
      </h2>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <Question previewModeFromParent={true} userId={userId} />
      </div>
    </div>
  );
};

export default AlumniTracker;
