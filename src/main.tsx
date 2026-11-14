import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { pathLang, setEnDictionary, setLang, setTrDictionary } from './i18n';

const root = createRoot(document.getElementById('root')!);
const render = () => {
  if (import.meta.env.DEV) {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  } else {
    root.render(<App />);
  }
};

// Persian (default) renders synchronously and never downloads a foreign dictionary.
// /en and /tr pages load their dictionary first (a separate lazy chunk), then render.
const bootLang = pathLang(window.location.pathname);
if (bootLang === 'en') {
  import('./i18n/enDict')
    .then(({ EN_DICT }) => {
      setEnDictionary(EN_DICT);
      setLang('en');
    })
    .finally(render);
} else if (bootLang === 'tr') {
  import('./i18n/trDict')
    .then(({ TR_DICT }) => {
      setTrDictionary(TR_DICT);
      setLang('tr');
    })
    .finally(render);
} else {
  render();
}
