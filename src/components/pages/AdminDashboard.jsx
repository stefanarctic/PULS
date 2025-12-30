import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Layout from '../Layout';
import { useAdmin } from '../../hooks/useAdmin';
import { fetchProblems, updateProblem, deleteProblem, clearUpdateStatus, clearDeleteStatus } from '../../features/problems/problemsSlice';
import { Trash2, Search, X, AlertCircle, GraduationCap } from 'lucide-react';
import { normalizeString } from '../../lib/normalizeString';
import '../../scss/components/_admin-dashboard.scss';

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const AdminDashboard = () => {
  const { isAdmin, loading: adminLoading, user } = useAdmin();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { value: problems, status, updateStatus, updateError, deleteStatus, deleteError } = useSelector(state => state.problems);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Toate');
  const [selectedCategory, setSelectedCategory] = useState('Toate');
  const [isBacFilter, setIsBacFilter] = useState(false);
  const [filterYear, setFilterYear] = useState('');
  const [filterVariant, setFilterVariant] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterSubjectArea, setFilterSubjectArea] = useState('');
  const [editingProblem, setEditingProblem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    titlu: '',
    descriere: '',
    categorie: 'Mecanică',
    dificultate: 'ușor',
    continut: '',
    formule: [''],
    date: {},
    poze: [],
    punctajTotal: 0,
    subpuncte: [{ cerinta: '', punctaj: 1 }],
    metadata: {}
  });
  const [datePairs, setDatePairs] = useState([{ key: '', value: '' }]);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchProblems());
    }
  }, [isAdmin, dispatch]);

  useEffect(() => {
    if (updateStatus === 'succeeded') {
      setEditingProblem(null);
      setFormData({
        titlu: '',
        descriere: '',
        categorie: 'Mecanică',
        dificultate: 'ușor',
        continut: '',
        formule: [''],
        date: {},
        poze: [],
        punctajTotal: 0,
        subpuncte: [{ cerinta: '', punctaj: 1 }],
        metadata: {}
      });
      setDatePairs([{ key: '', value: '' }]);
      dispatch(clearUpdateStatus());
      dispatch(fetchProblems());
    }
  }, [updateStatus, dispatch]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (editingProblem) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [editingProblem]);

  useEffect(() => {
    if (deleteStatus === 'succeeded') {
      setDeleteConfirm(null);
      dispatch(clearDeleteStatus());
      dispatch(fetchProblems());
    }
  }, [deleteStatus, dispatch]);

  const categories = useMemo(() => {
    const cats = [...new Set(problems.map(p => p.categorie).filter(Boolean))].sort();
    return ['Toate', ...cats];
  }, [problems]);

  const difficulties = ['Toate', 'ușor', 'mediu', 'dificil', 'concurs'];

  const years = useMemo(() => {
    const yearSet = new Set();
    problems.forEach(p => {
      if (p.metadata?.year) yearSet.add(p.metadata.year.toString());
      if (p.varianta) {
        const yearMatch = p.varianta.match(/\b(20\d{2})\b/);
        if (yearMatch) yearSet.add(yearMatch[1]);
      }
    });
    return [...yearSet].sort((a, b) => parseInt(b) - parseInt(a));
  }, [problems]);

  const variants = useMemo(() => {
    const variantSet = new Set();
    problems.forEach(p => {
      if (p.varianta) {
        const variantMatch = p.varianta.match(/var[_\s]*(\d+)/i);
        if (variantMatch) {
          variantSet.add(variantMatch[1]);
        }
      }
    });
    return [...variantSet].sort((a, b) => parseInt(a) - parseInt(b));
  }, [problems]);

  const types = useMemo(() => {
    return [...new Set(problems.map(p => p.metadata?.type).filter(Boolean))].sort();
  }, [problems]);

  const subjectAreas = useMemo(() => {
    return [...new Set(problems.map(p => p.metadata?.subjectArea).filter(Boolean))].sort();
  }, [problems]);

  const filteredProblems = useMemo(() => {
    return problems.filter(problem => {
      // Search filter
      if (searchQuery) {
        const query = normalizeString(searchQuery);
        const matchesTitle = normalizeString(problem.titlu || '').includes(query);
        const matchesCategory = normalizeString(problem.categorie || '').includes(query);
        const matchesId = problem.id?.toString().includes(query);
        const matchesIndex = problem.index?.toString().includes(query);
        const matchesDescriere = normalizeString(problem.descriere || '').includes(query);
        const matchesContinut = normalizeString(problem.continut || '').includes(query);
        
        if (!matchesTitle && !matchesCategory && !matchesId && !matchesIndex && !matchesDescriere && !matchesContinut) {
          return false;
        }
      }

      // Difficulty filter
      if (selectedDifficulty !== 'Toate' && normalizeString(problem.dificultate || '') !== normalizeString(selectedDifficulty)) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'Toate' && !normalizeString(problem.categorie || '').includes(normalizeString(selectedCategory))) {
        return false;
      }

      // BAC filters (only if BAC filter is enabled)
      if (isBacFilter) {
        const isBac = problem.categorie === 'Bac' || 
                     (problem.categorie && normalizeString(problem.categorie).includes('bac'));
        if (!isBac) return false;

        if (filterYear && problem.metadata?.year?.toString() !== filterYear && !problem.varianta?.includes(filterYear)) {
          return false;
        }
        if (filterVariant && !problem.varianta?.toLowerCase().includes(filterVariant.toLowerCase())) {
          return false;
        }
        if (filterType && problem.metadata?.type !== filterType && !problem.metadata?.type?.toLowerCase().includes(filterType.toLowerCase())) {
          return false;
        }
        if (filterSubjectArea && problem.metadata?.subjectArea !== filterSubjectArea && !problem.metadata?.subjectArea?.toLowerCase().includes(filterSubjectArea.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [problems, searchQuery, selectedDifficulty, selectedCategory, isBacFilter, filterYear, filterVariant, filterType, filterSubjectArea]);

  const handleProblemClick = (problem) => {
    handleEdit(problem);
  };

  const handleEdit = (problem) => {
    setEditingProblem(problem.id);
    
    // Convert date object to pairs
    const dateObj = problem.date || {};
    const pairs = Object.keys(dateObj).length > 0
      ? Object.entries(dateObj).map(([key, value]) => ({ key: String(key), value: String(value) }))
      : [{ key: '', value: '' }];
    
    setDatePairs(pairs);
    
    const isBac = problem.categorie === 'Bac' || (problem.categorie && normalizeString(problem.categorie).includes('bac'));
    
    setFormData({
      titlu: problem.titlu || '',
      descriere: problem.descriere || '',
      categorie: problem.categorie || 'Mecanică',
      varianta: problem.varianta || '',
      dificultate: isBac ? '' : (problem.dificultate || 'ușor'), // Nu setăm dificultate pentru BAC
      punctajTotal: problem.punctajTotal || 0,
      continut: problem.continut || '',
      formule: Array.isArray(problem.formule) && problem.formule.length > 0 ? problem.formule : [''],
      date: problem.date || {},
      subpuncte: Array.isArray(problem.subpuncte) && problem.subpuncte.length > 0 
        ? problem.subpuncte.map(sub => ({ cerinta: sub.cerinta || '', punctaj: sub.punctaj || 1 }))
        : [{ cerinta: '', punctaj: 1 }],
      metadata: {
        source: problem.metadata?.source || '',
        year: problem.metadata?.year || null,
        variant: problem.metadata?.variant || null,
        type: problem.metadata?.type || '',
        session: problem.metadata?.session || null, // Adăugăm session pentru BAC
        subjectArea: problem.metadata?.subjectArea || '',
        subjectCode: problem.metadata?.subjectCode || '',
        subjectNumber: problem.metadata?.subjectNumber || null
      },
      poze: problem.poze || []
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editingProblem) return;
    
    // Convert date pairs to object
    const dateObject = {};
    datePairs.forEach(pair => {
      if (pair.key.trim() && pair.value.trim()) {
        dateObject[pair.key.trim()] = pair.value.trim();
      }
    });
    
    const isBac = formData.categorie === 'Bac' || (formData.categorie && normalizeString(formData.categorie).includes('bac'));
    
    // Prepare the problem data
    const problemData = {
      titlu: formData.titlu,
      descriere: formData.descriere,
      categorie: formData.categorie,
      varianta: formData.varianta,
      // Nu includem dificultatea pentru problemele de BAC
      ...(isBac ? {} : { dificultate: formData.dificultate }),
      continut: formData.continut,
      formule: formData.formule.filter(f => f.trim()),
      date: dateObject,
      subpuncte: formData.subpuncte.map((subpunct, index) => ({
        id: subpunct.id || `${index + 1}${String.fromCharCode(97 + index)}`,
        cerinta: subpunct.cerinta,
        punctaj: subpunct.punctaj
      })),
      punctajTotal: formData.punctajTotal,
      poze: formData.poze,
      metadata: formData.metadata
    };
    
    try {
      await dispatch(updateProblem({ problemId: editingProblem, problemData })).unwrap();
    } catch (error) {
      console.error('Error updating problem:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      await dispatch(deleteProblem(deleteConfirm)).unwrap();
    } catch (error) {
      console.error('Error deleting problem:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        [field]: value
      };
      
      // Când categoria se schimbă la BAC, ștergem dificultatea
      if (field === 'categorie') {
        const isBac = value === 'Bac' || (value && normalizeString(value).includes('bac'));
        if (isBac) {
          updated.dificultate = '';
        } else if (!updated.dificultate) {
          // Dacă nu e BAC și nu are dificultate, setăm una default
          updated.dificultate = 'ușor';
        }
      }
      
      return updated;
    });
  };

  const handleSubpunctChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      subpuncte: prev.subpuncte.map((subpunct, i) => 
        i === index ? { ...subpunct, [field]: value } : subpunct
      )
    }));
  };

  const addSubpunct = () => {
    setFormData(prev => ({
      ...prev,
      subpuncte: [...prev.subpuncte, {
        cerinta: '',
        punctaj: 1
      }]
    }));
  };

  const removeSubpunct = (index) => {
    if (formData.subpuncte.length > 1) {
      setFormData(prev => ({
        ...prev,
        subpuncte: prev.subpuncte.filter((_, i) => i !== index)
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imagePromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises).then(images => {
      setFormData(prev => ({
        ...prev,
        poze: [...prev.poze, ...images]
      }));
    });
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      poze: prev.poze.filter((_, i) => i !== index)
    }));
  };

  const handleDatePairChange = (index, field, value) => {
    setDatePairs(prev => 
      prev.map((pair, i) => 
        i === index ? { ...pair, [field]: value } : pair
      )
    );
  };

  const addDatePair = () => {
    setDatePairs(prev => [...prev, { key: '', value: '' }]);
  };

  const removeDatePair = (index) => {
    if (datePairs.length > 1) {
      setDatePairs(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleMetadataChange = (field, value) => {
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        [field]: value
      }
    });
  };

  const getDifficultyColorClass = (diff) => {
    switch (diff) {
      case 'ușor':
      case 'usoare':
        return 'difficulty--usor';
      case 'mediu':
      case 'medii':
        return 'difficulty--mediu';
      case 'dificil':
      case 'dificile':
        return 'difficulty--dificil';
      case 'concurs':
      case 'concursuri':
        return 'difficulty--concurs';
      default:
        return '';
    }
  };

  if (adminLoading) {
    return (
      <Layout>
        <div className="admin-dashboard-loading">
          <div className="container">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Se verifică permisiunile...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="admin-dashboard-error">
          <div className="container">
            <div className="error-message">
              <AlertCircle size={48} />
              <h2>Acces interzis</h2>
              <p>Nu ai permisiuni pentru a accesa această pagină.</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="admin-dashboard">
        <div className="admin-dashboard-inner">
          <h1 className="admin-dashboard-title">Panou de administrare</h1>

          {/* Search and Filters - Similar to /probleme */}
          <div className="admin-filters-section">
            <div className="filters-row">
              <form onSubmit={(e) => e.preventDefault()} className="search-container">
                <span className="search-icon"><SearchIcon /></span>
                <input
                  type="text"
                  placeholder="Caută după titlu, categorie, ID sau număr..."
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
              <div className="select-container">
                <select
                  className="filter-select"
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                >
                  {difficulties.map((difficulty) => (
                    <option key={difficulty} value={difficulty}>
                      {difficulty === 'Toate' ? 'Toate dificultățile' : `Dificultate: ${difficulty}`}
                    </option>
                  ))}
                </select>
                <select
                  className="filter-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === 'Toate' ? 'Toate categoriile' : `Categorie: ${category}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* BAC Filter Toggle */}
            <div className="bac-filter-toggle">
              <label className="bac-toggle-label">
                <input
                  type="checkbox"
                  checked={isBacFilter}
                  onChange={(e) => {
                    setIsBacFilter(e.target.checked);
                    if (!e.target.checked) {
                      setFilterYear('');
                      setFilterVariant('');
                      setFilterType('');
                      setFilterSubjectArea('');
                    }
                  }}
                />
                <GraduationCap size={16} />
                <span>Filtrează problemele de BAC</span>
              </label>
            </div>

            {/* BAC Specific Filters - Only show when BAC filter is enabled */}
            {isBacFilter && (
              <div className="bac-filters-row">
                <select
                  className="filter-select"
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                >
                  <option value="">Toți anii</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <select
                  className="filter-select"
                  value={filterVariant}
                  onChange={(e) => setFilterVariant(e.target.value)}
                >
                  <option value="">Toate variantele</option>
                  {variants.map(variant => (
                    <option key={variant} value={variant}>Varianta {variant}</option>
                  ))}
                </select>
                <select
                  className="filter-select"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="">Toate tipurile</option>
                  {types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <select
                  className="filter-select"
                  value={filterSubjectArea}
                  onChange={(e) => setFilterSubjectArea(e.target.value)}
                >
                  <option value="">Toate domeniile</option>
                  {subjectAreas.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
                <button
                  className="clear-bac-filters-btn"
                  onClick={() => {
                    setFilterYear('');
                    setFilterVariant('');
                    setFilterType('');
                    setFilterSubjectArea('');
                  }}
                >
                  <X size={16} />
                  Șterge filtrele BAC
                </button>
              </div>
            )}
          </div>

          {/* Status Messages */}
          {updateError && (
            <div className="admin-message error">
              <AlertCircle size={20} />
              <span>{updateError}</span>
              <button onClick={() => dispatch(clearUpdateStatus())}>
                <X size={16} />
              </button>
            </div>
          )}
          {deleteError && (
            <div className="admin-message error">
              <AlertCircle size={20} />
              <span>{deleteError}</span>
              <button onClick={() => dispatch(clearDeleteStatus())}>
                <X size={16} />
              </button>
            </div>
          )}
          {updateStatus === 'succeeded' && (
            <div className="admin-message success">
              <span>Problema a fost actualizată cu succes!</span>
            </div>
          )}
          {deleteStatus === 'succeeded' && (
            <div className="admin-message success">
              <span>Problema a fost ștearsă cu succes!</span>
            </div>
          )}

          {/* Results Header */}
          <div className="results-header">
            <p className="results-count">
              {filteredProblems.length} {filteredProblems.length === 1 ? 'problemă' : 'probleme'} găsite
            </p>
          </div>

          {/* Problems Grid - Similar to /probleme */}
          {status === 'loading' ? (
            <div className="admin-loading">
              <div className="spinner"></div>
              <p>Se încarcă problemele...</p>
            </div>
          ) : (
            <div className="problems-grid">
              {filteredProblems.map(problem => (
                <div
                  key={problem.id}
                  className="problem-card admin-problem-card"
                  onClick={() => handleProblemClick(problem)}
                >
                  <div className="problem-card-header">
                    <div className="problem-card-info">
                      <span className="problem-card-id">#{problem.index || problem.id}</span>
                      <h3 className="problem-card-title">{problem.titlu || 'Fără titlu'}</h3>
                      <p className="problem-card-topic">{problem.categorie}</p>
                    </div>
                    <div className="problem-card-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn-delete-card"
                        onClick={() => setDeleteConfirm(problem)}
                        title="Șterge"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="problem-card-footer">
                    {/* Nu afișăm dificultatea pentru problemele de BAC */}
                    {(problem.categorie !== 'Bac' && !normalizeString(problem.categorie || '').includes('bac')) && problem.dificultate && (
                      <div className={`problem-card-difficulty ${getDifficultyColorClass(problem.dificultate)}`}>
                        {problem.dificultate}
                      </div>
                    )}
                    {/* Nu afișăm punctajul pentru problemele de BAC */}
                    {problem.punctajTotal && (problem.categorie !== 'Bac' && !normalizeString(problem.categorie || '').includes('bac')) && (
                      <div className="problem-card-points">
                        {problem.punctajTotal} puncte
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Edit Modal - Exact copy from AddProblemModal */}
          {editingProblem && (
            <div className="modal-overlay" onClick={() => setEditingProblem(null)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Editează problemă</h2>
                  <button className="modal-close" onClick={() => setEditingProblem(null)}>×</button>
                </div>
                
                {updateError && (
                  <div className="error-message">
                    Eroare la salvarea problemei: {updateError}
                  </div>
                )}
                
                <form onSubmit={handleSave} className="modal-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Titlu *</label>
                      <input
                        type="text"
                        value={formData.titlu}
                        onChange={(e) => handleInputChange('titlu', e.target.value)}
                        required
                        placeholder="Titlul problemei"
                        disabled={updateStatus === 'loading'}
                      />
                    </div>

                    <div className="form-group">
                      <label>Descriere</label>
                      <textarea
                        value={formData.descriere}
                        onChange={(e) => handleInputChange('descriere', e.target.value)}
                        placeholder="O scurtă descriere a problemei"
                        rows={3}
                        disabled={updateStatus === 'loading'}
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Categorie *</label>
                        <select
                          value={formData.categorie}
                          onChange={(e) => handleInputChange('categorie', e.target.value)}
                          required
                          disabled={updateStatus === 'loading'}
                        >
                          <option value="Mecanică">Mecanică</option>
                          <option value="Oscilații">Oscilații</option>
                          <option value="Unde">Unde</option>
                          <option value="Lissajous">Lissajous</option>
                          <option value="Seismologie">Seismologie</option>
                          <option value="Bac">Bac</option>
                        </select>
                      </div>

                      {/* Ascunde dificultatea pentru problemele de BAC */}
                      {formData.categorie !== 'Bac' && !normalizeString(formData.categorie).includes('bac') && (
                        <div className="form-group">
                          <label>Dificultate *</label>
                          <select
                            value={formData.dificultate}
                            onChange={(e) => handleInputChange('dificultate', e.target.value)}
                            required
                            disabled={updateStatus === 'loading'}
                          >
                            <option value="ușor">Ușor</option>
                            <option value="mediu">Mediu</option>
                            <option value="dificil">Dificil</option>
                            <option value="concurs">Concurs</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Câmpuri specifice pentru problemele de BAC */}
                    {(formData.categorie === 'Bac' || normalizeString(formData.categorie).includes('bac')) && (
                      <div className="form-row">
                        <div className="form-group">
                          <label>Subiect</label>
                          <select
                            value={formData.metadata?.subjectNumber ? String(formData.metadata.subjectNumber) : ''}
                            onChange={(e) => handleMetadataChange('subjectNumber', e.target.value ? parseInt(e.target.value) : null)}
                            disabled={updateStatus === 'loading'}
                          >
                            <option value="">Selectează subiectul</option>
                            <option value="1">Subiectul I</option>
                            <option value="2">Subiectul II</option>
                            <option value="3">Subiectul III</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>An</label>
                          <input
                            type="number"
                            value={formData.metadata?.year || ''}
                            onChange={(e) => handleMetadataChange('year', e.target.value ? parseInt(e.target.value) : null)}
                            placeholder="ex: 2024"
                            min="2000"
                            max="2100"
                            disabled={updateStatus === 'loading'}
                          />
                        </div>
                      </div>
                    )}

                    {(formData.categorie === 'Bac' || normalizeString(formData.categorie).includes('bac')) && (
                      <div className="form-row">
                        <div className="form-group">
                          <label>Sesiune</label>
                          <select
                            value={formData.metadata?.session || ''}
                            onChange={(e) => handleMetadataChange('session', e.target.value || null)}
                            disabled={updateStatus === 'loading'}
                          >
                            <option value="">Selectează sesiunea</option>
                            <option value="bac">Bac</option>
                            <option value="model">Model</option>
                            <option value="simulare">Simulare</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Categorie (Domeniu)</label>
                          <select
                            value={formData.metadata?.subjectArea || ''}
                            onChange={(e) => handleMetadataChange('subjectArea', e.target.value || null)}
                            disabled={updateStatus === 'loading'}
                          >
                            <option value="">Selectează categoria</option>
                            <option value="Mecanică">Mecanică</option>
                            <option value="Termodinamică">Termodinamică</option>
                            <option value="Optică">Optică</option>
                            <option value="Curent continuu">Curent continuu</option>
                          </select>
                        </div>
                      </div>
                    )}

                    <div className="form-group full-width">
                      <label>Conținut/Enunț *</label>
                      <textarea
                        value={formData.continut}
                        onChange={(e) => handleInputChange('continut', e.target.value)}
                        required
                        placeholder="Enunțul problemei cu formule LaTeX (folosește $...$ pentru formule)"
                        rows={6}
                        disabled={updateStatus === 'loading'}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Formule</label>
                      <textarea
                        value={formData.formule.join('\n')}
                        onChange={(e) => handleInputChange('formule', e.target.value.split('\n'))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.stopPropagation();
                          }
                        }}
                        placeholder="Formulele necesare (câte una pe rând)"
                        rows={3}
                        disabled={updateStatus === 'loading'}
                        style={{ whiteSpace: 'pre-wrap' }}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Date/Variabile</label>
                      <div className="date-pairs-container">
                        {datePairs.map((pair, index) => (
                          <div key={index} className="date-pair-row">
                            <input
                              type="text"
                              value={pair.key}
                              onChange={(e) => handleDatePairChange(index, 'key', e.target.value)}
                              placeholder="Nume variabilă (ex: m, v, t)"
                              disabled={updateStatus === 'loading'}
                            />
                            <span className="date-pair-separator">=</span>
                            <input
                              type="text"
                              value={pair.value}
                              onChange={(e) => handleDatePairChange(index, 'value', e.target.value)}
                              placeholder="Valoare (ex: 5 kg, 10 m/s)"
                              disabled={updateStatus === 'loading'}
                            />
                            <button
                              type="button"
                              className="remove-date-pair-btn"
                              onClick={() => removeDatePair(index)}
                              disabled={datePairs.length === 1 || updateStatus === 'loading'}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="add-date-pair-btn"
                          onClick={addDatePair}
                          disabled={updateStatus === 'loading'}
                        >
                          Adaugă variabilă
                        </button>
                      </div>
                    </div>

                    <div className="form-group full-width">
                      <label>Poze</label>
                      <div className="image-upload-area">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          id="image-upload-edit"
                          style={{ display: 'none' }}
                          disabled={updateStatus === 'loading'}
                        />
                        <label htmlFor="image-upload-edit" className="image-upload-label">
                          <div className="upload-placeholder">
                            <span>Click, trage sau folosește Ctrl+V pentru a adăuga poze</span>
                          </div>
                        </label>
                        
                        {formData.poze.length > 0 && (
                          <div className="uploaded-images">
                            {formData.poze.map((image, index) => (
                              <div key={index} className="image-preview">
                                <img src={image} alt={`Preview ${index + 1}`} />
                                <button
                                  type="button"
                                  className="remove-image"
                                  onClick={() => removeImage(index)}
                                  disabled={updateStatus === 'loading'}
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Punctaj total</label>
                      <input
                        type="number"
                        value={formData.punctajTotal}
                        onChange={(e) => handleInputChange('punctajTotal', parseInt(e.target.value) || 0)}
                        min="0"
                        placeholder="Punctaj total"
                        disabled={updateStatus === 'loading'}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Cerințe (subpuncte)</label>
                      <div className="subpuncte-container">
                        {formData.subpuncte.map((subpunct, index) => (
                          <div key={index} className="subpunct-row">
                            <div className="subpunct-inputs">
                              <input
                                type="text"
                                value={subpunct.cerinta}
                                onChange={(e) => handleSubpunctChange(index, 'cerinta', e.target.value)}
                                placeholder="Cerință"
                                disabled={updateStatus === 'loading'}
                              />
                              <input
                                type="number"
                                value={subpunct.punctaj}
                                onChange={(e) => handleSubpunctChange(index, 'punctaj', parseInt(e.target.value) || 0)}
                                min="1"
                                max="10"
                                placeholder="Punctaj"
                                disabled={updateStatus === 'loading'}
                              />
                            </div>
                            <button
                              type="button"
                              className="remove-subpunct-btn"
                              onClick={() => removeSubpunct(index)}
                              disabled={formData.subpuncte.length === 1 || updateStatus === 'loading'}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="add-subpunct-btn"
                          onClick={addSubpunct}
                          disabled={updateStatus === 'loading'}
                        >
                          Adaugă subpunct
                        </button>
                      </div>
                    </div>

                    {/* Metadata Section for BAC - doar pentru problemele non-BAC sau câmpuri suplimentare */}
                    {formData.categorie !== 'Bac' && !normalizeString(formData.categorie).includes('bac') && (
                      <>
                        <div className="form-group full-width">
                          <label>Varianta (opțional)</label>
                          <input
                            type="text"
                            value={formData.varianta}
                            onChange={(e) => handleInputChange('varianta', e.target.value)}
                            placeholder="ex: 2019 Var 2"
                            disabled={updateStatus === 'loading'}
                          />
                        </div>

                        <div className="form-group full-width">
                          <label style={{ fontWeight: 600, marginBottom: '0.75rem', display: 'block' }}>Metadata (opțional)</label>
                          <div className="form-row">
                            <div className="form-group">
                              <label>An</label>
                              <input
                                type="number"
                                value={formData.metadata?.year || ''}
                                onChange={(e) => handleMetadataChange('year', e.target.value ? parseInt(e.target.value) : null)}
                                placeholder="ex: 2019"
                                disabled={updateStatus === 'loading'}
                              />
                            </div>
                            <div className="form-group">
                              <label>Varianta (număr)</label>
                              <input
                                type="number"
                                value={formData.metadata?.variant || ''}
                                onChange={(e) => handleMetadataChange('variant', e.target.value ? parseInt(e.target.value) : null)}
                                placeholder="ex: 2"
                                disabled={updateStatus === 'loading'}
                              />
                            </div>
                          </div>
                          <div className="form-row">
                            <div className="form-group">
                              <label>Tip</label>
                              <input
                                type="text"
                                value={formData.metadata?.type || ''}
                                onChange={(e) => handleMetadataChange('type', e.target.value)}
                                placeholder="ex: teoretic"
                                disabled={updateStatus === 'loading'}
                              />
                            </div>
                            <div className="form-group">
                              <label>Cod subiect</label>
                              <input
                                type="text"
                                value={formData.metadata?.subjectCode || ''}
                                onChange={(e) => handleMetadataChange('subjectCode', e.target.value)}
                                placeholder="ex: A"
                                disabled={updateStatus === 'loading'}
                              />
                            </div>
                          </div>
                          <div className="form-group">
                            <label>Sursă</label>
                            <input
                              type="text"
                              value={formData.metadata?.source || ''}
                              onChange={(e) => handleMetadataChange('source', e.target.value)}
                              placeholder="ex: 2019_E_d_fizica_teoretic_vocational_2019_var_02_LRO"
                              disabled={updateStatus === 'loading'}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Câmpuri suplimentare pentru BAC */}
                    {(formData.categorie === 'Bac' || normalizeString(formData.categorie).includes('bac')) && (
                      <div className="form-group full-width">
                        <label style={{ fontWeight: 600, marginBottom: '0.75rem', display: 'block' }}>Metadata suplimentare (BAC)</label>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Varianta (opțional)</label>
                            <input
                              type="text"
                              value={formData.varianta}
                              onChange={(e) => handleInputChange('varianta', e.target.value)}
                              placeholder="ex: 2019 Var 2"
                              disabled={updateStatus === 'loading'}
                            />
                          </div>
                          <div className="form-group">
                            <label>Varianta (număr)</label>
                            <input
                              type="number"
                              value={formData.metadata?.variant || ''}
                              onChange={(e) => handleMetadataChange('variant', e.target.value ? parseInt(e.target.value) : null)}
                              placeholder="ex: 2"
                              disabled={updateStatus === 'loading'}
                            />
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Cod subiect</label>
                            <input
                              type="text"
                              value={formData.metadata?.subjectCode || ''}
                              onChange={(e) => handleMetadataChange('subjectCode', e.target.value)}
                              placeholder="ex: A"
                              disabled={updateStatus === 'loading'}
                            />
                          </div>
                          <div className="form-group">
                            <label>Sursă</label>
                            <input
                              type="text"
                              value={formData.metadata?.source || ''}
                              onChange={(e) => handleMetadataChange('source', e.target.value)}
                              placeholder="ex: 2019_E_d_fizica_teoretic_vocational_2019_var_02_LRO"
                              disabled={updateStatus === 'loading'}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="modal-actions">
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={updateStatus === 'loading'}
                    >
                      {updateStatus === 'loading' ? 'Se salvează...' : 'Salvează'}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setEditingProblem(null)}
                      disabled={updateStatus === 'loading'}
                    >
                      Anulează
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deleteConfirm && (
            <div className="admin-modal-overlay" onClick={() => setDeleteConfirm(null)}>
              <div className="admin-modal delete-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Confirmă ștergerea</h2>
                  <button className="modal-close" onClick={() => setDeleteConfirm(null)}>×</button>
                </div>
                <div className="modal-content">
                  <div className="delete-confirmation">
                    <AlertCircle size={48} className="warning-icon" />
                    <p>Ești sigur că vrei să ștergi problema:</p>
                    <p className="problem-to-delete"><strong>{deleteConfirm.titlu || 'Fără titlu'}</strong></p>
                    <p className="warning-text">Această acțiune nu poate fi anulată!</p>
                  </div>
                </div>
                <div className="modal-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => setDeleteConfirm(null)}
                  >
                    Anulează
                  </button>
                  <button
                    className="btn-danger"
                    onClick={handleDelete}
                    disabled={deleteStatus === 'loading'}
                  >
                    {deleteStatus === 'loading' ? 'Se șterge...' : 'Șterge'}
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
