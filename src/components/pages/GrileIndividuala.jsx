import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../Layout';
import { useSelector, useDispatch } from 'react-redux';
import { fetchGrile } from '../../features/grile/grileSlice';
import { ArrowLeft, Check, X } from 'lucide-react';
import MathJaxRender from '../MathJaxRender';
import SEO from '../SEO';
import '../../scss/components/_probleme-grile.scss';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import { parseHomeworkParams, recordAssignmentItemProgress } from '../../lib/assignmentProgress';
import { useI18n } from '../../i18n/LanguageContext';
import { convertDollarToInlineMathJax } from '../../lib/problemHtmlMath';
import { useGrilaEnglishTranslation } from '../../hooks/useGrilaEnglishTranslation';

const GrileIndividuala = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { localizedPath, t, lang } = useI18n();
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const homeworkContext = parseHomeworkParams(searchParams);
    const { value: grileData, status } = useSelector(state => state.grile);

    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [hasChecked, setHasChecked] = useState(false);
    const [firebaseUser, setFirebaseUser] = useState(null);

    const grilaIndex = parseInt(id, 10);
    const grila = grileData.find(g => g.index === grilaIndex);
    const { displayGrila, status: translationStatus } = useGrilaEnglishTranslation(grila, lang);
    const grileView = displayGrila ?? grila;

    const correctAnswer = grileView ? (grileView.raspunsCorect || 'a').toLowerCase() : '';
    const isCorrect = !!(hasChecked && selectedAnswer !== null && selectedAnswer === correctAnswer);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, setFirebaseUser);
        return () => unsub();
    }, []);

    useEffect(() => {
        if (grileData.length === 0) {
            dispatch(fetchGrile());
        }
    }, [dispatch, grileData.length]);

    useEffect(() => {
        if (!hasChecked || !homeworkContext || !firebaseUser?.uid) return;
        (async () => {
            try {
                await recordAssignmentItemProgress({
                    classId: homeworkContext.classId,
                    assignmentId: homeworkContext.assignmentId,
                    studentUid: firebaseUser.uid,
                    itemIndex: homeworkContext.itemIndex,
                    itemType: 'grila',
                    patch: {
                        done: true,
                        score10: isCorrect ? 10 : 0,
                        gradedAt: Timestamp.now(),
                    },
                });
            } catch (e) {
                console.error('Temă grilă:', e);
            }
        })();
    }, [hasChecked, homeworkContext, firebaseUser?.uid, isCorrect]);

    useEffect(() => {
        if (!hasChecked) return;
        const mj = window.MathJax;
        if (!mj?.typesetPromise) return;
        const run = () => mj.typesetPromise().catch(() => {});
        if (mj.startup?.promise) {
            mj.startup.promise.then(run).catch(run);
        } else {
            run();
        }
    }, [hasChecked]);

    useEffect(() => {
        if ((status === 'succeeded' || status === 'failed') && !grila) {
            navigate(localizedPath('/probleme/grile'));
        }
    }, [grila, status, navigate, localizedPath]);

    const handleCheck = () => {
        if (selectedAnswer === null) return;
        setHasChecked(true);
    };

    const handleBack = () => {
        navigate(localizedPath('/probleme/grile'));
    };

    if (status === 'loading' || status === 'idle') {
        return (
            <Layout>
                <div className="loading-container">
                    <div className="container">
                        <div className="main">
                            <div className="loading-spinner">
                                <div className="spinner"></div>
                                <h3>{t('gridProblemsPage.detailLoadingTitle', 'Se încarcă grila...')}</h3>
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

    const grileDisplay = grileView;

    const variante = grileDisplay.variante || {};
    const options = ['a', 'b', 'c', 'd'].filter(k => variante[k]);

    const translationLoading = lang === 'en' && translationStatus === 'loading';

    const title = grileDisplay.intrebare?.substring(0, 60) || `Grilă #${grilaIndex}`;
    const snippet = `${title}${title.length >= 60 ? '...' : ''}`;
    const description = t(
        'gridProblemsPage.detailMetaDescription',
        `Întrebare cu variante de răspuns: ${snippet}`,
        { snippet }
    );
    const keywords = grileDisplay.categorie
        ? t(
            'gridProblemsPage.detailKeywordsWithCategory',
            `grilă fizică, ${grileDisplay.categorie}, întrebări fizică`,
            { category: grileDisplay.categorie }
        )
        : t('gridProblemsPage.detailKeywords', 'grilă fizică, întrebări fizică');

    return (
        <Layout>
            <SEO
                title={t(
                    'gridProblemsPage.detailSeoTitle',
                    `Grilă #${grilaIndex} | Grile de Fizică - PULS`,
                    { num: grilaIndex }
                )}
                description={description}
                keywords={keywords}
                image="/res/icons/New-logo.png"
            />
            <div className="grila-detalii-page">
                <div className="grila-detalii-inner">
                    <button
                        onClick={handleBack}
                        className="grila-back-button"
                        title={t('gridProblemsPage.detailBack', 'Înapoi la grile')}
                    >
                        <ArrowLeft size={18} />
                        <span>{t('gridProblemsPage.detailBack', 'Înapoi la grile')}</span>
                    </button>

                    <div className="grila-detalii-card">
                        {translationLoading && (
                            <div className="grila-translation-banner" role="status">
                                {t('gridProblemsPage.translationInProgress', 'Se traduce grila în engleză…')}
                            </div>
                        )}
                        <div className="grila-detalii-header">
                            <span className="grila-detalii-id">
                                {t('gridProblemsPage.detailQuizBadge', `Grilă #${grilaIndex}`, { num: grilaIndex })}
                            </span>
                            {grileDisplay.categorie && (
                                <span className="grila-detalii-categorie">{grileDisplay.categorie}</span>
                            )}
                        </div>

                        <div
                            className="grila-intrebare"
                            dangerouslySetInnerHTML={{
                                __html: convertDollarToInlineMathJax(grileDisplay.intrebare || '')
                            }}
                        />
                        <MathJaxRender rerun={translationStatus} />

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
                                {t('gridProblemsPage.detailVerify', 'Verifică răspunsul')}
                            </button>
                        )}

                        {hasChecked && (
                            <div className="grila-feedback">
                                <div className={`grila-feedback-message${isCorrect ? ' correct' : ' wrong'}`}>
                                    {isCorrect ? (
                                        <>
                                            <Check size={24} />
                                            <span>{t('gridProblemsPage.detailCorrect', 'Răspuns corect!')}</span>
                                        </>
                                    ) : (
                                        <>
                                            <X size={24} />
                                            <span>
                                                {t(
                                                    'gridProblemsPage.detailWrong',
                                                    `Răspuns greșit. Varianta corectă este ${correctAnswer.toUpperCase()}.`,
                                                    { letter: correctAnswer.toUpperCase() }
                                                )}
                                            </span>
                                        </>
                                    )}
                                </div>
                                {grileDisplay.explicatie && (
                                    <div className="grila-explicatie">
                                        <strong>{t('gridProblemsPage.detailExplanationLabel', 'Explicație:')}</strong>
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: convertDollarToInlineMathJax(grileDisplay.explicatie)
                                            }}
                                        />
                                        <MathJaxRender rerun={translationStatus} />
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
