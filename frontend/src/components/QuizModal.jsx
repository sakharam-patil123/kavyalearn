import React, { useState, useEffect } from 'react';
import { Lock, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../api';
import '../assets/quizModal.css';

const QuizModal = ({ courseId, onClose, enrollment }) => {
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
      const response = await api.get(`/quizzes/course/${courseId}/lock-status`);
      setQuizStatus(response.data);
      
      if (response.data.isUnlocked && !response.data.quizTaken) {
        // Fetch quiz questions
        const questionsResponse = await api.get(`/quizzes/${response.data.quizId}/questions`);
        setQuiz(questionsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching quiz status:', error);
      setQuizStatus(null);
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
    if (!quiz) return;

    const submissionAnswers = Object.entries(answers).map(([qIdx, optIdx]) => ({
      questionIndex: parseInt(qIdx),
      selectedOption: optIdx
    }));

    try {
      const response = await api.post(`/quizzes/${quizStatus.quizId}/submit`, {
        answers: submissionAnswers
      });

      setResult(response.data);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Error submitting quiz. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="quiz-modal-overlay">
        <div className="quiz-modal">
          <div className="quiz-loading">Loading...</div>
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
            <Lock size={64} className="lock-icon" />
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
            <CheckCircle size={64} className="check-icon" />
            <h2>Quiz Already Completed</h2>
            <div className="marks-display">
              <div className="marks-item">
                <span>Score:</span>
                <strong>{quizStatus.marks} / 100</strong>
              </div>
              <div className="marks-item">
                <span>Percentage:</span>
                <strong>{quizStatus.percentage}%</strong>
              </div>
              <div className="marks-item">
                <span>Status:</span>
                <strong className={quizStatus.status === 'passed' ? 'passed' : 'failed'}>
                  {quizStatus.status.toUpperCase()}
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
              <span>Duration: {quiz.duration} minutes</span>
              <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
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
              {isPassed ? <CheckCircle size={64} /> : <AlertCircle size={64} />}
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
