import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../Layout';
import { useSelector, useDispatch } from 'react-redux';
import { fetchGrile } from '../../features/grile/grileSlice';
import { ArrowLeft, Check, X } from 'lucide-react';
import MathJaxRender from '../MathJaxRender';
import SEO from '../SEO';
import '../../scss/components/_probleme-grile.scss';

function convertDollarToInlineMathJax(str) {
    if (!str) return str;
    return str.replace(/\$(.+?)\$/g, (_, expr) => `\\(${expr}\\)`);
}

const GrileIndividuala = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { value: grileData, status } = useSelector(state => state.grile);

    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [hasChecked, setHasChecked] = useState(false);

    const grilaIndex = parseInt(id, 10);
    const grila = grileData.find(g => g.index === grilaIndex);

    useEffect(() => {
        if (grileData.length === 0) {
            dispatch(fetchGrile());
        }
    }, [dispatch, grileData.length]);

    useEffect(() => {
        if (hasChecked && window.MathJax?.typesetPromise) {
            window.MathJax.typesetPromise();
        }
    }, [hasChecked]);

    useEffect(() => {
        if ((status === 'succeeded' || status === 'failed') && !grila) {
            navigate('/probleme/grile');
        }
    }, [grila, status, navigate]);

    const handleCheck = () => {
        if (selectedAnswer === null) return;
        setHasChecked(true);
    };

    const handleBack = () => {
        navigate('/probleme/grile');
    };

    if (status === 'loading' || status === 'idle') {
        return (
            <Layout>
                <div className="loading-container">
                    <div className="container">
                        <div className="main">
                            <div className="loading-spinner">
                                <div className="spinner"></div>
                                <h3>Se încarcă grila...</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!grila) {
        return null;
    }

    const variante = grila.variante || {};
    const options = ['a', 'b', 'c', 'd'].filter(k => variante[k]);
    const correctAnswer = (grila.raspunsCorect || 'a').toLowerCase();
    const isCorrect = hasChecked && selectedAnswer === correctAnswer;

    const title = grila.intrebare?.substring(0, 60) || `Grilă #${grilaIndex}`;
    const description = `Întrebare cu variante de răspuns: ${title}...`;

    return (
        <Layout>
            <SEO
                title={`Grilă #${grilaIndex} | Grile de Fizică - PULS`}
                description={description}
                keywords={`grilă fizică, ${grila.categorie || ''}, întrebări fizică`}
                image="/res/icons/New-logo.png"
            />
            <div className="grila-detalii-page">
                <div className="grila-detalii-inner">
                    <button
                        onClick={handleBack}
                        className="grila-back-button"
                        title="Înapoi la grile"
                    >
                        <ArrowLeft size={18} />
                        <span>Înapoi la grile</span>
                    </button>

                    <div className="grila-detalii-card">
                        <div className="grila-detalii-header">
                            <span className="grila-detalii-id">Grilă #{grilaIndex}</span>
                            {grila.categorie && (
                                <span className="grila-detalii-categorie">{grila.categorie}</span>
                            )}
                        </div>

                        <div
                            className="grila-intrebare"
                            dangerouslySetInnerHTML={{
                                __html: convertDollarToInlineMathJax(grila.intrebare || '')
                            }}
                        />
                        <MathJaxRender />

                        <div className="grila-variante">
                            {options.map((key) => {
                                const label = key.toUpperCase();
                                const text = variante[key];
                                const isSelected = selectedAnswer === key;
                                const showResult = hasChecked;
                                const isThisCorrect = key === correctAnswer;
                                const showCorrect = showResult && isThisCorrect;
                                const showWrong = showResult && isSelected && !isThisCorrect;

                                return (
                                    <label
                                        key={key}
                                        className={`grila-option${isSelected ? ' selected' : ''}${showCorrect ? ' correct' : ''}${showWrong ? ' wrong' : ''}${hasChecked ? ' disabled' : ''}`}
                                    >
                                        <input
                                            type="radio"
                                            name="grila-answer"
                                            value={key}
                                            checked={isSelected}
                                            onChange={() => !hasChecked && setSelectedAnswer(key)}
                                            disabled={hasChecked}
                                        />
                                        <span className="grila-option-label">{label}.</span>
                                        <span
                                            className="grila-option-text"
                                            dangerouslySetInnerHTML={{
                                                __html: convertDollarToInlineMathJax(text || '')
                                            }}
                                        />
                                        {showCorrect && <Check size={18} className="grila-option-icon correct-icon" />}
                                        {showWrong && <X size={18} className="grila-option-icon wrong-icon" />}
                                    </label>
                                );
                            })}
                        </div>

                        {!hasChecked && (
                            <button
                                className="grila-verifica-btn"
                                onClick={handleCheck}
                                disabled={selectedAnswer === null}
                            >
                                Verifică răspunsul
                            </button>
                        )}

                        {hasChecked && (
                            <div className="grila-feedback">
                                <div className={`grila-feedback-message${isCorrect ? ' correct' : ' wrong'}`}>
                                    {isCorrect ? (
                                        <>
                                            <Check size={24} />
                                            <span>Răspuns corect!</span>
                                        </>
                                    ) : (
                                        <>
                                            <X size={24} />
                                            <span>Răspuns greșit. Varianta corectă este {correctAnswer.toUpperCase()}.</span>
                                        </>
                                    )}
                                </div>
                                {grila.explicatie && (
                                    <div className="grila-explicatie">
                                        <strong>Explicație:</strong>
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: convertDollarToInlineMathJax(grila.explicatie)
                                            }}
                                        />
                                        <MathJaxRender />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default GrileIndividuala;
