'use strict';

(function () {
  const cloud = document.getElementById('cloud');
  const status = document.getElementById('status');
  const refresh = document.getElementById('refresh');

  refresh.addEventListener('click', () => { void webviewApi.postMessage({ type: 'refresh' }); });

  webviewApi.onMessage(event => {
    const message = event && event.message ? event.message : event;
    if (!message || typeof message !== 'object') return;
    if (message.type === 'loading') {
      status.textContent = message.hasData ? 'Refreshing…' : 'Loading tags…';
      refresh.disabled = true;
    } else if (message.type === 'progress') {
      status.textContent = `Loading tags… ${message.done} of ${message.total}`;
    } else if (message.type === 'error') {
      status.textContent = 'Could not load tags. Try refreshing.';
      refresh.disabled = false;
    } else if (message.type === 'cloud') {
      refresh.disabled = false;
      cloud.replaceChildren();
      const tags = message.tags;
      if (!tags.length) {
        status.textContent = 'No tags in use yet.';
        return;
      }
      status.textContent = '';
      const max = Math.max(...tags.map(tag => tag.count));
      const min = Math.min(...tags.map(tag => tag.count));
      const range = Math.log1p(max) - Math.log1p(min);
      for (const tag of tags) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'tag';
        button.textContent = tag.title;
        const label = `${tag.title}: ${tag.count} ${tag.count === 1 ? 'note' : 'notes'}`;
        button.title = label;
        button.setAttribute('aria-label', label);
        const weight = range ? (Math.log1p(tag.count) - Math.log1p(min)) / range : 0.35;
        button.style.fontSize = `${(0.9 + 1.9 * weight).toFixed(2)}em`;
        button.addEventListener('click', () => { void webviewApi.postMessage({ type: 'openTag', id: tag.id }); });
        cloud.appendChild(button);
      }
    }
  });
  void webviewApi.postMessage({ type: 'ready' });
})();
