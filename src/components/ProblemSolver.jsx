import React, { useState } from 'react';

// Exemplu de componentă pentru rezolvarea problemelor
// Această componentă demonstrează cum să se integreze funcția de salvare a problemelor rezolvate

const ProblemSolver = ({ problemId, maxScore = 10 }) => {
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Simulează corectarea răspunsurilor
  const calculateScore = (answers) => {
    // Aici se poate implementa logica reală de corectare
    // Pentru exemplu, presupunem că fiecare răspuns corect valorează 2 puncte
    let correctAnswers = 0;
    Object.values(answers).forEach(answer => {
      if (answer && answer.trim().length > 0) {
        correctAnswers += 2; // 2 puncte per răspuns
      }
    });
    return Math.min(correctAnswers, maxScore);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const calculatedScore = calculateScore(userAnswers);
    setScore(calculatedScore);
    setIsSubmitted(true);

    // Salvează problema rezolvată în Firebase
    if (typeof window !== 'undefined' && window.saveSolvedProblem) {
      try {
        const success = await window.saveSolvedProblem(problemId, calculatedScore, maxScore);
        if (success) {
          console.log('Problema rezolvată salvată cu succes!');
        } else {
          console.error('Eroare la salvarea problemei rezolvate');
        }
      } catch (error) {
        console.error('Eroare la salvarea problemei:', error);
      }
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  return (
    <div style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
      <h3>Rezolvă problema #{problemId}</h3>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Răspunsul tău la întrebarea 1:
          </label>
          <textarea
            value={userAnswers.q1 || ''}
            onChange={(e) => handleAnswerChange('q1', e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #d1d5db' }}
            rows={3}
            placeholder="Scrie răspunsul tău aici..."
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Răspunsul tău la întrebarea 2:
          </label>
          <textarea
            value={userAnswers.q2 || ''}
            onChange={(e) => handleAnswerChange('q2', e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #d1d5db' }}
            rows={3}
            placeholder="Scrie răspunsul tău aici..."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitted}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.25rem',
            cursor: isSubmitted ? 'not-allowed' : 'pointer',
            opacity: isSubmitted ? 0.6 : 1
          }}
        >
          {isSubmitted ? 'Trimis!' : 'Trimite răspunsurile'}
        </button>
      </form>

      {isSubmitted && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          background: '#f0fdf4', 
          border: '1px solid #10b981',
          borderRadius: '0.25rem'
        }}>
          <h4>Rezultatul tău:</h4>
          <p>Scor: <strong>{score}/{maxScore}</strong></p>
          <p>Procentaj: <strong>{Math.round((score / maxScore) * 100)}%</strong></p>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Problema a fost salvată în profilul tău!
          </p>
        </div>
      )}
    </div>
  );
};

export default ProblemSolver; 