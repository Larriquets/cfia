import React from 'react';
import ReactDOM from 'react-dom/client';

// Expose globals so the existing JSX files (which reference `React` and
// attach components to `window`) work without modification.
window.React = React;
window.ReactDOM = ReactDOM;

import './data.js';
import './Illustration.jsx';
import './Nav.jsx';
import './Footer.jsx';
import './StoryCard.jsx';
import './Home.jsx';
import './Catalog.jsx';
import './Reader.jsx';
import './About.jsx';

const { useState } = React;
const { Nav, Footer, Home, Catalog, Reader, About } = window;

function App() {
  const [route, setRoute] = useState('home');
  const [lang, setLang] = useState('es');
  const [slug, setSlug] = useState(null);
  const stories = window.CFIA_STORIES;

  const onOpen = (s) => { setSlug(s); setRoute('reader'); window.scrollTo(0, 0); };
  const onNav = (r) => { setRoute(r); window.scrollTo(0, 0); };

  const current = stories.find(s => s.slug === slug) || stories[0];

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
