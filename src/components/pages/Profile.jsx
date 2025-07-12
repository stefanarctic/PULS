import React, { useState } from 'react';
import Layout from '../Layout';

const Profile = () => {
    const [activeTab, setActiveTab] = useState('activitate');

    // Mock user data
    const user = {
        name: "Elena Popescu",
        email: "elena.popescu@example.com",
        joinedDate: "15 martie 2023",
        problemsSolved: 42,
        level: "Intermediar",
        achievements: [
            { id: 1, name: "Primul pas", description: "Rezolvă prima problemă", completed: true },
            { id: 2, name: "Fizicianul amator", description: "Rezolvă 10 probleme", completed: true },
            { id: 3, name: "Maestrul pendulului", description: "Rezolvă toate problemele despre pendul", completed: false },
            { id: 4, name: "Expert în unde", description: "Rezolvă 15 probleme despre unde", completed: false },
        ],
        recentActivity: [
            { id: 1, type: "problem", name: "Pendulul simplu", result: "Corect", date: "Ieri" },
            { id: 2, type: "simulation", name: "Figuri Lissajous", result: null, date: "Acum 3 zile" },
            { id: 3, type: "problem", name: "Undele seismice", result: "Parțial corect", date: "Acum o săptămână" },
            { id: 4, type: "resource", name: "Principiile mecanicii", result: null, date: "Acum 2 săptămâni" },
        ],
        savedProblems: [
            { id: 5, title: "Interferența undelor", difficulty: "dificil", topic: "Unde" },
            { id: 8, title: "Pendulul elastic", difficulty: "mediu", topic: "Mecanică" },
        ]
    };

    const getDifficultyClass = (difficulty) => {
        switch (difficulty) {
            case 'ușor': return 'difficulty-easy';
            case 'mediu': return 'difficulty-medium';
            case 'dificil': return 'difficulty-hard';
            default: return '';
        }
    };

    const getResultClass = (result) => {
        if (result === 'Corect') return 'result-correct';
        if (result === 'Parțial corect') return 'result-partial';
        return 'result-incorrect';
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'problem': return '📚';
            case 'simulation': return '⚙️';
            case 'resource': return '📄';
            default: return '📝';
        }
    };

    return (
        <Layout>
            <div className="page-section profile-container">
                <div className="profile-header">
                    <div className="profile-header-content">
                        <div className="profile-avatar">
                            {user.name.charAt(0)}
                        </div>
                        <div className="profile-info">
                            <h1 className="profile-name">{user.name}</h1>
                            <p className="profile-email">{user.email}</p>

                            <div className="profile-stats">
                                <div className="stat-item">
                                    <span className="stat-icon">📅</span>
                                    <span className="stat-text">Membru din {user.joinedDate}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-icon">✅</span>
                                    <span className="stat-text">{user.problemsSolved} probleme rezolvate</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-icon">🏆</span>
                                    <span className="stat-text">Nivel: {user.level}</span>
                                </div>
                            </div>
                        </div>

                        <div className="profile-actions">
                            <button className="edit-profile-btn">
                                Editează profilul
                            </button>
                        </div>
                    </div>
                </div>

                <div className="profile-tabs">
                    <div className="tabs-list">
                        <button
                            className={`tab-trigger ${activeTab === 'activitate' ? 'active' : ''}`}
                            onClick={() => setActiveTab('activitate')}
                        >
                            Activitate recentă
                        </button>
                        <button
                            className={`tab-trigger ${activeTab === 'probleme' ? 'active' : ''}`}
                            onClick={() => setActiveTab('probleme')}
                        >
                            Probleme salvate
                        </button>
                        <button
                            className={`tab-trigger ${activeTab === 'realizari' ? 'active' : ''}`}
                            onClick={() => setActiveTab('realizari')}
                        >
                            Realizări
                        </button>
                        <button
                            className={`tab-trigger ${activeTab === 'statistici' ? 'active' : ''}`}
                            onClick={() => setActiveTab('statistici')}
                        >
                            Statistici
                        </button>
                    </div>

                    <div className="tab-content">
                        {activeTab === 'activitate' && (
                            <div className="activity-content">
                                {user.recentActivity.map((activity, index) => (
                                    <div
                                        key={activity.id}
                                        className={`activity-item ${index !== user.recentActivity.length - 1 ? 'border-bottom' : ''}`}
                                    >
                                        <div className="activity-left">
                                            <div className={`activity-icon ${activity.type}`}>
                                                {getActivityIcon(activity.type)}
                                            </div>
                                            <div className="activity-details">
                                                <h3 className="activity-name">{activity.name}</h3>
                                                <div className="activity-meta">
                                                    <span className="activity-date">🕒 {activity.date}</span>
                                                    {activity.result && (
                                                        <>
                                                            <span className="separator">•</span>
                                                            <span className={`activity-result ${getResultClass(activity.result)}`}>
                                                                {activity.result}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="activity-arrow">→</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'probleme' && (
                            <div className="problems-content">
                                {user.savedProblems.length > 0 ? (
                                    user.savedProblems.map((problem) => (
                                        <div key={problem.id} className="problem-item">
                                            <div className="problem-info">
                                                <h3 className="problem-title">{problem.title}</h3>
                                                <p className="problem-topic">{problem.topic}</p>
                                            </div>
                                            <div className="problem-actions">
                                                <span className={`difficulty-badge ${getDifficultyClass(problem.difficulty)}`}>
                                                    {problem.difficulty}
                                                </span>
                                                <button className="solve-btn">
                                                    Rezolvă
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-state">
                                        <h3>Nicio problemă salvată</h3>
                                        <p>Încă nu ai salvat probleme pentru rezolvare ulterioară.</p>
                                        <button className="explore-btn">
                                            <span>Explorează probleme</span>
                                            <span className="arrow">→</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'realizari' && (
                            <div className="achievements-content">
                                {user.achievements.map((achievement) => (
                                    <div
                                        key={achievement.id}
                                        className={`achievement-item ${achievement.completed ? 'completed' : ''}`}
                                    >
                                        <div className={`achievement-icon ${achievement.completed ? 'completed' : ''}`}>
                                            🏆
                                        </div>
                                        <div className="achievement-details">
                                            <h3 className="achievement-name">{achievement.name}</h3>
                                            <p className="achievement-description">{achievement.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'statistici' && (
                            <div className="statistics-content">
                                <div className="stats-grid">
                                    <div className="stat-card">
                                        <h3>Distribuția problemelor rezolvate</h3>
                                        <div className="chart-placeholder">
                                            [Placeholder pentru grafic]
                                        </div>
                                    </div>
                                    <div className="stat-card">
                                        <h3>Progres pe categorii</h3>
                                        <div className="progress-list">
                                            <div className="progress-item">
                                                <div className="progress-header">
                                                    <span>Mecanică</span>
                                                    <span>70%</span>
                                                </div>
                                                <div className="progress-bar">
                                                    <div className="progress-fill profile-progress-fill progress-70"></div>
                                                </div>
                                            </div>
                                            <div className="progress-item">
                                                <div className="progress-header">
                                                    <span>Oscilații</span>
                                                    <span>45%</span>
                                                </div>
                                                <div className="progress-bar">
                                                    <div className="progress-fill profile-progress-fill progress-45"></div>
                                                </div>
                                            </div>
                                            <div className="progress-item">
                                                <div className="progress-header">
                                                    <span>Unde</span>
                                                    <span>30%</span>
                                                </div>
                                                <div className="progress-bar">
                                                    <div className="progress-fill profile-progress-fill progress-30"></div>
                                                </div>
                                            </div>
                                            <div className="progress-item">
                                                <div className="progress-header">
                                                    <span>Seismologie</span>
                                                    <span>15%</span>
                                                </div>
                                                <div className="progress-bar">
                                                    <div className="progress-fill profile-progress-fill progress-15"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Profile;
