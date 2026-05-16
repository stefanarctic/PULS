import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../Layout';
import { useAdmin } from '../../hooks/useAdmin';
import { fetchProblems, updateProblem, deleteProblem, clearUpdateStatus, clearDeleteStatus } from '../../features/problems/problemsSlice';
import { Trash2, Search, X, AlertCircle, GraduationCap, User, UserPlus, ChevronDown } from 'lucide-react';
import { normalizeString } from '../../lib/normalizeString';
import { collection, query, where, getDocs, getDoc, updateDoc, doc } from 'firebase/firestore';
import { createTeacherInvite } from '../../lib/teacherInvite';
import { db } from '../../lib/firebase';
import { useI18n } from '../../i18n/LanguageContext';
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
  const location = useLocation();
  const { value: problems, status, updateStatus, updateError, deleteStatus, deleteError } = useSelector(state => state.problems);
  const { t, localizedPath } = useI18n();
  const AD = 'adminDashboard';

  const difficultyDisplayLabel = (value) => {
    if (value == null || value === '') return value;
    const key = normalizeString(String(value));
    return t(`profilePage.difficultyLabels.${key}`, String(value));
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Toate');
  const [selectedCategory, setSelectedCategory] = useState('Toate');
  const [problemTypeFilter, setProblemTypeFilter] = useState('all'); // 'all', 'normal', 'bac'
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
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [teacherApprovalsLoading, setTeacherApprovalsLoading] = useState(false);
  const [selfTeacherStatus, setSelfTeacherStatus] = useState(null);
  const [selfTeacherRoleSaving, setSelfTeacherRoleSaving] = useState(false);
  const [teacherInviteLoading, setTeacherInviteLoading] = useState(false);
  const [teacherInviteUrl, setTeacherInviteUrl] = useState('');
  const [teacherInviteError, setTeacherInviteError] = useState('');
  const [teacherInviteCopied, setTeacherInviteCopied] = useState(false);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate(localizedPath('/'));
    }
  }, [isAdmin, adminLoading, navigate, localizedPath]);

  useEffect(() => {
    if (!isAdmin || !user?.uid) {
      setSelfTeacherStatus(null);
      return;
    }
    let cancelled = false;
    getDoc(doc(db, 'users', user.uid))
      .then((snap) => {
        if (cancelled || !snap.exists()) return;
        setSelfTeacherStatus(snap.data().teacherStatus || 'none');
      })
      .catch((err) => console.error('Self teacher status:', err));
    return () => {
      cancelled = true;
    };
  }, [isAdmin, user?.uid]);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    setTeacherApprovalsLoading(true);
    const q = query(collection(db, 'users'), where('teacherStatus', '==', 'pending'));
    getDocs(q)
      .then((snap) => {
        if (!cancelled) {
          setPendingTeachers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        }
      })
      .catch((err) => console.error('Pending teachers:', err))
      .finally(() => {
        if (!cancelled) setTeacherApprovalsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const approveTeacher = async (uid) => {
    try {
      await updateDoc(doc(db, 'users', uid), { teacherStatus: 'approved' });
      setPendingTeachers((prev) => prev.filter((p) => p.id !== uid));
    } catch (e) {
      console.error(e);
      alert(t(`${AD}.errors.approveTeacher`, 'Nu s-a putut aproba.'));
    }
  };

  const rejectTeacher = async (uid) => {
    try {
      await updateDoc(doc(db, 'users', uid), { teacherStatus: 'rejected' });
      setPendingTeachers((prev) => prev.filter((p) => p.id !== uid));
    } catch (e) {
      console.error(e);
      alert(t(`${AD}.errors.rejectTeacher`, 'Nu s-a putut respinge.'));
    }
  };

  const handleGenerateTeacherInvite = async () => {
    if (!user?.uid) return;
    setTeacherInviteLoading(true);
    setTeacherInviteError('');
    setTeacherInviteCopied(false);
    try {
      const { url } = await createTeacherInvite(user.uid);
      setTeacherInviteUrl(url);
    } catch (e) {
      console.error(e);
      setTeacherInviteError(
        t(
          `${AD}.errors.inviteGenerate`,
          'Nu s-a putut genera invitația. Verifică regulile Firestore și că ești admin.'
        )
      );
    } finally {
      setTeacherInviteLoading(false);
    }
  };

  const copyTeacherInviteUrl = async () => {
    if (!teacherInviteUrl) return;
    try {
      await navigator.clipboard.writeText(teacherInviteUrl);
      setTeacherInviteCopied(true);
      setTimeout(() => setTeacherInviteCopied(false), 2000);
    } catch {
      setTeacherInviteError(t(`${AD}.errors.inviteCopy`, 'Nu s-a putut copia în clipboard.'));
    }
  };

  const setDebugTeacherRole = async (status) => {
    if (!user?.uid) return;
    setSelfTeacherRoleSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), { teacherStatus: status });
      setSelfTeacherStatus(status);
    } catch (e) {
      console.error(e);
      alert(t(`${AD}.errors.roleUpdate`, 'Nu s-a putut actualiza rolul.'));
    } finally {
      setSelfTeacherRoleSaving(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchProblems());
    }
  }, [isAdmin, dispatch]);

  useEffect(() => {
    if (updateStatus === 'succeeded') {
      handleCloseModal();
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

  // Handle editId URL parameter to automatically open edit modal
  useEffect(() => {
    if (status === 'succeeded' && problems.length > 0 && !editingProblem) {
      const searchParams = new URLSearchParams(location.search);
      const editId = searchParams.get('editId');
      
      if (editId) {
        const problemToEdit = problems.find(p => p.id === editId);
        if (problemToEdit) {
          handleEdit(problemToEdit);
          // Remove editId from URL
          // searchParams.delete('editId');
          // navigate(`/admin${searchParams.toString() ? `?${searchParams.toString()}` : ''}`, { replace: true });
        }
      }
    }
  }, [status, problems, location.search, editingProblem, navigate]);

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

  // Helper function to check if a problem is BAC
  const isBacProblem = (problem) => {
    const categorie = problem.categorie || '';
    const normalizedCategorie = normalizeString(categorie);
    return categorie === 'Bac' || normalizedCategorie.includes('bac');
  };

  const filteredProblems = useMemo(() => {
    return problems.filter(problem => {
      // Problem type filter (all, normal, bac)
      if (problemTypeFilter === 'bac') {
        if (!isBacProblem(problem)) return false;
      } else if (problemTypeFilter === 'normal') {
        if (isBacProblem(problem)) return false;
      }
      // If problemTypeFilter === 'all', show all problems

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

      // BAC-specific filters (only apply to BAC problems)
      if (isBacProblem(problem)) {
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
  }, [problems, searchQuery, selectedDifficulty, selectedCategory, problemTypeFilter, filterYear, filterVariant, filterType, filterSubjectArea]);

  const handleCloseModal = () => {
    // setEditingProblem(null);
    navigate(localizedPath('/admin'), { replace: false });
    setTimeout(() => setEditingProblem(null), 50);
  };

  const handleProblemClick = (problem) => {
    handleEdit(problem);
  };

  // Funcție pentru a verifica dacă query-ul este un ID valid și deschide modalul de editare
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const query = searchQuery.trim();
      // Verifică dacă query-ul este un număr și dacă există o problemă cu acel index
      const problemIndex = parseInt(query);
      if (!isNaN(problemIndex)) {
        const problem = problems.find(p => p.index === problemIndex);
        if (problem) {
          handleEdit(problem);
          setSearchQuery(''); // Șterge query-ul după ce găsește problema
          return;
        }
      }
      // Dacă nu e număr, poate fi ID direct
      const problemById = problems.find(p => p.id === query || p.id?.toString() === query);
      if (problemById) {
        handleEdit(problemById);
        setSearchQuery(''); // Șterge query-ul după ce găsește problema
        return;
      }
    }
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

  const handleAiAnalysis = async () => {
    if (!formData.continut || !formData.continut.trim()) {
      console.warn('[AI Analysis] Nu există conținut în enunț pentru analiză');
      alert(t(`${AD}.ai.needContent`, 'Te rugăm să introduci mai întâi enunțul problemei.'));
      return;
    }

    console.log('[AI Analysis] Început analiză problemă');
    console.log('[AI Analysis] Enunțul problemei:', formData.continut.substring(0, 200) + '...');
    
    setAiAnalyzing(true);
    const startTime = Date.now();
    
    try {
      const prompt = `Analizează următoarea problemă de fizică și extrage:
1. Toate datele numerice și variabilele menționate în enunț (ex: m = 5 kg, v = 10 m/s, t = 2 s)
2. Toate formulele fizice necesare pentru rezolvarea problemei

Enunțul problemei:
${formData.continut}

Răspunde în format JSON cu următoarea structură:
{
  "date": {
    "nume_variabila": "valoare cu unitate",
    ...
  },
  "formule": [
    "formula 1 în format LaTeX",
    "formula 2 în format LaTeX",
    ...
  ]
}

Dacă nu găsești date sau formule, returnează obiecte goale. Răspunde DOAR cu JSON, fără text suplimentar.`;

      const sessionId = `admin-analysis-${Date.now()}`;
      console.log('[AI Analysis] Trimite request către API');
      console.log('[AI Analysis] Session ID:', sessionId);
      console.log('[AI Analysis] Prompt length:', prompt.length, 'caractere');

      const response = await fetch("/api/webhook/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt, sessionId }),
      });

      const requestTime = Date.now() - startTime;
      console.log('[AI Analysis] Request completat în', requestTime, 'ms');
      console.log('[AI Analysis] Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[AI Analysis] Eroare HTTP:', response.status, response.statusText);
        console.error('[AI Analysis] Response body:', errorText);
        throw new Error(`Eroare ${response.status}: ${response.statusText}`);
      }

      const responseText = await response.text();
      console.log('[AI Analysis] Response primit, lungime:', responseText.length, 'caractere');
      console.log('[AI Analysis] Response raw (primele 500 caractere):', responseText.substring(0, 500));
      
      let aiResponse = responseText;
      let parsedResponse = null;

      // Try to parse the response as JSON first (it might be an array or object)
      try {
        parsedResponse = JSON.parse(responseText);
        console.log('[AI Analysis] Response parsat ca JSON:', Array.isArray(parsedResponse) ? 'Array' : 'Object');
        
        // If it's an array, try to get the first element
        if (Array.isArray(parsedResponse) && parsedResponse.length > 0) {
          const firstItem = parsedResponse[0];
          console.log('[AI Analysis] Primul element din array:', Object.keys(firstItem));
          
          // Check if it has an "output" field
          if (firstItem.output) {
            console.log('[AI Analysis] Găsit câmp "output", extragere conținut...');
            aiResponse = firstItem.output;
          } else if (firstItem.message) {
            console.log('[AI Analysis] Găsit câmp "message", extragere conținut...');
            aiResponse = firstItem.message;
          } else if (firstItem.text) {
            console.log('[AI Analysis] Găsit câmp "text", extragere conținut...');
            aiResponse = firstItem.text;
          } else {
            // Use the whole object as string
            aiResponse = JSON.stringify(firstItem);
          }
        } else if (parsedResponse && typeof parsedResponse === 'object') {
          // It's an object, check for output/message/text fields
          if (parsedResponse.output) {
            console.log('[AI Analysis] Găsit câmp "output" în obiect, extragere conținut...');
            aiResponse = parsedResponse.output;
          } else if (parsedResponse.message) {
            console.log('[AI Analysis] Găsit câmp "message" în obiect, extragere conținut...');
            aiResponse = parsedResponse.message;
          } else if (parsedResponse.text) {
            console.log('[AI Analysis] Găsit câmp "text" în obiect, extragere conținut...');
            aiResponse = parsedResponse.text;
          }
        }
      } catch (e) {
        console.log('[AI Analysis] Response nu este JSON valid, se folosește textul direct');
      }

      // Try to extract JSON from markdown code blocks (```json ... ```)
      const markdownJsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/);
      if (markdownJsonMatch) {
        console.log('[AI Analysis] JSON detectat în bloc markdown, extragere...');
        aiResponse = markdownJsonMatch[1].trim();
        console.log('[AI Analysis] JSON extras din markdown, lungime:', aiResponse.length, 'caractere');
      } else {
        // Try to extract JSON from code blocks without language (``` ... ```)
        const codeBlockMatch = aiResponse.match(/```\s*([\s\S]*?)\s*```/);
        if (codeBlockMatch) {
          console.log('[AI Analysis] Bloc de cod detectat (fără language), extragere...');
          aiResponse = codeBlockMatch[1].trim();
        }
      }

      // Try to extract JSON object from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log('[AI Analysis] JSON detectat în răspuns, extragere...');
        aiResponse = jsonMatch[0];
        console.log('[AI Analysis] JSON extras, lungime:', aiResponse.length, 'caractere');
      } else {
        console.warn('[AI Analysis] Nu s-a găsit JSON în răspuns, se încearcă parsare directă');
      }

      // Parse the JSON response
      let analysisData = {
        date: {},
        formule: []
      };
      try {
        console.log('[AI Analysis] Încearcă parsare JSON final...');
        console.log('[AI Analysis] JSON de parsat (primele 300 caractere):', aiResponse.substring(0, 300));
        const parsed = JSON.parse(aiResponse);
        
        // Asigură că avem structura corectă
        if (parsed && typeof parsed === 'object') {
          analysisData = {
            date: parsed.date || {},
            formule: Array.isArray(parsed.formule) ? parsed.formule : []
          };
        } else {
          analysisData = { date: {}, formule: [] };
        }
        
        console.log('[AI Analysis] JSON parsat cu succes');
        console.log('[AI Analysis] Date extrase:', {
          numarDate: Object.keys(analysisData.date || {}).length,
          numarFormule: (analysisData.formule || []).length,
          dateKeys: Object.keys(analysisData.date || {}),
          formulePreview: (analysisData.formule || []).slice(0, 3)
        });
      } catch (parseError) {
        // If parsing fails, try to extract data manually
        console.error('[AI Analysis] Eroare la parsare JSON:', parseError);
        console.log('[AI Analysis] Răspuns complet AI:', aiResponse);
        
        analysisData = {
          date: {},
          formule: []
        };

        // Funcție helper pentru a extrage obiectul JSON corect (gestionează acolade nested)
        const extractJsonObject = (str, startKey) => {
          const keyIndex = str.indexOf(`"${startKey}"`);
          if (keyIndex === -1) return null;
          
          let braceCount = 0;
          let bracketCount = 0;
          let inString = false;
          let escapeNext = false;
          let startPos = -1;
          let endPos = -1;
          
          // Găsește începutul obiectului/array-ului
          for (let i = keyIndex; i < str.length; i++) {
            const char = str[i];
            
            if (escapeNext) {
              escapeNext = false;
              continue;
            }
            
            if (char === '\\') {
              escapeNext = true;
              continue;
            }
            
            if (char === '"' && !escapeNext) {
              inString = !inString;
              continue;
            }
            
            if (inString) continue;
            
            if (char === '{') {
              if (startPos === -1) startPos = i;
              braceCount++;
            } else if (char === '}') {
              braceCount--;
              if (braceCount === 0 && startPos !== -1) {
                endPos = i + 1;
                break;
              }
            } else if (char === '[') {
              if (startPos === -1) startPos = i;
              bracketCount++;
            } else if (char === ']') {
              bracketCount--;
              if (bracketCount === 0 && startPos !== -1) {
                endPos = i + 1;
                break;
              }
            }
          }
          
          if (startPos !== -1 && endPos !== -1) {
            return str.substring(startPos, endPos);
          }
          return null;
        };

        // Încearcă să extragă obiectul "date"
        try {
          const dateObjStr = extractJsonObject(aiResponse, 'date');
          if (dateObjStr) {
            console.log('[AI Analysis] Obiect date extras:', dateObjStr.substring(0, 200));
            const dateObj = JSON.parse(dateObjStr);
            if (dateObj && typeof dateObj === 'object') {
              analysisData.date = dateObj;
              console.log('[AI Analysis] Date parsate cu succes:', Object.keys(analysisData.date));
            }
          }
        } catch (e) {
          console.log('[AI Analysis] Nu s-au putut extrage date cu metoda avansată, se încearcă regex simplu');
          // Fallback la regex simplu
          const datePattern = /"date"\s*:\s*\{([^}]*)\}/;
          const dateMatch = aiResponse.match(datePattern);
          if (dateMatch) {
            try {
              const dateObjStr = '{' + dateMatch[1] + '}';
              const dateObj = JSON.parse(dateObjStr);
              analysisData.date = dateObj;
            } catch (e2) {
              // Încearcă să extragă perechi individuale
              const pairs = dateMatch[1].match(/"([^"]+)"\s*:\s*"([^"]+)"/g);
              if (pairs) {
                pairs.forEach(pair => {
                  const match = pair.match(/"([^"]+)"\s*:\s*"([^"]+)"/);
                  if (match) {
                    analysisData.date[match[1]] = match[2];
                  }
                });
              }
            }
          }
        }

        // Încearcă să extragă array-ul "formule"
        try {
          const formuleArrayStr = extractJsonObject(aiResponse, 'formule');
          if (formuleArrayStr) {
            console.log('[AI Analysis] Array formule extras:', formuleArrayStr.substring(0, 200));
            const formuleArray = JSON.parse(formuleArrayStr);
            if (Array.isArray(formuleArray)) {
              analysisData.formule = formuleArray;
              console.log('[AI Analysis] Formule parsate cu succes:', analysisData.formule.length);
            }
          }
        } catch (e) {
          console.log('[AI Analysis] Nu s-au putut extrage formule cu metoda avansată, se încearcă regex simplu');
          // Fallback la regex simplu
          const formulePattern = /"formule"\s*:\s*\[([^\]]*)\]/;
          const formuleMatch = aiResponse.match(formulePattern);
          if (formuleMatch) {
            try {
              const formuleArrayStr = '[' + formuleMatch[1] + ']';
              const formuleArray = JSON.parse(formuleArrayStr);
              if (Array.isArray(formuleArray)) {
                analysisData.formule = formuleArray;
              }
            } catch (e2) {
              // Încearcă să extragă formule individuale
              const formuleArray = formuleMatch[1].match(/"([^"]+)"/g);
              if (formuleArray) {
                analysisData.formule = formuleArray.map(f => {
                  // Elimină ghilimelele și gestionează escape-urile
                  return f.replace(/^"|"$/g, '').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
                });
              }
            }
          }
        }
        
        console.log('[AI Analysis] Fallback completat:', {
          numarDate: Object.keys(analysisData.date).length,
          numarFormule: analysisData.formule.length
        });
      }

      // Update date pairs
      if (analysisData.date && Object.keys(analysisData.date).length > 0) {
        const newDatePairs = Object.entries(analysisData.date).map(([key, value]) => ({
          key: key.trim(),
          value: String(value).trim()
        }));
        console.log('[AI Analysis] Actualizare date pairs:', newDatePairs.length, 'perechi');
        console.log('[AI Analysis] Date pairs:', newDatePairs);
        setDatePairs(newDatePairs.length > 0 ? newDatePairs : [{ key: '', value: '' }]);
      } else {
        console.log('[AI Analysis] Nu s-au găsit date pentru actualizare');
      }

      // Update formulas
      if (analysisData.formule && Array.isArray(analysisData.formule) && analysisData.formule.length > 0) {
        const cleanedFormule = analysisData.formule
          .map(f => f.trim())
          .filter(f => f.length > 0);
        console.log('[AI Analysis] Actualizare formule:', cleanedFormule.length, 'formule');
        console.log('[AI Analysis] Formule:', cleanedFormule);
        if (cleanedFormule.length > 0) {
          setFormData(prev => ({
            ...prev,
            formule: cleanedFormule
          }));
        }
      } else {
        console.log('[AI Analysis] Nu s-au găsit formule pentru actualizare');
      }

      const totalTime = Date.now() - startTime;
      console.log('[AI Analysis] Analiză completă în', totalTime, 'ms');
      
      if ((!analysisData.date || Object.keys(analysisData.date).length === 0) &&
          (!analysisData.formule || analysisData.formule.length === 0)) {
        console.warn('[AI Analysis] Nu s-au detectat date sau formule');
        alert(
          t(
            `${AD}.ai.noDetection`,
            'AI-ul nu a putut detecta date sau formule în enunț. Te rugăm să le introduci manual.'
          )
        );
      } else {
        console.log('[AI Analysis] Analiză finalizată cu succes');
      }
    } catch (error) {
      const totalTime = Date.now() - startTime;
      console.error('[AI Analysis] Eroare la analiza problemei:', error);
      console.error('[AI Analysis] Stack trace:', error.stack);
      console.error('[AI Analysis] Timp până la eroare:', totalTime, 'ms');
      alert(
        t(
          `${AD}.ai.analysisError`,
          'Eroare la analiza problemei cu AI. Te rugăm să încerci din nou sau să introduci datele manual.'
        )
      );
    } finally {
      setAiAnalyzing(false);
      console.log('[AI Analysis] Stare analiză resetată');
    }
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
          <div className="spinner"></div>
          <p>{t(`${AD}.checkingAccess`, 'Se verifică permisiunile...')}</p>
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
              <h2>{t(`${AD}.accessDeniedTitle`, 'Acces interzis')}</h2>
              <p>{t(`${AD}.accessDeniedBody`, 'Nu ai permisiuni pentru a accesa această pagină.')}</p>
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
          <h1 className="admin-dashboard-title">{t(`${AD}.pageTitle`, 'Panou de administrare')}</h1>

          <section className="admin-teacher-requests admin-debug-teacher-role" aria-label={t(`${AD}.debug.sectionAria`, 'Rol cont pentru testare')}>
            <h2 className="admin-teacher-requests-title">
              <User size={22} aria-hidden />
              {t(`${AD}.debug.title`, 'Rol cont (testare)')}
            </h2>
            <p className="admin-debug-teacher-role-lead">
              {t(`${AD}.debug.statusLabel`, 'Stare curentă:')}{' '}
              <strong className="admin-debug-teacher-role-status">{selfTeacherStatus ?? '…'}</strong>
              .{' '}
              {t(`${AD}.debug.asStudentPrefix`, 'Ca elev')}{' '}
              (<code>none</code>){t(`${AD}.debug.asStudentSuffix`, ' nu poți crea clase; ca profesor ')}
              (<code>approved</code>){t(`${AD}.debug.asTeacherSuffix`, ' ai acces la panoul profesor.')}
            </p>
            <div className="admin-teacher-requests-actions admin-debug-teacher-role-actions">
              <button
                type="button"
                className="admin-teacher-btn approve"
                disabled={selfTeacherRoleSaving || selfTeacherStatus == null || selfTeacherStatus === 'approved'}
                onClick={() => setDebugTeacherRole('approved')}
              >
                {t(`${AD}.debug.simulateTeacher`, 'Simulează profesor')}
              </button>
              <button
                type="button"
                className="admin-teacher-btn reject"
                disabled={selfTeacherRoleSaving || selfTeacherStatus == null || selfTeacherStatus === 'none'}
                onClick={() => setDebugTeacherRole('none')}
              >
                {t(`${AD}.debug.simulateStudent`, 'Simulează elev')}
              </button>
            </div>
          </section>

          <section className="admin-teacher-requests" aria-label={t(`${AD}.teacherRequests.sectionAria`, 'Cereri profesor')}>
            <h2 className="admin-teacher-requests-title">
              <GraduationCap size={22} aria-hidden />
              {t(`${AD}.teacherRequests.title`, 'Cereri cont profesor')}
            </h2>
            {teacherApprovalsLoading ? (
              <p className="admin-teacher-requests-empty">{t(`${AD}.teacherRequests.loading`, 'Se încarcă...')}</p>
            ) : pendingTeachers.length === 0 ? (
              <p className="admin-teacher-requests-empty">{t(`${AD}.teacherRequests.empty`, 'Nicio cerere în așteptare.')}</p>
            ) : (
              <ul className="admin-teacher-requests-list">
                {pendingTeachers.map((pending) => (
                  <li key={pending.id} className="admin-teacher-requests-item">
                    <div className="admin-teacher-requests-info">
                      <strong>{pending.name || '—'}</strong>
                      <span className="admin-teacher-requests-email">{pending.email || ''}</span>
                    </div>
                    <div className="admin-teacher-requests-actions">
                      <button type="button" className="admin-teacher-btn approve" onClick={() => approveTeacher(pending.id)}>
                        {t(`${AD}.teacherRequests.approve`, 'Aprobă')}
                      </button>
                      <button type="button" className="admin-teacher-btn reject" onClick={() => rejectTeacher(pending.id)}>
                        {t(`${AD}.teacherRequests.reject`, 'Respinge')}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <details className="admin-teacher-invite" aria-label={t(`${AD}.invite.sectionAria`, 'Invitație profesor')}>
            <summary className="admin-teacher-invite-summary">
              <span className="admin-teacher-invite-summary-text">
                <UserPlus size={22} aria-hidden className="admin-teacher-invite-summary-icon" />
                <span className="admin-teacher-invite-heading">{t(`${AD}.invite.heading`, 'Invitație profesor')}</span>
              </span>
              <ChevronDown size={22} className="admin-teacher-invite-chevron" aria-hidden />
            </summary>
            <div className="admin-teacher-invite-body">
              <p className="admin-teacher-invite-lead">
                {t(
                  `${AD}.invite.lead`,
                  'Generează un link unic și trimite-l persoanei care trebuie să poată cere cont de profesor. După ce trimite cererea, o vezi mai sus și o aprobi sau respingi manual.'
                )}
              </p>
              <div className="admin-teacher-invite-actions">
                <button
                  type="button"
                  className="admin-teacher-btn approve"
                  disabled={teacherInviteLoading}
                  onClick={handleGenerateTeacherInvite}
                >
                  {teacherInviteLoading
                    ? t(`${AD}.invite.generating`, 'Se generează...')
                    : t(`${AD}.invite.generate`, 'Generează link nou')}
                </button>
                {teacherInviteUrl ? (
                  <button
                    type="button"
                    className="admin-teacher-btn reject"
                    onClick={copyTeacherInviteUrl}
                  >
                    {teacherInviteCopied
                      ? t(`${AD}.invite.copied`, 'Copiat în clipboard')
                      : t(`${AD}.invite.copy`, 'Copiază linkul')}
                  </button>
                ) : null}
              </div>
              {teacherInviteError ? <p className="admin-teacher-invite-err">{teacherInviteError}</p> : null}
              {teacherInviteUrl ? (
                <div className="admin-teacher-invite-url-box">
                  <span className="admin-teacher-invite-url-label">{t(`${AD}.invite.linkLabel`, 'Link generat')}</span>
                  <code className="admin-teacher-invite-url" title={teacherInviteUrl}>
                    {teacherInviteUrl}
                  </code>
                </div>
              ) : null}
            </div>
          </details>

          {/* Search and Filters - Similar to /probleme */}
          <div className="admin-filters-section">
            <div className="filters-row">
              <form onSubmit={handleSearchSubmit} className="search-container">
                <span className="search-icon"><SearchIcon /></span>
                <input
                  type="text"
                  placeholder={t(
                    `${AD}.filters.searchPlaceholder`,
                    'Caută după titlu, categorie, ID sau număr...'
                  )}
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
              <div className="select-container">
                <select
                  className="filter-select"
                  value={problemTypeFilter}
                  onChange={(e) => {
                    setProblemTypeFilter(e.target.value);
                    // Clear BAC-specific filters when switching away from BAC filter
                    if (e.target.value !== 'bac') {
                      setFilterYear('');
                      setFilterVariant('');
                      setFilterType('');
                      setFilterSubjectArea('');
                    }
                  }}
                >
                  <option value="all">{t(`${AD}.filters.typeAll`, 'Toate')}</option>
                  <option value="normal">{t(`${AD}.filters.typeNormal`, 'Normale')}</option>
                  <option value="bac">{t(`${AD}.filters.typeBac`, 'Bac')}</option>
                </select>
                <select
                  className="filter-select"
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                >
                  {difficulties.map((difficulty) => (
                    <option key={difficulty} value={difficulty}>
                      {difficulty === 'Toate'
                        ? t(`${AD}.filters.allDifficulties`, 'Toate dificultățile')
                        : t(`${AD}.filters.difficultyPrefix`, 'Dificultate: {label}', {
                            label: difficultyDisplayLabel(difficulty),
                          })}
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
                      {category === 'Toate'
                        ? t(`${AD}.filters.allCategories`, 'Toate categoriile')
                        : t(`${AD}.filters.categoryPrefix`, 'Categorie: {name}', { name: category })}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* BAC Specific Filters - Only show when BAC filter is selected */}
            {problemTypeFilter === 'bac' && (
              <div className="bac-filters-row">
                <select
                  className="filter-select"
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                >
                  <option value="">{t(`${AD}.filters.allYears`, 'Toți anii')}</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <select
                  className="filter-select"
                  value={filterVariant}
                  onChange={(e) => setFilterVariant(e.target.value)}
                >
                  <option value="">{t(`${AD}.filters.allVariants`, 'Toate variantele')}</option>
                  {variants.map((variant) => (
                    <option key={variant} value={variant}>
                      {t(`${AD}.filters.variantOption`, 'Varianta {n}', { n: variant })}
                    </option>
                  ))}
                </select>
                <select
                  className="filter-select"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="">{t(`${AD}.filters.allTypes`, 'Toate tipurile')}</option>
                  {types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <select
                  className="filter-select"
                  value={filterSubjectArea}
                  onChange={(e) => setFilterSubjectArea(e.target.value)}
                >
                  <option value="">{t(`${AD}.filters.allSubjectAreas`, 'Toate domeniile')}</option>
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
                  {t(`${AD}.filters.clearBac`, 'Șterge filtrele BAC')}
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
              <span>{t(`${AD}.messages.updateSuccess`, 'Problema a fost actualizată cu succes!')}</span>
            </div>
          )}
          {deleteStatus === 'succeeded' && (
            <div className="admin-message success">
              <span>{t(`${AD}.messages.deleteSuccess`, 'Problema a fost ștearsă cu succes!')}</span>
            </div>
          )}

          {/* Results Header */}
          <div className="results-header">
            <p className="results-count">
              {filteredProblems.length === 1
                ? t(`${AD}.results.oneProblemFound`, '{count} problemă găsită', { count: filteredProblems.length })
                : t(`${AD}.results.manyProblemsFound`, '{count} probleme găsite', { count: filteredProblems.length })}
            </p>
          </div>

          {/* Problems Grid - Similar to /probleme */}
          {status === 'loading' ? (
            <div className="admin-loading">
              <div className="spinner"></div>
              <p>{t(`${AD}.loadingProblems`, 'Se încarcă problemele...')}</p>
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
                      <h3 className="problem-card-title">
                        {problem.titlu || t(`${AD}.card.noTitle`, 'Fără titlu')}
                      </h3>
                      <p className="problem-card-topic">{problem.categorie}</p>
                    </div>
                    <div className="problem-card-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn-delete-card"
                        onClick={() => setDeleteConfirm(problem)}
                        title={t(`${AD}.card.deleteTitle`, 'Șterge')}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="problem-card-footer">
                    {/* Nu afișăm dificultatea pentru problemele de BAC */}
                    {(problem.categorie !== 'Bac' && !normalizeString(problem.categorie || '').includes('bac')) && problem.dificultate && (
                      <div className={`problem-card-difficulty ${getDifficultyColorClass(problem.dificultate)}`}>
                        {difficultyDisplayLabel(problem.dificultate)}
                      </div>
                    )}
                    {/* Nu afișăm punctajul pentru problemele de BAC */}
                    {problem.punctajTotal && (problem.categorie !== 'Bac' && !normalizeString(problem.categorie || '').includes('bac')) && (
                      <div className="problem-card-points">
                        {t(`${AD}.card.points`, '{n} puncte', { n: problem.punctajTotal })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Edit Modal - Exact copy from AddProblemModal */}
          {editingProblem && (
            <div className="modal-overlay" onClick={handleCloseModal}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>{t(`${AD}.modal.editTitle`, 'Editează problemă')}</h2>
                  <button className="modal-close" onClick={handleCloseModal}>×</button>
                </div>
                
                {updateError && (
                  <div className="error-message">
                    {t(`${AD}.messages.saveErrorPrefix`, 'Eroare la salvarea problemei:')} {updateError}
                  </div>
                )}
                
                <form onSubmit={handleSave} className="modal-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>{t(`${AD}.modal.titleLabel`, 'Titlu *')}</label>
                      <input
                        type="text"
                        value={formData.titlu}
                        onChange={(e) => handleInputChange('titlu', e.target.value)}
                        required
                        placeholder={t(`${AD}.modal.titlePlaceholder`, 'Titlul problemei')}
                        disabled={updateStatus === 'loading'}
                      />
                    </div>

                    <div className="form-group">
                      <label>{t(`${AD}.modal.descriptionLabel`, 'Descriere')}</label>
                      <textarea
                        value={formData.descriere}
                        onChange={(e) => handleInputChange('descriere', e.target.value)}
                        placeholder={t(`${AD}.modal.descriptionPlaceholder`, 'O scurtă descriere a problemei')}
                        rows={3}
                        disabled={updateStatus === 'loading'}
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>{t(`${AD}.modal.categoryLabel`, 'Categorie *')}</label>
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
                          <label>{t(`${AD}.modal.difficultyLabel`, 'Dificultate *')}</label>
                          <select
                            value={formData.dificultate}
                            onChange={(e) => handleInputChange('dificultate', e.target.value)}
                            required
                            disabled={updateStatus === 'loading'}
                          >
                            <option value="ușor">{difficultyDisplayLabel('ușor')}</option>
                            <option value="mediu">{difficultyDisplayLabel('mediu')}</option>
                            <option value="dificil">{difficultyDisplayLabel('dificil')}</option>
                            <option value="concurs">{difficultyDisplayLabel('concurs')}</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Câmpuri specifice pentru problemele de BAC */}
                    {(formData.categorie === 'Bac' || normalizeString(formData.categorie).includes('bac')) && (
                      <div className="form-row">
                        <div className="form-group">
                          <label>{t(`${AD}.modal.bac.subjectLabel`, 'Subiect')}</label>
                          <select
                            value={formData.metadata?.subjectNumber ? String(formData.metadata.subjectNumber) : ''}
                            onChange={(e) => handleMetadataChange('subjectNumber', e.target.value ? parseInt(e.target.value) : null)}
                            disabled={updateStatus === 'loading'}
                          >
                            <option value="">{t(`${AD}.modal.bac.selectSubject`, 'Selectează subiectul')}</option>
                            <option value="1">{t(`${AD}.modal.bac.subject1`, 'Subiectul I')}</option>
                            <option value="2">{t(`${AD}.modal.bac.subject2`, 'Subiectul II')}</option>
                            <option value="3">{t(`${AD}.modal.bac.subject3`, 'Subiectul III')}</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>{t(`${AD}.modal.bac.yearLabel`, 'An')}</label>
                          <input
                            type="number"
                            value={formData.metadata?.year || ''}
                            onChange={(e) => handleMetadataChange('year', e.target.value ? parseInt(e.target.value) : null)}
                            placeholder={t(`${AD}.modal.bac.yearPlaceholder`, 'ex: 2024')}
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
                          <label>{t(`${AD}.modal.bac.sessionLabel`, 'Sesiune')}</label>
                          <select
                            value={formData.metadata?.session || ''}
                            onChange={(e) => handleMetadataChange('session', e.target.value || null)}
                            disabled={updateStatus === 'loading'}
                          >
                            <option value="">{t(`${AD}.modal.bac.selectSession`, 'Selectează sesiunea')}</option>
                            <option value="bac">{t(`${AD}.modal.bac.sessionBac`, 'Bac')}</option>
                            <option value="model">{t(`${AD}.modal.bac.sessionModel`, 'Model')}</option>
                            <option value="simulare">{t(`${AD}.modal.bac.sessionSim`, 'Simulare')}</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>{t(`${AD}.modal.bac.domainLabel`, 'Categorie (Domeniu)')}</label>
                          <select
                            value={formData.metadata?.subjectArea || ''}
                            onChange={(e) => handleMetadataChange('subjectArea', e.target.value || null)}
                            disabled={updateStatus === 'loading'}
                          >
                            <option value="">{t(`${AD}.modal.bac.selectDomain`, 'Selectează categoria')}</option>
                            <option value="Mecanică">Mecanică</option>
                            <option value="Termodinamică">Termodinamică</option>
                            <option value="Optică">Optică</option>
                            <option value="Curent continuu">Curent continuu</option>
                          </select>
                        </div>
                      </div>
                    )}

                    <div className="form-group full-width enunt-container">
                      <div className="enunt-header">
                        <label>{t(`${AD}.modal.contentLabel`, 'Conținut/Enunț *')}</label>
                        <button
                          type="button"
                          onClick={handleAiAnalysis}
                          disabled={updateStatus === 'loading' || aiAnalyzing || !formData.continut?.trim()}
                          className="btn-ai-analyze"
                          title={t(`${AD}.modal.aiAnalyzeTitle`, 'Folosește AI pentru a detecta automat datele și formulele din enunț')}
                        >
                          {aiAnalyzing ? (
                            <>
                              <span className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }}></span>
                              {t(`${AD}.modal.aiAnalyzing`, 'Analizează...')}
                            </>
                          ) : (
                            <>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                              </svg>
                              {t(`${AD}.modal.aiButton`, 'Detectează date și formule cu AI')}
                            </>
                          )}
                        </button>
                      </div>
                      <textarea
                        value={formData.continut}
                        onChange={(e) => handleInputChange('continut', e.target.value)}
                        required
                        placeholder={t(
                          `${AD}.modal.contentPlaceholder`,
                          'Enunțul problemei cu formule LaTeX (folosește $...$ pentru formule)'
                        )}
                        rows={6}
                        disabled={updateStatus === 'loading'}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>{t(`${AD}.modal.formulasLabel`, 'Formule')}</label>
                      <textarea
                        value={formData.formule.join('\n')}
                        onChange={(e) => handleInputChange('formule', e.target.value.split('\n'))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.stopPropagation();
                          }
                        }}
                        placeholder={t(`${AD}.modal.formulasPlaceholder`, 'Formulele necesare (câte una pe rând)')}
                        rows={3}
                        disabled={updateStatus === 'loading'}
                        style={{ whiteSpace: 'pre-wrap' }}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>{t(`${AD}.modal.dataLabel`, 'Date/Variabile')}</label>
                      <div className="date-pairs-container">
                        {datePairs.map((pair, index) => (
                          <div key={index} className="date-pair-row">
                            <input
                              type="text"
                              value={pair.key}
                              onChange={(e) => handleDatePairChange(index, 'key', e.target.value)}
                              placeholder={t(`${AD}.modal.varNamePlaceholder`, 'Nume variabilă (ex: m, v, t)')}
                              disabled={updateStatus === 'loading'}
                            />
                            <span className="date-pair-separator">=</span>
                            <input
                              type="text"
                              value={pair.value}
                              onChange={(e) => handleDatePairChange(index, 'value', e.target.value)}
                              placeholder={t(`${AD}.modal.varValuePlaceholder`, 'Valoare (ex: 5 kg, 10 m/s)')}
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
                          {t(`${AD}.modal.addVariable`, 'Adaugă variabilă')}
                        </button>
                      </div>
                    </div>

                    <div className="form-group full-width">
                      <label>{t(`${AD}.modal.imagesLabel`, 'Poze')}</label>
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
                            <span>{t(`${AD}.modal.uploadHint`, 'Click, trage sau folosește Ctrl+V pentru a adăuga poze')}</span>
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
                      <label>{t(`${AD}.modal.totalScoreLabel`, 'Punctaj total')}</label>
                      <input
                        type="number"
                        value={formData.punctajTotal}
                        onChange={(e) => handleInputChange('punctajTotal', parseInt(e.target.value) || 0)}
                        min="0"
                        placeholder={t(`${AD}.modal.totalScorePlaceholder`, 'Punctaj total')}
                        disabled={updateStatus === 'loading'}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>{t(`${AD}.modal.requirementsLabel`, 'Cerințe (subpuncte)')}</label>
                      <div className="subpuncte-container">
                        {formData.subpuncte.map((subpunct, index) => (
                          <div key={index} className="subpunct-row">
                            <div className="subpunct-inputs">
                              <input
                                type="text"
                                value={subpunct.cerinta}
                                onChange={(e) => handleSubpunctChange(index, 'cerinta', e.target.value)}
                                placeholder={t(`${AD}.modal.requirementPlaceholder`, 'Cerință')}
                                disabled={updateStatus === 'loading'}
                              />
                              <input
                                type="number"
                                value={subpunct.punctaj}
                                onChange={(e) => handleSubpunctChange(index, 'punctaj', parseInt(e.target.value) || 0)}
                                min="1"
                                max="10"
                                placeholder={t(`${AD}.modal.scorePlaceholder`, 'Punctaj')}
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
                          {t(`${AD}.modal.addSubpart`, 'Adaugă subpunct')}
                        </button>
                      </div>
                    </div>

                    {/* Metadata Section for BAC - doar pentru problemele non-BAC sau câmpuri suplimentare */}
                    {formData.categorie !== 'Bac' && !normalizeString(formData.categorie).includes('bac') && (
                      <>
                        <div className="form-group full-width">
                          <label>{t(`${AD}.modal.normal.variantOptional`, 'Varianta (opțional)')}</label>
                          <input
                            type="text"
                            value={formData.varianta}
                            onChange={(e) => handleInputChange('varianta', e.target.value)}
                            placeholder={t(`${AD}.modal.normal.variantPlaceholder`, 'ex: 2019 Var 2')}
                            disabled={updateStatus === 'loading'}
                          />
                        </div>

                        <div className="form-group full-width">
                          <label style={{ fontWeight: 600, marginBottom: '0.75rem', display: 'block' }}>
                            {t(`${AD}.modal.normal.metadataOptional`, 'Metadata (opțional)')}
                          </label>
                          <div className="form-row">
                            <div className="form-group">
                              <label>{t(`${AD}.modal.normal.yearLabel`, 'An')}</label>
                              <input
                                type="number"
                                value={formData.metadata?.year || ''}
                                onChange={(e) => handleMetadataChange('year', e.target.value ? parseInt(e.target.value) : null)}
                                placeholder={t(`${AD}.modal.normal.yearPh`, 'ex: 2019')}
                                disabled={updateStatus === 'loading'}
                              />
                            </div>
                            <div className="form-group">
                              <label>{t(`${AD}.modal.normal.variantNumLabel`, 'Varianta (număr)')}</label>
                              <input
                                type="number"
                                value={formData.metadata?.variant || ''}
                                onChange={(e) => handleMetadataChange('variant', e.target.value ? parseInt(e.target.value) : null)}
                                placeholder={t(`${AD}.modal.normal.variantNumPh`, 'ex: 2')}
                                disabled={updateStatus === 'loading'}
                              />
                            </div>
                          </div>
                          <div className="form-row">
                            <div className="form-group">
                              <label>{t(`${AD}.modal.normal.typeLabel`, 'Tip')}</label>
                              <input
                                type="text"
                                value={formData.metadata?.type || ''}
                                onChange={(e) => handleMetadataChange('type', e.target.value)}
                                placeholder={t(`${AD}.modal.normal.typePh`, 'ex: teoretic')}
                                disabled={updateStatus === 'loading'}
                              />
                            </div>
                            <div className="form-group">
                              <label>{t(`${AD}.modal.normal.subjectCodeLabel`, 'Cod subiect')}</label>
                              <input
                                type="text"
                                value={formData.metadata?.subjectCode || ''}
                                onChange={(e) => handleMetadataChange('subjectCode', e.target.value)}
                                placeholder={t(`${AD}.modal.normal.subjectCodePh`, 'ex: A')}
                                disabled={updateStatus === 'loading'}
                              />
                            </div>
                          </div>
                          <div className="form-group">
                            <label>{t(`${AD}.modal.normal.sourceLabel`, 'Sursă')}</label>
                            <input
                              type="text"
                              value={formData.metadata?.source || ''}
                              onChange={(e) => handleMetadataChange('source', e.target.value)}
                              placeholder={t(`${AD}.modal.normal.sourcePh`, 'ex: 2019_E_d_fizica_teoretic_vocational_2019_var_02_LRO')}
                              disabled={updateStatus === 'loading'}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Câmpuri suplimentare pentru BAC */}
                    {(formData.categorie === 'Bac' || normalizeString(formData.categorie).includes('bac')) && (
                      <div className="form-group full-width">
                        <label style={{ fontWeight: 600, marginBottom: '0.75rem', display: 'block' }}>
                          {t(`${AD}.modal.bac.extraMeta`, 'Metadata suplimentare (BAC)')}
                        </label>
                        <div className="form-row">
                          <div className="form-group">
                            <label>{t(`${AD}.modal.normal.variantOptional`, 'Varianta (opțional)')}</label>
                            <input
                              type="text"
                              value={formData.varianta}
                              onChange={(e) => handleInputChange('varianta', e.target.value)}
                              placeholder={t(`${AD}.modal.normal.variantPlaceholder`, 'ex: 2019 Var 2')}
                              disabled={updateStatus === 'loading'}
                            />
                          </div>
                          <div className="form-group">
                            <label>{t(`${AD}.modal.normal.variantNumLabel`, 'Varianta (număr)')}</label>
                            <input
                              type="number"
                              value={formData.metadata?.variant || ''}
                              onChange={(e) => handleMetadataChange('variant', e.target.value ? parseInt(e.target.value) : null)}
                              placeholder={t(`${AD}.modal.normal.variantNumPh`, 'ex: 2')}
                              disabled={updateStatus === 'loading'}
                            />
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>{t(`${AD}.modal.normal.subjectCodeLabel`, 'Cod subiect')}</label>
                            <input
                              type="text"
                              value={formData.metadata?.subjectCode || ''}
                              onChange={(e) => handleMetadataChange('subjectCode', e.target.value)}
                              placeholder={t(`${AD}.modal.normal.subjectCodePh`, 'ex: A')}
                              disabled={updateStatus === 'loading'}
                            />
                          </div>
                          <div className="form-group">
                            <label>{t(`${AD}.modal.normal.sourceLabel`, 'Sursă')}</label>
                            <input
                              type="text"
                              value={formData.metadata?.source || ''}
                              onChange={(e) => handleMetadataChange('source', e.target.value)}
                              placeholder={t(`${AD}.modal.normal.sourcePh`, 'ex: 2019_E_d_fizica_teoretic_vocational_2019_var_02_LRO')}
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
                      {updateStatus === 'loading'
                        ? t(`${AD}.modal.saving`, 'Se salvează...')
                        : t(`${AD}.modal.save`, 'Salvează')}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleCloseModal}
                      disabled={updateStatus === 'loading'}
                    >
                      {t(`${AD}.modal.cancel`, 'Anulează')}
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
                  <h2>{t(`${AD}.deleteModal.title`, 'Confirmă ștergerea')}</h2>
                  <button className="modal-close" onClick={() => setDeleteConfirm(null)}>×</button>
                </div>
                <div className="modal-content">
                  <div className="delete-confirmation">
                    <AlertCircle size={48} className="warning-icon" />
                    <p>{t(`${AD}.deleteModal.lead`, 'Ești sigur că vrei să ștergi problema:')}</p>
                    <p className="problem-to-delete">
                      <strong>{deleteConfirm.titlu || t(`${AD}.deleteModal.noTitle`, 'Fără titlu')}</strong>
                    </p>
                    <p className="warning-text">{t(`${AD}.deleteModal.warning`, 'Această acțiune nu poate fi anulată!')}</p>
                  </div>
                </div>
                <div className="modal-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => setDeleteConfirm(null)}
                  >
                    {t(`${AD}.modal.cancel`, 'Anulează')}
                  </button>
                  <button
                    className="btn-danger"
                    onClick={handleDelete}
                    disabled={deleteStatus === 'loading'}
                  >
                    {deleteStatus === 'loading'
                      ? t(`${AD}.deleteModal.deleting`, 'Se șterge...')
                      : t(`${AD}.deleteModal.delete`, 'Șterge')}
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
