import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../Layout';
import ProblemaDetaliata from '../ProblemaDetaliata';
import { problemeData } from '../problemedata';

const ProblemaIndividuala = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Find the problem by ID
  const problema = problemeData.find(problem => problem.id === parseInt(id));
  
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