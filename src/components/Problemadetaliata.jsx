import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../scss/components/_problema-detaliata.scss';
import { ArrowLeft, Bot, Calculator, BookOpen, Copy, Check, Star } from 'lucide-react';
import { Button } from './Buttondet';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Separator } from './separator';
import ProblemSubmit from './ProblemSubmit';
import { useDispatch, useSelector } from 'react-redux';
import { deleteProblem, clearDeleteStatus, fetchProblems } from '../features/problems/problemsSlice';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAssistant } from '../hooks/useAssistant';
import useDarkMode from '../hooks/useDarkMode';
import { useMathJaxTypesetRoot } from '../hooks/useMathJaxTypesetRoot';
import { summarizeProblemImages } from '../lib/problemImageSummary';
import { useI18n } from '../i18n/LanguageContext';
import { normalizeString } from '../lib/normalizeString';
import { convertDollarToInlineMathJax, prepareProblemHtmlMath } from '../lib/problemHtmlMath';

function formatProblemCategory(cat, t) {
  if (!cat) return '';
  const map = {
    Toate: ['problemsPage.categories.all', 'Toate'],
    Mecanică: ['problemsPage.categories.mechanics', 'Mecanică'],
    Oscilații: ['problemsPage.categories.oscillations', 'Oscilații'],
    Unde: ['problemsPage.categories.waves', 'Unde'],
    unde: ['problemsPage.categories.waves', 'Unde'],
    Lissajous: ['problemsPage.categories.lissajous', 'Lissajous'],
    Seismologie: ['problemsPage.categories.seismology', 'Seismologie'],
    Bac: ['problemsPage.categories.bac', 'Bac'],
    pendule: ['problemsPage.categories.oscillations', 'Pendule'],
    Pendule: ['problemsPage.categories.oscillations', 'Pendule'],
    seisme: ['problemsPage.categories.seismology', 'Seisme'],
    Seisme: ['problemsPage.categories.seismology', 'Seisme'],
    difractie: ['problemDetailPage.categoryDiffraction', 'Difracția Luminii'],
    Difractie: ['problemDetailPage.categoryDiffraction', 'Difracția Luminii'],
  };
  const entry = map[cat];
  return entry ? t(entry[0], entry[1]) : cat;
}

function problemMathJaxFingerprint(p) {
  if (!p) return '';
  const sub = Array.isArray(p.subpuncte) ? p.subpuncte.map((s) => s.cerinta).join('\n') : '';
  return [
    p.id,
    p.continut,
    p.descriere,
    p.titlu,
    Array.isArray(p.formule) ? p.formule.join('\n') : '',
    JSON.stringify(p.date || {}),
    sub,
  ].join('\u0000');
}

