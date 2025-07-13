import React from 'react';
import { useLocation } from 'react-router-dom';
import Question from '../admin/tracker/questions';

// Helper to get query params
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const AlumniTracker: React.FC = () => {
  const query = useQuery();
  const userId = query.get('user_id');

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