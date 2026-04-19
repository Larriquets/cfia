import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';

window.React = React;
window.ReactDOM = ReactDOM;

import './Illustration.jsx';
import './Nav.jsx';
import './Footer.jsx';
import './StoryCard.jsx';
import './Home.jsx';
import './Catalog.jsx';
import './Reader.jsx';
import './About.jsx';

const { Nav, Footer, Home, Catalog, Reader, About } = window;

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

  const current = stories.find((s) => s.slug === slug) || stories[0];

  return (
    <div>
      <Nav route={route} onNav={onNav} lang={lang} onLang={setLang} />
      {route === 'home' && <Home stories={stories} lang={lang} onOpen={onOpen} onNav={onNav} />}
      {route === 'catalog' && <Catalog stories={stories} lang={lang} onOpen={onOpen} />}
      {route === 'reader' && <Reader story={current} lang={lang} onBack={() => onNav('catalog')} />}
      {route === 'about' && <About lang={lang} onNav={onNav} />}
      <Footer lang={lang} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
