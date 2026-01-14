import React, { useState, useRef, useEffect, useCallback } from 'react';
import Layout from './Layout';
import { Card, CardHeader, CardTitle, CardContent } from './card';
import { Badge } from './badge';
import { Button } from './Buttondet';
import useDarkMode from '../hooks/useDarkMode';
import { useSolvedProblems } from '../hooks/useSolvedProblems';
import '../scss/components/_problem-submit.scss';

const DEFAULT_MAX_SCORE = 10;

const stripCodeFences = (text) => {
    if (!text || typeof text !== 'string') return '';
    const fenceMatch = text.trim().match(/^```[a-zA-Z0-9]*\s*([\s\S]+?)```$/m);
    if (fenceMatch) {
        return fenceMatch[1].trim();
    }
    return text.trim();
};

const valueToPlainText = (value) => {
    if (value === null || typeof value === 'undefined') return '';
    if (typeof value === 'string') return stripCodeFences(value);
    if (typeof value === 'number') return value.toString();
    if (Array.isArray(value)) {
        return value
            .map((item, index) => `${index + 1}. ${valueToPlainText(item)}`)
            .join('\n');
    }
    if (typeof value === 'object') {
        return Object.entries(value)
            .map(([key, val]) => `${key}: ${valueToPlainText(val)}`)
            .join('\n');
    }
    return String(value);
};

const buildSections = (content, fallbackLabel) => {
    if (!content) return [];

    if (typeof content === 'string' || typeof content === 'number') {
        return [{
            title: null,
            text: valueToPlainText(content)
        }];
    }

    if (Array.isArray(content)) {
        return content.map((item, index) => {
            if (typeof item === 'object' && item !== null) {
                return {
                    title: item.title || item.heading || `${fallbackLabel} ${index + 1}`,
                    text: valueToPlainText(item.text ?? item.content ?? item.value ?? item)
                };
            }
            return {
                title: `${fallbackLabel} ${index + 1}`,
                text: valueToPlainText(item)
            };
        });
    }

    if (typeof content === 'object') {
        return Object.entries(content).map(([key, val]) => ({
            title: key.replace(/[_-]/g, ' '),
            text: valueToPlainText(val)
        }));
    }

    return [];
};

const extractJsonFromText = (text) => {
    if (!text || typeof text !== 'string') return null;
    const possibleJson = stripCodeFences(text);
    if (!possibleJson) return null;
    const trimmed = possibleJson.trim();
    if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) return null;
    try {
        return JSON.parse(trimmed);
    } catch (_) {
        return null;
    }
};

const mergeStructuredResult = (result) => {
    if (!result || typeof result !== 'object') return {};
    let merged = { ...result };

    const absorbJson = (value, parentKey) => {
        const parsed = extractJsonFromText(value);
        if (!parsed || typeof parsed !== 'object') return;
        merged = { ...merged, ...parsed };
        if (parentKey) {
            const replacement = typeof parsed[parentKey] !== 'undefined' ? parsed[parentKey] : parsed;
            merged[parentKey] = replacement;
        }
    };

    ['solution', 'errorAnalysis', 'analysis', 'feedback', 'details'].forEach((key) => {
        absorbJson(merged[key], key);
    });

    return merged;
};

