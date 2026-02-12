import { useState } from "react";
import "./assest.css";

export default function Assessment() {
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [isChapterOpen, setIsChapterOpen] = useState(true);

  return (
    <div className="assessment-wrapper">
      {/* Top header */}
      <div className="assessment-header">
        <div className="logo">
          <img src="/logo.svg" alt="Classpedia logo" />
        </div>

     

        <div className="header-right">
          <div className="top-btns">
            <div className="search">
              <a href="#">
                <i className="fa-solid fa-magnifying-glass" />
              </a>
            </div>
            <div className="bell-icon">
              <a href="#">
                <i className="fa-regular fa-bell" />
              </a>
            </div>
          </div>

          <div className="top-side">
            <div className="top-side-c">
              <span>100% Complete</span>
              <p>3 of 3 lectures</p>
            </div>
            <div
              className="Dropdown"
              onClick={() => setIsStatusMenuOpen((open) => !open)}
            >
              <span>
                NA <em></em>
              </span>
              {isStatusMenuOpen && (
                <div className="status-menu">
                  <a href="#profile" className="status-menu-item">
                    Profile
                  </a>
                  <a href="#settings" className="status-menu-item">
                    Settings
                  </a>
                  <a href="#logout" className="status-menu-item">
                    Logout
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="assessment-wrapper-inner">
        {/* LEFT SIDEBAR */}
        <aside className="left-sidebar">
          <div className="cur-cont">
            <h5>Course Content</h5>
            <span>
              <img src="/course-icon.svg" alt="Course icon" /> 1h 0m total
            </span>
          </div>

          <div className="progress-block">
            <div className="progress-header">
              <span className="progress-label">Your Progress</span>
              <span className="progress-value">100%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" />
            </div>
            <div className="progress-meta">
              <span>3 completed</span>
              <span>0 remaining</span>
            </div>
          </div>

          {/* Chapter 1 accordion inside card */}
          <div className="chapter-list">
            

            <button
              type="button"
              className="chapter-header-toggle"
              onClick={() => setIsChapterOpen((open) => !open)}
            >
              <span className="accordion-icon">
                <i
                  className={
                    isChapterOpen
                      ? "fa-solid fa-angle-down"
                      : "fa-solid fa-angle-right"
                  }
                />
              </span>
              <span className="chapter-label"><i class="fa-regular fa-circle-check"></i> Chapter 1</span>
              {/* <span className="chapter-status">Selected</span> */}
            </button>
              
            {isChapterOpen && (
              
              <ul className="lesson-list">
                    <div className="section-row mt-3">
              <div className="section-info">
                <span className="section-title">Section 1</span>
                <div className="section-progress-bar">
                  <div className="section-progress-fill" />
                </div>
              </div>
              <span className="section-count">3/3</span>
            </div>
                <li className="lesson-item completed">
                  <div className="lesson-status-icon">
                   <i class="fa-regular fa-circle-check"></i>
                  </div>
                  <div className="lesson-content">
                    <p className="lesson-title">Principles of Sustainable Food Systems</p>
                    <span className="lesson-meta">5 min · 0 views</span>
                  </div>
                </li>
                <li className="lesson-item completed">
                  <div className="lesson-status-icon">
                 <i class="fa-regular fa-circle-check"></i>
                  </div>
                  <div className="lesson-content">
                    <p className="lesson-title">Environmental Impacts of Food Production</p>
                    <span className="lesson-meta">10 min · 0 views</span>
                  </div>
                </li>
                <li className="lesson-item active">
                  <div className="lesson-status-icon">
                   <i class="fa-regular fa-circle-check"></i>
                  </div>
                  <div className="lesson-content">
                    <p className="lesson-title">Resource Efficiency of Water Use in Farms</p>
                    <span className="lesson-meta">15 min · 0 views</span>
                  </div>
                </li>
              </ul>
              
            )}
          </div>

          <button className="complete-btn"> Course Complete!</button>
        </aside>

        {/* MAIN CONTENT */}
        <main className="content-mid">
          <div className="content-header">
            <div>
              <h3>Final Assessment</h3>
              <p className="content-subtitle">With Quantitative</p>
            </div>
            <span className="question-count">5/15 Questions</span>
          </div>

          <section className="question-card">
            <header className="question-header">
              <h4>What does skill-based learning focus on?</h4>
            </header>

            <div className="options-grid">
              <label className="option-item">
                <input type="checkbox" name="q1-option-a" />
                <span className="option-label">A. Theory only</span>
              </label>
              <label className="option-item">
                <input type="checkbox" name="q1-option-c" />
                <span className="option-label">C. Exams only</span>
              </label>
              <label className="option-item">
                <input type="checkbox" name="q1-option-b" />
                <span className="option-label">B. Practical and real-world application</span>
              </label>
              <label className="option-item">
                <input type="checkbox" name="q1-option-d" />
                <span className="option-label">D. Grades only</span>
              </label>
            </div>
          </section>

          <footer className="assessment-footer">
            <div className="footer-actions">
              <button type="button" className="footer-icon-btn">
                <i className="fa-regular fa-hand" />
                <span>Helpful</span>
              </button>
              <button type="button" className="footer-icon-btn">
                <i className="fa-regular fa-circle-question" />
                <span>Ask Question</span>
              </button>
              <button type="button" className="footer-icon-btn">
                <i className="fa-regular fa-life-ring" />
                <span>Need Help?</span>
              </button>
            </div>

            <div className="footer-nav">
              <button type="button" className="btn-secondary">
                Previous
              </button>
              <button type="button" className="btn-primary">
                Next
              </button>
            </div>
          </footer>
        </main>

        {/* RIGHT CHAT PANEL */}
        <aside className="chat-panel">
          <div className="chat-header">
            <div className="chat-header-user">
              <strong>Mark jacob</strong>
              <span className="online">Online</span>
            </div>
            <button type="button" className="chat-more-btn">
              ···
            </button>
          </div>

          <div className="chat-body">
            <div className="message message-incoming">
              <p>Hello! How can I help you today?</p>
              <span className="message-time">02:30 PM</span>
            </div>
          </div>

          <div className="chat-input">
            <input placeholder="Type your message..." />
            <button type="button" className="chat-send-btn">
              ➤
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
