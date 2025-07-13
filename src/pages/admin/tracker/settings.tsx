import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import './Tracker.css';
import { fetchAlumniList, sendReminders } from '../../../services/api';

interface AlumniUser {
  id: number;
  name: string;
  email?: string;
  course?: string;
}

interface TrackerResponse {
  name: string;
  answers: Record<string, any>;
  user_id: number; // Added user_id to the interface
}

const fetchTrackerResponses = async () => {
  const response = await fetch('http://127.0.0.1:8000/api/tracker/list-responses/');
  return response.json();
};

const Settings: React.FC = () => {
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [alumni, setAlumni] = useState<AlumniUser[]>([]);
  const [responses, setResponses] = useState<TrackerResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch alumni users and tracker responses on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [alumniData, responseData] = await Promise.all([
          fetchAlumniList(),
          fetchTrackerResponses(),
        ]);
        setAlumni(alumniData.alumni || []);
        setResponses(responseData.responses || []);
      } catch (e) {
        setAlumni([]);
        setResponses([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Determine responded and not responded alumni by user_id
  const respondedIds = new Set(responses.map(r => r.user_id));
  const responded = alumni.filter(a => respondedIds.has(a.id));
  const notResponded = alumni.filter(a => !respondedIds.has(a.id));

  const handleSelectAll = () => {
    if (selectedUsers.length === notResponded.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(notResponded.map((_, idx) => idx));
    }
  };

  const handleToggleUser = (index: number) => {
    setSelectedUsers((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  // Editable message and title logic
  const [title, setTitle] = useState<string>('Please Fill Out the Tracker Form');
  const [editTitle, setEditTitle] = useState<string>(title);
  const [message, setMessage] = useState<string>(`Hi [User's Name],\n\nWe hope you're doing well! This is a gentle reminder to complete the required Tracker Form to help us keep everything on track and up to date.\n\nPlease take a few moments to fill it out by clicking the link below:\n👉 Fill Out the Tracker Form\n\nYour timely response is greatly appreciated and helps us stay aligned and organized.\nIf you have any questions or need assistance, feel free to reply to this message.\n\nThank you!\nBest regards,\nCCICT`);
  const [editMessage, setEditMessage] = useState<string>(message);
  const [editing, setEditing] = useState<boolean>(false);

  const handleSend = async () => {
    // Get selected users who haven't responded
    const selectedAlumni = notResponded
      .map((user, idx) => selectedUsers.includes(idx) ? user : null)
      .filter((user): user is AlumniUser => user !== null);

    if (selectedAlumni.length === 0) {
      alert('No users selected.');
      return;
    }

    let sent = 0;
    for (const user of selectedAlumni) {
      // Generate unique link
      const trackerLink = `${window.location.origin}/alumni/tracker?user_id=${user.id}`;
      // Debug log for user name
      console.log('Sending reminder to:', user.name, 'ID:', user.id);
      // Personalize message (replace all instances)
      let personalizedMsg = message.replace(/\[User's Name\]/g, user.name);
      // Replace the '👉 Fill Out the Tracker Form' line with a clickable link with the same text
      const linkHtml = `<a href='${trackerLink}' style='color:#1e4c7a;font-weight:600;text-decoration:underline;cursor:pointer;'>👉 Fill Out the Tracker Form</a>`;
      personalizedMsg = personalizedMsg.replace(
        '👉 Fill Out the Tracker Form',
        linkHtml
      );
      // Send reminder to this user
      const result = await sendReminders([user.id], personalizedMsg, title);
      if (result.success) sent += 1;
    }
    alert(`Reminders sent: ${sent} of ${selectedAlumni.length}`);
  };

  const handleEdit = () => {
    setEditTitle(title);
    setEditMessage(message);
    setEditing(true);
  };

  const handleCancel = () => {
    setEditMessage(message);
    setEditing(false);
  };

  const handleUpdate = () => {
    setTitle(editTitle);
    setMessage(editMessage);
    setEditing(false);
  };

  const handleMessageChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setEditMessage(e.target.value);
  };

  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
  const readOnlyTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea for editing
  useEffect(() => {
    if (editing && editTextareaRef.current) {
      editTextareaRef.current.style.height = 'auto';
      editTextareaRef.current.style.height = editTextareaRef.current.scrollHeight + 'px';
    }
    if (!editing && readOnlyTextareaRef.current) {
      readOnlyTextareaRef.current.style.height = 'auto';
      readOnlyTextareaRef.current.style.height = readOnlyTextareaRef.current.scrollHeight + 'px';
    }
  }, [editMessage, message, editing]);

  return (
    <div className="tracker-container">
      <div className="tracker-inner">
        {/* Editable Message Card */}
        <div className="card">
          <div className="message-header">
            {editing ? (
              <input
                type="text"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="form-title-input"
                style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}
              />
            ) : (
              <h3>{title}</h3>
            )}
            <button className="border-button" onClick={handleSend}>Send Form</button>
            {!editing && (
              <button className="button-edit" style={{ marginLeft: 8 }} onClick={handleEdit}>Edit</button>
            )}
          </div>
          <hr />
          {editing ? (
            <>
              <textarea
                ref={editTextareaRef}
                value={editMessage}
                onChange={handleMessageChange}
                className="message-textarea"
                style={{ resize: 'none' }}
              />
              <div style={{ marginTop: 8 }}>
                <button className="button-cancel" onClick={handleCancel} style={{ marginRight: 8 }}>Cancel</button>
                <button className="button-update" onClick={handleUpdate}>Update</button>
              </div>
            </>
          ) : (
            <textarea
              ref={readOnlyTextareaRef}
              value={message}
              readOnly
              className="message-textarea"
              style={{ background: '#f7fbff', color: '#164B87', cursor: 'default', pointerEvents: 'none', resize: 'none' }}
              tabIndex={-1}
            />
          )}
        </div>

        {/* Users Who Responded */}
        <div className="card">
          <div className="users-header">
            <h3>Users Who Responded</h3>
          </div>
          {loading ? (
            <div>Loading...</div>
          ) : responded.length === 0 ? (
            <div>No alumni have responded yet.</div>
          ) : (
            <table className="user-table">
              <thead>
                <tr>
                  <th>Account</th>
                  <th>Course</th>
                </tr>
              </thead>
              <tbody>
                {responded.map((user, index) => (
                  <tr key={index}>
                    <td>
                      <div className="user-info">
                        <img src="https://via.placeholder.com/32" alt="avatar" />
                        <div>
                          <strong>{user.name}</strong><br />
                          <span>{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>{user.course}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Users Who Haven't Responded */}
        <div className="card">
          <div className="users-header">
            <h3>Users Who Haven't Responded</h3>
            <button className="border-button" onClick={handleSelectAll}>
              {selectedUsers.length === notResponded.length ? 'Unselect All' : 'Select All'}
            </button>
          </div>
          {loading ? (
            <div>Loading...</div>
          ) : notResponded.length === 0 ? (
            <div>All alumni have responded.</div>
          ) : (
            <table className="user-table">
              <thead>
                <tr>
                  <th>Account</th>
                  <th>Course</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {notResponded.map((user, index) => (
                  <tr key={index}>
                    <td>
                      <div className="user-info">
                        <img src="https://via.placeholder.com/32" alt="avatar" />
                        <div>
                          <strong>{user.name}</strong><br />
                          <span>{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>{user.course}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(index)}
                        onChange={() => handleToggleUser(index)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
