import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AlumniTopBar from './AlumniTopBar';
import ctulogo from '../../images/ctulogo.png';
import './profile.css';
import { fetchFollowers, followUser, unfollowUser, checkFollowStatus } from '../../services/api';  // Import follow functions

interface AlumniUser {
  name: string;
  course?: string; 
  batch?: string | number;
  profile_pic?: string;
  profile_bio?: string;
  profile_resume?: string;
  location?: string;
  university?: string;
  resume?: string;
  // Add fields that might come from backend
  id?: number;
  ctu_id?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  year_graduated?: string | number;
}

const AlumniProfile: React.FC = () => {
  const [user, setUser] = useState<AlumniUser | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editProfilePic, setEditProfilePic] = useState<string | undefined>(user?.profile_pic);
  const [editBio, setEditBio] = useState<string>(user?.profile_bio|| '');
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  
  const [isOwnProfile, setIsOwnProfile] = useState(true);

  // Add followers state
  const [followers, setFollowers] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Load user data based on id param or localStorage user
  useEffect(() => {
    const loadUser = async () => {
      let userId = id;
      if (!userId) {
        // No id param, load logged-in user
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          navigate('/login');
          return;
        }
          const userObj = JSON.parse(userStr);
          userId = userObj.user_id || userObj.id;
          setIsOwnProfile(true);
      } else {
        setIsOwnProfile(false);
      }

      try {
        const res = await fetch(`http://127.0.0.1:8000/api/alumni/${userId}/`);
        if (res.ok) {
          const profile = await res.json();
          setUser(profile.alumni);
          setEditBio(profile.alumni.profile_bio || '');
          if (userId === (JSON.parse(localStorage.getItem('user') || '{}').user_id || JSON.parse(localStorage.getItem('user') || '{}').id)) {
            localStorage.setItem('user', JSON.stringify(profile.alumni));
          }
          // Determine numeric user id being viewed
          const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
          if (numericUserId !== undefined && numericUserId !== null && !isNaN(Number(numericUserId))) {
            // Followers list for the viewed profile
            fetchFollowers(Number(numericUserId))
              .then(data => {
                if (data.success && data.followers) {
                  setFollowers(data.followers);
                } else {
                  setFollowers([]);
                }
              })
              .catch(() => setFollowers([]));

            // Decide own vs other profile by comparing with logged-in user id
            const currentUserObj = JSON.parse(localStorage.getItem('user') || '{}');
            const currentId = currentUserObj.user_id || currentUserObj.id;
            const viewingOwn = Number(numericUserId) === Number(currentId);
            setIsOwnProfile(viewingOwn);

            // Fetch follow status only if viewing someone else's profile
            if (!viewingOwn) {
              checkFollowStatus(Number(numericUserId))
                .then(data => {
                  if (data.success) {
                    setIsFollowing(!!data.is_following);
                  }
                })
                .catch(error => {
                  console.error('Error checking follow status:', error);
                });
            }
          } else {
            setFollowers([]);
          }
        } else {
          alert('Failed to load profile.');
          if (userId === (JSON.parse(localStorage.getItem('user') || '{}').user_id || JSON.parse(localStorage.getItem('user') || '{}').id)) {
            navigate('/login');
          }
        }
      } catch (error) {
        alert('Network error: ' + error);
        if (userId === (JSON.parse(localStorage.getItem('user') || '{}').user_id || JSON.parse(localStorage.getItem('user') || '{}').id)) {
          navigate('/login');
        }
      }
    };
    loadUser();
  }, [id, navigate]);

  // Other existing state and handlers remain unchanged...


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
    const res = await fetch(`http://127.0.0.1:8000/api/resume/delete/?user_id=${userId}`, {
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

  const handleFollow = async () => {
    if (!id) return;
    setFollowLoading(true);
    try {
      console.log('Attempting to follow user:', id);
      const result = await followUser(parseInt(id));
      console.log('Follow result:', result);
      if (result.success) {
        setIsFollowing(true);
        console.log('Successfully followed user');
      } else {
        console.log('Follow failed:', result.message);
      }
    } catch (error) {
      console.error('Error following user:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (!id) return;
    setFollowLoading(true);
    try {
      console.log('Attempting to unfollow user:', id);
      const result = await unfollowUser(parseInt(id));
      console.log('Unfollow result:', result);
      if (result.success) {
        setIsFollowing(false);
        console.log('Successfully unfollowed user');
      } else {
        console.log('Unfollow failed:', result.message);
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
    } finally {
      setFollowLoading(false);
    }
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

  const handleRemoveProfilePic = async () => {
    const userObj = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = userObj.user_id || userObj.id;
    if (!userId) {
      alert('User ID not found. Please log in again.');
      return;
    }
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/alumni/profile/delete/?user_id=${userId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setEditProfilePic(undefined);
        setProfilePicFile(null);
        const updatedUser = { ...userObj, profile_pic: null };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        alert('Profile picture removed.');
      } else {
        const err = await res.json();
        alert('Failed to remove profile picture: ' + (err.message || 'Unknown error'));
      }
    } catch (error) {
      alert('Network error: ' + error);
    }
  };

// Call this on edit/save
const handleSave = async () => {
  if (!profilePicFile && !editBio) {
    alert('No changes to save.');
    return;
  }

  const userObj = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = userObj.user_id || userObj.id;
  if (!userId) {
    alert('User ID not found. Please log in again.');
    return;
  }

  const formData = new FormData();
  if (profilePicFile) {
    formData.append('profile_pic', profilePicFile);
  }
  formData.append('bio', editBio);

  try {
    const response = await fetch(`http://127.0.0.1:8000/api/alumni/profile/update/?user_id=${userId}`, {
      method: 'PUT',
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      const updatedUser = {
        ...userObj,
        ...data.user,
        profile_pic: data.user.profile_pic + '?t=' + new Date().getTime(), // force reload
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setEditModalOpen(false);
      setProfilePicFile(null);
      alert('Profile updated successfully.');
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
    <div className="profile-container">
      <AlumniTopBar 
        showProfile={showProfile} 
        setShowProfile={setShowProfile} 
        handleLogout={handleLogout} 
      />

      {/* Main Content */}
      <div className="profile-main-content">
        {/* Left Sidebar */}
        <div className="profile-left-sidebar">
          {/* Introduction */} 
          <div className="profile-card">
            <div className="profile-intro-title">Introduction</div>
            <div className="profile-bio-container">
             {/* Show bio if exists, otherwise show Add Bio button */}
          {user?.profile_bio?.trim() ? (
            <div className="profile-bio-text">
              <span>{user.profile_bio}</span>
              {isOwnProfile ? (
                <button
                  className="profile-bio-edit-btn"
                  onClick={() => {
                    setBioInput(user.profile_bio?.trim() || '');
                    setBioModalOpen(true);
                  }}
                >
                  Edit Bio
                </button>
              ) : null}
            </div>
          ) : (
            isOwnProfile ? (
              <button
                className="profile-add-bio-btn"
                onClick={() => setBioModalOpen(true)}
              >
                Add Bio
              </button>
            ) : null
          )}

{user?.profile_resume ? (
  <div className="profile-resume-wrapper">
    <a 
      href={`http://127.0.0.1:8000${user.profile_resume}`} 
      target="_blank" 
      rel="noopener noreferrer"
      className="profile-resume-link"
    >
      View Resume
    </a>
    {isOwnProfile ? (
      <button
        onClick={handleDeleteResume}
        className="profile-resume-delete-btn"
      >
        Delete Resume
      </button>
    ) : null}
  </div>
) : (
  isOwnProfile ? (
    <>
      <input type="file" accept="application/pdf" onChange={handleResumeChange} />
      <button
        onClick={handleSaveResume}
        className="profile-resume-upload-btn"
      >
        Upload Resume
      </button>
    </>
  ) : null
)}

            </div>
          </div>

          {/* Followers */}
          <div className="profile-followers-card">
            <div className="profile-followers-header">
              <div className="profile-followers-title">Followers</div>
              <div className="profile-followers-seeall">See all</div>
            </div>
            <div className="profile-followers-list">
              {followers.length === 0 ? (
                <div>No followers yet.</div>
              ) : (
                <>
                  {/* Render followers in rows of 3 */}
                  {Array.from({ length: Math.ceil(followers.length / 3) }).map((_, rowIndex) => (
                    <div key={rowIndex} className="profile-followers-row">
                      {followers.slice(rowIndex * 3, rowIndex * 3 + 3).map((follower) => (
                        <div 
                          key={follower.id} 
                          className="profile-follower-item"
                          onClick={() => navigate(`/alumni/profile/${follower.user_id}`)}
                          style={{ cursor: 'pointer' }}
                        >
                          <img
                            src={follower.profile_pic ? `http://127.0.0.1:8000${follower.profile_pic}` : ctulogo}
                            alt={follower.name}
                            className="profile-follower-img"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = ctulogo as unknown as string;
                            }}
                          />
                          <div className="profile-follower-name">{follower.name}</div>
                        </div>
                      ))}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

        </div>

        {/* Center Content */}
        <div className="profile-center-content">
          {/* Orange Banner */}
          <div className="profile-orange-banner">
          {isOwnProfile && (
            <div className="profile-edit-profile-button" onClick={handleEditProfile}>
              <span>Edit Profile</span>
              <span>✏️</span>
            </div>
          )}
        </div>
          {/* Profile Info Section */}
          <div className="profile-info-section">
            <div className="profile-info-card">
              <img 
                src={user?.profile_pic ? `http://127.0.0.1:8000${user.profile_pic}` : ctulogo}
                alt="Profile" 
                className="profile-image"
              />
              <div className="profile-name">
                {user?.name || 'Loading...'}
              </div>
              <div className="profile-university">
                {user?.course || 'Loading...'}
              </div>
              <div className="profile-other-actions-below-university">
                {!isOwnProfile && (
                  <button 
                    className={`profile-follow-button ${isFollowing ? 'following' : ''}`}
                    onClick={isFollowing ? handleUnfollow : handleFollow}
                    disabled={followLoading}
                  >
                    {followLoading ? '...' : isFollowing ? 'Unfollow' : 'Follow'}
                  </button>
                )}
                <button className="profile-message-button">Message</button>
              </div>
            </div>
          </div>

          {/* Start a Post */}
          {isOwnProfile && (
            <div className="profile-start-post-card">
              <div className="profile-start-post-input-container">
                <img 
                  src={user?.profile_pic ? `http://127.0.0.1:8000${user.profile_pic}` : ctulogo}
                  alt="Profile" 
                  className="profile-start-post-profile-image"
                />
                <input 
                  type="text" 
                  placeholder="Start a post" 
                  className="profile-start-post-input"
                />
              </div>
            </div>
          )}

          {/* Social Media Post */}
          <div className="profile-social-post-card">
            {/* Post Header */}
            <div className="profile-post-header">
              <img 
                src={user?.profile_pic ? (user.profile_pic.startsWith('http') ? user.profile_pic : `http://127.0.0.1:8000${user.profile_pic}`) : ctulogo} 
                alt="Profile" 
                className="profile-post-profile-image"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = ctulogo as unknown as string;
                }}
              />
              <div>
                <div className="profile-post-user-name">
                  {user?.name || 'ok'}
                </div>
                <div className="profile-post-meta">
                  <span>3,000,000 Followers</span>
                  <span>•</span>
                  <span>2 d</span>
                  <span>🌐</span>
                </div>
              </div>
            </div>

            {/* Post Content */}
            <div className="profile-post-content">
              Lorem ipsum dolor sit amet. Quo asperiores enim ut veniam repudiandae eum quisquam voluptatem non dolore veritatis eos quia suscipit sed facere alias nam voluptate quia. Ut neque ipsam sed explicabo nemo ut sapiente consectetur qui omnis ducimus qui voluptatem iusto? Id enim quia quo quam consequatur sit nulla delectus aut accusamus velit est animi sint eos consequatur nemo sit facilis ipsam. Est dolores tenetur in dignissimos velit At rerum minus qui velit autern qui officia sint!
            </div>

            {/* Post Actions */}
            <div className="profile-post-actions">
              <span className="profile-post-action-item">
                ❤️ Like
              </span>
              <span className="profile-post-action-item">
                💬 Comment
              </span>
              <span className="profile-post-action-item">
                🔄 Repost
              </span>
            </div>
          </div>
        </div>

        {/* Bio Modal */}
      {bioModalOpen && (
        <div className="profile-bio-modal-overlay">
          <div className="profile-bio-modal-content">
            <h3 className="profile-bio-modal-title">Add Bio</h3>
            <textarea
              value={bioInput}
              onChange={e => setBioInput(e.target.value)}
              rows={4}
              className="profile-bio-textarea"
              placeholder="Enter your bio..."
            />
            <div className="profile-bio-modal-buttons">
            <button
              onClick={() => setBioModalOpen(false)}
              className="profile-bio-cancel-btn"
              disabled={bioLoading}
            >
              Cancel
            </button>
            {user?.profile_bio?.trim() && (
              <button
                onClick={handleDeleteBio}
                className="profile-bio-delete-btn"
                disabled={bioLoading}
              >
                {bioLoading ? 'Deleting...' : 'Delete Bio'}
              </button>
            )}
            <button
              onClick={handleSaveBio}
              className="profile-bio-save-btn"
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
        <div className="profile-edit-modal-overlay">
          <div className="profile-edit-modal-content">
            <button onClick={() => setEditModalOpen(false)} className="profile-edit-modal-close-btn" title="Close">×</button>
            <h2 className="profile-edit-modal-title">Edit Profile</h2>
            {/* Profile Pic */}
            <div className="profile-edit-pic-section" style={{ marginBottom: 16 }}>
              <label className="profile-edit-pic-label">Profile Picture</label><br />
              <img src={editProfilePic || ctulogo} alt="Profile Preview" className="profile-edit-pic-preview" />
              <div className="profile-edit-pic-controls">
                <input type="file" accept="image/*" onChange={handleProfilePicChange} />
                <button onClick={handleRemoveProfilePic} className="profile-edit-pic-remove-btn">Remove</button>
              </div>
            </div>
            
            {/* Resume (PDF) - Feature coming soon */} 
            <div className="profile-edit-modal-buttons">
              <button onClick={() => setEditModalOpen(false)} className="profile-edit-modal-cancel-btn">Cancel</button>
              <button onClick={handleSave} className="profile-edit-modal-save-btn">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlumniProfile;
