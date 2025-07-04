import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../scss/components/ProblemaDetaliata.scss';
import { ArrowLeft, Bot, Calculator, BookOpen, Copy, Check } from 'lucide-react';
import { Button } from './Buttondet';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Separator } from './separator';
import MathJaxRender from './MathJaxRender';
import ProblemSubmit from './ProblemSubmit';

export const ProblemaDetaliata = ({ problema, onBack }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const getDifficultyClass = (dificultate) => {
    return `badge-difficulty ${dificultate || 'default'}`;
  };

  const getCategoryName = (categorie) => {
    switch (categorie) {
      case 'unde': return 'Unde';
      case 'pendule': return 'Pendule';
      case 'seisme': return 'Seisme';
      case 'difractie': return 'Difracția Luminii';
      default: return categorie;
    }
  };

  const getDifficultyName = (dificultate) => {
    switch (dificultate) {
      case 'usoare': return 'Ușoare';
      case 'medii': return 'Medii';
      case 'grele': return 'Grele';
      case 'dificile': return 'Dificile';
      case 'concurs': return 'Concurs';
      default: return dificultate;
    }
  };

  // Funcție pentru a extrage latexul dintr-un string cu delimitatori $...$
  function stripMathJaxDelimiters(str) {
    if (!str) return str;
    // Elimină delimitatorii $...$ sau \(...\) și păstrează doar conținutul
    // Pentru $...$
    let result = str.replace(/\$(.+?)\$/g, (_, expr) => expr);
    // Pentru \(...\)
    result = result.replace(/\\\((.+?)\\\)/g, (_, expr) => expr);
    return result;
  }

  // Funcție pentru generarea textului compact al problemei
  const generateProblemText = () => {
    let text = `PROBLEMA #${problema.index}: ${problema.titlu}\n`;
    text += `Categorie: ${getCategoryName(problema.categorie)}\n`;
    text += `Dificultate: ${getDifficultyName(problema.dificultate)}\n`;
    text += `Punctaj total: ${problema.punctajTotal} puncte\n\n`;
    
    text += `DESCRIERE:\n${problema.descriere}\n\n`;
    
    if (problema.continut) {
      text += `CONTINUT:\n${stripMathJaxDelimiters(problema.continut)}\n\n`;
    }
    
    if (problema.formule && problema.formule.length > 0) {
      text += `FORMULE RELEVANTE:\n`;
      problema.formule.forEach((formula, index) => {
        text += `${index + 1}. ${stripMathJaxDelimiters(formula)}\n`;
      });
      text += '\n';
    }
    
    if (problema.date && Object.keys(problema.date).length > 0) {
      text += `DATE CUNOSCUTE:\n`;
      Object.entries(problema.date).forEach(([key, value]) => {
        text += `${stripMathJaxDelimiters(key.replace(/_/g, ' '))}: ${stripMathJaxDelimiters(String(value))}\n`;
      });
      text += '\n';
    }
    
    if (problema.subpuncte && problema.subpuncte.length > 0) {
      text += `CERINTE:\n`;
      problema.subpuncte.forEach((subpunct, index) => {
        text += `${String.fromCharCode(97 + index)}) ${stripMathJaxDelimiters(subpunct.cerinta)} (${subpunct.punctaj}p)\n`;
      });
      text += '\n';
      
      text += `BAREM:\n`;
      problema.subpuncte.forEach((subpunct, index) => {
        text += `${String.fromCharCode(97 + index)}) ${subpunct.punctaj} puncte\n`;
      });
    }
    
    return text;
  };

  // Funcție pentru copierea textului
  const copyToClipboard = async () => {
    try {
      const text = generateProblemText();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Eroare la copiere:', err);
      // Fallback pentru browsere mai vechi
      const textArea = document.createElement('textarea');
      textArea.value = generateProblemText();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Funcție pentru navigarea la secțiunea AI
  const navigateToAI = () => {
    // Navighează direct la pagina AI
    navigate('/api-test');
  };

  // Funcție pentru revenirea la lista de probleme
  const goBackToProblems = () => {
    if (onBack) {
      // Dacă avem funcția onBack, o folosim pentru a reveni la lista de probleme
      onBack();
    } else {
      // Altfel navigăm la pagina de probleme
      navigate('/probleme');
    }
  };

  // Adaugă funcția de conversie pentru delimitatori MathJax
  function convertDollarToInlineMathJax(str) {
    if (!str) return str;
    // Înlocuiește TOATE aparițiile $...$ cu \( ... \) (regex global, non-greedy)
    return str.replace(/\$(.+?)\$/g, (match) => match.replace(/\$(.+?)\$/g, (_, expr) => `\\(${expr}\\)`));
  }

  useEffect(() => {
    if (typeof window?.MathJax !== "undefined") {
      window.MathJax.typeset()
    }
  });
  

  return (
    <div className="container">
      {/* Butonul de "Înapoi la probleme" a fost eliminat */}
      <div className="main">
        <div>
          <Card className="mb-6">
            <CardHeader>
              <div className="card-header-container">
                <div className="card-header-content">
                  <div className="back-button-container">
                    <button
                      onClick={goBackToProblems}
                      className="back-button"
                      title="Înapoi la probleme"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Înapoi la probleme</span>
                    </button>
                  </div>
                  <CardTitle className="card-title">{problema.titlu}</CardTitle>
                  <p className="card-description">{problema.descriere}</p>
                  <div className="flex items-center space-x-4">
                    <Badge className="category">{getCategoryName(problema.categorie)}</Badge>
                    <span className="total-points">Total: {problema.punctajTotal} puncte</span>
                  </div>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="copy-button"
                  title="Copiază problema completă"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-600 hover:text-blue-600" />
                  )}
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {problema.imagine && (
                <div className="problema-imagine-container" style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  <img src={problema.imagine} alt="Ilustrație problemă" style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
                </div>
              )}
              {problema.imagine1 && (
                <div className="problema-imagine-container" style={{ textAlign: 'center', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                  <img src={problema.imagine1} alt="Ilustrație problemă" style={{ maxWidth: '50%', height: 'auto', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
                  <img src={problema.imagine2} alt="Ilustrație problemă" style={{ maxWidth: '50%', height: 'auto', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
                </div>
              )}
              {/* ENUNT PROBLEMA CU MATHJAX */}
              <div className="text-gray-700 leading-relaxed mb-6" dangerouslySetInnerHTML={{ __html: convertDollarToInlineMathJax(problema.continut) }} />
              <MathJaxRender />

              {problema.formule?.length > 0 && (
                <div className="formule-section">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                    <Calculator className="w-4 h-4 mr-2" /> Formule relevante:
                  </h4>
                  <div className="space-y-2">
                    {problema.formule.map((formula, index) => (
                      <div key={index}>
                        <span
                          className="block bg-white px-3 py-2 rounded border text-sm font-mono"
                          // MathJax inline
                          dangerouslySetInnerHTML={{ __html: `\\(${formula}\\)` }}
                        />
                        <MathJaxRender />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {problema.date && Object.keys(problema.date).length > 0 && (
                <div className="date-section">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <BookOpen className="w-4 h-4 mr-2" /> Date cunoscute:
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(problema.date).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span
                          className="text-gray-600"
                          dangerouslySetInnerHTML={{
                            __html: `${convertDollarToInlineMathJax(key.replace(/_/g, ' '))}: <span class='font-medium'>${convertDollarToInlineMathJax(String(value))}</span>`
                          }}
                        />
                        <MathJaxRender />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Cerințe</CardTitle>
            </CardHeader>
            <CardContent>
              {problema.subpuncte && problema.subpuncte.length > 0 && (
                <div className="space-y-4">
                  {problema.subpuncte.map((subpunct, index) => (
                    <div key={subpunct.id} className="subpunct">
                      <span className="font-semibold text-blue-600">{String.fromCharCode(97 + index)}) </span>
                      <span className="text-gray-800" dangerouslySetInnerHTML={{ __html: convertDollarToInlineMathJax(subpunct.cerinta) }} />
                      <MathJaxRender /> {/* Aici adaugă MathJaxRender */}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>


        </div>

        <div style={{ width: '300px' }} className="sidebar">
          <Card className="mb-6 sticky top-4">
            <CardHeader>
              <CardTitle className="text-lg">Punctaje</CardTitle>
            </CardHeader>
            <CardContent>
              {problema.subpuncte && problema.subpuncte.length > 0 && (
                <div className="space-y-3">
                  {problema.subpuncte.map((subpunct, index) => (
                    <div key={subpunct.id} className="punctaj-item">
                      <span>Punctul {String.fromCharCode(97 + index)})</span>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">{subpunct.punctaj}p</Badge>
                    </div>
                  ))}
                  <Separator className="my-4" />
                  <div className="punctaj-item bg-blue-50">
                    <span className="font-bold text-blue-900">Total</span>
                    <Badge className="total-badge">{problema.punctajTotal}p</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ajutor AI</CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="ai-button" onClick={navigateToAI}>
                <Bot className="w-4 h-4 mr-2" />
                Inteligența Artificială
              </Button>
              <p className="ai-description">
                Obține ajutor personalizat pentru rezolvarea acestei probleme.
              </p>
            </CardContent>
          </Card>
        </div>

      {/* Mutat aici: Card Trimite o problemă */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Trimite o problemă</CardTitle>
        </CardHeader>
        <CardContent>
          <ProblemSubmit />
        </CardContent>
      </Card>

      </div>


    </div>
  );
};
export default ProblemaDetaliata;