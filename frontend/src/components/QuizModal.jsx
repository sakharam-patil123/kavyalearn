import React, { useState, useEffect } from 'react';
import api from '../api';
import '../assets/quizModal.css';

const QuizModal = ({ courseId, onClose, onSuccess }) => {
  const [quizStatus, setQuizStatus] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  useEffect(() => {
    fetchQuizStatus();
  }, [courseId]);

  const fetchQuizStatus = async () => {
    try {
      console.log('[QuizModal] Fetching quiz status for courseId:', courseId);
      const response = await api.get(`/api/quiz/course/${courseId}/lock-status`);
      console.log('[QuizModal] Quiz status response:', response.data);
      setQuizStatus(response.data);
      
      if (response.data.isUnlocked && !response.data.quizTaken) {
        // Fetch quiz questions
        console.log('[QuizModal] Fetching quiz questions for quizId:', response.data.quizId);
        const quizResponse = await api.get(`/api/quiz/${response.data.quizId}`);
        console.log('[QuizModal] Quiz questions received:', quizResponse.data);
        setQuiz(quizResponse.data);
      }
    } catch (error) {
      console.error('[QuizModal] Error fetching quiz status:', error.response?.data || error.message);
      setQuizStatus({ 
        error: error.response?.data?.message || 'Error loading quiz',
        isError: true 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!quiz || !quizStatus) return;

    const submissionAnswers = Object.entries(answers).map(([qIdx, optIdx]) => ({
      questionIndex: parseInt(qIdx),
      selectedOption: optIdx
    }));

    try {
      const response = await api.post(`/api/quiz/${quizStatus.quizId}/submit-and-store`, {
        answers: submissionAnswers
      });

      setResult(response.data);
      setSubmitted(true);
      
      // Notify parent that quiz was submitted successfully
      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Error submitting quiz: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div className="quiz-modal-overlay">
        <div className="quiz-modal">
          <div className="quiz-loading">Loading quiz...</div>
        </div>
      </div>
    );
  }

  // Quiz is locked
  if (quizStatus && quizStatus.isLocked) {
    return (
      <div className="quiz-modal-overlay">
        <div className="quiz-modal quiz-locked">
          <button className="quiz-close" onClick={onClose}>✕</button>
          <div className="quiz-locked-content">
            <div style={{ fontSize: '48px', marginBottom: 16 }}>🔒</div>
            <h2>Quiz Locked</h2>
            <p>Complete all course lessons to unlock this quiz.</p>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${quizStatus.coursePerformance}%` }}
              />
            </div>
            <p className="progress-text">
              Course Progress: {quizStatus.coursePerformance}% / {quizStatus.requiredPerformance}%
            </p>
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (quizStatus && quizStatus.isError) {
    return (
      <div className="quiz-modal-overlay">
        <div className="quiz-modal quiz-locked">
          <button className="quiz-close" onClick={onClose}>✕</button>
          <div className="quiz-locked-content" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: 16 }}>⚠️</div>
            <h2>Error</h2>
            <p>{quizStatus.error || 'Failed to load quiz'}</p>
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz is locked
  if (quizStatus && quizStatus.isLocked) {
    return (
      <div className="quiz-modal-overlay">
        <div className="quiz-modal quiz-locked">
          <button className="quiz-close" onClick={onClose}>✕</button>
          <div className="quiz-locked-content">
            <div style={{ fontSize: '48px', marginBottom: 16 }}>🔒</div>
            <h2>Quiz Locked</h2>
            <p>Complete all course lessons to unlock this quiz.</p>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${quizStatus.coursePerformance}%` }}
              />
            </div>
            <p className="progress-text">
              Course Progress: {quizStatus.coursePerformance}% / {quizStatus.requiredPerformance}%
            </p>
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz already taken
  if (quizStatus && quizStatus.quizTaken) {
    return (
      <div className="quiz-modal-overlay">
        <div className="quiz-modal quiz-completed">
          <button className="quiz-close" onClick={onClose}>✕</button>
          <div className="quiz-completed-content">
            <div className="check-icon">
              <i className="bi bi-check-circle-fill" style={{ fontSize: '48px', color: '#48bb78' }}></i>
            </div>
            <h2>Quiz Already Completed</h2>
            <div className="marks-display">
              <div className="marks-item">
                <span>Score:</span>
                <strong>{quizStatus.marks} marks</strong>
              </div>
              <div className="marks-item">
                <span>Percentage:</span>
                <strong>{quizStatus.percentage}%</strong>
              </div>
              <div className="marks-item">
                <span>Status:</span>
                <strong className={quizStatus.status === 'passed' ? 'passed' : 'failed'}>
                  {quizStatus.status?.toUpperCase() || 'N/A'}
                </strong>
              </div>
            </div>
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz ready to take
  if (quiz && !submitted) {
    const question = quiz.questions[currentQuestion];
    const isLastQuestion = currentQuestion === quiz.questions.length - 1;

    return (
      <div className="quiz-modal-overlay">
        <div className="quiz-modal quiz-active">
          <button className="quiz-close" onClick={onClose}>✕</button>
          <div className="quiz-header">
            <h2>{quiz.title}</h2>
            <div className="quiz-meta">
              <span>Total Marks: {quiz.totalMarks}</span>
              <span>Q {currentQuestion + 1} of {quiz.questions.length}</span>
            </div>
          </div>

          <div className="quiz-question">
            <h3>{question.question}</h3>
            <div className="quiz-options">
              {question.options.map((option, idx) => (
                <label key={idx} className="quiz-option">
                  <input
                    type="radio"
                    name={`question-${currentQuestion}`}
                    checked={answers[currentQuestion] === idx}
                    onChange={() => handleAnswerSelect(currentQuestion, idx)}
                  />
                  <span className="option-text">{option.text}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="quiz-navigation">
            <button
              className="btn btn-secondary"
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
            >
              Previous
            </button>
            {isLastQuestion ? (
              <button
                className="btn btn-primary"
                onClick={handleSubmitQuiz}
              >
                Submit Quiz
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => setCurrentQuestion(currentQuestion + 1)}
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Quiz results
  if (submitted && result) {
    const isPassed = result.passed;

    return (
      <div className="quiz-modal-overlay">
        <div className="quiz-modal quiz-results">
          <button className="quiz-close" onClick={onClose}>✕</button>
          <div className="quiz-results-content">
            <div className={`results-status ${isPassed ? 'passed' : 'failed'}`}>
              {isPassed ? 
                <i className="bi bi-check-circle-fill" style={{ fontSize: '48px', color: '#48bb78' }}></i>
                : 
                <i className="bi bi-exclamation-circle-fill" style={{ fontSize: '48px', color: '#e53e3e' }}></i>
              }
              <h2>{isPassed ? 'Congratulations!' : 'Needs Improvement'}</h2>
            </div>

            <div className="results-summary">
              <div className="result-item">
                <span>Your Score:</span>
                <strong>{result.score} / {result.totalMarks}</strong>
              </div>
              <div className="result-item">
                <span>Percentage:</span>
                <strong>{result.percentage}%</strong>
              </div>
              <div className="result-item">
                <span>Passing Score:</span>
                <strong>{result.passingPercentage}%</strong>
              </div>
            </div>

            <button className="btn btn-primary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default QuizModal;