const deriveScoreDetails = (result) => {
    let scoreObtained = 0;
    let maxScore = DEFAULT_MAX_SCORE;
    const ratingLabelFromApi = typeof result.rating === 'string' ? result.rating.trim() : '';
    let ratingLabel = ratingLabelFromApi;

    const assignScoreFromRatingMatch = (match) => {
        scoreObtained = parseFloat(match[1]);
        maxScore = parseFloat(match[2]) || DEFAULT_MAX_SCORE;
    };

    if (typeof result.score === 'number' && Number.isFinite(result.score)) {
        scoreObtained = result.score;
    }

    if (!scoreObtained && typeof result.score === 'string') {
        const numeric = parseFloat(result.score);
        if (!Number.isNaN(numeric)) {
            scoreObtained = numeric;
        }
    }

    if (!scoreObtained && ratingLabelFromApi) {
        const ratingMatch = ratingLabelFromApi.toLowerCase().match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+)/);
        if (ratingMatch) {
            assignScoreFromRatingMatch(ratingMatch);
        } else {
            const lowered = ratingLabelFromApi.toLowerCase();
            if (lowered.includes('punctaj maxim') || lowered.includes('perfect') || lowered.includes('10/10') || lowered.includes('excelent')) {
                scoreObtained = 10;
            } else if (lowered.includes('9/10') || lowered.includes('foarte bun')) {
                scoreObtained = 9;
            } else if (lowered.includes('8/10') || lowered.includes('bun')) {
                scoreObtained = 8;
            } else if (lowered.includes('7/10')) {
                scoreObtained = 7;
            } else if (lowered.includes('parțial') || lowered.includes('aproape')) {
                scoreObtained = 5;
            } else if (lowered.includes('greșit') || lowered.includes('incorect')) {
                scoreObtained = 2;
            } else if (lowered.includes('6/10')) {
                scoreObtained = 6;
            }
        }
    }

    const analysisSource = typeof result.analysis === 'string'
        ? result.analysis
        : typeof result.errorAnalysis === 'string'
            ? result.errorAnalysis
            : '';

    if (!scoreObtained && analysisSource) {
        const lowered = analysisSource.toLowerCase();
        if (lowered.includes('punctaj maxim') || lowered.includes('perfect') || lowered.includes('excelent')) {
            scoreObtained = 10;
        } else if (lowered.includes('foarte bun')) {
            scoreObtained = 9;
        } else if (lowered.includes('bun') || lowered.includes('corect')) {
            scoreObtained = 7;
        } else if (lowered.includes('parțial') || lowered.includes('aproape')) {
            scoreObtained = 5;
        } else if (lowered.includes('greșit') || lowered.includes('incorect')) {
            scoreObtained = 2;
        }
    }

    if (!scoreObtained) {
        scoreObtained = 6;
    }

    if (!ratingLabel) {
        ratingLabel = `${scoreObtained}/${maxScore} puncte`;
    }

    return { scoreObtained, maxScore, ratingLabel };
};

const normalizeApiResult = (result) => {
    const structuredResult = mergeStructuredResult(result);
    const { scoreObtained, maxScore, ratingLabel } = deriveScoreDetails(structuredResult);

    return {
        raw: structuredResult,
        score: scoreObtained,
        maxScore,
        ratingLabel,
        solutionSections: buildSections(structuredResult.solution || structuredResult.correctSolution || structuredResult.answer, 'Pas'),
        errorSections: buildSections(structuredResult.errorAnalysis || structuredResult.feedback || structuredResult.analysis, 'Observație'),
    };
};

