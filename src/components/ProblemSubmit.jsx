import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardHeader, CardTitle, CardContent } from './card';
import { Badge } from './badge';
import { Button } from './Buttondet';
import { Trophy, FileText, ListChecks, ClipboardList, Lightbulb } from 'lucide-react';
import useDarkMode from '../hooks/useDarkMode';
import { useSolvedProblems } from '../hooks/useSolvedProblems';
import '../scss/components/_problem-submit.scss';

const DEFAULT_MAX_SCORE = 10;

// Funcție pentru extragerea rating-ului din text
const extractRatingFromJson = (text) => {
    if (!text) return null;
    
    // 1. Încearcă să găsească și să parseze obiecte JSON complete
    const jsonMatches = text.match(/\{[\s\S]{0,3000}?\}/g);
    if (jsonMatches) {
        for (const jsonStr of jsonMatches) {
            try {
                const parsed = JSON.parse(jsonStr);
                if (parsed.rating && typeof parsed.rating === 'string') {
                    const rating = parsed.rating.trim();
                    if (rating && rating !== '—/10 puncte' && rating !== '-/10 puncte') {
                        return rating;
                    }
                }
            } catch {
                // Încearcă să extragă rating direct din string JSON chiar dacă nu e valid JSON
                const ratingMatch = jsonStr.match(/"rating"\s*:\s*"([^"]+)"/);
                if (ratingMatch && ratingMatch[1]) {
                    const rating = ratingMatch[1].trim();
                    if (rating && rating !== '—/10 puncte' && rating !== '-/10 puncte') {
                        return rating;
                    }
                }
            }
        }
    }

    // 2. Încearcă pattern-uri regex pentru rating din JSON
    const jsonPatterns = [
        /"rating"\s*:\s*"([^"]+)"/,
        /"rating"\s*:\s*'([^']+)'/,
        /"rating"\s*:\s*([^",}\]]+)/,
        /rating["\s]*:["\s]*([^",}\]]+)/i,
    ];

    for (const pattern of jsonPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            const rating = match[1].trim();
            if (rating && rating !== '—/10 puncte' && rating !== '-/10 puncte' && 
                (/\d/.test(rating) || rating.includes('/'))) {
                return rating;
            }
        }
    }

    // 3. Încearcă pattern-uri din text simplu
    const plainTextPatterns = [
        /Punctaj\s+total:\s*(\d+\/\d+\s*puncte)/i,
        /Punctaj\s+obținut:\s*(\d+\/\d+\s*puncte)/i,
        /Punctaj:\s*(\d+\/\d+\s*puncte)/i,
        /(\d+\/\d+\s*puncte)/,
    ];

    for (const pattern of plainTextPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            return match[1].trim();
        }
    }

    return null;
};

// Funcție pentru curățarea textului
const cleanText = (text) => {
    if (!text) return text;
    
    let cleaned = text;
    
    // Elimină obiecte JSON complete
    cleaned = cleaned.replace(/\{\s*"solution"\s*:\s*\{[\s\S]*?\},\s*"errorAnalysis"\s*:\s*"[\s\S]*?",\s*"rating"\s*:\s*"[\s\S]*?"\s*\}/g, '');
    cleaned = cleaned.replace(/\{\s*"solution"\s*:\s*"[\s\S]*?",\s*"errorAnalysis"\s*:\s*"[\s\S]*?",\s*"rating"\s*:\s*"[\s\S]*?"\s*\}/g, '');
    cleaned = cleaned.replace(/\{\s*"rating"\s*:\s*"[^"]*"\s*\}/g, '');
    
    // Elimină breakdown-uri de punctaj
    cleaned = cleaned.replace(/^[a-z]\)\s+[^:]*:\s+\d+\s+puncte\s+\([^)]*\)\s*$/gmi, '');
    cleaned = cleaned.replace(/Punctaj\s+total:\s*\d+\/\d+\s+puncte/gi, '');
    cleaned = cleaned.replace(/Punctaj\s+obținut:\s*\d+\/\d+\s+puncte/gi, '');
    cleaned = cleaned.replace(/Punctaj:\s*\d+\/\d+\s+puncte/gi, '');
    
    // Elimină linii goale multiple
    cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    return cleaned.trim();
};

