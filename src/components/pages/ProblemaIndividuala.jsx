import React, { useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../Layout';
import ProblemaDetaliata from '../Problemadetaliata';
import { useSelector } from 'react-redux';
import SEO from '../SEO';
import { parseHomeworkParams } from '../../lib/assignmentProgress';
import { useI18n } from '../../i18n/LanguageContext';

const ProblemaIndividuala = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { localizedPath, t, lang } = useI18n();
  const [searchParams] = useSearchParams();
  const homeworkContext = parseHomeworkParams(searchParams);
  const { value: problemeData, status } = useSelector(state => state.problems);

  const problema = problemeData.find(problem => problem.index === parseInt(id, 10));

  useEffect(() => {
    if ((status === 'succeeded' || status === 'failed') && !problema) {
      navigate(localizedPath('/probleme'));
    }
  }, [problema, status, navigate, localizedPath]);

  if (status === 'loading' || status === 'idle') {
    return (
      <Layout>
        <div className="loading-container">
          <div className="container">
            <div className="main">
              <div className="loading-spinner">
                <div className="spinner"></div>
                <h3>{t('problemDetailPage.loading', 'Se încarcă problema...')}</h3>
                <p>{t('problemDetailPage.loadingSubtitle', 'Te rugăm să aștepți în timp ce se procesează datele.')}</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!problema) {
    return null;
  }

  const handleBack = () => {
    if (problema.categorie === 'Bac' || (problema.categorie && problema.categorie.toLowerCase().includes('bac'))) {
      navigate(localizedPath('/probleme/bac'));
    } else {
      navigate(localizedPath('/probleme'));
    }
  };

  const problemTitle = problema?.titlu || `Problema ${id}`;
  const snippetRaw = problema?.enunt ? `${problema.enunt.substring(0, 150)}...` : '';
  const problemDescription = problema?.enunt
    ? t('problemDetailPage.seoDescriptionWithStatement', `${problemTitle} - ${snippetRaw}`, {
        title: problemTitle,
        snippet: snippetRaw,
      })
    : t(
        'problemDetailPage.seoDescriptionFallback',
        `Rezolvă problema de fizică: ${problemTitle}. Vezi soluția completă și explicațiile pas cu pas.`,
        { title: problemTitle },
      );

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: problemTitle,
    description: problemDescription,
    educationalLevel: 'High School',
    learningResourceType: 'Problem Set',
    subject: 'Physics',
    inLanguage: lang === 'en' ? 'en' : 'ro',
  };

  const seoKeywords = t(
    'problemDetailPage.seoKeywords',
    `problema fizică, ${problema?.categorie || ''}, ${problema?.dificultate || ''}, rezolvare fizică, exercițiu fizică`,
    { category: problema?.categorie || '', difficulty: problema?.dificultate || '' },
  );

  return (
    <Layout>
      <SEO
        title={t('problemDetailPage.seoTitle', `${problemTitle} | Problema de Fizică - PULS`, { title: problemTitle })}
        description={problemDescription}
        keywords={seoKeywords}
        image="/res/icons/New-logo.png"
        type="article"
        structuredData={structuredData}
      />
      <ProblemaDetaliata problema={problema} onBack={handleBack} homeworkContext={homeworkContext} />
    </Layout>
  );
};

export default ProblemaIndividuala;
