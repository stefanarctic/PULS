import React, { useState, useRef, useEffect } from 'react';
import Layout from './Layout';
import { Card, CardHeader, CardTitle, CardContent } from './card';
import { Badge } from './badge';
import { Button } from './Buttondet';
import useDarkMode from '../hooks/useDarkMode';
import { useSolvedProblems } from '../hooks/useSolvedProblems';

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

const ProblemSubmit = ({ defaultProblemId = null, defaultProblemTitle = null }) => {
    const [problemText, setProblemText] = useState('');
    const [problemImageFile, setProblemImageFile] = useState(null);
    const [solutionImageFiles, setSolutionImageFiles] = useState([]);
    const [apiResponse, setApiResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const isDarkMode = useDarkMode();
    const { saveSolvedProblem } = useSolvedProblems();

    const problemInputRef = useRef(null);
    const solutionInputRef = useRef(null);

    const fileToDataUrl = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleProblemFileChange = async (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const previewUrl = await fileToDataUrl(file);
                setProblemImageFile({ file, previewUrl });
                setError(null);
            } catch (err) {
                console.error("Error reading problem file:", err);
                const errorMsg = "A apărut o eroare la citirea imaginii problemei.";
                setError(errorMsg);
                alert(errorMsg);
            }
            if (problemInputRef.current) problemInputRef.current.value = '';
        }
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

    const removeProblemImage = () => setProblemImageFile(null);
    const removeSolutionImage = (index) => {
        setSolutionImageFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!problemText.trim() && !problemImageFile) {
            const errorMsg = 'Te rog introdu textul problemei SAU încarcă o imagine a problemei.';
            setError(errorMsg);
            alert(errorMsg);
            return;
        }
        if (solutionImageFiles.length === 0) {
            const errorMsg = 'Te rog încarcă cel puțin o imagine cu rezolvarea.';
            setError(errorMsg);
            alert(errorMsg);
            return;
        }

        setIsLoading(true);
        setError(null);
        setApiResponse(null);

        try {
            const payload = {
                problemText: problemText.trim() || undefined,
                problemPhotoDataUri: problemImageFile?.previewUrl,
                solutionPhotoDataUris: solutionImageFiles.map(img => img.previewUrl),
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
                const generatedProblemId = defaultProblemId !== null && defaultProblemId !== undefined
                    ? String(defaultProblemId)
                    : `submitted_${Date.now()}`;
                
                // Extrage un titlu din contextul problemei sau din textul introdus
                let problemTitle = defaultProblemTitle || 'Problema trimisă';
                if (!defaultProblemTitle) {
                    if (problemText.trim()) {
                        const firstLine = problemText.trim().split('\n')[0];
                        if (firstLine.length > 0) {
                            problemTitle = firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine;
                        }
                    } else if (problemImageFile) {
                        problemTitle = 'Problema din imagine';
                    }
                }
                
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

    // Highlight the textarea on mount
    useEffect(() => {
        if (problemInputRef.current) {
            problemInputRef.current.focus();
            problemInputRef.current.style.borderColor = '#3b82f6';
        }
    }, []);

    const renderSections = (sections, emptyMessage) => {
        if (!sections || sections.length === 0) {
            return (
                <p style={{ 
                    margin: 0, 
                    color: 'var(--muted-color-current-mode)',
                    whiteSpace: 'pre-wrap'
                }}>
                    {emptyMessage}
                </p>
            );
        }

        return sections.map((section, index) => (
            <div 
                key={`${section.title || 'section'}-${index}`} 
                style={{ marginBottom: index === sections.length - 1 ? 0 : '1rem' }}
            >
                {section.title && (
                    <p style={{ 
                        margin: 0, 
                        marginBottom: '0.35rem', 
                        fontWeight: 600,
                        color: 'var(--primary-color-current-mode)'
                    }}>
                        {section.title}
                    </p>
                )}
                <p style={{ 
                    margin: 0, 
                    whiteSpace: 'pre-wrap',
                    color: 'var(--primary-color-current-mode)'
                }}>
                    {section.text}
                </p>
            </div>
        ));
    };

    return (
            <div style={{ 
                maxWidth: '1200px',
                minWidth: '900px',
                width: '500px',
                margin: '0 auto', 
                padding: '2rem',
                backgroundColor: 'var(--primary-background-current-mode)',
                color: 'var(--primary-color-current-mode)',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start', width: '100%' }}>
                    <div>
                        <Card style={{ 
                            marginBottom: '2rem', 
                            border: '1px solid var(--border-color-current-mode)',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                            backgroundColor: 'var(--secondary-background-current-mode)'
                        }}>
                            <CardHeader style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color-current-mode)' }}>
                                <CardTitle style={{ 
                                    fontSize: '1.5rem', 
                                    color: 'var(--primary-color-current-mode)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    📝 Problemă
                                </CardTitle>
                            </CardHeader>
                            <CardContent style={{ padding: '1.5rem', paddingRight: '1rem'}}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ 
                                        display: 'block', 
                                        marginBottom: '0.5rem', 
                                        fontWeight: '600',
                                        color: 'var(--primary-color-current-mode)'
                                    }}>
                                        Text Problemă:
                                    </label>
                                    <textarea
                                        placeholder="Scrie enunțul problemei aici..."
                                        value={problemText}
                                        onChange={(e) => setProblemText(e.target.value)}
                                        disabled={!!problemImageFile}
                                        ref={problemInputRef}
                                        style={{
                                            width: '92%',
                                            minHeight: '120px',
                                            padding: '0.75rem',
                                            paddingLeft: '1rem',
                                            border: `2px solid ${isDarkMode ? '#6b7280' : 'var(--border-color-current-mode)'}`,
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                            fontFamily: 'inherit',
                                            resize: 'vertical',
                                            transition: 'border-color 0.2s',
                                            backgroundColor: problemImageFile ? 'var(--primary-background-current-mode)' : 'var(--secondary-background-current-mode)',
                                            color: 'var(--primary-color-current-mode)'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = isDarkMode ? '#6b7280' : 'var(--border-color-current-mode)';
                                        }}
                                    />
                                </div>
                                <div style={{ textAlign: 'center', margin: '1.5rem 0', position: 'relative' }}>
                                    <div style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '0',
                                        right: '0',
                                        height: '1px',
                                        backgroundColor: 'var(--border-color-current-mode)'
                                    }}></div>
                                    <span style={{ 
                                        backgroundColor: 'var(--secondary-background-current-mode)',
                                        padding: '0 1rem',
                                        color: 'var(--muted-color-current-mode)',
                                        fontWeight: '500',
                                        position: 'relative'
                                    }}>
                                        SAU
                                    </span>
                                </div>
                                <div>
                                    <label style={{ 
                                        display: 'block', 
                                        marginBottom: '0.5rem', 
                                        fontWeight: '600',
                                        color: 'var(--primary-color-current-mode)'
                                    }}>
                                        Imagine Problemă:
                                    </label>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        ref={problemInputRef} 
                                        onChange={handleProblemFileChange} 
                                        style={{ display: 'none' }} 
                                        disabled={!!problemText.trim()} 
                                    />
                                    <Button 
                                        type="button" 
                                        onClick={() => triggerFileInput(problemInputRef)} 
                                        disabled={!!problemText.trim()}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            marginRight: '0',
                                            backgroundColor: problemText.trim() ? 'var(--border-color-current-mode)' : '#3b82f6',
                                            
                                            color: problemText.trim() ? 'var(--muted-color-current-mode)' : 'var(--secondary-background-current-mode)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontWeight: '500',
                                            cursor: problemText.trim() ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        📸 Încarcă Imagine Problemă
                                    </Button>
                                    {problemImageFile && (
                                        <div style={{ 
                                            marginTop: '1rem', 
                                            position: 'relative',
                                            padding: '1rem',
                                            backgroundColor: 'var(--primary-background-current-mode)',
                                            borderRadius: '8px',
                                            textAlign: 'center'
                                        }}>
                                            <img 
                                                src={problemImageFile.previewUrl} 
                                                alt="Previzualizare problemă" 
                                                style={{ 
                                                    maxWidth: '100%', 
                                                    maxHeight: '250px', 
                                                    borderRadius: '8px',
                                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                                                }} 
                                            />
                                            <Button 
                                                type="button" 
                                                onClick={removeProblemImage}
                                                style={{
                                                    position: 'absolute',
                                                    top: '0.5rem',
                                                    right: '0.5rem',
                                                    backgroundColor: '#ef4444',
                                                    color: 'var(--secondary-background-current-mode)',
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    width: '32px',
                                                    height: '32px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                ✕
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                        <Card style={{ 
                            border: '1px solid var(--border-color-current-mode)',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                            backgroundColor: 'var(--secondary-background-current-mode)'
                        }}>
                            <CardHeader style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color-current-mode)' }}>
                                <CardTitle style={{ 
                                    fontSize: '1.5rem', 
                                    color: 'var(--primary-color-current-mode)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    🔧 Soluție 
                                    <Badge style={{ 
                                        backgroundColor: 'var(--accent-color-current-mode)', 
                                        color: '#1e40af',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '12px',
                                        fontSize: '0.875rem'
                                    }}>
                                        {solutionImageFiles.length}
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent style={{ padding: '1.5rem' }}>
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '0.5rem', 
                                    fontWeight: '600',
                                    color: 'var(--primary-color-current-mode)'
                                }}>
                                    Imagini Soluție *
                                </label>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    multiple 
                                    ref={solutionInputRef} 
                                    onChange={handleSolutionFilesChange} 
                                    style={{ display: 'none' }} 
                                />
                                <Button 
                                    type="button" 
                                    onClick={() => triggerFileInput(solutionInputRef)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        backgroundColor: '#10b981',
                                        color: 'var(--secondary-background-current-mode)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    ➕ Adaugă Imagini Soluție
                                </Button>
                                {solutionImageFiles.length > 0 ? (
                                    <div style={{ 
                                        marginTop: '1rem',
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                                        gap: '0.75rem'
                                    }}>
                                        {solutionImageFiles.map((img, index) => (
                                            <div key={index} style={{ 
                                                position: 'relative',
                                                backgroundColor: 'var(--primary-background-current-mode)',
                                                borderRadius: '8px',
                                                padding: '0.5rem'
                                            }}>
                                                <img 
                                                    src={img.previewUrl} 
                                                    alt={`Soluție ${index + 1}`} 
                                                    style={{ 
                                                        width: '100%', 
                                                        height: '100px',
                                                        objectFit: 'contain',
                                                        borderRadius: '4px'
                                                    }} 
                                                />
                                                <Button 
                                                    type="button" 
                                                    onClick={() => removeSolutionImage(index)}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '0.25rem',
                                                        right: '0.25rem',
                                                        backgroundColor: '#ef4444',
                                                        color: 'var(--secondary-background-current-mode)',
                                                        border: 'none',
                                                        borderRadius: '50%',
                                                        width: '24px',
                                                        height: '24px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    ✕
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ 
                                        marginTop: '1rem',
                                        height: '120px',
                                        border: '2px dashed var(--border-color-current-mode)',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--muted-color-current-mode)',
                                        backgroundColor: 'var(--primary-background-current-mode)',
                                        fontSize: '1rem'
                                    }}>
                                        📷 Nicio imagine cu soluția încărcată
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        {error && (
                            <div style={{ 
                                marginTop: '1.5rem',
                                padding: '1rem',
                                backgroundColor: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: '8px',
                                color: '#dc2626'
                            }}>
                                <strong>⚠️ Eroare:</strong> {error}
                            </div>
                        )}
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isLoading || solutionImageFiles.length === 0 || (!problemText.trim() && !problemImageFile)}
                            style={{
                                width: '100%',
                                height: '60px',
                                marginTop: '1.5rem',
                                padding: '1rem !important',
                                paddingBottom: '1.25rem !important',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                backgroundColor: (isLoading || solutionImageFiles.length === 0 || (!problemText.trim() && !problemImageFile))
                                    ? '#e5e7eb' // fixed disabled color for both modes
                                    : '#8b5cf6',
                                color: (isLoading || solutionImageFiles.length === 0 || (!problemText.trim() && !problemImageFile))
                                    ? '#64748b' // fixed disabled text color for both modes
                                    : 'var(--secondary-background-current-mode)',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: (isLoading || solutionImageFiles.length === 0 || (!problemText.trim() && !problemImageFile))
                                    ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                                marginBottom: '2.5rem',
                            }}
                        >
                            {isLoading ? '⏳ Se trimite la API...' : '🚀 Trimite la API'}
                        </Button>
                        {isLoading && (
                            <div style={{ 
                                textAlign: 'center', 
                                marginTop: '1rem',
                                color: '#64748b',
                                fontSize: '1rem'
                            }}>
                                <p>⏳ Se apelează API-ul...</p>
                            </div>
                        )}
                    </div>
                    <div>
                        {apiResponse && (
                            <div>
                                <Card style={{ 
                                    marginBottom: '1.5rem',
                                    border: '1px solid #fbbf24',
                                    borderRadius: '12px',
                                    backgroundColor: '#fffbeb',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
                                }}>
                                    <CardHeader style={{ padding: '1.5rem', borderBottom: '1px solid #fde68a' }}>
                                        <CardTitle style={{ color: '#92400e', fontSize: '1.25rem' }}>
                                            ⭐ Punctaj
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent style={{ padding: '1.5rem' }}>
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '1rem'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                                <span style={{ fontSize: '2.75rem', fontWeight: 700, color: '#b45309' }}>
                                                    {apiResponse.score}
                                                </span>
                                                <span style={{ fontSize: '1.25rem', color: '#92400e', fontWeight: 600 }}>
                                                    / {apiResponse.maxScore}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card style={{ 
                                    marginBottom: '1.5rem',
                                    border: '1px solid var(--border-color-current-mode)',
                                    borderRadius: '12px',
                                    backgroundColor: 'var(--primary-background-current-mode)',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
                                }}>
                                    <CardHeader style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color-current-mode)' }}>
                                        <CardTitle style={{ color: 'var(--primary-color-current-mode)', fontSize: '1.25rem' }}>
                                            ✅ Soluție Corectă
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent style={{ padding: '1.5rem' }}>
                                        <div style={{ 
                                            backgroundColor: 'var(--secondary-background-current-mode)',
                                            padding: '1rem',
                                            borderRadius: '8px'
                                        }}>
                                            {renderSections(apiResponse.solutionSections, 'Nu am primit încă o soluție text.')}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card style={{ 
                                    border: '1px solid var(--border-color-current-mode)',
                                    borderRadius: '12px',
                                    backgroundColor: 'var(--secondary-background-current-mode)',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
                                }}>
                                    <CardHeader style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color-current-mode)' }}>
                                        <CardTitle style={{ color: 'var(--primary-color-current-mode)', fontSize: '1.25rem' }}>
                                            🔍 Analiză Erori & Feedback
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent style={{ padding: '1.5rem' }}>
                                        <div style={{ 
                                            backgroundColor: 'var(--primary-background-current-mode)',
                                            padding: '1rem',
                                            borderRadius: '8px'
                                        }}>
                                            {renderSections(apiResponse.errorSections, 'Nu au fost găsite erori sau feedback suplimentar.')}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                        {!apiResponse && (
                            <div style={{
                                padding: '3rem',
                                textAlign: 'center',
                                backgroundColor: 'var(--secondary-background-current-mode)',
                                borderRadius: '12px',
                                border: '2px dashed var(--border-color-current-mode)',
                                color: 'var(--muted-color-current-mode)'
                            }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Rezultatele vor apărea aici</h3>
                                <p>Completează formularul și trimite la API pentru a vedea analiza</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
    );
}

export default ProblemSubmit;