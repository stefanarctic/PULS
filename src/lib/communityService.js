import { db, auth } from './firebase';
import {
  doc, getDoc, updateDoc, addDoc, collection,
  query, orderBy, limit, where, getDocs, serverTimestamp, writeBatch
} from 'firebase/firestore';

// --- XP & Rank constants ---

const XP_BY_DIFFICULTY = {
  'ușor': 10, 'usoare': 10, 'usor': 10,
  'mediu': 25, 'medii': 25,
  'dificil': 50, 'dificile': 50,
  'concurs': 100, 'concursuri': 100,
};

const RANK_THRESHOLDS = [
  { rank: 'diamond',  minXp: 5000, color: '#b9f2ff' },
  { rank: 'platinum', minXp: 1500, color: '#e5e4e2' },
  { rank: 'gold',     minXp: 500,  color: '#ffd700' },
  { rank: 'silver',   minXp: 100,  color: '#c0c0c0' },
  { rank: 'bronze',   minXp: 0,    color: '#cd7f32' },
];

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];

const BADGE_TIERS = [
  { tier: 'apprentice', threshold: 5,  label: 'Apprentice' },
  { tier: 'expert',     threshold: 15, label: 'Expert' },
  { tier: 'master',     threshold: 30, label: 'Master' },
  { tier: 'legend',     threshold: 50, label: 'Legend' },
];

// --- Pure helper functions ---

export function calculateXP(difficulty, scoreObtained, maxScore, currentStreak = 0) {
  const normalizedDiff = (difficulty || '').toLowerCase().trim();
  const baseXP = XP_BY_DIFFICULTY[normalizedDiff] || 10;
  const scoreRatio = maxScore > 0 ? scoreObtained / maxScore : 0;
  const isPerfect = scoreObtained === maxScore && maxScore > 0;
  const streakBonus = Math.min(currentStreak * 2, 20);

  return Math.floor(baseXP * scoreRatio * (isPerfect ? 1.2 : 1)) + streakBonus;
}

export function getRankForXP(xp) {
  for (const t of RANK_THRESHOLDS) {
    if (xp >= t.minXp) return t;
  }
  return RANK_THRESHOLDS[RANK_THRESHOLDS.length - 1];
}

export function getLevelForXP(xp) {
  return Math.min(Math.floor(Math.sqrt(xp / 10)) + 1, 100);
}

export function getNextRankThreshold(xp) {
  for (let i = RANK_THRESHOLDS.length - 1; i >= 0; i--) {
    if (RANK_THRESHOLDS[i].minXp > xp) {
      return RANK_THRESHOLDS[i];
    }
  }
  return null;
}

export function computeStreak(existingStreak) {
  const today = new Date().toISOString().slice(0, 10);
  const { current = 0, longest = 0, lastActivityDate } = existingStreak || {};

  if (lastActivityDate === today) {
    return { current, longest, lastActivityDate: today };
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  let newCurrent;
  if (lastActivityDate === yesterday) {
    newCurrent = current + 1;
  } else {
    newCurrent = 1;
  }
  const newLongest = Math.max(newCurrent, longest);
  return { current: newCurrent, longest: newLongest, lastActivityDate: today };
}

export function checkCategoryBadges(categoryCounts, existingBadges = []) {
  const newBadges = [];
  const existingSet = new Set(existingBadges.map(b => b.id));

  for (const [category, count] of Object.entries(categoryCounts)) {
    for (const { tier, threshold, label } of BADGE_TIERS) {
      const badgeId = `${tier}:${category}`;
      if (count >= threshold && !existingSet.has(badgeId)) {
        newBadges.push({
          id: badgeId,
          name: `${label}: ${category}`,
          category,
          tier,
          unlockedAt: new Date().toISOString(),
        });
      }
    }
  }
  return newBadges;
}

function getISOWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().slice(0, 10);
}

// --- Firestore operations ---

