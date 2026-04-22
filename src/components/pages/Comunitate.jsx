import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../Layout';
import Leaderboard from '../community/Leaderboard';
import ActivityFeed from '../community/ActivityFeed';
import XPBar from '../community/XPBar';
import StreakCounter from '../community/StreakCounter';
import { useActivityFeed, useCommunityStats } from '../../hooks/useCommunity';
import { useSelector } from 'react-redux';
import { Trophy, Activity, Zap } from 'lucide-react';

const Comunitate = () => {
  const { activities, loading: feedLoading } = useActivityFeed(50);
  const { stats, user, loading: statsLoading, refresh: refreshStats } = useCommunityStats();
  const allProblems = useSelector(state => state.problems.items);

  useEffect(() => {
    if (user?.uid && allProblems?.length > 0) {
      refreshStats(allProblems);
    }
  }, [user?.uid, allProblems?.length]);

  return (
    <Layout>
      <div className="page-section profile-container comunitate-page">
        <div className="comunitate-page__header">
          <h1 className="comunitate-page__title">
            <Trophy size={28} /> Comunitate
          </h1>
          <p className="comunitate-page__subtitle">
            Compete, progresează și vezi cum te compari cu alți elevi.
          </p>
        </div>

        {user && stats && !statsLoading && (
          <div className="comunitate-page__my-stats">
            <div className="comunitate-page__my-stats-header">
              <Zap size={18} />
              <span>Progresul tău</span>
              <Link to="/profil" className="comunitate-page__profile-link">
                Vezi profilul complet
              </Link>
            </div>
            <div className="comunitate-page__my-stats-body">
              <XPBar
                xp={stats.xp || 0}
                level={stats.level || 1}
                rank={stats.rank || 'bronze'}
                compact
              />
              <StreakCounter
                current={stats.streak?.current || 0}
                longest={stats.streak?.longest || 0}
                compact
              />
            </div>
          </div>
        )}

        <div className="comunitate-page__content">
          <div className="comunitate-page__leaderboard">
            <Leaderboard currentUserUid={user?.uid} />
          </div>
          <div className="comunitate-page__feed">
            <div className="comunitate-page__feed-header">
              <h2>
                <Activity size={20} /> Activitate recentă
              </h2>
            </div>
            <ActivityFeed activities={activities} loading={feedLoading} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Comunitate;
