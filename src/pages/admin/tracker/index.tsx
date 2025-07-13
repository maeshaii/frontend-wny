import React, { useState, ChangeEvent, KeyboardEvent, useEffect } from 'react';
import './Tracker.css';
import { FaPlusCircle } from 'react-icons/fa';
import { Link, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../global/sidebar'; // ✅ Sidebar import
import Question from './questions';
import Responses from './responses';
import Setting from './settings';
import { fetchTrackerForm, updateTrackerFormTitle } from '../../../services/api';

const Tracker: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string): boolean => location.pathname === path;

  // Assume trackerFormId is 1 for now
  const trackerFormId = 1;

  const [formTitle, setFormTitle] = useState<string>('Untitled Form');
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [loadingTitle, setLoadingTitle] = useState<boolean>(true);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    // Fetch the tracker form title on mount
    const loadTitle = async () => {
      setLoadingTitle(true);
      try {
        const data = await fetchTrackerForm(trackerFormId);
        setFormTitle(data.title || 'Untitled Form');
      } catch (e) {
        setFormTitle('Untitled Form');
      } finally {
        setLoadingTitle(false);
      }
    };
    loadTitle();
  }, []);

  const handleTitleClick = () => setIsEditingTitle(true);

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormTitle(e.target.value);
  };

  const handleTitleBlur = async () => {
    setIsEditingTitle(false);
    // Save the title to the backend
    try {
      await updateTrackerFormTitle(trackerFormId, formTitle);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 1500);
    } catch (e) {
      // Optionally handle error
    }
  };

  const handleTitleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditingTitle(false);
      // Save the title to the backend
      try {
        await updateTrackerFormTitle(trackerFormId, formTitle);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 1500);
      } catch (e) {
        // Optionally handle error
      }
    }
  };

  return (
    <div style={{ display: 'flex'}}>
      <Sidebar /> {/* ✅ Sidebar added */}

      <div className="tracker-container" style={{ flex: 1, padding: '20px' }}>
        <div className="tracker-inner">

          {/* Header */}
          <div className="tracker-header">
            {/* Replace editable/dynamic title with static, non-editable title */}
            <h2 className="form-title" style={{ fontWeight: 'bold', color: '#164B87', margin: 0 }}>
              CTU MAIN ALUMNI TRACKER
            </h2>
            <div className="tracker-tabs">
              <Link to="/tracker/questions" className={isActive('/tracker/questions') ? 'active' : ''}>
                Questions
              </Link>
              <Link to="/tracker/responses" className={isActive('/tracker/responses') ? 'active' : ''}>
                Responses
              </Link>
              <Link to="/tracker/settings" className={isActive('/tracker/settings') ? 'active' : ''}>
                Settings
              </Link>
            </div>
          </div>

          {/* Tab Content */}
          <Routes>
            <Route index element={<Navigate to="questions" replace />} />
            <Route path="questions" element={<Question />} />
            <Route path="responses" element={<Responses />} />
            <Route path="settings" element={<Setting />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Tracker;
