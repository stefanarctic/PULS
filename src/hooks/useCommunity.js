import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import {
  fetchLeaderboard as fetchLeaderboardService,
  fetchActivityFeed as fetchActivityFeedService,
  fetchPublicProfile as fetchPublicProfileService,
  fetchUserActivities as fetchUserActivitiesService,
  migrateUserCommunityStats,
  getDefaultCommunityStats,
} from '../lib/communityService';

export function useLeaderboard(timeFilter = 'all-time') {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLeaderboardService(timeFilter);
      setEntries(data);
    } catch (err) {
      console.error('Leaderboard fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [timeFilter]);

  useEffect(() => { load(); }, [load]);

  return { entries, loading, error, refresh: load };
}

export function useActivityFeed(maxResults = 50) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchActivityFeedService(maxResults);
      setActivities(data);
    } catch (err) {
      console.error('Activity feed error:', err);
    } finally {
      setLoading(false);
    }
  }, [maxResults]);

  useEffect(() => { load(); }, [load]);

  return { activities, loading, refresh: load };
}

export function usePublicProfile(alias) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!alias) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const data = await fetchPublicProfileService(alias);
        if (cancelled) return;
        if (!data) {
          setNotFound(true);
        } else {
          setProfile(data);
        }
      } catch (err) {
        console.error('Public profile error:', err);
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [alias]);

  return { profile, loading, notFound };
}

export function useCommunityStats() {
  const [stats, setStats] = useState(null);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const load = useCallback(async (allProblems) => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        setStats(getDefaultCommunityStats());
        setLoading(false);
        return;
      }

      const data = snap.data();
      if (data.communityStats) {
        setStats(data.communityStats);
        setBadges(data.categoryBadges || []);
      } else if (allProblems) {
        const migrated = await migrateUserCommunityStats(user.uid, allProblems);
        setStats(migrated || getDefaultCommunityStats());
        const refreshSnap = await getDoc(userRef);
        setBadges(refreshSnap.data()?.categoryBadges || []);
      } else {
        setStats(getDefaultCommunityStats());
      }
    } catch (err) {
      console.error('Community stats error:', err);
      setStats(getDefaultCommunityStats());
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user?.uid) load();
  }, [user?.uid, load]);

  return { stats, badges, loading, user, refresh: load };
}

export function useUserActivities(userId) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchUserActivitiesService(userId);
        if (!cancelled) setActivities(data);
      } catch (err) {
        console.error('User activities error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  return { activities, loading };
}
