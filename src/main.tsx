import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { pathLang, setEnDictionary, setLang } from './i18n';

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

// Persian (default) renders synchronously and never downloads the English dictionary.
// /en pages load it first (a separate lazy chunk), then render in English.
if (pathLang(window.location.pathname) === 'en') {
  import('./i18n/enDict')
    .then(({ EN_DICT }) => {
      setEnDictionary(EN_DICT);
      setLang('en');
    })
    .finally(render);
} else {
  render();
}
