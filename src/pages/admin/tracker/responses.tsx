import React, { useState, useEffect } from 'react';
import './Tracker.css';

const Responses: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'summary' | 'view'>('summary');
  const [accepting, setAccepting] = useState<boolean>(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [responses, setResponses] = useState<any[]>([]);

  // Fetch categories (questions) and responses from backend
  useEffect(() => {
    const fetchData = async () => {
      const qRes = await fetch('http://127.0.0.1:8000/api/tracker/questions/');
      const qData = await qRes.json();
      setCategories(qData.categories || []);
      const rRes = await fetch('http://127.0.0.1:8000/api/tracker/list-responses/');
      const rData = await rRes.json();
      setResponses(rData.responses || []);
    };
    fetchData();
  }, []);

  // Flatten all questions for summary
  const allQuestions = categories.flatMap((cat: any) => cat.questions);

  // Calculate summary data for each question (except text questions)
  const getSummaryData = () => {
    return allQuestions
      .filter((q: any) => q.type !== 'text')
      .map((q: any) => {
        const counts: Record<string, number> = {};
        responses.forEach(res => {
          const ans = res.answers[String(q.id)];
          if (ans) {
            if (Array.isArray(ans)) {
              ans.forEach((a: string) => {
                counts[a] = (counts[a] || 0) + 1;
              });
            } else {
              counts[ans] = (counts[ans] || 0) + 1;
            }
          }
        });
        const total = Object.values(counts).reduce((a, b) => a + b, 0);
        return {
          question: q.text,
          options: (q.options || []).map((opt: string, idx: number) => ({
            label: opt,
            percent: total ? Math.round(((counts[opt] || 0) / total) * 100) : 0,
            count: counts[opt] || 0,
          })),
        };
      });
  };
  const summaryData = getSummaryData();

  return (
    <div className="tracker-container">
      <div className="tracker-inner">
        {/* Header */}
        <div className="card response-header-card">
          <div className="response-header">
            <h3>No. of Responses: {responses.length}</h3>
            <button
              className={`toggle-button ${accepting ? 'active' : 'inactive'}`}
              onClick={() => setAccepting(!accepting)}
            >
              {accepting ? 'Accepting Responses' : 'Not Accepting'}
            </button>
          </div>

          {/* Tabs */}
          <div className="response-tabs">
            <button
              className={activeTab === 'summary' ? 'active' : ''}
              onClick={() => setActiveTab('summary')}
            >
              Summary
            </button>
            <button
              className={activeTab === 'view' ? 'active' : ''}
              onClick={() => setActiveTab('view')}
            >
              View Responses
            </button>
          </div>
        </div>

        {/* Summary Tab */}
        {activeTab === 'summary' &&
          summaryData.map((q, index) => (
            <div key={index} className="card">
              <h3>{q.question}</h3>
              {q.options.map((opt: {label: string, count: number, percent: number}, idx: number) => (
                <div key={idx} className="bar-group">
                  <span>
                    {opt.label}: {opt.count} ({opt.percent}%)
                  </span>
                  <div className="bar-container">
                    <div
                      className="bar-fill"
                      style={{ width: `${opt.percent}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ))}

        {/* View Responses Tab */}
        {activeTab === 'view' &&
          responses.map((res, idx) => {
            // Get all keys in answers (including user fields and tracker questions)
            const allAnswerKeys = Object.keys(res.answers || {});
            // Show user fields first (sorted alphabetically for now)
            const userFieldKeys = allAnswerKeys.filter(k => [
              'First Name', 'Middle Name', 'Last Name', 'Gender', 'Birthdate', 'Phone Number', 'Address', 'Social Media', 'Civil Status', 'Age', 'Email', 'Program Name', 'Status'
            ].includes(k));
            const otherKeys = allAnswerKeys.filter(k => !userFieldKeys.includes(k));
            return (
              <div key={idx} className="card">
                <h3>{res.name}</h3>
                <ul>
                  {/* Show user fields first */}
                  {userFieldKeys.map((k, i) => (
                    <li key={i}>
                      <strong>{k}:</strong> {res.answers[k] ? res.answers[k] : <em>No answer</em>}
                    </li>
                  ))}
                  {/* Then show tracker question answers (by question text if available) */}
                  {otherKeys.map((k, i) => {
                    // Try to find the question text for this key (if it's a question ID)
                    const questionObj = allQuestions.find((q: any) => String(q.id) === k);
                    const label = questionObj ? questionObj.text : k;
                    return (
                      <li key={userFieldKeys.length + i}>
                        <strong>{label}:</strong> {Array.isArray(res.answers[k]) ? res.answers[k].join(', ') : (res.answers[k] ? res.answers[k] : <em>No answer</em>)}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Responses;
