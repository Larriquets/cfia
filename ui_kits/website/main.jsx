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
import './Universes.jsx';

const { Nav, Footer, Home, Catalog, Reader, About, Create, Universes } = window;

const ROUTE_PATH = {
  home: '/',
  catalog: '/catalogo',
  universes: '/universos',
  create: '/crear',
  about: '/acerca',
};

function pathFor(route, slug) {
  if (route === 'reader' && slug) return `/cuentos/${slug}`;
  return ROUTE_PATH[route] || '/';
}

function parseLocation(pathname) {
  const p = pathname.replace(/\/+$/, '') || '/';
  if (p === '/' || p === '') return { route: 'home', slug: null };
  if (p === '/catalogo') return { route: 'catalog', slug: null };
  if (p === '/universos') return { route: 'universes', slug: null };
  if (p === '/crear') return { route: 'create', slug: null };
  if (p === '/acerca') return { route: 'about', slug: null };
  const m = p.match(/^\/cuentos\/([^/]+)$/);
  if (m) return { route: 'reader', slug: decodeURIComponent(m[1]) };
  return { route: 'home', slug: null };
}

function App() {
  const initial = parseLocation(window.location.pathname);
  const [route, setRoute] = useState(initial.route);
  const [slug, setSlug] = useState(initial.slug);
  const [lang, setLang] = useState('es');
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

  useEffect(() => {
    const onPop = () => {
      const parsed = parseLocation(window.location.pathname);
      setRoute(parsed.route);
      setSlug(parsed.slug);
      window.scrollTo(0, 0);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const pushRoute = (nextRoute, nextSlug = null) => {
    const target = pathFor(nextRoute, nextSlug);
    if (target !== window.location.pathname) {
      window.history.pushState({ route: nextRoute, slug: nextSlug }, '', target);
    }
    setRoute(nextRoute);
    setSlug(nextSlug);
    window.scrollTo(0, 0);
  };

  const onOpen = (s) => pushRoute('reader', s);
  const onNav = (r) => pushRoute(r, null);

  const onLikeChange = (s, likes) => {
    setStories((prev) => prev ? prev.map((x) => x.slug === s ? { ...x, likes } : x) : prev);
  };
  window.CFIA_onLikeChange = onLikeChange;

  const onCreated = (result) => {
    const list = Array.isArray(result) ? result : [result];
    if (!list.length) return;
    setStories((prev) => [...list, ...(prev || [])]);
    if (list.length === 1) {
      pushRoute('reader', list[0].slug);
    } else {
      pushRoute('catalog', null);
    }
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

  const current = stories.find((s) => s.slug === slug) || null;

  if (route === 'reader' && !current) {
    return (
      <div>
        <Nav route={route} onNav={onNav} lang={lang} onLang={setLang} />
        <div style={{ padding: 40, fontFamily: "'JetBrains Mono', monospace", color: '#e8b84a', letterSpacing: '0.14em' }}>
          <p>◼ {lang === 'es' ? 'CUENTO NO ENCONTRADO' : 'STORY NOT FOUND'}</p>
          <p style={{ color: '#6b6860', fontSize: 13, letterSpacing: 0 }}>
            {lang === 'es' ? 'El slug ' : 'Slug '}<code style={{ color: '#e8b84a' }}>{slug}</code>{lang === 'es' ? ' no existe.' : ' does not exist.'}
          </p>
          <button
            type="button"
            onClick={() => onNav('catalog')}
            style={{ marginTop: 16, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.16em', background: 'transparent', color: '#e8b84a', border: '1px solid #e8b84a', padding: '10px 16px', cursor: 'pointer' }}
          >
            ▸ {lang === 'es' ? 'IR AL CATÁLOGO' : 'GO TO CATALOG'}
          </button>
        </div>
        <Footer lang={lang} />
      </div>
    );
  }

  return (
    <div>
      <Nav route={route} onNav={onNav} lang={lang} onLang={setLang} />
      {route === 'home' && <Home stories={stories} lang={lang} onOpen={onOpen} onNav={onNav} />}
      {route === 'catalog' && <Catalog stories={stories} lang={lang} onOpen={onOpen} />}
      {route === 'universes' && <Universes lang={lang} onOpen={onOpen} />}
      {route === 'create' && <Create lang={lang} onCreated={onCreated} stories={stories} />}
      {route === 'reader' && current && <Reader story={current} lang={lang} onBack={() => onNav('catalog')} onOpen={onOpen} onCreated={onCreated} />}
      {route === 'about' && <About lang={lang} onNav={onNav} />}
      <Footer lang={lang} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
