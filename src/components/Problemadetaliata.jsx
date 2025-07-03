import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../scss/components/ProblemaDetaliata.scss';
import { ArrowLeft, Bot, Calculator, BookOpen } from 'lucide-react';
import { Button } from './Buttondet';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Separator } from './separator';
import MathJaxRender from './MathJaxRender';
import ProblemSubmit from './ProblemSubmit';

export const ProblemaDetaliata = ({ problema }) => {
  const navigate = useNavigate();

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
      default: return dificultate;
    }
  };

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
              <CardTitle className="card-title">{problema.titlu}</CardTitle>
              <p className="card-description">{problema.descriere}</p>
              <div className="flex items-center space-x-4">
                <Badge className="category">{getCategoryName(problema.categorie)}</Badge>
                <span className="total-points">Total: {problema.punctajTotal} puncte</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed mb-6">{problema.continut}</p>

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
                        <span className="text-gray-600">{key.replace(/_/g, ' ')}:</span>
                        <span className="font-medium">{value}</span>
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
                      <span className="text-gray-800" dangerouslySetInnerHTML={{ __html: subpunct.cerinta }} />
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
              <Button className="ai-button">
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