function escapeHtmlPlain(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Enunț scurt / fără LaTeX: nu încadra în $...$ — MathJax ignoră spațiile în modul math. */
function plainProseToSafeHtml(s) {
  if (s == null || s === '') return '';
  const prepared = prepareProblemHtmlMath(s);
  if (!prepared) return '';
  return String(prepared)
    .split(/<br\s*\/?>/gi)
    .map((chunk) => escapeHtmlPlain(chunk))
    .join('<br/>');
}

function hasProblemLatexMarkers(s) {
  return (
    typeof s === 'string' &&
    (s.includes('\\') || s.includes('$') || /[α-ωΑ-Ω°]/.test(s))
  );
}

function isWhitespacePhrase(s) {
  return typeof s === 'string' && /\s/.test(s);
}

function htmlForProblemDateKey(key) {
  if (!hasProblemLatexMarkers(key) && isWhitespacePhrase(key)) {
    return plainProseToSafeHtml(key);
  }
  let formattedKey = key;
  if (!hasProblemLatexMarkers(key)) {
    formattedKey = `$${key}$`;
  } else if (!formattedKey.includes('$') && !formattedKey.startsWith('\\(')) {
    formattedKey = `$${formattedKey}$`;
  }
  return convertDollarToInlineMathJax(formattedKey);
}

function htmlForProblemDateValue(value) {
  const raw = String(value ?? '');
  if (!hasProblemLatexMarkers(raw) && isWhitespacePhrase(raw)) {
    return plainProseToSafeHtml(raw);
  }
  let formattedValue = raw;
  if (!hasProblemLatexMarkers(raw) && !formattedValue.includes('$') && !formattedValue.startsWith('\\(')) {
    formattedValue = `$${formattedValue}$`;
  } else if (hasProblemLatexMarkers(raw) && !formattedValue.includes('$') && !formattedValue.startsWith('\\(')) {
    formattedValue = `$${formattedValue}$`;
  }
  return convertDollarToInlineMathJax(formattedValue);
}

function formatDifficultyDisplay(raw, t) {
  if (!raw) return '';
  const n = normalizeString(raw);
  if (n.includes('usor') || n.includes('usoare')) return t('problemsPage.difficulty.easy', raw);
  if (n.includes('mediu') || n.includes('medii')) return t('problemsPage.difficulty.medium', raw);
  if (n.includes('dificil') || n.includes('dificile') || n.includes('greu') || n.includes('grele')) {
    return t('problemsPage.difficulty.hard', raw);
  }
  if (n.includes('concurs')) return t('problemsPage.difficulty.competition', raw);
  return raw;
}

export const ProblemaDetaliata = ({ problema, onBack, homeworkContext = null, translationLoading = false }) => {
  const navigate = useNavigate();
  const { localizedPath, t } = useI18n();
  const [copied, setCopied] = useState(false);
  const [isPreparingAi, setIsPreparingAi] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [isUpdatingFavorite, setIsUpdatingFavorite] = useState(false);
  const dispatch = useDispatch();
  const resolvedProblemId = problema?.index ?? problema?.id ?? null;
  const resolvedProblemTitle = problema?.titlu ?? null;
  const darkModeOn = useDarkMode();
  const starRef = useRef(null);
  const assistant = useAssistant();
  const { deleteStatus, deleteError } = useSelector(state => state.problems);

  const mathJaxFingerprint = useMemo(() => problemMathJaxFingerprint(problema), [problema]);
  const mathJaxRootRef = useMathJaxTypesetRoot(mathJaxFingerprint);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setIsAuthenticated(true);
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setIsAdmin(userData.isAdmin === true);
          setFavorites(Array.isArray(userData.favorites) ? userData.favorites : []);
        } else {
          setIsAdmin(false);
          setFavorites([]);
        }
      } else {
        setIsAuthenticated(false);
        setIsAdmin(false);
        setFavorites([]);
      }
    });

    // document.querySelector('nav').scrollIntoView();

    return () => unsubscribe();
  }, []);

  const handleEdit = () => {
    // Check if user is authenticated before navigating
    if (!auth.currentUser) {
      alert(t('problemDetailPage.editLoginRequired', 'Trebuie să te conectezi pentru a edita probleme. Te rugăm să te autentifici mai întâi.'));
      return;
    }

    // Get the Firestore document ID
    const problemId = problema.id;

    if (!problemId) {
      console.error('Problem ID is missing:', problema);
      alert(t('problemDetailPage.editMissingId', 'Eroare: Problema nu are un ID valid. Nu se poate edita.'));
      return;
    }

    // Navigate to admin dashboard with editId parameter
    navigate(`${localizedPath('/admin')}?editId=${problemId}`);
  };

  const handleDelete = () => {
    // Check if user is authenticated before showing confirmation
    if (!auth.currentUser) {
      alert(t('problemDetailPage.deleteLoginRequired', 'Trebuie să te conectezi pentru a șterge probleme. Te rugăm să te autentifici mai întâi.'));
      return;
    }

    // Get the Firestore document ID - this MUST be the document ID from Firestore
    const problemId = problema.id;

    console.log('Problem object:', problema);
    console.log('Problem ID to delete:', problemId);
    console.log('Problem index:', problema.index);
    console.log('Problem title:', problema.titlu);

    if (!problemId) {
      console.error('Problem ID is missing:', problema);
      alert(t('problemDetailPage.deleteMissingId', 'Eroare: Problema nu are un ID valid. Nu se poate șterge.'));
      return;
    }

    if (
      window.confirm(
        t('problemDetailPage.deleteProblemConfirm', `Sigur vrei să ștergi problema "${problema.titlu}"?`, {
          title: problema.titlu,
        }),
      )
    ) {
      console.log('User confirmed deletion, dispatching deleteProblem with ID:', problemId, 'and index:', problema.index);
      // Pass both ID and index to help find the document
      dispatch(deleteProblem({ id: problemId, index: problema.index }));
    }
  };

  // Handle delete status changes
  useEffect(() => {
    console.log('Delete status changed:', { deleteStatus, deleteError });

    if (deleteStatus === 'succeeded') {
      console.log('Delete succeeded, reloading problems and navigating away...');
      // Reload problems from Firestore to update the frontend
      dispatch(fetchProblems()).then(() => {
        console.log('Problems reloaded successfully');
        if (onBack) onBack();
        else navigate(localizedPath('/probleme'));
      });
    } else if (deleteStatus === 'failed') {
      // Show more user-friendly error message
      const errorMessage = deleteError || 'A apărut o eroare necunoscută';
      console.error('Delete failed with error:', errorMessage);
      alert(
        t('problemDetailPage.deleteError', `Eroare la ștergerea problemei:\n\n${errorMessage}\n\nTe rugăm să încerci din nou sau să contactezi administratorul.`, {
          message: errorMessage,
        }),
      );
      dispatch(clearDeleteStatus());
    }
  }, [deleteStatus, deleteError, onBack, navigate, dispatch, localizedPath, t]);

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
    let text =
      t(
        'problemDetailPage.export.problemHeader',
        `PROBLEMA #${problema.index}: ${problema.titlu}`,
        { num: problema.index, title: problema.titlu },
      ) + '\n';
    text += `${t('problemDetailPage.export.category', 'Categorie:')} ${formatProblemCategory(problema.categorie, t)}\n`;
    text += `${t('problemDetailPage.export.difficulty', 'Dificultate:')} ${formatDifficultyDisplay(problema.dificultate, t)}\n`;
    text += `${t('problemDetailPage.export.totalScore', `Punctaj total: ${problema.punctajTotal} puncte`, { points: problema.punctajTotal })}\n\n`;

    text += `${t('problemDetailPage.export.description', 'DESCRIERE:')}\n${problema.descriere}\n\n`;

    if (problema.continut) {
      text += `${t('problemDetailPage.export.content', 'CONTINUT:')}\n${stripMathJaxDelimiters(problema.continut)}\n\n`;
    }

    if (problema.formule && problema.formule.length > 0) {
      text += `${t('problemDetailPage.export.formulas', 'FORMULE RELEVANTE:')}\n`;
      problema.formule.forEach((formula, index) => {
        text += `${index + 1}. ${stripMathJaxDelimiters(formula)}\n`;
      });
      text += '\n';
    }

    if (problema.date && Object.keys(problema.date).length > 0) {
      text += `${t('problemDetailPage.export.knownData', 'DATE CUNOSCUTE:')}\n`;
      Object.entries(problema.date).forEach(([key, value]) => {
        text += `${stripMathJaxDelimiters(key.replace(/_/g, ' '))}: ${stripMathJaxDelimiters(String(value))}\n`;
      });
      text += '\n';
    }

    if (problema.subpuncte && problema.subpuncte.length > 0) {
      text += `${t('problemDetailPage.export.requirements', 'CERINTE:')}\n`;
      problema.subpuncte.forEach((subpunct, index) => {
        const letter = String.fromCharCode(97 + index);
        text +=
          t(
            'problemDetailPage.export.requirementLine',
            `${letter}) ${stripMathJaxDelimiters(subpunct.cerinta)} (${subpunct.punctaj}p)`,
            {
              letter,
              text: stripMathJaxDelimiters(subpunct.cerinta),
              points: subpunct.punctaj,
            },
          ) + '\n';
      });
      text += '\n';

      text += `${t('problemDetailPage.export.rubric', 'BAREM:')}\n`;
      problema.subpuncte.forEach((subpunct, index) => {
        const letter = String.fromCharCode(97 + index);
        text +=
          t('problemDetailPage.export.rubricLine', `${letter}) ${subpunct.punctaj} puncte`, {
            letter,
            points: subpunct.punctaj,
          }) + '\n';
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
  const navigateToAI = async () => {
    if (assistant && assistant.openWithMessage) {
      const problemText = generateProblemText();
      try {
        setIsPreparingAi(true);
        const imageSummary = await summarizeProblemImages({
          problemText,
          problem: problema,
        });
        const solvePrompt = t('problemDetailPage.export.solvePrompt', 'Rezolvă această problemă:\n\n');
        const imageHdr = t(
          'problemDetailPage.export.imageSummaryHeader',
          '\n\nREZUMAT IMAGINI ATAȘATE ENUNȚULUI:\n',
        );
        const msg = imageSummary ? `${solvePrompt}${problemText}${imageHdr}${imageSummary}` : `${solvePrompt}${problemText}`;
        assistant.openWithMessage(msg);
      } catch (error) {
        console.error('Error opening Profesorul Whiz:', error);
        alert(
          t(
            "assistant.problemOpenError",
            "Eroare la deschiderea Profesorului Whiz. Te rugăm să încerci din nou.",
          ),
        );
      } finally {
        setIsPreparingAi(false);
      }
    } else {
      console.warn('Profesorul Whiz not available. Make sure the AssistantAvatar component is mounted.');
      alert(
        t(
          "assistant.problemUnavailable",
          "Profesorul Whiz nu este disponibil momentan. Te rugăm să reîmprospătezi pagina.",
        ),
      );
    }
  };

  // Funcție pentru revenirea la lista de probleme
  const goBackToProblems = () => {
    if (onBack) {
      // Dacă avem funcția onBack, o folosim pentru a reveni la lista de probleme
      onBack();
    } else {
      // Altfel navigăm la pagina de probleme
      navigate(localizedPath('/probleme'));
    }
  };

  const getPrimaryColor = () =>
    getComputedStyle(document.documentElement)
      .getPropertyValue('--primary-color-current-mode')
      .trim();

  useEffect(() => {
    // starRef.current.color = 'green';
  }, [darkModeOn]);

  const problemId = problema?.id;
  const isFavorite = Boolean(problemId && favorites.includes(problemId));

  const toggleFavorite = async () => {
    if (!problemId) return;
    if (!auth.currentUser) {
      alert(t('problemDetailPage.favoriteLogin', 'Autentifică-te pentru a salva probleme la favorite.'));
      return;
    }
    const previousFavorites = favorites;
    const alreadyFavorite = previousFavorites.includes(problemId);
    const updatedFavorites = alreadyFavorite
      ? previousFavorites.filter(id => id !== problemId)
      : [...previousFavorites, problemId];

    // Optimistic update for instant UI feedback
    setFavorites(updatedFavorites);
    setIsUpdatingFavorite(true);
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userRef, { favorites: updatedFavorites }, { merge: true });
      console.log(
        `[ProblemaDetaliata] Favorite ${alreadyFavorite ? 'removed' : 'added'} for problem`,
        problemId,
        'New favorites:',
        updatedFavorites
      );
    } catch (error) {
      console.error('Favorite toggle failed:', error);
      setFavorites(previousFavorites);
      alert(t('problemDetailPage.favoriteUpdateError', 'A apărut o problemă la actualizarea favoritei. Încearcă din nou.'));
    } finally {
      setIsUpdatingFavorite(false);
    }
  };

  const isBacProblem =
    problema.categorie === 'Bac' ||
    (problema.categorie && problema.categorie.toLowerCase().includes('bac'));
  const backLabel = isBacProblem
    ? t('problemDetailPage.backBac', 'Înapoi la probleme pentru bacalaureat')
    : t('problemDetailPage.back', 'Înapoi la probleme');


  return (
    <div className="container">
      {/* Butonul de "Înapoi la probleme" a fost eliminat */}
      <div className="main">
        <div className="problema-detaliata tex2jax_process" ref={mathJaxRootRef}>
          <Card className="problema-detaliata-main-card mb-6">
            {translationLoading && (
              <div className="problema-translation-banner" role="status">
                {t('problemDetailPage.translationInProgress', 'Se traduce problema în engleză…')}
              </div>
            )}
            <CardHeader>
              <div className="card-header-container">
                <div className="card-header-content">
                  <div className="back-button-container">
                    <button
                      onClick={goBackToProblems}
                      className="back-button"
                      title={backLabel}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>{backLabel}</span>
                    </button>
                  </div>
                  <div className="card-title-row">
                    <CardTitle className="card-title">{problema.titlu}</CardTitle>
                    {problemId && (
                      <button
                        type="button"
                        className={`problema-favorite-btn${isFavorite ? ' is-active' : ''}`}
                        title={
                          isFavorite
                            ? t('problemDetailPage.favoriteRemove', 'Elimină din favorite')
                            : t('problemDetailPage.favoriteAdd', 'Adaugă la favorite')
                        }
                        aria-label={
                          isFavorite
                            ? t('problemDetailPage.favoriteRemove', 'Elimină din favorite')
                            : t('problemDetailPage.favoriteAdd', 'Adaugă la favorite')
                        }
                        onClick={toggleFavorite}
                        disabled={isUpdatingFavorite}
                      >
                        <Star strokeWidth={1.5} fill={isFavorite ? 'currentColor' : 'none'} color={darkModeOn && darkModeOn ? 'white' : 'black'} />
                      </button>
                    )}
                  </div>
                  <p className="card-description">{problema.descriere}</p>
                  <div className="flex items-center space-x-4">
                    <Badge className="category">{formatProblemCategory(problema.categorie, t)}</Badge>
                    <span className="total-points">
                      {t('problemDetailPage.totalPointsBadge', `Total: ${problema.punctajTotal} puncte`, {
                        points: problema.punctajTotal,
                      })}
                    </span>
                  </div>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="copy-button"
                  title={t('problemDetailPage.copyFullProblemTitle', 'Copiază problema completă')}
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
              {/* Suport pentru array-ul poze (format nou) */}
              {problema.poze && Array.isArray(problema.poze) && problema.poze.length > 0 && (
                <div className={`problema-imagine-container ${problema.poze.length === 2 ? 'dual-images' : ''}`}>
                  {problema.poze.map((imagine, index) => (
                    <img
                      key={index}
                      src={imagine}
                      alt={t('problemDetailPage.illustrationAltIndexed', `Ilustrație problemă ${index + 1}`, {
                        index: index + 1,
                      })}
                      className={`problema-imagine ${problema.poze.length === 2 ? 'dual-image' : ''}`}
                    />
                  ))}
                </div>
              )}
              {/* Suport pentru imagine (format vechi - o singură imagine) */}
              {!problema.poze && problema.imagine && (
                <div className="problema-imagine-container">
                  <img src={problema.imagine} alt={t('problemDetailPage.illustrationAlt', 'Ilustrație problemă')} className="problema-imagine" />
                </div>
              )}
              {/* Suport pentru imagine1 și imagine2 (format vechi - două imagini) */}
              {!problema.poze && problema.imagine1 && (
                <div className="problema-imagine-container dual-images">
                  <img src={problema.imagine1} alt={t('problemDetailPage.illustrationAlt', 'Ilustrație problemă')} className="problema-imagine dual-image" />
                  {problema.imagine2 && (
                    <img src={problema.imagine2} alt={t('problemDetailPage.illustrationAlt', 'Ilustrație problemă')} className="problema-imagine dual-image" />
                  )}
                </div>
              )}
              {/* ENUNT PROBLEMA CU MATHJAX */}
              <div className="text-gray-700 leading-relaxed mb-6" dangerouslySetInnerHTML={{ __html: convertDollarToInlineMathJax(problema.continut) }} />

              {problema.formule?.length > 0 && (
                <div className="formule-section">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                    <Calculator className="w-4 h-4 mr-2" /> {t('problemDetailPage.formulasTitle', 'Formule relevante')}:
                  </h4>
                  <div className="space-y-2">
                    {problema.formule.map((formula, index) => {
                      // Curăță formula și asigură că este în format LaTeX valid
                      let cleanedFormula = formula.trim();
                      cleanedFormula = prepareProblemHtmlMath(cleanedFormula);

                      // Elimină delimitatori LaTeX dacă există deja
                      cleanedFormula = cleanedFormula.replace(/^\$+|\$+$/g, '');
                      cleanedFormula = cleanedFormula.replace(/^\\\(|\\\)$/g, '');
                      cleanedFormula = cleanedFormula.replace(/^\\\[|\\\]$/g, '');

                      // Corectează sintaxa LaTeX comună din răspunsurile AI
                      // Funcție helper pentru a verifica dacă un caracter la o poziție este precedat de backslash
                      const isEscaped = (str, pos) => {
                        let backslashCount = 0;
                        for (let i = pos - 1; i >= 0 && str[i] === '\\'; i--) {
                          backslashCount++;
                        }
                        return backslashCount % 2 === 1;
                      };

                      // Corectează pattern-urile comune fără backslash
                      const patterns = [
                        { find: /\bcdot\b/g, replace: '\\cdot' },
                        { find: /\bfrac\b/g, replace: '\\frac' },
                        { find: /\bsin(?=\()/g, replace: '\\sin' },
                        { find: /\bcos(?=\()/g, replace: '\\cos' },
                        { find: /\btan(?=\()/g, replace: '\\tan' },
                        { find: /\bmu\b/g, replace: '\\mu' },
                        { find: /\balpha\b/g, replace: '\\alpha' },
                        { find: /\bDelta\b/g, replace: '\\Delta' },
                        { find: /\btheta\b/g, replace: '\\theta' },
                        { find: /\bpi\b/g, replace: '\\pi' },
                      ];

                      // Aplică corecțiile doar dacă nu sunt deja escape-uite
                      patterns.forEach(({ find, replace }) => {
                        cleanedFormula = cleanedFormula.replace(find, (match, offset) => {
                          // Verifică dacă este deja escape-uit
                          if (isEscaped(cleanedFormula, offset)) {
                            return match;
                          }
                          return replace;
                        });
                      });

                      return (
                        <div key={index}>
                          <span
                            className="block bg-white px-3 py-2 rounded border text-sm"
                            style={{ fontFamily: 'inherit' }}
                            // MathJax inline
                            dangerouslySetInnerHTML={{ __html: `\\(${cleanedFormula}\\)` }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {problema.date && Object.keys(problema.date).length > 0 && (
                <div className="date-section">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <BookOpen className="w-4 h-4 mr-2" /> {t('problemDetailPage.dataTitle', 'Date cunoscute')}:
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(problema.date).map(([key, value]) => {
                      const keyHtml = htmlForProblemDateKey(key);
                      const valueHtml = htmlForProblemDateValue(value);

                      return (
                        <div key={key} className="flex justify-between items-center">
                          <span
                            className="text-gray-600"
                            dangerouslySetInnerHTML={{
                              __html: `${keyHtml}: <span class='font-medium'>${valueHtml}</span>`,
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="problema-detaliata-requirements-card">
            <CardHeader>
              <CardTitle className="text-xl">{t('problemDetailPage.requirementsTitle', 'Cerințe')}</CardTitle>
            </CardHeader>
            <CardContent>
              {problema.subpuncte && problema.subpuncte.length > 0 && (
                <div className="space-y-4 requirements-section">
                  {problema.subpuncte.map((subpunct, index) => (
                    <div key={subpunct.id} className="subpunct">
                      <span className="font-semibold text-blue-600">{String.fromCharCode(97 + index)}) </span>
                      <span className="text-gray-800" dangerouslySetInnerHTML={{ __html: convertDollarToInlineMathJax(subpunct.cerinta) }} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>


        </div>

        <div className="problema-sidebar sidebar">
          <Card className="problema-detaliata-scores-card mb-6 sticky top-4">
            <CardHeader>
              <CardTitle className="text-lg">{t('problemDetailPage.scoresTitle', 'Punctaje')}</CardTitle>
            </CardHeader>
            <CardContent>
              {problema.subpuncte && problema.subpuncte.length > 0 && (
                <div className="space-y-3">
                  {problema.subpuncte.map((subpunct, index) => (
                    <div key={subpunct.id} className="punctaj-item">
                      <span>
                        {t('problemDetailPage.scorePart', `Punctul ${String.fromCharCode(97 + index)})`, {
                          letter: String.fromCharCode(97 + index),
                        })}
                      </span>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">{subpunct.punctaj}p</Badge>
                    </div>
                  ))}
                  <Separator className="my-4" />
                  <div className="punctaj-item bg-blue-50">
                    <span className="font-bold text-blue-900">{t('problemDetailPage.totalLabel', 'Total')}</span>
                    <Badge className="total-badge">{problema.punctajTotal}p</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="problema-detaliata-ai-card">
            <CardHeader>
              <CardTitle className="text-lg">{t('problemDetailPage.aiHelpTitle', 'Ajutor AI')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="ai-button" onClick={navigateToAI} disabled={isPreparingAi}>
                <Bot className="w-4 h-4 mr-2" />
                {isPreparingAi
                  ? t('problemDetailPage.aiHelpButtonLoading', 'Analizez imaginile...')
                  : t('problemDetailPage.aiHelpButton', 'Inteligența Artificială')}
              </Button>
              <p className="ai-description">
                {t(
                  'problemDetailPage.aiHelpDescription',
                  'Obține ajutor personalizat pentru rezolvarea acestei probleme.',
                )}
              </p>
            </CardContent>
          </Card>
          {isAdmin && (
            <div style={{ marginTop: 16, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {!isAuthenticated ? (
                <div style={{
                  padding: '12px',
                  backgroundColor: '#fff3cd',
                  border: '1px solid #ffeaa7',
                  borderRadius: '8px',
                  color: '#856404',
                  fontSize: '14px'
                }}>
                  ⚠️ {t('problemDetailPage.adminLoginRequired', 'Trebuie să te conectezi pentru a edita sau șterge probleme')}
                </div>
              ) : (
                <>
                  <button
                    className="problem-card-edit-btn"
                    onClick={handleEdit}
                    title={t('problemDetailPage.editProblem', 'Editează problema')}
                  >
                    ✏️ {t('problemDetailPage.editProblem', 'Editează problema')}
                  </button>
                  <button
                    className="problem-card-delete-btn"
                    onClick={handleDelete}
                    disabled={deleteStatus === 'loading'}
                    title={
                      deleteStatus === 'loading'
                        ? t('problemDetailPage.deleteInProgress', 'Se șterge...')
                        : t('problemDetailPage.deleteProblem', 'Șterge problema')
                    }
                    style={{
                      opacity: deleteStatus === 'loading' ? 0.6 : 1,
                      cursor: deleteStatus === 'loading' ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {deleteStatus === 'loading'
                      ? `⏳ ${t('problemDetailPage.deleteInProgress', 'Se șterge...')}`
                      : `🗑️ ${t('problemDetailPage.deleteProblem', 'Șterge problema')}`}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Mutat aici: Card Trimite o problemă */}
        <Card className="problema-detaliata-submit-card mt-6">
          <CardHeader>
            <CardTitle className="text-lg">{t('problemDetailPage.submitSolutionCardTitle', 'Trimite o problemă')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ProblemSubmit
              problem={problema}
              defaultProblemId={resolvedProblemId}
              defaultProblemTitle={resolvedProblemTitle}
              assignmentContext={homeworkContext}
            />
          </CardContent>
        </Card>

      </div>


    </div>
  );
};
export default ProblemaDetaliata;