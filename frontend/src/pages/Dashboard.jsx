import React, { useState, useEffect } from "react";
import StatCard from "../components/StatCard";
import { LuAward, LuBookOpen, LuClock4 } from "react-icons/lu";
import chatbot from "../assets/chatbot.png";
import trophy from "../assets/leaderboard-trophy.png";
import { FaArrowTrendUp } from "react-icons/fa6";
import AppLayout from "../components/AppLayout";
import ChatBox from "../components/ChatBox";
import "../assets/dashboard.css";

function Dashboard() {
  const [activeVideo, setActiveVideo] = useState(null);
  const [openChat, setOpenChat] = useState(false);
  const [user, setUser] = useState(null);
  
  // Stats from backend
  const [stats, setStats] = useState({
    totalHoursLearned: 0,
    totalCourses: 0,
    achievementsCount: 0,
    achievements: []
  });
  
  // Courses from backend
  const [courses, setCourses] = useState([]);

  // ANNOUNCEMENTS
  const [announcements] = useState([
    { text: "New batch starting soon", link: "https://example.com/batch" },
    { text: "Live classes updated", link: "https://example.com/live" },
    { text: "AI mentor improvements released", link: "https://example.com/ai" },
    { text: "Exams scheduled for next week", link: "https://example.com/exams" },
  ]);

  // UPCOMING CLASSES
  const upcoming = [
    { title: "Mathematics", date: "March 16, 1:00 PM", link: "https://www.youtube.com/embed/UCdxT4d8k5c" },
    { title: "Physics", date: "March 17, 10:00 AM", link: "https://www.youtube.com/embed/V76QPpoWVwA" },
    { title: "Chemistry", date: "March 18, 2:00 PM", link: "https://www.youtube.com/embed/tMHrpmJH5I8" },
  ];

  // LEADERBOARD
  const leaderboard = [
    { name: "Deepak", score: 845 },
    { name: "Shweta", score: 845 },
    { name: "Rahul", score: 820 },
  ];

  const firstName = user?.fullName ? user.fullName.split(' ')[0] : (user?.email ? user.email.split('@')[0] : 'User');
  const greeting = (
    <div>
      <h1 className="mb-1" style={{ color: "#1A365D", fontSize: "1.3rem" }}>
        Hello, {firstName}
      </h1>
      <p style={{ margin: 0, fontSize: "1.2rem", fontWeight: "400", color: "#758096" }}>
        Welcome back to your learning journey!
      </p>
    </div>
  );

  useEffect(() => {
    async function loadProfileAndStats() {
      try {
        const token = localStorage.getItem('token');
        const headers = {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        };

        // Load profile
        const profileRes = await fetch('/api/users/profile', { headers });
        if (profileRes.ok) {
          const userData = await profileRes.json();
          setUser(userData);
        }

        // Load stats
        const statsRes = await fetch('/api/users/stats', { headers });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        // Load courses
        const coursesRes = await fetch('/api/users/courses', { headers });
        if (coursesRes.ok) {
          const coursesData = await coursesRes.json();
          setCourses(coursesData.courses || []);
        }
      } catch (err) {
        console.warn('Could not load dashboard data', err);
      }
    }
    loadProfileAndStats();
  }, []);

  return (
    <AppLayout showGreeting={true} greetingContent={greeting}>
      {/* ============ STAT CARDS ============ */}
      <div className="stats">
        <StatCard title="Total Courses" value={stats.totalCourses} color2="#1D3E69" color1="#397ACF" IconComponent={LuBookOpen} />
        <StatCard title="Hours Learned" value={Math.round(stats.totalHoursLearned)} color1="#35AAAD" color2="#2B73B0" IconComponent={LuClock4} />
        <StatCard title="Achievements" value={stats.achievementsCount} color1="#46BA7D" color2="#3CB49F" IconComponent={LuAward} />
      </div>

      {/* ============ ANNOUNCEMENTS SCROLL ============ */}
      <div className="latest-announcement" style={{ background: "#d9e8feff", padding: "12px 0", margin: "20px 0", borderRadius: "10px", overflow: "hidden", whiteSpace: "nowrap" }}>
        <div style={{ display: "inline-block", paddingLeft: "100%", animation: "scroll-left 15s linear infinite", fontSize: "16px", fontWeight: "500", color: "#1A365D" }}>
          {announcements.map((a, index) => (
            <a key={index} href={a.link} target="_blank" rel="noopener noreferrer" style={{ marginRight: "30px", color: "#1A365D", textDecoration: "none", cursor: "pointer" }}>
              {a.text}
            </a>
          ))}
        </div>
      </div>

      {/* ============ MAIN GRID ============ */}
      <div className="main-grid">
        {/* ============ LEFT SECTION ============ */}
        <div className="left">
          {/* YOUR COURSES */}
          <div className="card" style={{ borderRadius: "15px", height: "auto", minHeight: "295px" }}>
            <div className="card-header bg-white" style={{ borderColor: "white" }}>
              <h3 className="fw-normal">Your Courses</h3>
              <button className="view-btn">View All</button>
            </div>
            {courses.length > 0 ? (
              courses.map((course) => (
                <div key={course._id} className="progress-item">
                  <div className="label">
                    <span>{course.title}</span>
                    <span>{Math.round(course.completionPercentage)}%</span>
                  </div>
                  <div className="progress-bar-dash">
                    <div className="progress-fill" style={{ width: `${course.completionPercentage}%` }} />
                  </div>
                </div>
              ))
            ) : (
              <p style={{ padding: "12px", textAlign: "center", color: "#999" }}>
                No courses enrolled yet. Explore courses to get started!
              </p>
            )}
          </div>

          {/* UPCOMING LIVE CLASSES */}
          <div className="card" style={{ borderRadius: "15px" }}>
            <h3 className="fw-normal upcoming-head">Upcoming Live Classes</h3>
            {upcoming.map((u) => (
              <div key={u.title} className="class-item fw-light">
                <div>
                  <h3 style={{ fontSize: "18px" }}>{u.title}</h3>
                  <p>{u.date}</p>
                </div>
                <button style={{ fontSize: "14px" }} onClick={() => setActiveVideo(u.link)}>
                  Join
                </button>
              </div>
            ))}
            {activeVideo && (
              <div style={{ marginTop: "15px" }}>
                <iframe width="100%" height="300" src={activeVideo} style={{ borderRadius: "10px" }} allow="autoplay; encrypted-media"></iframe>
              </div>
            )}
          </div>
        </div>

        {/* ============ RIGHT SECTION ============ */}
        <div className="right">
          {/* ASK KAVYA */}
          <div className="card ask-kavya" style={{ borderRadius: "15px" }}>
            <div className="tutor">
              <div className="round">
                <img src={chatbot} alt="ChatBot" height={113} width={113} />
              </div>
              <div className="content">
                <h6 className="text-white">Ask Kavya</h6>
                <p className="fw-light">AI Tutor</p>
              </div>
            </div>
            <p className="chat-message">
              Need help with your studies? Chat with Kavya, your personal AI tutor available 24/7.
            </p>

            <button onClick={() => setOpenChat(true)}>Start Chat</button>
          </div>

          {/* Show ChatBox when openChat is true */}
          {openChat && <ChatBox onClose={() => setOpenChat(false)} />}

          {/* LEADERBOARD */}
          <div className="card" style={{ borderRadius: "15px" }}>
            <div className="leaderboard-head">
              <h3 className="fw-normal">Leaderboard</h3>
              <img src={trophy} alt="Trophy" width={30} height={32} />
            </div>
            {leaderboard.map((l, i) => (
              <div key={l.name} className="leader-item">
                <span data-rank={i + 1}>{l.name}</span>
                <span>{l.score}</span>
              </div>
            ))}
          </div>

          {/* ACHIEVEMENTS */}
          <div className="card recent-achievements" style={{ borderRadius: "15px" }}>
            <h3>Recent Achievements</h3>
            <ul className="achievement-ul">
              {stats.achievements.length > 0 ? (
                stats.achievements.slice(0, 2).map((ach, i) => (
                  <li key={i} className="achievement-li">
                    <LuAward style={{ marginRight: "8px" }} />
                    <div>
                      <h4 className="achievement fw-normal">{ach.name}</h4>
                      <p className="achievement-p">{ach.description}</p>
                    </div>
                  </li>
                ))
              ) : (
                <li style={{ textAlign: "center", color: "#999", padding: "12px" }}>No achievements yet</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default Dashboard;
