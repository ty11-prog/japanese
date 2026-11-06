import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

const root = document.getElementById('root')!;

// Pages cannot set frame-ancestors response headers. Refuse to mount the
// interactive app inside a frame, including a same-origin or sandboxed frame.
if (window.self !== window.top) {
  const notice = document.createElement('main');
  notice.className = 'embedded-notice';
  const heading = document.createElement('h1');
  heading.textContent = '請直接開啟拾語手帖';
  const message = document.createElement('p');
  message.textContent = '開啟獨立頁面後，即可開始學習與管理進度。';
  const link = document.createElement('a');
  link.textContent = '開啟拾語手帖';
  link.href = new URL('./', window.location.href).href;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  notice.append(heading, message, link);
  root.replaceChildren(notice);
} else {
  ReactDOM.createRoot(root).render(
    <React.StrictMode><App /></React.StrictMode>,
  );
}