// Funcție pentru conversie File → Data URI
const fileToDataUri = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

// Component pentru renderizare markdown cu MathJax
const MarkdownContent = React.memo(({ content, className = '' }) => {
    const contentRef = useRef(null);
    
    // Funcție pentru a forța wrapping la formulele MathJax care depășesc lățimea
    const fixMathJaxOverflow = (container) => {
        if (!container) return;
        
        // Găsește toate containerele MathJax
        const mathContainers = container.querySelectorAll('mjx-container, .MathJax, .MathJax_Display');
        
        mathContainers.forEach((mathEl) => {
            // Verifică dacă elementul depășește lățimea containerului părinte
            const parent = mathEl.parentElement;
            if (!parent) return;
            
            const parentWidth = parent.offsetWidth || parent.clientWidth;
            const mathWidth = mathEl.offsetWidth || mathEl.scrollWidth;
            
            // Dacă formula depășește lățimea părinte (cu un buffer de 10px)
            if (mathWidth > parentWidth - 10) {
                // Aplică stiluri pentru wrapping
                mathEl.style.maxWidth = '100%';
                mathEl.style.overflowX = 'auto';
                mathEl.style.overflowY = 'hidden';
                mathEl.style.display = 'block';
                mathEl.style.wordBreak = 'break-all';
                
                // Pentru formule inline, le facem block pentru a permite wrapping
                const mathContent = mathEl.querySelector('mjx-math');
                if (mathContent && mathContent.getAttribute('display') === 'false') {
                    mathEl.style.display = 'block';
                    mathEl.style.width = '100%';
                }
            }
        });
    };
    
    useEffect(() => {
        if (contentRef.current) {
            const timeoutId = setTimeout(() => {
                if (window.MathJax) {
                    const typesetPromise = window.MathJax.typesetPromise 
                        ? window.MathJax.typesetPromise([contentRef.current])
                        : Promise.resolve().then(() => {
                            if (window.MathJax.typeset) {
                                window.MathJax.typeset([contentRef.current]);
                            }
                        });
                    
                    typesetPromise.then(() => {
                        // După ce MathJax termină de renderizat, verifică și corectează overflow
                        setTimeout(() => {
                            fixMathJaxOverflow(contentRef.current);
                        }, 100);
                    }).catch(() => {
                        // Chiar dacă typeset eșuează, încercă să corecteze overflow
                        setTimeout(() => {
                            fixMathJaxOverflow(contentRef.current);
                        }, 200);
                    });
                }
            }, 50);
            return () => clearTimeout(timeoutId);
        }
    }, [content]);
    
    // Re-verifică overflow când se redimensionează fereastra
    useEffect(() => {
        const handleResize = () => {
            if (contentRef.current) {
                setTimeout(() => {
                    fixMathJaxOverflow(contentRef.current);
                }, 100);
            }
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [content]);
    
    return (
        <div ref={contentRef} className={`prose max-w-none ${className}`}>
            <ReactMarkdown
                components={{
                    a: ({node, ...props}) => (
                        <a {...props} target="_self" rel="noopener noreferrer" />
                    )
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
});

MarkdownContent.displayName = 'MarkdownContent';

const ProblemSubmit = ({ problem = null, defaultProblemId = null, defaultProblemTitle = null }) => {
    // State pentru soluție
    const [solutionText, setSolutionText] = useState('');
    const [solutionImageFiles, setSolutionImageFiles] = useState([]);
    const solutionImageInputRef = useRef(null);
    
    // State pentru context adițional
    const [additionalContext, setAdditionalContext] = useState('');
    
    // State pentru API
    const [apiResponse, setApiResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const isDarkMode = useDarkMode();
    const { saveSolvedProblem } = useSolvedProblems();

    // Extract problem text from problem data (pentru când problema vine din props)
    const getProblemTextFromProps = () => {
        if (!problem) return '';
        
        let text = '';
        
        if (problem.titlu) {
            text += `${problem.titlu}\n\n`;
        }
        
        if (problem.continut) {
            text += problem.continut;
        }
        
        if (problem.formule && problem.formule.length > 0) {
            text += `\n\nFormule:\n${problem.formule.join('\n')}`;
        }
        
        if (problem.date && Object.keys(problem.date).length > 0) {
            text += `\n\nDate:\n${Object.entries(problem.date).map(([key, value]) => `${key} = ${value}`).join('\n')}`;
        }
        
        if (problem.subpuncte && problem.subpuncte.length > 0) {
            text += `\n\nCerințe:\n${problem.subpuncte.map((sub, idx) => `${sub.id || idx + 1}. ${sub.cerinta}`).join('\n')}`;
        }
        
        return text.trim();
    };

    // Handler pentru încărcare imagini soluție
    const handleSolutionImagesChange = async (e) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const newImageFiles = [];
            try {
                for (const file of files) {
                    const previewUrl = await fileToDataUri(file);
                    newImageFiles.push({ file, previewUrl });
                }
                setSolutionImageFiles(prev => [...prev, ...newImageFiles]);
                setError(null);
            } catch (err) {
                console.error("Error reading solution files:", err);
                setError("A apărut o eroare la citirea imaginilor soluției.");
            }
            if (solutionImageInputRef.current) solutionImageInputRef.current.value = '';
        }
    };

    const removeSolutionImage = (index) => {
        setSolutionImageFiles(prev => prev.filter((_, i) => i !== index));
    };

    const triggerFileInput = (ref) => ref.current?.click();

    // Handler pentru submit
    const handleSubmit = async () => {
        // Validare: trebuie să existe problem din props
        if (!problem || !getProblemTextFromProps()) {
            setError('Problema este preluată automat din pagină. Te rugăm să accesezi problema din listă.');
            return;
        }
        
        // Validare: cel puțin unul dintre solutionText SAU solutionImages
        if (!solutionText.trim() && solutionImageFiles.length === 0) {
            setError('Te rog introdu textul soluției SAU încarcă cel puțin o imagine cu rezolvarea.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setApiResponse(null);

        try {
            // Construiește problemText din props
            const finalProblemText = getProblemTextFromProps();
            
            // Conversie imagini în Data URI
            const solutionPhotoDataUris = solutionImageFiles.length > 0
                ? solutionImageFiles.map(img => img.previewUrl)
                : undefined;

            // Construiește payload
            const payload = {
                problemText: finalProblemText,
                solutionText: solutionText.trim() || undefined,
                solutionPhotoDataUris,
                additionalContext: additionalContext.trim() || undefined,
            };

            // Request către API
            const response = await fetch('https://puls-ai-two.vercel.app/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            // Verifică răspuns
            let result;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                result = await response.json();
            } else {
                result = { error: await response.text() };
            }

            if (!response.ok) {
                throw new Error(result.error || `Request failed with status ${response.status}`);
            }

            setApiResponse(result);
            console.log("Analiza a fost primită.", result);

            // Salvează automat problema rezolvată în Firebase (dacă există problem din props)
            if (problem) {
                try {
                    const generatedProblemId = (problem?.index || problem?.id || defaultProblemId) !== null && (problem?.index || problem?.id || defaultProblemId) !== undefined
                        ? String(problem?.index || problem?.id || defaultProblemId)
                        : `submitted_${Date.now()}`;
                    
                    let problemTitle = problem?.titlu || defaultProblemTitle || 'Problema trimisă';
                    const problemIndex = problem?.index;
                    if (problemIndex !== null && problemIndex !== undefined && !generatedProblemId.startsWith('submitted_')) {
                        if (!problemTitle.match(/^PROBLEMA\s*#\d+/i)) {
                            problemTitle = `PROBLEMA #${problemIndex}: ${problemTitle}`;
                        }
                    }
                    
                    // Extrage rating pentru salvare
                    const extractedRating = extractRatingFromJson(result.solution || '') || 
                                           extractRatingFromJson(result.errorAnalysis || '') ||
                                           (result.rating && result.rating.trim() && result.rating !== '—/10 puncte' 
                                             ? result.rating.trim() 
                                             : null);
                    
                    // Parsează rating pentru score
                    let scoreObtained = 0;
                    let maxScore = DEFAULT_MAX_SCORE;
                    if (extractedRating) {
                        const ratingMatch = extractedRating.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+)/);
                        if (ratingMatch) {
                            scoreObtained = parseFloat(ratingMatch[1]);
                            maxScore = parseFloat(ratingMatch[2]) || DEFAULT_MAX_SCORE;
                        }
                    }
                    
                    if (scoreObtained > 0) {
                        await saveSolvedProblem(generatedProblemId, scoreObtained, maxScore, problemTitle);
                        console.log('Problema rezolvată salvată automat în profil!');
                    }
                } catch (error) {
                    console.error('Eroare la salvarea automată a problemei:', error);
                }
            }

        } catch (err) {
            console.error('Error calling API:', err);
            const message = err instanceof Error ? err.message : 'A apărut o eroare necunoscută la apelarea API-ului.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    // Extrage rating ÎNAINTE de curățare
    const extractedRating = apiResponse ? (
        extractRatingFromJson(apiResponse.solution || '') || 
        extractRatingFromJson(apiResponse.errorAnalysis || '') ||
        (apiResponse.rating && apiResponse.rating.trim() && apiResponse.rating !== '—/10 puncte' 
          ? apiResponse.rating.trim() 
          : null)
    ) : null;

    // Curăță textul DUPĂ extragerea rating-ului
    const cleanedSolution = apiResponse ? cleanText(apiResponse.solution || '') : '';
    const cleanedErrorAnalysis = apiResponse ? cleanText(apiResponse.errorAnalysis || '') : '';

    // Primele 3 linii pentru rezumat
    const solutionSummary = cleanedSolution ? cleanedSolution.split('\n').slice(0, 3).join('\n') : '';
    const errorAnalysisSummary = cleanedErrorAnalysis ? cleanedErrorAnalysis.split('\n').slice(0, 3).join('\n') : '';

    return (
        <div className="problem-submit">
            {/* Formular - păstrat vizibil pentru a preveni redimensionarea */}
            <div className={`problem-submit-form-container ${apiResponse ? 'problem-submit-form-collapsed' : ''}`}>
                    {/* Coloana Soluție */}
                    <div className="problem-submit-form-column">
                            <Card className="problem-submit-card">
                                <CardHeader className="problem-submit-card-header">
                                    <CardTitle className="problem-submit-card-title">
                                        🔧 Soluție
                                        {solutionImageFiles.length > 0 && (
                                            <Badge className="problem-submit-badge">
                                                {solutionImageFiles.length} {solutionImageFiles.length === 1 ? 'imagine' : 'imagini'}
                                            </Badge>
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="problem-submit-card-content">
                                    {/* Text Soluție */}
                                    <div className="problem-submit-form-group">
                                        <label className="problem-submit-label">
                                            Text Soluție:
                                        </label>
                                        <textarea
                                            className="problem-submit-textarea"
                                            placeholder="Scrie soluția ta aici..."
                                            value={solutionText}
                                            onChange={(e) => setSolutionText(e.target.value)}
                                        />
                                    </div>

                                    {/* Divider */}
                                    <div className="problem-submit-divider">
                                        <span className="problem-submit-divider-text">
                                            SAU
                                        </span>
                                    </div>

                                    {/* Imagini Soluție */}
                                    <div>
                                        <label className="problem-submit-label">
                                            Imagini Soluție:
                                        </label>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            multiple 
                                            ref={solutionImageInputRef} 
                                            onChange={handleSolutionImagesChange} 
                                            className="problem-submit-file-input"
                                        />
                                        <Button 
                                            type="button" 
                                            onClick={() => triggerFileInput(solutionImageInputRef)}
                                            className="problem-submit-upload-btn"
                                        >
                                            ➕ Adaugă Imagini Soluție
                                        </Button>
                                        {solutionImageFiles.length > 0 ? (
                                            <div className="problem-submit-images-grid">
                                                {solutionImageFiles.map((img, index) => (
                                                    <div key={index} className="problem-submit-image-preview">
                                                        <img 
                                                            src={img.previewUrl} 
                                                            alt={`Soluție ${index + 1}`} 
                                                            className="problem-submit-image"
                                                        />
                                                        <Button 
                                                            type="button" 
                                                            onClick={() => removeSolutionImage(index)}
                                                            className="problem-submit-remove-image-btn"
                                                        >
                                                            ✕
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="problem-submit-empty-state">
                                                📷 Nicio imagine cu soluția încărcată
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                    </div>

                    {/* Context Adițional */}
                    {/* <div className="problem-submit-additional-context">
                        <Card className="problem-submit-card">
                            <CardHeader className="problem-submit-card-header">
                                <CardTitle className="problem-submit-card-title">
                                    ℹ️ Context Adițional (Opțional)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="problem-submit-card-content">
                                <textarea
                                    className="problem-submit-textarea"
                                    placeholder="Adaugă informații suplimentare despre problemă sau soluție (opțional)..."
                                    value={additionalContext}
                                    onChange={(e) => setAdditionalContext(e.target.value)}
                                    rows={3}
                                />
                            </CardContent>
                        </Card>
                    </div> */}

                    {/* Error Message */}
                    {error && (
                        <div className="problem-submit-error">
                            <strong>⚠️ Eroare:</strong> {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="problem-submit-submit-btn"
                    >
                        {isLoading ? '⏳ Se analizează...' : '🚀 Analizează Soluția'}
                    </Button>

                    {isLoading && (
                        <div className="problem-submit-loading">
                            <p>⏳ Se apelează API-ul...</p>
                        </div>
                    )}
            </div>

            {/* Rezultate - Interfața exactă conform prompt-ului */}
            {apiResponse && (
                <div className="problem-submit-results">
                    {/* 1. PUNCTAJ OBTINUT - PRIMUL */}
                    {extractedRating && (
                        <div className="problem-analysis-rating-section">
                            <h3 className="problem-analysis-rating-title">
                                <Trophy className="problem-analysis-icon" />
                                🎯 Punctaj Obținut:
                            </h3>
                            <div className="problem-analysis-rating-content">
                                <div className="problem-analysis-rating-text">
                                    <MarkdownContent content={extractedRating} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. REZUMATURI - SIDE BY SIDE */}
                    {(solutionSummary || errorAnalysisSummary) && (
                        <div className="problem-analysis-summaries-grid">
                            {solutionSummary && (
                                <div className="problem-analysis-summary-section">
                                    <h3 className="problem-analysis-summary-title">
                                        <FileText className="problem-analysis-icon" />
                                        Rezumat Problemă
                                    </h3>
                                    <div className="problem-analysis-summary-content">
                                        <MarkdownContent content={solutionSummary} />
                                    </div>
                                </div>
                            )}
                            {errorAnalysisSummary && (
                                <div className="problem-analysis-summary-section">
                                    <h3 className="problem-analysis-summary-title">
                                        <ListChecks className="problem-analysis-icon" />
                                        Rezumat Analiză
                                    </h3>
                                    <div className="problem-analysis-summary-content">
                                        <MarkdownContent content={errorAnalysisSummary} />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 3. PAȘII REZOLVĂRII */}
                    {cleanedSolution && (
                        <div className="problem-analysis-solution-section">
                            <h3 className="problem-analysis-solution-title">
                                <ClipboardList className="problem-analysis-icon" />
                                📋 Pașii Rezolvării:
                            </h3>
                            <div className="problem-analysis-solution-content">
                                <MarkdownContent content={cleanedSolution} />
                            </div>
                        </div>
                    )}

                    {/* 4. ANALIZA ERORILOR */}
                    {cleanedErrorAnalysis && (
                        <div className="problem-analysis-errors-section">
                            <h3 className="problem-analysis-errors-title">
                                <Lightbulb className="problem-analysis-icon" />
                                💡 Analiza Erorilor și Explicații Detaliate:
                            </h3>
                            <div className="problem-analysis-errors-content">
                                <MarkdownContent content={cleanedErrorAnalysis} />
                            </div>
                        </div>
                    )}

                    {/* Buton pentru analiză nouă */}
                    <Button
                        type="button"
                        onClick={() => {
                            setApiResponse(null);
                            setError(null);
                        }}
                        className="problem-submit-submit-btn"
                        style={{ marginTop: '2rem' }}
                    >
                        🔄 Analiză Nouă
                    </Button>
                </div>
            )}

            {/* Placeholder când nu există rezultate */}
            {!apiResponse && !isLoading && (
                <div className="problem-submit-placeholder">
                    <div className="problem-submit-placeholder-icon">📊</div>
                    <h3 className="problem-submit-placeholder-title">Rezultatele vor apărea aici</h3>
                    <p>Completează formularul și trimite pentru a vedea analiza</p>
                </div>
            )}
        </div>
    );
};

export default ProblemSubmit;