const ProblemSubmit = ({ problem = null, defaultProblemId = null, defaultProblemTitle = null }) => {
    const [solutionText, setSolutionText] = useState('');
    const [solutionImageFiles, setSolutionImageFiles] = useState([]);
    const [apiResponse, setApiResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const isDarkMode = useDarkMode();
    const { saveSolvedProblem } = useSolvedProblems();

    const solutionInputRef = useRef(null);
    const solutionTextRef = useRef(null);

    const fileToDataUrl = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleSolutionFilesChange = async (e) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const newImageFiles = [];
            try {
                for (const file of files) {
                    const previewUrl = await fileToDataUrl(file);
                    newImageFiles.push({ file, previewUrl });
                }
                setSolutionImageFiles(prev => [...prev, ...newImageFiles]);
                setError(null);
            } catch (err) {
                console.error("Error reading solution files:", err);
                const errorMsg = "A apărut o eroare la citirea imaginilor soluției.";
                setError(errorMsg);
                alert(errorMsg);
            }
            if (solutionInputRef.current) solutionInputRef.current.value = '';
        }
    };

    const removeSolutionImage = (index) => {
        setSolutionImageFiles(prev => prev.filter((_, i) => i !== index));
    };

    // Extract problem text from problem data
    const getProblemText = () => {
        if (!problem) return '';
        
        // Build problem text from problem data
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

    const handleSubmit = async () => {
        // Validate that we have problem data
        if (!problem) {
            const errorMsg = 'Nu există date despre problemă. Te rugăm să accesezi problema din listă.';
            setError(errorMsg);
            alert(errorMsg);
            return;
        }
        
        // Validate that we have at least solution text or images
        if (!solutionText.trim() && solutionImageFiles.length === 0) {
            const errorMsg = 'Te rog introdu textul soluției SAU încarcă cel puțin o imagine cu rezolvarea.';
            setError(errorMsg);
            alert(errorMsg);
            return;
        }

        setIsLoading(true);
        setError(null);
        setApiResponse(null);

        try {
            const problemText = getProblemText();
            
            const payload = {
                problemText: problemText || undefined,
                solutionText: solutionText.trim() || undefined,
                solutionPhotoDataUris: solutionImageFiles.length > 0 ? solutionImageFiles.map(img => img.previewUrl) : undefined,
                outputFormat: 'mathjax',
                instructions: 'IMPORTANT: Folosește DOAR formatul MathJax pentru toate expresiile matematice. Folosește delimitatorii \\( ... \\) pentru formule inline și \\[ ... \\] pentru formule pe linie separată. NU folosi delimitatori LaTeX precum $...$ sau alte formate.',
            };

            const response = await fetch('https://puls-ai-two.vercel.app/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            // Defensive: check if response is JSON
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

            const normalizedResult = normalizeApiResult(result);
            setApiResponse(normalizedResult);
            console.log("Analiza a fost primită.", normalizedResult);

            // Salvează automat problema rezolvată în Firebase
            try {
                // Determină ID-ul sub care salvăm problema rezolvată
                const generatedProblemId = (problem?.index || problem?.id || defaultProblemId) !== null && (problem?.index || problem?.id || defaultProblemId) !== undefined
                    ? String(problem?.index || problem?.id || defaultProblemId)
                    : `submitted_${Date.now()}`;
                
                // Extrage un titlu din contextul problemei
                const problemTitle = problem?.titlu || defaultProblemTitle || 'Problema trimisă';
                
                console.log('API Response:', result);
                console.log('Analiza normalizată:', normalizedResult);
                
                // Salvează problema rezolvată cu titlul personalizat
                console.log(`Saving problem with score: ${normalizedResult.score}/${normalizedResult.maxScore}`);
                await saveSolvedProblem(generatedProblemId, normalizedResult.score, normalizedResult.maxScore, problemTitle);
                console.log('Problema rezolvată salvată automat în profil!');
            } catch (error) {
                console.error('Eroare la salvarea automată a problemei:', error);
            }

        } catch (err) {
            console.error('Error calling API:', err);
            const message = err instanceof Error ? err.message : 'A apărut o eroare necunoscută la apelarea API-ului.';
            setError(message);
            alert(`Eroare API: ${message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const triggerFileInput = (ref) => ref.current?.click();

    // Highlight the solution textarea on mount
    useEffect(() => {
        if (solutionTextRef.current) {
            // solutionTextRef.current.focus();
        }
    }, []);

    // Preprocess text for MathJax - same logic as AssistantPopup
    const preprocessTextForMathJax = useCallback((text) => {
        if (!text) return text;
        
        // First, protect markdown links from being processed as math formulas
        const markdownLinks = [];
        const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        let linkMatch;
        let protectedText = text;
        let linkIndex = 0;
        
        // Replace markdown links with placeholders
        while ((linkMatch = markdownLinkRegex.exec(text)) !== null) {
            const placeholder = `__MARKDOWN_LINK_${linkIndex}__`;
            markdownLinks.push(linkMatch[0]);
            protectedText = protectedText.replace(linkMatch[0], placeholder);
            linkIndex++;
        }
        
        // Convert $...$ to \( ... \)
        protectedText = protectedText.replace(/\$(.+?)\$/g, (match, expr) => {
            return `\\(${expr.trim()}\\)`;
        });
        
        // Convert [ ... ] to \( ... \) if it looks like LaTeX
        protectedText = protectedText.replace(/\[([^\]]+)\]/g, (match, content) => {
            // Skip if it looks like a markdown link placeholder
            if (content.startsWith('__MARKDOWN_LINK_')) {
                return match;
            }
            
            const trimmedContent = content.trim();
            
            // Check if content looks like LaTeX
            const hasLatex = /\\[a-zA-Z]{2,}|\\[^a-zA-Z\s]|\\mathrm\{|\\frac\{|\\cdot|\\sin|\\cos|\\tan|\\sqrt|\\sum|\\int|\\alpha|\\beta|\\gamma|\\delta|\\theta|\\pi|\\mu|\\Delta|[\^_\{\}]/.test(trimmedContent);
            const hasMathOperators = /[A-Za-z]\s*[=+\-*/]\s*[A-Za-z0-9]/.test(trimmedContent);
            
            if (hasLatex || (hasMathOperators && trimmedContent.length > 3)) {
                return `\\(${trimmedContent}\\)`;
            }
            
            return match;
        });
        
        // Restore markdown links
        markdownLinks.forEach((link, index) => {
            protectedText = protectedText.replace(`__MARKDOWN_LINK_${index}__`, link);
        });
        
        return protectedText;
    }, []);

    // Component for individual section with MathJax support
    const SolutionSection = React.memo(({ section, index }) => {
        const sectionRef = useRef(null);
        const textRef = useRef(null);
        
        // Typeset MathJax when section is rendered - same as AssistantPopup
        useEffect(() => {
            if (textRef.current) {
                const timeoutId = setTimeout(() => {
                    if (window.MathJax) {
                        if (window.MathJax.typesetPromise) {
                            window.MathJax.typesetPromise([textRef.current]).catch(() => {});
                        } else if (window.MathJax.typeset) {
                            window.MathJax.typeset([textRef.current]);
                        }
                    }
                }, 50);
                return () => clearTimeout(timeoutId);
            }
        }, [section.text]);

        return (
            <div 
                className="problem-submit-section"
                ref={sectionRef}
            >
                {section.title && (
                    <p className="problem-submit-section-title">
                        {section.title}
                    </p>
                )}
                <div 
                    ref={textRef}
                    className="problem-submit-section-text"
                    dangerouslySetInnerHTML={{ __html: preprocessTextForMathJax(section.text) }}
                />
            </div>
        );
    });

    const renderSections = (sections, emptyMessage) => {
        if (!sections || sections.length === 0) {
            return (
                <p className="problem-submit-empty-message">
                    {emptyMessage}
                </p>
            );
        }

        return sections.map((section, index) => (
            <SolutionSection 
                key={`${section.title || 'section'}-${index}`}
                section={section}
                index={index}
            />
        ));
    };

    const problemText = getProblemText();

    return (
        <div className="problem-submit">
            {/* Solution Card */}
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
                    {/* Solution Text Input */}
                    <div className="problem-submit-form-group">
                        <label className="problem-submit-label">
                            Text Soluție:
                        </label>
                        <textarea
                            ref={solutionTextRef}
                            autoFocus={false}
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

                    {/* Solution Image Upload */}
                    <div>
                        <label className="problem-submit-label">
                            Imagini Soluție:
                        </label>
                        <input 
                            type="file" 
                            accept="image/*" 
                            multiple 
                            ref={solutionInputRef} 
                            onChange={handleSolutionFilesChange} 
                            className="problem-submit-file-input"
                        />
                        <Button 
                            type="button" 
                            onClick={() => triggerFileInput(solutionInputRef)}
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
                disabled={isLoading || (!solutionText.trim() && solutionImageFiles.length === 0) || !problem}
                className="problem-submit-submit-btn"
            >
                {isLoading ? '⏳ Se trimite la API...' : '🚀 Trimite la API'}
            </Button>

            {isLoading && (
                <div className="problem-submit-loading">
                    <p>⏳ Se apelează API-ul...</p>
                </div>
            )}

            {/* API Response */}
            {apiResponse && (
                <div className="problem-submit-response">
                    <Card className="problem-submit-score-card">
                        <CardHeader className="problem-submit-score-header">
                            <CardTitle className="problem-submit-score-title">
                                ⭐ Punctaj
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="problem-submit-score-content">
                            <div className="problem-submit-score-container">
                                <div className="problem-submit-score-display">
                                    <span className="problem-submit-score-value">
                                        {apiResponse.score}
                                    </span>
                                    <span className="problem-submit-score-max">
                                        / {apiResponse.maxScore}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="problem-submit-result-card">
                        <CardHeader className="problem-submit-result-header">
                            <CardTitle className="problem-submit-result-title">
                                ✅ Soluție Corectă
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="problem-submit-result-content">
                            <div className="problem-submit-result-content-inner">
                                {renderSections(apiResponse.solutionSections, 'Nu am primit încă o soluție text.')}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="problem-submit-result-card">
                        <CardHeader className="problem-submit-result-header">
                            <CardTitle className="problem-submit-result-title">
                                🔍 Analiză Erori & Feedback
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="problem-submit-result-content">
                            <div className="problem-submit-result-content-inner-alt">
                                {renderSections(apiResponse.errorSections, 'Nu au fost găsite erori sau feedback suplimentar.')}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {!apiResponse && !isLoading && (
                <div className="problem-submit-placeholder">
                    <div className="problem-submit-placeholder-icon">📊</div>
                    <h3 className="problem-submit-placeholder-title">Rezultatele vor apărea aici</h3>
                    <p>Completează formularul și trimite la API pentru a vedea analiza</p>
                </div>
            )}
        </div>
    );
}

export default ProblemSubmit;