import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchNotifications, followUser, unfollowUser, checkFollowStatus } from '../../services/api';
import AlumniTopBar from './AlumniTopBar';
import ctulogo from '../../images/ctulogo.png';
import './dashboard.css';

interface AlumniUser {
  name: string;
  course?: string;
  year_graduated?: string | number;
  profile_pic?: string;
  location?: string;
  university?: string;
}

interface Post {
  id: number;
  author: {
    name: string;
    profile_pic: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  reposts: number;
}

interface SuggestedUser {
  id: number;
  name: string;
  profile_pic: string;
  batch?: string | number;
  isFollowing?: boolean;
}

const AlumniDashboard: React.FC = () => {
  const [user, setUser] = useState<AlumniUser | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
  const [followLoading, setFollowLoading] = useState<{ [key: number]: boolean }>({});
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleFollow = async (userId: number) => {
    setFollowLoading(prev => ({ ...prev, [userId]: true }));
    try {
      const result = await followUser(userId);
      if (result.success) {
        setSuggestedUsers(prev => 
          prev.map(user => 
            user.id === userId 
              ? { ...user, isFollowing: true }
              : user
          )
        );
      }
    } catch (error) {
      console.error('Error following user:', error);
    } finally {
      setFollowLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleUnfollow = async (userId: number) => {
    setFollowLoading(prev => ({ ...prev, [userId]: true }));
    try {
      const result = await unfollowUser(userId);
      if (result.success) {
        setSuggestedUsers(prev => 
          prev.map(user => 
            user.id === userId 
              ? { ...user, isFollowing: false }
              : user
          )
        );
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
    } finally {
      setFollowLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userObj = JSON.parse(userStr);
      setUser(userObj);

      // Fetch users for "People you may know" excluding admin and current user
      fetch(`http://127.0.0.1:8000/api/users_list_view/?current_user_id=${userObj.id}`)
        .then((res) => res.json())
        .then(async (data) => {
          if (data.success) {
            const usersWithFollowStatus = await Promise.all(
              data.users.map(async (user: any) => {
                try {
                  const followStatus = await checkFollowStatus(user.id);
                  return {
                    ...user,
                    isFollowing: followStatus.is_following
                  };
                } catch (error) {
                  console.error('Error checking follow status:', error);
                  // If there's an authentication error, default to not following
                  return {
                    ...user,
                    isFollowing: false
                  };
                }
              })
            );
            setSuggestedUsers(usersWithFollowStatus);
          }
        })
        .catch((error) => {
          console.error('Error fetching users:', error);
        });
    } else {
      navigate('/login');
    }

    // Mock data for posts
    setPosts([
      {
        id: 1,
        author: {
          name: "Lorem ipsum dolor",
          profile_pic: "https://randomuser.me/api/portraits/men/32.jpg"
        },
        content: "Lorem ipsum dolor sit amet. Quo asperiores enim ut veniam repudiandae eum quisquam voluptatem non dolore veritatis eos quia suscipit sed facere alias nam voluptate quia. Ut neque ipsam sed explicabo nemo ut sapiente consectetur qui omnis ducimus qui voluptatem iusto? Id enim quia quo quam consequatur sit nulla delectus aut accusamus velit est animi sint eos consequatur nemo sit facilis ipsam. Est dolores tenetur in dignissimos velit At rerum minus qui velit autern qui officia sint!",
        timestamp: "2 d",
        likes: 24,
        comments: 8,
        reposts: 3
      },
      {
        id: 2,
        author: {
          name: "Lorem ipsum dolor",
          profile_pic: "https://randomuser.me/api/portraits/men/45.jpg"
        },
        content: "Lorem ipsum dolor sit amet. Quo asperiores enim ut veniam repudiandae eum quisquam voluptatem non dolore veritatis eos quia suscipit sed facere alias nam voluptate quia. Ut neque ipsam sed explicabo nemo ut sapiente consectetur qui omnis ducimus qui voluptatem iusto? Id enim quia quo quam consequatur sit nulla delectus aut accusamus velit est animi sint eos consequatur nemo sit facilis ipsam. Est dolores tenetur in dignissimos velit At rerum minus qui velit autern qui officia sint!",
        timestamp: "1 d",
        likes: 18,
        comments: 5,
        reposts: 2
      }
    ]);
  }, [navigate]);

  return (
    <div className="page-container">
      <AlumniTopBar 
        showProfile={showProfile} 
        setShowProfile={setShowProfile} 
        handleLogout={handleLogout} 
      />

      {/* Main Content */}
      <div className="main-content">
        {/* Left Sidebar */}
        <div className="left-sidebar">
          {/* Profile Card */}
          <div 
            className="profile-card"
            onClick={() => navigate('/alumni/profile')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {/* Orange Header Bar */}
            <div className="orange-header-bar"></div>
            
            {/* Profile Content */}
            <div className="profile-content">
              <img 
                src={user?.profile_pic ? `http://127.0.0.1:8000${user.profile_pic}` : ctulogo} 
                alt="Profile" 
                className="profile-image"
              />
              <div className="profile-name">
                {user?.name }
              </div>
              <div className="profile-university">
                {user?.university}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="quick-links">
            <div className="quick-link-card">
              {/* Orange Header Bar */}
              <div className="quick-link-orange-header"></div>
              
              {/* Content */}
              <div className="quick-link-content">
                <div className="quick-link-icon ccict-icon">
                  C
                </div>
                <div className="quick-link-text">CCICT</div>
              </div>
            </div>
            <div className="quick-link-card">
              {/* Orange Header Bar */}
              <div className="quick-link-orange-header"></div>
              
              {/* Content */}
              <div className="quick-link-content">
                <div className="quick-link-icon peso-icon">
                  ✱
                </div>
                <div className="quick-link-text">PESO</div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Content */}
        <div className="center-content">
          {/* Start a Post */}
          <div className="post-start">
            <div className="post-start-input-container">
              <img 
                src={user?.profile_pic ? `http://127.0.0.1:8000${user.profile_pic}` : ctulogo} 
                alt="Profile" 
                className="post-start-profile-image"
              />
              <input 
                type="text" 
                placeholder="Start a post" 
                className="post-start-input"
              />
            </div>
          </div>

          {/* Posts Feed */}
          {posts.map((post) => (
            <div key={post.id} className="post-feed-card">
              {/* Post Header */}
              <div className="post-header">
                <div className="post-header-left">
                   <img 
                    src={post.author.profile_pic ? (post.author.profile_pic.startsWith('http') ? post.author.profile_pic : `http://127.0.0.1:8000${post.author.profile_pic}`) : ctulogo} 
                    alt="Profile" 
                    className="post-header-profile-image"
                  />
                  <div>
                    <div className="post-author-info">{post.author.name}</div>
                    <div className="post-author-details">
                      <span>3,000,000 Followers</span>
                      <span>•</span>
                      <span>{post.timestamp}</span>
                      <span>🌐</span>
                    </div>
                  </div>
                </div>
                <button className="follow-button">
                  + Follow
                </button>
              </div>

              {/* Post Content */}
              <div className="post-content">
                {post.content} 
              </div>

              {/* Post Actions */}
              <div className="post-actions">
                <span className="post-action-item">
                  ❤️ Like
                </span>
                <span className="post-action-item">
                  💬 Comment
                </span>
                <span className="post-action-item">
                  🔄 Repost
                </span>
              </div>
            </div>
          ))}
        </div>

       {/* Right Sidebar */}
       <div className="right-sidebar">
          <div className="people-you-may-know-card">
            <div className="people-you-may-know-title">People you may know</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {suggestedUsers.length > 0 ? (
                suggestedUsers.map((user) => (
                  <div 
                    key={user.id} 
                    className="suggested-user-item"
                    onClick={() => navigate(`/alumni/profile/${user.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img
                      src={user.profile_pic ? `http://127.0.0.1:8000${user.profile_pic}` : ctulogo}
                      alt={user.name}
                      className="suggested-user-profile-image"
                    />
                    <div className="suggested-user-name">
                      {user.name} {user.batch ? `(${user.batch})` : ''}
                    </div>
                    <button 
                      className={`suggested-user-follow-button ${user.isFollowing ? 'following' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent navigation when clicking follow button
                        user.isFollowing ? handleUnfollow(user.id) : handleFollow(user.id);
                      }}
                      disabled={followLoading[user.id]}
                    >
                      {followLoading[user.id] ? '...' : user.isFollowing ? 'Unfollow' : 'Follow'}
                    </button>
                  </div>
                ))
              ) : (
                <div>No users to display</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniDashboard;
