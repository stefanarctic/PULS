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
import { useDispatch, useSelector } from 'react-redux';
import { addFavorite, removeFavorite, setFavorites } from '../problemeSlice';
import { db } from '../lib/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc, deleteDoc } from 'firebase/firestore';
import { auth } from '../lib/firebase';

export const ProblemaDetaliata = ({ problema, onBack }) => {
  if (!problema || !problema.id) {
    return <div style={{ padding: 32, color: '#c00', fontWeight: 600 }}>Eroare: problema nu este disponibilă sau nu are date valide.</div>;
  }
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const dispatch = useDispatch();
  const favorites = useSelector(state => state.problems.favorites);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Sync favorite din Firestore la Redux
        const userRef = doc(db, 'users', firebaseUser.uid);
        const snap = await getDoc(userRef);
        if (snap.exists() && snap.data().favorites) {
          dispatch({ type: 'problems/setFavorites', payload: snap.data().favorites });
        }
        setIsAdmin(snap.exists() && (snap.data().isAdmin || [
          'matbajean@gmail.com',
          'aleluianu09@gmail.com',
          'pulsphysics@gmail.com',
        ].includes(firebaseUser.email)));
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, [dispatch]);

  const isFavorite = favorites.includes(problema.id);
  const handleToggleFavorite = async () => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    let currentFavorites = [];
    if (snap.exists() && Array.isArray(snap.data().favorites)) {
      currentFavorites = snap.data().favorites;
    }
    if (isFavorite) {
      // Șterge problema după id
      const newFavorites = currentFavorites.filter(fid => fid !== problema.id);
      await updateDoc(userRef, { favorites: newFavorites });
      dispatch(setFavorites(newFavorites));
    } else {
      // Adaugă doar id-ul problemei
      const newFavorites = [...currentFavorites, problema.id];
      await updateDoc(userRef, { favorites: newFavorites });
      dispatch(setFavorites(newFavorites));
    }
  };

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

  // Funcție utilitară pentru reindexarea problemelor după ștergere
  const reindexProblemsAfterDelete = async (ownerUid) => {
    const { getDocs, collection, setDoc, doc } = await import('firebase/firestore');
    const userProblemsRef = collection(db, 'users', ownerUid, 'userProblems');
    const problemsSnap = await getDocs(userProblemsRef);
    const remainingProblems = problemsSnap.docs.map(doc => doc.data());
    
    // Sortează după index vechi și reindexează
    const sorted = [...remainingProblems].sort((a, b) => (a.index || 0) - (b.index || 0));
    
    // Găsește ultimul index din problemele existente (din problemeData)
    const { problemeData } = await import('./problemedata');
    const maxExistingIndex = problemeData.length > 0 ? Math.max(...problemeData.map(p => Number(p.index) || 0)) : 0;
    
    // Reindexează începând de la ultimul index existent + 1 (care ar trebui să fie 14)
    for (let i = 0; i < sorted.length; i++) {
      const p = { ...sorted[i], index: maxExistingIndex + i + 1 };
      const userProblemRef = doc(db, 'users', ownerUid, 'userProblems', p.id);
      await setDoc(userProblemRef, p, { merge: true });
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    className="copy-btn"
                    onClick={copyToClipboard}
                    title={copied ? 'Copiat!' : 'Copiază enunțul'}
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <Copy size={20} />
                  </button>
                  <button
                    className="favorite-btn"
                    onClick={handleToggleFavorite}
                    title={isFavorite ? 'Șterge de la favorite' : 'Adaugă la favorite'}
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    disabled={!problema.id}
                  >
                    {isFavorite ? (
                      <svg width="24" height="24" fill="#FFD700" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                    ) : (
                      <svg width="24" height="24" fill="none" stroke="#FFD700" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                    )}
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Afișează toate imaginile din array-ul images dacă există */}
              {Array.isArray(problema.images) && problema.images.length > 0 && (
                <div className="problema-imagini-grid" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 16 }}>
                  {problema.images.map((url, i) => (
                    <img key={i} src={url} alt={`Ilustrație problemă ${i+1}`} style={{ maxWidth: 180, maxHeight: 180, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', objectFit: 'cover' }} />
                  ))}
                </div>
              )}
              {/* Fallback pentru imagine/imagine1/imagine2 */}
              {problema.imagine && !problema.images && (
                <div className="problema-imagine-container" style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  <img src={problema.imagine} alt="Ilustrație problemă" style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
                </div>
              )}
              {problema.imagine1 && !problema.images && (
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

        <div className="sidebar">
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

          {/* Card Ajutor AI */}
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

          {/* Buton de ștergere problemă pentru autor sau admin */}
          {user && (
            isAdmin ||
            (problema.createdByUid && problema.createdByUid === user.uid) ||
            (problema.createdByAlias && (problema.createdByAlias === user.displayName || problema.createdByAlias === user.alias))
          ) && (
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <button
                style={{
                  background: '#c00',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  padding: '10px 24px',
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: 'pointer',
                  marginBottom: 24
                }}
                onClick={async () => {
                  if (window.confirm('Ești sigur că vrei să ștergi această problemă? Această acțiune este ireversibilă.')) {
                    try {
                      const ownerUid = problema.createdByUid || user.uid;
                      const problemId = problema.id;
                      await import('firebase/firestore').then(async ({ deleteDoc, doc }) => {
                        await deleteDoc(doc(db, 'users', ownerUid, 'userProblems', problemId));
                        
                        // Reindexare automată după ștergere
                        await reindexProblemsAfterDelete(ownerUid);
                      });
                      if (onBack) onBack();
                      else navigate('/probleme');
                    } catch (err) {
                      alert('Eroare la ștergere: ' + err.message);
                    }
                  }
                }}
              >
                Șterge problema
              </button>
            </div>
          )}

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