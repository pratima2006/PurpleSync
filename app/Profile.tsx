import { useState } from 'react';
import {
  ArrowLeft,
  Bell,
  Bookmark,
  CalendarDays,
  Check,
  ChevronRight,
  Edit3,
  Heart,
  Settings2,
  Sparkles,
  Trophy,
  Vote,
  Zap,
} from 'lucide-react';
import './Profile.css';

const savedNotes = [
  {
    label: 'VOTING DESK',
    title: 'MAMA 2025 Â· Worldwide Fansâ€™ Choice',
    detail: 'Closes in 2 days Â· 3 actions left',
    icon: Vote,
    tone: 'violet',
  },
  {
    label: 'NEXT ON THE CALENDAR',
    title: 'BTS WORLD TOUR â€œARIRANGâ€',
    detail: '20 JUN Â· 19:00 KST',
    icon: CalendarDays,
    tone: 'lilac',
  },
];

const milestones = [
  { value: '18', label: 'votes this month' },
  { value: '07', label: 'saved updates' },
  { value: '12', label: 'archive visits' },
];

export default function ProfileRef() {
  const [following, setFollowing] = useState(true);

  return (
    <main className="ps-profile">
      <header className="ps-profile__topbar">
        <button className="ps-profile__icon-button" type="button" aria-label="Go back">
          <ArrowLeft size={18} />
        </button>
        <div className="ps-profile__breadcrumb">
          <span>ARMY /</span>
          <strong>Profile</strong>
        </div>
        <div className="ps-profile__top-actions">
          <button
            className="ps-profile__icon-button"
            type="button"
            aria-label="Notifications"
          >
            <Bell size={17} />
            <i aria-hidden="true" />
          </button>
          <button className="ps-profile__icon-button" type="button" aria-label="Profile settings">
            <Settings2 size={17} />
          </button>
        </div>
      </header>

      <div className="ps-profile__content">
        <section className="ps-profile__intro ps-profile__rise">
          <div className="ps-profile__identity">
            <div className="ps-profile__avatar" aria-hidden="true">
              <span>AR</span>
              <div className="ps-profile__avatar-orbit ps-profile__avatar-orbit--one" />
              <div className="ps-profile__avatar-orbit ps-profile__avatar-orbit--two" />
            </div>
            <div className="ps-profile__identity-copy">
              <div className="ps-profile__eyebrow">
                <span className="ps-profile__dot" />
                <span>MY PURPLESYNC DESK</span>
              </div>
              <h1>Ari</h1>
              <p>ARMY since 2018 Â· keeping the signal close</p>
              <div className="ps-profile__status">
                <span className="ps-profile__status-mark">
                  <Check size={11} strokeWidth={2.5} />
                </span>
                <span>Source-first supporter</span>
              </div>
            </div>
          </div>
          <button
            className={`ps-profile__follow ${following ? 'is-following' : ''}`}
            type="button"
            onClick={() => setFollowing((current) => !current)}
          >
            {following ? <Check size={14} /> : <Heart size={14} />}
            {following ? 'Following' : 'Follow desk'}
          </button>
        </section>

        <section className="ps-profile__stats ps-profile__rise" aria-label="Profile activity">
          {milestones.map((milestone) => (
            <div className="ps-profile__stat" key={milestone.label}>
              <strong>{milestone.value}</strong>
              <span>{milestone.label}</span>
            </div>
          ))}
          <div className="ps-profile__stat ps-profile__stat--accent">
            <strong>
              <Zap size={17} fill="currentColor" />
              14
            </strong>
            <span>day desk streak</span>
          </div>
        </section>

        <div className="ps-profile__grid">
          <section className="ps-profile__panel ps-profile__panel--focus ps-profile__rise">
            <div className="ps-profile__section-heading">
              <div>
                <span className="ps-profile__label">THE DESK NOTE</span>
                <h2>What Iâ€™m close to</h2>
              </div>
              <button className="ps-profile__edit" type="button" aria-label="Edit desk note">
                <Edit3 size={15} />
              </button>
            </div>
            <div className="ps-profile__focus-card">
              <div className="ps-profile__focus-icon">
                <Sparkles size={18} />
              </div>
              <div>
                <span className="ps-profile__label">CURRENT FOCUS</span>
                <h3>Making every vote count.</h3>
                <p>Two windows need attention before the weekend.</p>
              </div>
            </div>
            <div className="ps-profile__focus-footer">
              <span>
                <span className="ps-profile__mini-dot" />
                private view
              </span>
              <span>updated just now</span>
            </div>
          </section>

          <section className="ps-profile__panel ps-profile__panel--record ps-profile__rise">
            <div className="ps-profile__section-heading">
              <div>
                <span className="ps-profile__label">ON RECORD</span>
                <h2>Small wins, kept close</h2>
              </div>
              <Trophy className="ps-profile__heading-icon" size={18} />
            </div>
            <div className="ps-profile__record-row">
              <div className="ps-profile__record-badge">
                <Trophy size={17} />
              </div>
              <div>
                <strong>Steady signal</strong>
                <p>14 days showing up for the desk</p>
              </div>
              <ChevronRight size={16} />
            </div>
            <div className="ps-profile__record-row">
              <div className="ps-profile__record-badge ps-profile__record-badge--soft">
                <Bookmark size={17} />
              </div>
              <div>
                <strong>Thoughtful archive</strong>
                <p>7 official notes saved this month</p>
              </div>
              <ChevronRight size={16} />
            </div>
          </section>
        </div>

        <section className="ps-profile__saved ps-profile__rise">
          <div className="ps-profile__section-heading">
            <div>
              <span className="ps-profile__label">SAVED TO MY DESK</span>
              <h2>Keep close</h2>
            </div>
            <button className="ps-profile__text-button" type="button">
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div className="ps-profile__saved-list">
            {savedNotes.map((note) => {
              const Icon = note.icon;
              return (
                <article className="ps-profile__saved-card" key={note.title}>
                  <div className={`ps-profile__saved-icon ps-profile__saved-icon--${note.tone}`}>
                    <Icon size={17} />
                  </div>
                  <div className="ps-profile__saved-copy">
                    <span className="ps-profile__label">{note.label}</span>
                    <h3>{note.title}</h3>
                    <p>{note.detail}</p>
                  </div>
                  <ChevronRight className="ps-profile__saved-arrow" size={16} />
                </article>
              );
            })}
          </div>
        </section>

        <footer className="ps-profile__footer">
          <div className="ps-profile__footer-mark">P</div>
          <p>
            PurpleSync keeps your desk calm,
            <br />
            current, and close to the source.
          </p>
          <span>LOCAL VIEW Â· PRIVATE</span>
        </footer>
      </div>
    </main>
  );
}
