import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../Layout';
import ProblemaDetaliata from '../Problemadetaliata';
// import { problemeData } from '../problemedata';
import { useSelector } from 'react-redux';

const ProblemaIndividuala = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { value: problemeData, status } = useSelector(state => state.problems);
  
  // Find the problem by index (the id parameter is actually the index)
  const problema = problemeData.find(problem => problem.index === parseInt(id));
  
  // If problems are still loading, show loading state
  if (status === 'loading') {
    return (
      <Layout>
        <div className="loading-container">
          <div className="container">
            <div className="main">
              <div className="loading-spinner">
                <div className="spinner"></div>
                <h3>Se încarcă problema...</h3>
                <p>Te rugăm să aștepți în timp ce se procesează datele.</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  // If problem not found, redirect to problems page
  if (!problema) {
    navigate('/probleme');
    return null;
  }

  const handleBack = () => {
    navigate('/probleme');
  };

  return (
    <Layout>
      <ProblemaDetaliata 
        problema={problema} 
        onBack={handleBack}
      />
    </Layout>
  );
};

export default ProblemaIndividuala; 