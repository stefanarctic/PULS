import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../Layout';
import SEO from '../SEO';
import XPBar from '../community/XPBar';
import StreakCounter from '../community/StreakCounter';
import UserStatsGrid from '../community/UserStatsGrid';
import CategoryBadges from '../community/CategoryBadges';
import ActivityFeed from '../community/ActivityFeed';
import RankBadge from '../community/RankBadge';
import Achievements from '../Achievements';
import { usePublicProfile, useUserActivities } from '../../hooks/useCommunity';
import { ArrowLeft, Calendar } from 'lucide-react';
import { useI18n } from '../../i18n/LanguageContext';

const PublicProfile = () => {
  const { alias } = useParams();
  const { profile, loading, notFound } = usePublicProfile(alias);
  const { activities, loading: activitiesLoading } = useUserActivities(profile?.uid);
  const [activeTab, setActiveTab] = useState('activitate');
  const { t, lang, localizedPath } = useI18n();
  const PP = 'publicProfile';
  const P = 'profilePage';

  const dateLocale = lang === 'en' ? 'en-US' : 'ro-RO';

  if (loading) {
    return (
      <Layout>
        <SEO
          title={t(`${PP}.seo.loadingTitle`, 'Se încarcă profilul… | PULS')}
          description={t(`${PP}.seo.description`, 'Vezi progresul acestui utilizator pe PULS: XP, nivel, insignii, realizări și activitate.')}
          keywords={t(`${PP}.seo.keywords`, 'PULS, profil comunitate, realizări, clasament')}
          image="/res/icons/New-logo.png"
          locale={lang === 'en' ? 'en_US' : 'ro_RO'}
        />
        <div className="page-section profile-container public-profile">
          <div className="loading-container" style={{ minHeight: 400 }}>
            <div className="loading-spinner">
              <div className="spinner"></div>
              <h3>{t(`${PP}.loading`, 'Se încarcă profilul...')}</h3>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (notFound || !profile) {
    return (
      <Layout>
        <SEO
          title={t(`${PP}.seo.notFoundTitle`, 'Profil inexistent | PULS')}
          description={t(`${PP}.seo.description`, 'Vezi progresul acestui utilizator pe PULS: XP, nivel, insignii, realizări și activitate.')}
          keywords={t(`${PP}.seo.keywords`, 'PULS, profil comunitate, realizări, clasament')}
          image="/res/icons/New-logo.png"
          locale={lang === 'en' ? 'en_US' : 'ro_RO'}
        />
        <div className="page-section profile-container public-profile public-profile--not-found">
          <h2>{t(`${PP}.userNotFoundTitle`, 'Utilizator negăsit')}</h2>
          <p>
            {t(
              `${PP}.userNotFoundMessage`,
              'Nu există un profil cu alias-ul {alias}.',
              { alias: alias || '' }
            )}
          </p>
          <Link to={localizedPath('/comunitate')} className="public-profile__back-link">
            <ArrowLeft size={16} /> {t(`${PP}.backToCommunity`, 'Înapoi la comunitate')}
          </Link>
        </div>
      </Layout>
    );
  }

  const { communityStats: stats, categoryBadges: badges, achievements } = profile;
  const joinedFormatted = profile.joinedDate
    ? new Date(profile.joinedDate).toLocaleDateString(dateLocale, { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  const rawName = (profile.name || '').trim();
  const rawAlias = (profile.alias || '').trim();
  const primaryHeading = rawName || rawAlias || t(`${PP}.defaultUserName`, 'Utilizator');
  const showAliasSubline =
    rawAlias && rawName && rawName.toLowerCase() !== rawAlias.toLowerCase();
  const avatarInitial = (primaryHeading[0] || '?').toUpperCase();
  const avatarAlt = [rawName, rawAlias].filter(Boolean).join(' — ') || primaryHeading;

  return (
    <Layout>
      <SEO
        title={t(`${PP}.seo.title`, '{name} | Profil în comunitate — PULS', { name: primaryHeading })}
        description={t(`${PP}.seo.description`, 'Vezi progresul acestui utilizator pe PULS: XP, nivel, insignii, realizări și activitate.')}
        keywords={t(`${PP}.seo.keywords`, 'PULS, profil comunitate, realizări, clasament')}
        image="/res/icons/New-logo.png"
        locale={lang === 'en' ? 'en_US' : 'ro_RO'}
      />
      <div className="page-section profile-container public-profile">
        <Link to={localizedPath('/comunitate')} className="public-profile__back-link">
          <ArrowLeft size={16} /> {t(`${PP}.communityNav`, 'Comunitate')}
        </Link>

        <div className="profile-header">
          <div className="profile-header-content">
            <div className="profile-avatar">
              {profile.profilePic ? (
                <img
                  src={profile.profilePic}
                  alt={avatarAlt}
                  className="profile-avatar-img"
                  {...(profile.profilePic.includes('googleusercontent.com') && { crossOrigin: 'anonymous', referrerPolicy: 'no-referrer' })}
                />
              ) : (
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
                  {avatarInitial}
                </div>
              )}
            </div>
            <div className="profile-info">
              <h1 className="profile-name">{primaryHeading}</h1>
              {showAliasSubline && (
                <p className="public-profile__alias-sub">
                  <span className="public-profile__meta-label">{t(`${PP}.aliasLabel`, 'Alias:')}</span> {rawAlias}
                </p>
              )}
              <div className="public-profile__rank-row">
                <RankBadge rank={stats?.rank} size="lg" />
              </div>
              {joinedFormatted && (
                <div className="profile-stats">
                  <div className="stat-item">
                    <span className="stat-icon">
                      <Calendar size={18} strokeWidth={2} />
                    </span>
                    <span className="stat-text">
                      {t(`${PP}.joinedOn`, 'Membru din {date}', { date: joinedFormatted })}
                    </span>
                  </div>
                </div>
              )}
              {profile.description && <p className="public-profile__bio">{profile.description}</p>}
            </div>
          </div>

          {stats && (
            <div className="profile-community-section">
              <div className="profile-community-section__header">
                <h3>{t(`${PP}.communityProgress`, 'Progres comunitate')}</h3>
              </div>
              <div className="profile-community-section__body">
                <XPBar
                  xp={stats.xp || 0}
                  level={stats.level || 1}
                  rank={stats.rank || 'bronze'}
                />
                <div className="profile-community-section__row">
                  <StreakCounter
                    current={stats.streak?.current || 0}
                    longest={stats.streak?.longest || 0}
                  />
                </div>
                {badges && badges.length > 0 && (
                  <div className="profile-community-section__badges">
                    <h4>{t(`${PP}.categoryBadges`, 'Badge-uri categorii')}</h4>
                    <CategoryBadges badges={badges} compact />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="profile-tabs public-profile__tabs">
          <div className="tabs-list">
            <button
              type="button"
              className={`tab-trigger ${activeTab === 'activitate' ? 'active' : ''}`}
              onClick={() => setActiveTab('activitate')}
            >
              {t(`${P}.tabs.recentActivity`, 'Activitate recentă')}
            </button>
            <button
              type="button"
              className={`tab-trigger ${activeTab === 'realizari' ? 'active' : ''}`}
              onClick={() => setActiveTab('realizari')}
            >
              {t(`${P}.tabs.achievements`, 'Realizări')}
            </button>
            <button
              type="button"
              className={`tab-trigger ${activeTab === 'statistici' ? 'active' : ''}`}
              onClick={() => setActiveTab('statistici')}
            >
              {t(`${P}.tabs.statistics`, 'Statistici')}
            </button>
          </div>
          <div className="tab-content">
            {activeTab === 'activitate' && (
              <div className="activity-tab-content public-profile__tab-panel">
                {activitiesLoading ? (
                  <div className="loading-container" style={{ minHeight: 200 }}>
                    <div className="loading-spinner">
                      <div className="spinner"></div>
                      <h3>{t(`${PP}.loadingActivity`, 'Se încarcă activitatea...')}</h3>
                    </div>
                  </div>
                ) : (
                  <ActivityFeed activities={activities} loading={false} showAvatar={false} />
                )}
              </div>
            )}
            {activeTab === 'realizari' && (
              <div className="achievements-tab-content public-profile__tab-panel">
                <Achievements achievements={achievements || []} />
              </div>
            )}
            {activeTab === 'statistici' && (
              <div className="statistics-tab-content public-profile__tab-panel public-profile__stats-tab">
                <UserStatsGrid stats={stats || {}} />
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PublicProfile;