export async function updateCommunityStats(userId, { problemId, scoreObtained, maxScore, difficulty, category, problemTitle }) {
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;

  const userData = snap.data();
  const existing = userData.communityStats || getDefaultCommunityStats();

  const newStreak = computeStreak(existing.streak);
  const xpGained = calculateXP(difficulty, scoreObtained, maxScore, newStreak.current);
  const newXp = (existing.xp || 0) + xpGained;
  const oldRank = getRankForXP(existing.xp || 0);
  const newRankInfo = getRankForXP(newXp);
  const newLevel = getLevelForXP(newXp);

  const newTotalSolved = (existing.totalSolved || 0) + 1;
  const newTotalScore = (existing.totalScore || 0) + scoreObtained;
  const newTotalMaxScore = (existing.totalMaxScore || 0) + maxScore;
  const newAveragePercent = newTotalMaxScore > 0
    ? Math.round((newTotalScore / newTotalMaxScore) * 100)
    : 0;
  const isPerfect = scoreObtained === maxScore && maxScore > 0;
  const newPerfectScores = (existing.perfectScores || 0) + (isPerfect ? 1 : 0);

  const categoryCounts = { ...(existing.categoryCounts || {}) };
  if (category) {
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  }

  const currentWeekStart = getISOWeekStart();
  let weeklyXp = existing.weeklyXp || 0;
  let weekStartDate = existing.weekStartDate || currentWeekStart;
  if (weekStartDate !== currentWeekStart) {
    weeklyXp = 0;
    weekStartDate = currentWeekStart;
  }
  weeklyXp += xpGained;

  const updatedStats = {
    xp: newXp,
    level: newLevel,
    rank: newRankInfo.rank,
    streak: newStreak,
    totalSolved: newTotalSolved,
    totalScore: newTotalScore,
    totalMaxScore: newTotalMaxScore,
    averagePercent: newAveragePercent,
    perfectScores: newPerfectScores,
    categoryCounts,
    weeklyXp,
    weekStartDate,
  };

  const existingBadges = userData.categoryBadges || [];
  const newBadges = checkCategoryBadges(categoryCounts, existingBadges);
  const allBadges = [...existingBadges, ...newBadges];

  await updateDoc(userRef, {
    communityStats: updatedStats,
    categoryBadges: allBadges,
  });

  const userAlias = userData.alias || userData.name || 'Anonim';
  const userAvatar = userData.profilePic || '';

  const batch = [];

  batch.push(writeActivity({
    userId,
    userAlias,
    userAvatar,
    type: 'solved_problem',
    data: {
      problemId,
      problemTitle: problemTitle || `Problema #${problemId}`,
      score: scoreObtained,
      maxScore,
      xpGained,
      category: category || '',
    },
  }));

  if (oldRank.rank !== newRankInfo.rank) {
    batch.push(writeActivity({
      userId,
      userAlias,
      userAvatar,
      type: 'rank_up',
      data: { oldRank: oldRank.rank, newRank: newRankInfo.rank },
    }));
  }

  if (STREAK_MILESTONES.includes(newStreak.current) && newStreak.current > (existing.streak?.current || 0)) {
    batch.push(writeActivity({
      userId,
      userAlias,
      userAvatar,
      type: 'streak_milestone',
      data: { streakDays: newStreak.current },
    }));
  }

  for (const badge of newBadges) {
    batch.push(writeActivity({
      userId,
      userAlias,
      userAvatar,
      type: 'badge_earned',
      data: { badgeName: badge.name, category: badge.category, tier: badge.tier },
    }));
  }

  await Promise.all(batch);

  return { updatedStats, newBadges, xpGained, rankChanged: oldRank.rank !== newRankInfo.rank };
}

