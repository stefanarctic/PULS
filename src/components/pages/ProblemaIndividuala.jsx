import React, { useEffect } from 'react';
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
  
  // Redirect if problem not found (use useEffect to avoid render-time navigation)
  // Only redirect if problems have finished loading (succeeded or failed) and problem is not found
  useEffect(() => {
    if ((status === 'succeeded' || status === 'failed') && !problema) {
      navigate('/probleme');
    }
  }, [problema, status, navigate]);
  
  // If problems are still loading or haven't started loading yet, show loading state
  if (status === 'loading' || status === 'idle') {
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
  
  // If problem not found after loading completed, show nothing (redirect is handled in useEffect)
  if (!problema) {
    return null;
  }

  const handleBack = () => {
    // If it's a bac problem, go back to bac page, otherwise to general problems page
    if (problema.categorie === 'Bac' || (problema.categorie && problema.categorie.toLowerCase().includes('bac'))) {
      navigate('/probleme/bac');
    } else {
      navigate('/probleme');
    }
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