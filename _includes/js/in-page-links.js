class InPageLinks {
  constructor({ onNavigate }) {
    this.onNavigate = onNavigate;
  }

  start() {
    document.addEventListener('click', (event) => this.handle(event), true);
  }

  handle(event) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    const anchor = event.target.closest ? event.target.closest('a[href*="#"]') : null;
    const destination = anchor && this.destinationOf(anchor);
    if (!destination) {
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    destination.target.scrollIntoView({ behavior: Motion.prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    this.remember(destination.hash);
    this.onNavigate({
      id: destination.hash.slice(1),
      target: destination.target,
      anchor,
      origin: anchor.getBoundingClientRect(),
    });
  }

  destinationOf(anchor) {
    let url;
    try {
      url = new URL(anchor.href, location.href);
    } catch (error) {
      return null;
    }
    const withoutIndex = (path) => path.replace(/index\.html$/, '');
    if (url.origin !== location.origin || withoutIndex(url.pathname) !== withoutIndex(location.pathname) || url.hash.length < 2) {
      return null;
    }
    const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    return target ? { target, hash: url.hash } : null;
  }

  remember(hash) {
    if (!history.pushState || location.hash === hash) {
      return;
    }
    if (window.top !== window.self) {
      history.replaceState(null, '', hash);
    } else {
      history.pushState(null, '', hash);
    }
  }
}