async function writeActivity(activityData) {
  try {
    await addDoc(collection(db, 'activities'), {
      ...activityData,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.error('Failed to write activity:', err);
  }
}

// --- Migration for existing users ---

export async function migrateUserCommunityStats(userId, allProblems) {
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return null;

  const userData = snap.data();
  if (userData.communityStats) return userData.communityStats;

  const solvedProblems = userData.solvedProblems || [];
  const problemMap = new Map();
  if (allProblems) {
    allProblems.forEach(p => {
      if (p.index != null) problemMap.set(String(p.index), p);
      if (p.id != null) problemMap.set(String(p.id), p);
    });
  }

  let totalXp = 0;
  let totalScore = 0;
  let totalMaxScore = 0;
  let perfectScores = 0;
  const categoryCounts = {};

  for (const sp of solvedProblems) {
    const prob = problemMap.get(String(sp.problemId));
    const difficulty = prob?.dificultate || 'ușor';
    const category = prob?.categorie || '';

    const xp = calculateXP(difficulty, sp.scoreObtained, sp.maxScore, 0);
    totalXp += xp;
    totalScore += sp.scoreObtained || 0;
    totalMaxScore += sp.maxScore || 0;
    if (sp.scoreObtained === sp.maxScore && sp.maxScore > 0) perfectScores++;
    if (category) {
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    }
  }

  const stats = {
    xp: totalXp,
    level: getLevelForXP(totalXp),
    rank: getRankForXP(totalXp).rank,
    streak: { current: 0, longest: 0, lastActivityDate: null },
    totalSolved: solvedProblems.length,
    totalScore,
    totalMaxScore,
    averagePercent: totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0,
    perfectScores,
    categoryCounts,
    weeklyXp: 0,
    weekStartDate: getISOWeekStart(),
  };

  const badges = checkCategoryBadges(categoryCounts, []);

  await updateDoc(userRef, {
    communityStats: stats,
    categoryBadges: badges,
  });

  return stats;
}

// --- Query functions ---

export async function fetchLeaderboard(timeFilter = 'all-time', maxResults = 50) {
  const orderField = timeFilter === 'weekly' ? 'communityStats.weeklyXp' : 'communityStats.xp';
  const q = query(
    collection(db, 'users'),
    orderBy(orderField, 'desc'),
    limit(maxResults)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((d, i) => {
      const data = d.data();
      const stats = data.communityStats;
      if (!stats || stats.xp === 0) return null;
      return {
        uid: d.id,
        position: i + 1,
        alias: data.alias || data.name || 'Anonim',
        profilePic: data.profilePic || '',
        xp: stats.xp || 0,
        weeklyXp: stats.weeklyXp || 0,
        level: stats.level || 1,
        rank: stats.rank || 'bronze',
        streak: stats.streak?.current || 0,
        totalSolved: stats.totalSolved || 0,
        averagePercent: stats.averagePercent || 0,
      };
    })
    .filter(Boolean);
}

export async function fetchActivityFeed(maxResults = 50) {
  const q = query(
    collection(db, 'activities'),
    orderBy('createdAt', 'desc'),
    limit(maxResults)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({
    id: d.id,
    ...d.data(),
    createdAt: d.data().createdAt?.toDate?.() || new Date(),
  }));
}

/**
 * Activități pentru profilul public, cele mai recente întâi.
 * - Rezolvări: din `users/{uid}.solvedProblems` (sursă completă chiar dacă `activities` e goală sau incompletă).
 * - Altele (rank up, badge, streak): din feed-ul global `activities`, filtrat pe user.
 */
export async function fetchUserActivities(userId, maxResults = 20) {
  const userAliasFallback = 'Anonim';

  let solvedRows = [];
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const userData = snap.data();
      const alias = userData.alias || userData.name || userAliasFallback;
      const avatar = userData.profilePic || '';
      solvedRows = (userData.solvedProblems || []).map((sp, idx) => ({
        id: `sp-${userId}-${String(sp.problemId)}-${sp.solvedAt || idx}`,
        userId,
        userAlias: alias,
        userAvatar: avatar,
        type: 'solved_problem',
        data: {
          problemId: sp.problemId,
          problemTitle: sp.customTitle || `Problema #${sp.problemId}`,
        },
        createdAt: sp.solvedAt ? new Date(sp.solvedAt) : new Date(0),
      }));
    }
  } catch (err) {
    console.warn('fetchUserActivities: nu s-a putut citi users/' + userId, err);
  }

  let nonSolveFromFeed = [];
  try {
    const feed = await fetchActivityFeed(350);
    nonSolveFromFeed = feed.filter(
      (a) => a.userId === userId && a.type && a.type !== 'solved_problem'
    );
  } catch (err) {
    console.warn('fetchUserActivities: feed activities indisponibil', err);
  }

  const merged = [...nonSolveFromFeed, ...solvedRows].sort(
    (a, b) => b.createdAt - a.createdAt
  );
  return merged.slice(0, maxResults);
}

function normalizeProfileRouteParam(raw) {
  if (raw == null || raw === '') return '';
  let s = String(raw).replace(/\u00a0/g, ' ');
  try {
    for (let i = 0; i < 3; i++) {
      const next = decodeURIComponent(s);
      if (next === s) break;
      s = next;
    }
  } catch {
    /* păstrăm s */
  }
  return s.trim();
}

function mapUserDocToPublicProfile(docSnap) {
  const data = docSnap.data();
  return {
    uid: docSnap.id,
    alias: data.alias || '',
    name: data.name || '',
    profilePic: data.profilePic || '',
    description: data.description || '',
    joinedDate: data.joinedDate || '',
    communityStats: data.communityStats || getDefaultCommunityStats(),
    categoryBadges: data.categoryBadges || [],
    achievements: data.achievements || [],
  };
}

/**
 * Acceptă UID-ul documentului users/{id}, aliasul sau (dacă e unic) numele afișat în clasament.
 */
export async function fetchPublicProfile(routeParam) {
  const key = normalizeProfileRouteParam(routeParam);
  if (!key) return null;

  const byIdSnap = await getDoc(doc(db, 'users', key));
  if (byIdSnap.exists()) {
    return mapUserDocToPublicProfile(byIdSnap);
  }

  const byAlias = await getDocs(
    query(collection(db, 'users'), where('alias', '==', key), limit(1))
  );
  if (!byAlias.empty) {
    return mapUserDocToPublicProfile(byAlias.docs[0]);
  }

  const byName = await getDocs(
    query(collection(db, 'users'), where('name', '==', key), limit(2))
  );
  if (byName.size === 1) {
    return mapUserDocToPublicProfile(byName.docs[0]);
  }

  return null;
}

export function getDefaultCommunityStats() {
  return {
    xp: 0,
    level: 1,
    rank: 'bronze',
    streak: { current: 0, longest: 0, lastActivityDate: null },
    totalSolved: 0,
    totalScore: 0,
    totalMaxScore: 0,
    averagePercent: 0,
    perfectScores: 0,
    categoryCounts: {},
    weeklyXp: 0,
    weekStartDate: null,
  };
}

export { RANK_THRESHOLDS, BADGE_TIERS, STREAK_MILESTONES };
