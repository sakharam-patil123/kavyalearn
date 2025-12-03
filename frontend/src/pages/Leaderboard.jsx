import {
  Trophy,
  Crown,
  TrendingUp,
  TrendingDown,
  Award,
  Star,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/leaderboard.css";
import AppLayout from "../components/AppLayout";

const achievements = [
  { icon: Crown, label: "Top Performer", color: "#fbbf24" },
  { icon: TrendingUp, label: "Fast Learner", color: "#60a5fa" },
  { icon: Award, label: "Consistent", color: "#4ade80" },
  { icon: Star, label: "High Scorer", color: "#60a5fa" },
];

// ==========================================

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState("Overall");
  const [selectedRank, setSelectedRank] = useState(null);
  const [, setLeaderboardHover] = useState(false);
  const [topPerformersHover, setTopPerformersHover] = useState(false);
  const [fullRankingsHover, setFullRankingsHover] = useState(false);
  const [yourRankingHover, setYourRankingHover] = useState(false);
  const [achievementsHover, setAchievementsHover] = useState(false);
  const [challengeHover, setChallengeHover] = useState(false);
  const [motivationHover, setMotivationHover] = useState(false);
  const [topPerformers] = useState([
    { rank: 1, fullName: "Carol Davis", completedCourses: 10 },
    { rank: 2, fullName: "Alice Johnson", completedCourses: 8 },
    { rank: 3, fullName: "Bob Smith", completedCourses: 6 },
  ]);

  const [fullRankings] = useState([
    { rank: 1, _id: '1', fullName: 'Carol Davis', completedCourses: 10, completionPercentage: 100, avgQuizScore: 92 },
    { rank: 2, _id: '2', fullName: 'Alice Johnson', completedCourses: 8, completionPercentage: 100, avgQuizScore: 88 },
    { rank: 3, _id: '3', fullName: 'Bob Smith', completedCourses: 6, completionPercentage: 100, avgQuizScore: 85 },
    { rank: 4, _id: '4', fullName: 'David Wilson', completedCourses: 4, completionPercentage: 100, avgQuizScore: 78 },
    { rank: 5, _id: '5', fullName: 'Eva Martinez', completedCourses: 0, completionPercentage: 0, avgQuizScore: 0 },
  ]);

  const [userRanking] = useState({ rank: 5, completedCourses: 0, totalEnrollments: 1, completionPercentage: 0, avgQuizScore: 0 });
  const loading = false;
  const error = null;

  const interactiveStyle = {
    transition: "all 0.3s ease-in-out",
    cursor: "pointer",
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06)",
  };

  const hoverEffect = {
    transform: "translateY(-2px)",
    boxShadow:
      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.05)",
  };

  const tabs = ["Overall", "This Month", "This Week", "My Courses"];

  const navigate = useNavigate();

  // Get initials from full name
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get colors for rank badges
  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return "#1e3a5f";
      case 2:
        return "#3b6ea5";
      case 3:
        return "#4ca89a";
      default:
        return "#6b7280";
    }
  };

  const renderLeaderboardContent = () => {
    if (loading) {
      return (
        <div className="content-grid">
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px" }}>
            <p style={{ fontSize: "18px", color: "#666" }}>Loading leaderboard data...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="content-grid">
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px" }}>
            <p style={{ fontSize: "18px", color: "#dc2626" }}>{error}</p>
          </div>
        </div>
      );
    }

    if (activeTab === "Overall") {
      return (
        <div className="content-grid">
          <div className="left-column">
            {/* --- Top Performers --- */}
            <div
              className="top-performers-card"
              style={{
                ...interactiveStyle,
                ...(topPerformersHover ? hoverEffect : {}),
              }}
              onMouseEnter={() => setTopPerformersHover(true)}
              onMouseLeave={() => setTopPerformersHover(false)}
            >
              <h2 className="section-title">Top Performers</h2>

              <div className="podium">
                {topPerformers.length > 0 ? (
                  topPerformers.map((performer) => (
                    <div
                      key={performer.rank}
                      className={`podium-item podium-rank-${performer.rank}`}
                      onClick={() => navigate("/profile", { state: { user: performer } })}
                      style={{ cursor: "pointer" }}
                    >
                      <div
                        className="podium-avatar"
                        style={{ backgroundColor: getRankColor(performer.rank) }}
                      >
                        {performer.rank === 1 && (
                          <Crown
                            className="crown-icon"
                            size={24}
                            style={{ marginBottom: "8px" }}
                          />
                        )}
                        <span
                          className={`rank-number ${
                            performer.rank === 1 ? "rank-number-1st" : ""
                          }`}
                        >
                          {performer.rank === 1
                            ? "1st"
                            : performer.rank === 2
                            ? "2nd"
                            : "3rd"}
                        </span>
                      </div>

                      <div className="podium-name">{performer.fullName}</div>
                      <div className="podium-points">{performer.completedCourses} courses</div>

                      <div
                        className="podium-bar"
                        style={{ backgroundColor: getRankColor(performer.rank) }}
                      ></div>
                    </div>
                  ))
                ) : (
                  <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "20px" }}>
                    <p style={{ color: "#666" }}>No performers yet</p>
                  </div>
                )}
              </div>
              </div>

            {/* --- Full Rankings --- */}
            <div
              className="full-rankings-card"
              style={{
                ...interactiveStyle,
                ...(fullRankingsHover ? hoverEffect : {}),
              }}
              onMouseEnter={() => setFullRankingsHover(true)}
              onMouseLeave={() => setFullRankingsHover(false)}
            >
              <h2 className="section-title">Full Rankings</h2>

              <div className="rankings-list">
                {fullRankings.length > 0 ? (
                  fullRankings.map((user) => (
                    <div
                      key={user._id}
                      className={`ranking-item ${
                        selectedRank === user.rank ? "ranking-selected" : ""
                      }`}
                      style={
                        selectedRank === user.rank
                          ? { border: "1px solid black" }
                          : {}
                      }
                      onClick={() => {
                        setSelectedRank(user.rank);
                        navigate("/profile", { state: { user } });
                      }}
                    >
                      <div className="ranking-rank">{user.rank}</div>

                      <div
                        className="ranking-avatar"
                        style={{
                          backgroundColor: getRankColor(user.rank),
                        }}
                      >
                        {getInitials(user.fullName)}
                      </div>

                      <div className="ranking-info">
                        <div className="ranking-name">{user.fullName}</div>

                        <div className="ranking-stats">
                          {user.completedCourses} courses · {user.completionPercentage}%
                          completion · {user.avgQuizScore}% avg score
                        </div>
                      </div>

                      <div className="ranking-points">{user.completedCourses}</div>

                      {user.completedCourses > 0 ? (
                        <TrendingUp
                          className="ranking-trend trend-up"
                          size={20}
                        />
                      ) : (
                        <TrendingDown
                          className="ranking-trend trend-down"
                          size={20}
                        />
                      )}
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
                    No ranking data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* --- Right Column --- */}
          <div className="right-column">
            {/* Your Ranking */}
            <div
              className="your-ranking-card"
              style={{
                ...interactiveStyle,
                ...(yourRankingHover ? hoverEffect : {}),
              }}
              onMouseEnter={() => setYourRankingHover(true)}
              onMouseLeave={() => setYourRankingHover(false)}
            >
              <div className="your-ranking-header">
                <span>Your Ranking</span>
                <Trophy size={24} />
              </div>

              <div className="your-ranking-badge">
                <div className="ranking-circle">
                  {userRanking?.rank || "-"}
                </div>
              </div>

              <div className="your-ranking-points">{userRanking?.completedCourses || 0}</div>
              <div className="your-ranking-label">Courses Completed</div>

              <div className="your-ranking-stats">
                <div className="stat-row">
                  <span>Total Enrolled</span>
                  <span className="stat-value">{userRanking?.totalEnrollments || 0}</span>
                </div>
                <div className="stat-row">
                  <span>Completion %</span>
                  <span className="stat-value">{userRanking?.completionPercentage || 0}%</span>
                </div>
                <div className="stat-row">
                  <span>Avg Quiz Score</span>
                  <span className="stat-value">{userRanking?.avgQuizScore || 0}%</span>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div
              className="achievements-card"
              style={{
                ...interactiveStyle,
                ...(achievementsHover ? hoverEffect : {}),
              }}
              onMouseEnter={() => setAchievementsHover(true)}
              onMouseLeave={() => setAchievementsHover(false)}
            >
              <h3 className="section-title">Your Achievements</h3>

              <div className="achievements-list">
                {achievements.map((achievement, index) => (
                  <div key={index} className="achievement-item">
                    <achievement.icon
                      className="achievement-icon"
                      size={20}
                      style={{ color: achievement.color }}
                    />
                    <span>{achievement.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Challenge */}
            <div
              className="challenge-card"
              style={{
                ...interactiveStyle,
                ...(challengeHover ? hoverEffect : {}),
              }}
              onMouseEnter={() => setChallengeHover(true)}
              onMouseLeave={() => setChallengeHover(false)}
            >
              <h3 className="section-title">Weekly Challenge</h3>

              <div className="challenge-item">
                <div className="challenge-label-row">
                  <div>Complete 5 Courses</div>
                  <div className="challenge-progress-value">3/5</div>
                </div>

                <div className="challenge-progress-bar">
                  <div
                    className="challenge-progress-fill"
                    style={{ width: "60%", backgroundColor: "#4ade80" }}
                  ></div>
                </div>
              </div>

              <div className="challenge-item">
                <div className="challenge-label-row">
                  <div>Study 10 Hours</div>
                  <div className="challenge-progress-value">7/10</div>
                </div>

                <div className="challenge-progress-bar">
                  <div
                    className="challenge-progress-fill"
                    style={{ width: "70%", backgroundColor: "#3b82f6" }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Motivation */}
            <div
              className="motivation-card"
              style={{
                ...interactiveStyle,
                ...(motivationHover ? hoverEffect : {}),
              }}
              onMouseEnter={() => setMotivationHover(true)}
              onMouseLeave={() => setMotivationHover(false)}
            >
              <Star className="motivation-icon" size={24} />
              <h4 className="motivation-title">Keep Going!</h4>
              <p className="motivation-text">
                You're just 50 points away from overtaking the 2nd position.
                Keep up the great work!
              </p>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <AppLayout showGreeting={false}>
      <div
        className="leaderboard-container"
        onMouseEnter={() => setLeaderboardHover(true)}
        onMouseLeave={() => setLeaderboardHover(false)}
      >
        <div className="leaderboard-header">
          <Trophy className="header-icon" size={40} />

          <div>
            <h1 className="header-title">Leaderboard</h1>
            <p className="header-subtitle">
              Compete with peers and track your progress
            </p>
          </div>
        </div>

        {/* TABS */}
        <div className="filter-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`tab ${activeTab === tab ? "tab-active" : ""}`}
              onClick={() => {
                // For month/week tabs, navigate straight to Profile page
                if (tab === "This Month" || tab === "This Week") {
                  navigate("/profile");
                  setActiveTab(tab);
                  return;
                }

                // For 'My Courses' tab, navigate to courses page
                if (tab === "My Courses") {
                  navigate("/courses");
                  setActiveTab(tab);
                  return;
                }

                setActiveTab(tab);
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        {renderLeaderboardContent()}
      </div>
    </AppLayout>
  );
}
