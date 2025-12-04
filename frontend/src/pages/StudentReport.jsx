import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import AppLayout from '../components/AppLayout';
import { useNavigate } from 'react-router-dom';
import './StudentReport.css';

const StudentReport = () => {
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkEmail, setLinkEmail] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState('');

  useEffect(() => {
    // Check if user is parent (robust: try explicit 'userRole' first, then fallback to stored `user` object)
    let userRole = localStorage.getItem('userRole');
    if (!userRole) {
      try {
        const stored = JSON.parse(localStorage.getItem('user'));
        userRole = stored?.role || null;
      } catch (e) {
        userRole = null;
      }
    }

    // If not a parent, redirect to dashboard. If role cannot be determined, don't redirect immediately — try fetching children once.
    if (userRole && userRole !== 'parent') {
      navigate('/dashboard');
      return;
    }

    // Attempt to fetch children for parent (if any)
    fetchChildren();
  }, [navigate]);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/api/reports/children');
      setChildren(response.data.children || []);
      setError('');
    } catch (err) {
      setError('Failed to fetch children list');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentReport = async (studentId) => {
    try {
      setLoading(true);
      const response = await axiosClient.get(`/api/reports/student/${studentId}`);
      setReportData(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch student report');
      console.error(err);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleChildSelect = (child) => {
    setSelectedChild(child);
    fetchStudentReport(child._id);
  };

  const handleSearchStudents = async (email) => {
    setLinkEmail(email);
    if (email.length < 2) {
      setSearchResults([]);
      setLinkError('');
      return;
    }

    try {
      setLinkLoading(true);
      setLinkError('');
      console.log('Searching for students with email:', email);
      
      const response = await axiosClient.get('/api/reports/search-students', {
        params: { email: email.trim() }
      });
      
      console.log('Search response:', response.data);
      setSearchResults(response.data.students || []);
      
      if (!response.data.students || response.data.students.length === 0) {
        setLinkError(`No students found with email "${email}". Make sure the student account is registered.`);
      }
    } catch (err) {
      console.error('Search error details:', err.response?.data || err.message);
      setLinkError(err.response?.data?.message || 'Failed to search students. Please try again.');
      setSearchResults([]);
    } finally {
      setLinkLoading(false);
    }
  };

  const handleLinkStudent = async (studentId) => {
    try {
      setLinkLoading(true);
      await axiosClient.post('/api/reports/add-child', {
        childEmail: searchResults.find(s => s._id === studentId)?.email
      });
      setLinkError('');
      setLinkEmail('');
      setSearchResults([]);
      setShowLinkModal(false);
      fetchChildren();
      alert('Student linked successfully!');
    } catch (err) {
      setLinkError(err.response?.data?.message || 'Failed to link student');
      console.error(err);
    } finally {
      setLinkLoading(false);
    }
  };

  const handleRemoveChild = async (childId) => {
    if (window.confirm('Are you sure you want to remove this student?')) {
      try {
        await axiosClient.delete(`/api/reports/remove-child/${childId}`);
        fetchChildren();
        if (selectedChild?._id === childId) {
          setSelectedChild(null);
          setReportData(null);
        }
      } catch (err) {
        setError('Failed to remove student');
        console.error(err);
      }
    }
  };

  return (
    <AppLayout>
      <div className="student-report-container">
        <h2>Student Report Card</h2>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="report-layout">
          {/* Children List Sidebar */}
          <div className="children-list">
            <div className="list-header">
              <h3>Select Student</h3>
              <button className="link-btn" onClick={() => setShowLinkModal(true)}>
                + Link Student
              </button>
            </div>
            {children.length === 0 ? (
              <p className="no-children">No students linked yet. Click "Link Student" to add one.</p>
            ) : (
              <div className="children-items">
                {children.map(child => (
                  <div key={child._id} className="child-item-wrapper">
                    <button
                      className={`child-item ${selectedChild?._id === child._id ? 'active' : ''}`}
                      onClick={() => handleChildSelect(child)}
                    >
                      {child.avatar && (
                        <img src={child.avatar} alt={child.fullName} className="child-avatar-sm" />
                      )}
                      <div className="child-info">
                        <span className="child-name">{child.fullName}</span>
                        <span className="child-email">{child.email}</span>
                      </div>
                    </button>
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveChild(child._id)}
                      title="Remove student"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Report Card Section */}
          <div className="report-card-section">
            {loading && (
              <div className="loading">Loading report...</div>
            )}

            {reportData && !loading && (
              <div className="report-card">
                {/* Student Info */}
                <div className="student-info-section">
                  <div className="info-header">
                    {reportData.student.avatar && (
                      <img src={reportData.student.avatar} alt="avatar" className="student-avatar" />
                    )}
                    <div className="student-details">
                      <h3>{reportData.student.fullName}</h3>
                      <p className="email">{reportData.student.email}</p>
                      {reportData.student.phone && <p className="phone">{reportData.student.phone}</p>}
                    </div>
                  </div>
                </div>

                {/* Statistics Overview */}
                <div className="statistics">
                  <div className="stat-card">
                    <h4>Enrolled Courses</h4>
                    <p className="stat-value">{reportData.statistics.totalEnrollments}</p>
                  </div>
                  <div className="stat-card">
                    <h4>Completed Courses</h4>
                    <p className="stat-value">{reportData.statistics.completedCourses}</p>
                  </div>
                  <div className="stat-card">
                    <h4>Average Quiz Score</h4>
                    <p className="stat-value">{reportData.statistics.averageQuizScore}%</p>
                  </div>
                  <div className="stat-card">
                    <h4>Passed Quizzes</h4>
                    <p className="stat-value">{reportData.statistics.passedQuizzes}/{reportData.statistics.totalQuizzes}</p>
                  </div>
                </div>

                {/* Enrolled Courses */}
                <div className="enrollments-section">
                  <h4>Enrolled Courses</h4>
                  {reportData.enrollments.length === 0 ? (
                    <p>No courses enrolled</p>
                  ) : (
                    <div className="enrollments-list">
                      {reportData.enrollments.map(enrollment => (
                        <div key={enrollment._id} className="enrollment-item">
                          <div className="course-header">
                            <h5>{enrollment.courseTitle}</h5>
                            <span className={`completion-badge ${enrollment.completed ? 'completed' : 'in-progress'}`}>
                              {enrollment.completed ? 'Completed' : 'In Progress'}
                            </span>
                          </div>
                          <p className="course-description">{enrollment.courseDescription}</p>
                          <div className="course-stats">
                            <span>Category: {enrollment.courseCategory}</span>
                            <span>Progress: {enrollment.progressPercentage}%</span>
                            <span>Watch Hours: {enrollment.watchHours}h</span>
                            {enrollment.grade && <span>Grade: {enrollment.grade}</span>}
                          </div>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${enrollment.progressPercentage}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quiz Scores */}
                <div className="quiz-scores-section">
                  <h4>Quiz Scores</h4>
                  {reportData.quizScores.length === 0 ? (
                    <p>No quiz attempts</p>
                  ) : (
                    <div className="quiz-scores-list">
                      {reportData.quizScores.map((quiz, idx) => (
                        <div key={idx} className={`quiz-item ${quiz.status}`}>
                          <div className="quiz-header">
                            <h5>{quiz.quizTitle}</h5>
                            <span className={`status-badge ${quiz.status}`}>
                              {quiz.status === 'passed' ? '✓ Passed' : '✗ Failed'}
                            </span>
                          </div>
                          <div className="quiz-details">
                            <span>Score: <strong>{quiz.score}/{quiz.totalMarks}</strong></span>
                            <span>Percentage: <strong>{quiz.percentage}%</strong></span>
                            <span>Date: {new Date(quiz.completedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {!selectedChild && !loading && (
              <div className="no-selection">
                <p>Select a student to view their report card</p>
              </div>
            )}
          </div>
        </div>

        {/* Link Student Modal */}
        {showLinkModal && (
          <div className="modal-overlay" onClick={() => setShowLinkModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Link Student</h3>
                <button className="modal-close" onClick={() => setShowLinkModal(false)}>×</button>
              </div>

              {linkError && <div className="error-message">{linkError}</div>}

              <div className="modal-body">
                <input
                  type="email"
                  placeholder="Search by student email..."
                  value={linkEmail}
                  onChange={(e) => handleSearchStudents(e.target.value)}
                  className="search-input"
                />

                {linkLoading && <div className="searching">Searching...</div>}

                {searchResults.length > 0 && (
                  <div className="search-results">
                    {searchResults.map(student => (
                      <div key={student._id} className="search-result-item">
                        <div className="result-info">
                          {student.avatar && (
                            <img src={student.avatar} alt={student.fullName} className="result-avatar" />
                          )}
                          <div>
                            <h5>{student.fullName}</h5>
                            <p>{student.email}</p>
                          </div>
                        </div>
                        {student.isLinked ? (
                          <span className="linked-badge">Already Linked</span>
                        ) : (
                          <button
                            className="link-action-btn"
                            onClick={() => handleLinkStudent(student._id)}
                            disabled={linkLoading}
                          >
                            Link
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {linkEmail.length > 0 && searchResults.length === 0 && !linkLoading && (
                  <p className="no-results">No students found</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default StudentReport;
