import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AlumniTopBar from './AlumniTopBar';
import ctulogo from '../../images/ctulogo.png';


interface AlumniUser {
  name: string;
  course?: string; 
  year_graduated?: string | number;
  profile_pic?: string;
  profile_bio?: string;
  profile_resume?: string;
  location?: string;
  university?: string;
  resume?: string;
}

const AlumniProfile: React.FC = () => {
  const [user, setUser] = useState<AlumniUser | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editProfilePic, setEditProfilePic] = useState<string | undefined>(user?.profile_pic);
  const [editBio, setEditBio] = useState<string>(user?.profile_bio|| '');
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);

  const [bioModalOpen, setBioModalOpen] = useState(false);
  const [bioInput, setBioInput] = useState('');
  const [bioLoading, setBioLoading] = useState(false);

  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file && file.type === 'application/pdf') {
    setResumeFile(file);
  } else {
    alert('Please upload a valid PDF file.');
  }
};

const handleSaveResume = async () => {
  if (!resumeFile) {
    alert("No resume file selected.");
    return;
  }

  const formData = new FormData();
  formData.append('resume', resumeFile);

  const userObj = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = userObj.user_id || userObj.id;
  const url = `http://127.0.0.1:8000/api/resume/update/?user_id=${userId}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      const updatedUser = { ...userObj, profile_resume: data.resume };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      alert("Resume uploaded!");
    } else {
      const err = await res.json();
      alert("Failed to upload resume: " + (err.message || "Unknown error"));
    }
  } catch (err) {
    alert("Network error: " + err);
  }
};
const handleDeleteResume = async () => {
  const userObj = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = userObj.user_id || userObj.id;

  try {
    const res = await fetch(`http://127.0.0.1:8000/api/shared/resume/update/?user_id=${userId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      const updatedUser = { ...userObj, profile_resume: null };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      alert("Resume deleted.");
    } else {
      const err = await res.json();
      alert("Failed to delete resume: " + (err.message || "Unknown error"));
    }
  } catch (err) {
    alert("Network error: " + err);
  }
};

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userObj = JSON.parse(userStr);
      setUser(userObj);
      setBioInput(userObj.profile_bio || '');

      // Fetch latest profile from backend
      const userId = userObj.user_id || userObj.id;
      fetch(`http://127.0.0.1:8000/api/alumni/${userId}/`)
        .then(res => res.json())
        .then(profile => {
          setUser(profile.alumni);
          setBioInput(profile.alumni.profile_bio || '');
          localStorage.setItem('user', JSON.stringify(profile.alumni));
        });
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleEditProfile = () => {
    setEditProfilePic(user?.profile_pic);
    setEditBio(user?.profile_bio || '');
    setEditModalOpen(true);
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('Selected file:', file);
    if (file) {
      setProfilePicFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setEditProfilePic(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfilePic = () => {
    setEditProfilePic(undefined);
    setProfilePicFile(null);
  };


  const handleSave = async () => {
    const formData = new FormData();
    if (profilePicFile) {
      formData.append('profile_pic', profilePicFile);
    }
    formData.append('bio', editBio);

    const userObj = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = userObj.user_id || userObj.id;
    if (!userId) {
      alert('User ID not found. Please log in again.');
      return;
    }

    const url = `http://127.0.0.1:8000/api/shared/profile/update/?user_id=${userId}`;
    try {
      const response = await fetch(url, {
        method: 'PUT',
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        setEditModalOpen(false);
        window.location.reload();
      } else {
        const err = await response.json();
        alert('Failed to update profile: ' + (err.message || 'Unknown error'));
      }
    } catch (error) {
      alert('Network error: ' + error);
    }
  };

   const handleSaveBio = async () => {
    setBioLoading(true);
    const userObj = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = userObj.user_id || userObj.id;
    if (!userId) {
      alert('User ID not found. Please log in again.');
      setBioLoading(false);
      return;
    }
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/admin/${userId}/profile_bio/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_bio: bioInput }),
      });
      if (response.ok) {
        const data = await response.json();
        setUser((prev) => prev ? { ...prev, profile_bio: data.profile_bio } : prev);
        // Update localStorage as well
        const updatedUser = { ...userObj, profile_bio: data.profile_bio };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setBioModalOpen(false);
      } else {
        alert('Failed to save bio.');
      }
    } catch (error) {
      alert('Network error: ' + error);
    }
    setBioLoading(false);
  };

  const handleDeleteBio = async () => {
    setBioLoading(true);
    const userObj = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = userObj.user_id || userObj.id;
    if (!userId) {
      alert('User ID not found. Please log in again.');
      setBioLoading(false);
      return;
    }
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/admin/${userId}/profile_bio/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_bio: '' }),
      });
      if (response.ok) {
        setUser((prev) => prev ? { ...prev, profile_bio: '' } : prev);
        const updatedUser = { ...userObj, profile_bio: '' };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setBioInput('');
        setBioModalOpen(false);
      } else {
        alert('Failed to delete bio.');
      }
    } catch (error) {
      alert('Network error: ' + error);
    }
    setBioLoading(false);
  };

  return (
    <div style={{ background: '#f5f7fa', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <AlumniTopBar 
        showProfile={showProfile} 
        setShowProfile={setShowProfile} 
        handleLogout={handleLogout} 
      />

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 24, padding: '24px' }}>
        {/* Left Sidebar */}
        <div style={{ flex: 1, maxWidth: 280 }}>
          {/* Introduction */} 
          <div style={{ 
            background: 'white', 
            borderRadius: 12, 
            padding: 20, 
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            border: '1px solid #e0e0e0',
            marginBottom: 16
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: 16, fontSize: 16 }}>Introduction</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
             {/* Show bio if exists, otherwise show Add Bio button */}
          {user?.profile_bio?.trim() ? (
            <div style={{
              background: '#f5f7fa',
              borderRadius: 8,
              padding: '10px 12px',
              fontSize: 14,
              color: '#333',
              marginBottom: 8,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>{user.profile_bio}</span>
              <button
                style={{
                  marginLeft: 8,
                  background: '#eee',
                  border: 'none',
                  borderRadius: 6,
                  padding: '4px 10px',
                  cursor: 'pointer',
                  fontSize: 12
                }}
                onClick={() => {
                  setBioInput(user.profile_bio?.trim() || '');
                  setBioModalOpen(true);
                }}
              >
                Edit Bio
              </button>
            </div>
          ) : (
            <button
              style={{
                background: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: 8,
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: 14,
                marginBottom: 8
              }}
              onClick={() => setBioModalOpen(true)}
            >
              Add Bio
            </button>
          )}

{user?.profile_resume ? (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <a 
      href={`http://127.0.0.1:8000${user.profile_resume}`} 
      target="_blank" 
      rel="noopener noreferrer"
      style={{ fontSize: 14, color: '#174f84' }}
    >
      View Resume
    </a>
    <button
      onClick={handleDeleteResume}
      style={{
        background: '#e74c3c',
        color: 'white',
        border: 'none',
        borderRadius: 6,
        padding: '6px 12px',
        fontSize: 14,
        cursor: 'pointer'
      }}
    >
      Delete Resume
    </button>
  </div>
) : (
  <>
    <input type="file" accept="application/pdf" onChange={handleResumeChange} />
    <button
      onClick={handleSaveResume}
      style={{
        background: '#174f84',
        color: 'white',
        border: 'none',
        borderRadius: 6,
        padding: '6px 12px',
        fontSize: 14,
        cursor: 'pointer'
      }}
    >
      Upload Resume
    </button>
  </>
)}

            </div>
          </div>

          {/* Followers */}
          <div style={{ 
            background: 'white', 
            borderRadius: 12, 
            padding: 20, 
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            border: '1px solid #e0e0e0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontWeight: 'bold', fontSize: 16 }}>Followers</div>
              <div style={{ color: '#174f84', fontSize: 12, cursor: 'pointer' }}>See all</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* First Row */}
              <div style={{ display: 'flex', gap: 8 }}>
                {[1, 2, 3].map((f) => (
                  <div key={f} style={{ textAlign: 'center', flex: 1 }}>
                    <img
                      src={`https://randomuser.me/api/portraits/men/${f * 5}.jpg`}
                      alt="Follower"
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        marginBottom: 4
                      }}
                    />
                    <div style={{ fontSize: 12, color: '#666' }}>lorem</div>
                  </div>
                ))}
              </div>
              {/* Second Row */}
              <div style={{ display: 'flex', gap: 8 }}>
                {[4, 5, 6].map((f) => (
                  <div key={f} style={{ textAlign: 'center', flex: 1 }}>
                    <img
                      src={`https://randomuser.me/api/portraits/women/${f * 4}.jpg`}
                      alt="Follower"
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        marginBottom: 4
                      }}
                    />
                    <div style={{ fontSize: 12, color: '#666' }}>lorem</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Center Content */}
        <div style={{ flex: 2 }}>
          {/* Orange Banner */}
          <div style={{ 
            background: '#ff6b35', 
            height: 160, 
            width: '100%',
            borderRadius: 12,
            position: 'relative',
            marginBottom: 60
          }}>
            {/* Edit Profile Button */}
            <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'white', cursor: 'pointer', background: 'rgba(0,0,0,0.2)', padding: '6px 12px', borderRadius: 6 }} onClick={handleEditProfile}>
              <span>Edit Profile</span>
              <span>✏️</span>
            </div>
          </div>

          {/* Profile Info Section */}
          <div style={{ 
            position: 'relative',
            marginTop: -80,
            marginBottom: 24
          }}>
            <div style={{ 
              background: 'white', 
              borderRadius: 12, 
              padding: '60px 20px 20px 20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              border: '1px solid #e0e0e0',
              textAlign: 'center'
            }}>
              <img 
                src={user?.profile_pic ? `http://127.0.0.1:8000${user.profile_pic}` : ctulogo}
                alt="Profile" 
                style={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%', 
                  border: '3px solid white',
                  marginBottom: 12,
                  marginTop: -60
                }} 
              />
              <div style={{ fontWeight: 'bold', fontSize: 18, color: '#333', marginBottom: 4, textTransform: 'uppercase' }}>
                {user?.name || 'namee'}
              </div>
              <div style={{ fontSize: 14, color: '#666' }}>
                {user?.university || 'wowow'}
              </div>
            </div>
          </div>

          {/* Start a Post */}
          <div style={{ 
            background: 'white', 
            borderRadius: 12, 
            padding: 20, 
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            border: '1px solid #e0e0e0',
            marginBottom: 16
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img 
                src={user?.profile_pic || ctulogo} 
                alt="Profile" 
                style={{ width: 40, height: 40, borderRadius: '50%' }} 
              />
              <input 
                type="text" 
                placeholder="Start a post" 
                style={{ 
                  flex: 1, 
                  borderRadius: 20, 
                  border: '1px solid #e0e0e0', 
                  padding: '10px 16px',
                  fontSize: 14
                }} 
              />
            </div>
          </div>

          {/* Social Media Post */}
          <div style={{ 
            background: 'white', 
            borderRadius: 12, 
            padding: 20, 
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            border: '1px solid #e0e0e0'
          }}>
            {/* Post Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <img 
                src={user?.profile_pic || ctulogo} 
                alt="Profile" 
                style={{ width: 40, height: 40, borderRadius: '50%' }} 
              />
              <div>
                <div style={{ fontWeight: 'bold', fontSize: 14, color: '#333', textTransform: 'uppercase' }}>
                  {user?.name || 'LYKA BAUTISTA'}
                </div>
                <div style={{ fontSize: 12, color: '#666', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>3,000,000 Followers</span>
                  <span>•</span>
                  <span>2 d</span>
                  <span>🌐</span>
                </div>
              </div>
            </div>

            {/* Post Content */}
            <div style={{ fontSize: 14, color: '#333', marginBottom: 16, lineHeight: 1.5 }}>
              Lorem ipsum dolor sit amet. Quo asperiores enim ut veniam repudiandae eum quisquam voluptatem non dolore veritatis eos quia suscipit sed facere alias nam voluptate quia. Ut neque ipsam sed explicabo nemo ut sapiente consectetur qui omnis ducimus qui voluptatem iusto? Id enim quia quo quam consequatur sit nulla delectus aut accusamus velit est animi sint eos consequatur nemo sit facilis ipsam. Est dolores tenetur in dignissimos velit At rerum minus qui velit autern qui officia sint!
            </div>

            {/* Post Actions */}
            <div style={{ display: 'flex', gap: 24, fontSize: 13, color: '#666' }}>
              <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                ❤️ Like
              </span>
              <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                💬 Comment
              </span>
              <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                🔄 Repost
              </span>
            </div>
          </div>
        </div>

        {/* Bio Modal */}
      {bioModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: 24,
            borderRadius: 12,
            width: 400,
            maxWidth: '90%',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            position: 'relative'
          }}>
            <h3 style={{ marginBottom: 12 }}>Add Bio</h3>
            <textarea
              value={bioInput}
              onChange={e => setBioInput(e.target.value)}
              rows={4}
              style={{
                width: '100%',
                padding: 12,
                fontSize: 14,
                borderRadius: 8,
                border: '1px solid #ccc',
                marginBottom: 16
              }}
              placeholder="Enter your bio..."
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button
              onClick={() => setBioModalOpen(false)}
              style={{
                padding: '8px 16px',
                border: 'none',
                background: '#ccc',
                borderRadius: 6,
                cursor: 'pointer'
              }}
              disabled={bioLoading}
            >
              Cancel
            </button>
            {user?.profile_bio?.trim() && (
              <button
                onClick={handleDeleteBio}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  background: '#e74c3c',
                  color: 'white',
                  borderRadius: 6,
                  cursor: 'pointer'
                }}
                disabled={bioLoading}
              >
                {bioLoading ? 'Deleting...' : 'Delete Bio'}
              </button>
            )}
            <button
              onClick={handleSaveBio}
              style={{
                padding: '8px 16px',
                border: 'none',
                background: '#174f84',
                color: 'white',
                borderRadius: 6,
                cursor: 'pointer'
              }}
              disabled={bioLoading}
            >
              {bioLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
          </div>
        </div>
      )}
      </div>

      {/* Edit Profile Modal */}
      {editModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.18)', padding: 32, minWidth: 340, maxWidth: 480, width: '90%', position: 'relative' }}>
            <button onClick={() => setEditModalOpen(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }} title="Close">×</button>
            <h2 style={{ marginBottom: 16 }}>Edit Profile</h2>
            {/* Profile Pic */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600 }}>Profile Picture</label><br />
              <img src={editProfilePic || ctulogo} alt="Profile Preview" style={{ width: 80, height: 80, borderRadius: '50%', border: '2px solid #eee', margin: '8px 0' }} />
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <input type="file" accept="image/*" onChange={handleProfilePicChange} />
                <button onClick={handleRemoveProfilePic} style={{ background: '#eee', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>Remove</button>
              </div>
            </div>
            
            
            {/* Resume (PDF) - Feature coming soon */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setEditModalOpen(false)} style={{ background: '#eee', border: 'none', borderRadius: 6, padding: '8px 20px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSave} style={{ background: '#174f84', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', cursor: 'pointer' }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlumniProfile;