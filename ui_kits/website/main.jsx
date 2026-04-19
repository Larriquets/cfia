import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';

window.React = React;
window.ReactDOM = ReactDOM;

import './Illustration.jsx';
import './LikeButton.jsx';
import './Nav.jsx';
import './Footer.jsx';
import './StoryCard.jsx';
import './Home.jsx';
import './Catalog.jsx';
import './Reader.jsx';
import './About.jsx';
import './Create.jsx';

const { Nav, Footer, Home, Catalog, Reader, About, Create } = window;

function App() {
  const [route, setRoute] = useState('home');
  const [lang, setLang] = useState('es');
  const [slug, setSlug] = useState(null);
  const [stories, setStories] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/stories')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        window.CFIA_STORIES = data;
        setStories(data);
      })
      .catch((e) => setError(e.message));
  }, []);

  const onOpen = (s) => { setSlug(s); setRoute('reader'); window.scrollTo(0, 0); };
  const onNav = (r) => { setRoute(r); window.scrollTo(0, 0); };
  const onLikeChange = (slug, likes) => {
    setStories((prev) => prev ? prev.map((s) => s.slug === slug ? { ...s, likes } : s) : prev);
  };
  window.CFIA_onLikeChange = onLikeChange;
  const onCreated = (result) => {
    const list = Array.isArray(result) ? result : [result];
    if (!list.length) return;
    setStories((prev) => [...list, ...(prev || [])]);
    if (list.length === 1) {
      setSlug(list[0].slug);
      setRoute('reader');
    } else {
      setRoute('catalog');
    }
    window.scrollTo(0, 0);
  };

  if (error) {
    return (
      <div style={{ padding: 40, fontFamily: "'JetBrains Mono', monospace", color: '#e8b84a' }}>
        <p>◼ API error: {error}</p>
        <p style={{ color: '#6b6860', fontSize: 13 }}>
          ¿Está el server corriendo? <code>npm run dev</code> arranca api + web.
        </p>
      </div>
    );
  }

  if (!stories) {
    return (
      <div style={{ padding: 40, fontFamily: "'JetBrains Mono', monospace", color: '#6b6860', letterSpacing: '0.16em', fontSize: 11 }}>
        CARGANDO ·
      </div>
    );
  }

  const current = stories.find((s) => s.slug === slug) || stories[0] || null;

  return (
    <div>
      <Nav route={route} onNav={onNav} lang={lang} onLang={setLang} />
      {route === 'home' && <Home stories={stories} lang={lang} onOpen={onOpen} onNav={onNav} />}
      {route === 'catalog' && <Catalog stories={stories} lang={lang} onOpen={onOpen} />}
      {route === 'create' && <Create lang={lang} onCreated={onCreated} stories={stories} />}
      {route === 'reader' && current && <Reader story={current} lang={lang} onBack={() => onNav('catalog')} onOpen={onOpen} onCreated={onCreated} />}
      {route === 'about' && <About lang={lang} onNav={onNav} />}
      <Footer lang={lang} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
