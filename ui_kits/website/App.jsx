/* global React, ReactDOM, Nav, Footer, Home, Catalog, Reader, About */
const { useState } = React;

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
