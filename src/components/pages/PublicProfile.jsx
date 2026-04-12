import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../Layout';
import XPBar from '../community/XPBar';
import StreakCounter from '../community/StreakCounter';
import UserStatsGrid from '../community/UserStatsGrid';
import CategoryBadges from '../community/CategoryBadges';
import ActivityFeed from '../community/ActivityFeed';
import RankBadge from '../community/RankBadge';
import Achievements from '../Achievements';
import { usePublicProfile, useUserActivities } from '../../hooks/useCommunity';
import { ArrowLeft, Calendar } from 'lucide-react';

const PublicProfile = () => {
  const { alias } = useParams();
  const { profile, loading, notFound } = usePublicProfile(alias);
  const { activities, loading: activitiesLoading } = useUserActivities(profile?.uid);

  if (loading) {
    return (
      <Layout>
        <div className="public-profile">
          <div className="loading-container" style={{ minHeight: 400 }}>
            <div className="loading-spinner">
              <div className="spinner"></div>
              <h3>Se încarcă profilul...</h3>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (notFound || !profile) {
    return (
      <Layout>
        <div className="public-profile public-profile--not-found">
          <h2>Utilizator negăsit</h2>
          <p>Nu există un profil cu alias-ul <strong>{alias}</strong>.</p>
          <Link to="/comunitate" className="public-profile__back-link">
            <ArrowLeft size={16} /> Înapoi la comunitate
          </Link>
        </div>
      </Layout>
    );
  }

  const { communityStats: stats, categoryBadges: badges, achievements } = profile;
  const joinedFormatted = profile.joinedDate
    ? new Date(profile.joinedDate).toLocaleDateString('ro-RO', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <Layout>
      <div className="public-profile">
        <Link to="/comunitate" className="public-profile__back-link">
          <ArrowLeft size={16} /> Comunitate
        </Link>

        <div className="public-profile__header">
          <div className="public-profile__avatar-section">
            {profile.profilePic ? (
              <img
                src={profile.profilePic}
                alt={profile.alias}
                className="public-profile__avatar"
                {...(profile.profilePic.includes('googleusercontent.com') && { crossOrigin: 'anonymous', referrerPolicy: 'no-referrer' })}
              />
            ) : (
              <div className="public-profile__avatar public-profile__avatar--placeholder">
                {(profile.alias || '?')[0].toUpperCase()}
              </div>
            )}
            <div className="public-profile__identity">
              <h1 className="public-profile__alias">{profile.alias}</h1>
              <RankBadge rank={stats.rank} size="lg" />
              {joinedFormatted && (
                <span className="public-profile__joined">
                  <Calendar size={14} /> Membru din {joinedFormatted}
                </span>
              )}
              {profile.description && (
                <p className="public-profile__bio">{profile.description}</p>
              )}
            </div>
          </div>

          <div className="public-profile__xp-section">
            <XPBar
              xp={stats.xp || 0}
              level={stats.level || 1}
              rank={stats.rank || 'bronze'}
            />
          </div>
        </div>

        <UserStatsGrid stats={stats} />

        <div className="public-profile__sections">
          <div className="public-profile__section">
            <h2 className="public-profile__section-title">Streak</h2>
            <StreakCounter
              current={stats.streak?.current || 0}
              longest={stats.streak?.longest || 0}
            />
          </div>

          {badges && badges.length > 0 && (
            <div className="public-profile__section">
              <h2 className="public-profile__section-title">Badge-uri categorii</h2>
              <CategoryBadges badges={badges} />
            </div>
          )}

          {achievements && achievements.length > 0 && (
            <div className="public-profile__section">
              <h2 className="public-profile__section-title">Realizări</h2>
              <Achievements achievements={achievements} />
            </div>
          )}

          <div className="public-profile__section">
            <h2 className="public-profile__section-title">Activitate recentă</h2>
            <ActivityFeed
              activities={activities}
              loading={activitiesLoading}
              showAvatar={false}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PublicProfile;
