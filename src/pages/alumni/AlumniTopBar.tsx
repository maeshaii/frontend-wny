import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface AlumniTopBarProps {
  showProfile: boolean;
  setShowProfile: (v: boolean) => void;
  handleLogout: () => void;
}

const AlumniTopBar: React.FC<AlumniTopBarProps> = ({ showProfile, setShowProfile, handleLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <div style={{ background: '#174f84', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <img src="/logo192.png" alt="WhereNaYou Logo" style={{ width: 48, height: 48, borderRadius: '50%' }} />
        <input type="text" placeholder="Search..." style={{ borderRadius: 20, border: 'none', padding: '8px 16px', width: 200 }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        <span style={{ color: 'white', fontSize: 20, cursor: 'pointer' }}>Home</span>
        <span style={{ color: 'white', fontSize: 20, cursor: 'pointer' }}>Messages</span>
        <span
          style={{ color: location.pathname === '/alumni/notifications' ? '#ffd700' : 'white', fontSize: 20, cursor: 'pointer', fontWeight: location.pathname === '/alumni/notifications' ? 'bold' : undefined }}
          onClick={() => navigate('/alumni/notifications')}
        >
          Notification
        </span>
        <div style={{ position: 'relative' }}>
          <span style={{ color: 'white', fontSize: 20, cursor: 'pointer' }} onClick={() => setShowProfile(!showProfile)}>
            Profile ▼
          </span>
          {showProfile && (
            <div style={{ position: 'absolute', right: 0, top: 32, background: 'white', color: '#174f84', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', minWidth: 120, zIndex: 10 }}>
              <div style={{ padding: 12, cursor: 'pointer' }} onClick={handleLogout}>Logout</div>
              <div style={{ padding: 12, cursor: 'pointer' }} onClick={() => setShowProfile(false)}>Close</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlumniTopBar; 