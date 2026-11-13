import { useState } from 'react';
import MyPosts from '../components/MyPosts.jsx';
import ReceivedClaims from '../components/ReceivedClaims.jsx';
import SentClaims from '../components/SentClaims.jsx';

const TABS = [
  { key: 'posts', label: 'My posts' },
  { key: 'received', label: 'Claims received' },
  { key: 'sent', label: 'Claims sent' },
];

export default function DashboardPage() {
  const [tab, setTab] = useState('posts');

  return (
    <section>
      <h1>My dashboard</h1>

      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={tab === t.key ? 'tab active' : 'tab'}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'posts' && <MyPosts />}
      {tab === 'received' && <ReceivedClaims />}
      {tab === 'sent' && <SentClaims />}
    </section>
  );
}