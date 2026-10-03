class Reveal {
  constructor(root, { targets, openingSelector, sidebarSelector, headingSelector, shownClass = 'is-in', step = 80, maxSteps = 9 }) {
    this.root = root;
    this.targets = targets;
    this.items = [];
    this.openingSelector = openingSelector;
    this.sidebarSelector = sidebarSelector;
    this.headingSelector = headingSelector;
    this.shownClass = shownClass;
    this.step = step;
    this.maxSteps = maxSteps;
    this.paused = false;
    this.observer = new IntersectionObserver((entries) => this.onIntersect(entries), { rootMargin: '0px', threshold: 0.01 });
  }

  static create(root, options) {
    if (!/\bjs-reveal\b/.test(root.className) || !('IntersectionObserver' in window)) {
      return null;
    }
    const targets = Dom.token('reveal-targets');
    if (!targets) {
      root.className = root.className.replace(/\bjs-reveal\b/g, '');
      return null;
    }
    return new Reveal(root, Object.assign({ targets }, options));
  }

  start() {
    this.items = Array.from(document.querySelectorAll(this.targets));
    this.items.forEach((item) => this.observer.observe(item));
    window.addEventListener('scroll', () => this.showAtPageEnd(), { passive: true });
    window.addEventListener('resize', () => this.showAtPageEnd());
    this.root.setAttribute('data-reveal', 'on');
  }

  onIntersect(entries) {
    if (this.paused) {
      return;
    }
    const arrived = entries.filter((entry) => entry.isIntersecting).map((entry) => entry.target);
    arrived.forEach((element) => this.observer.unobserve(element));
    this.show(arrived);
  }

  isShown(element) {
    return element.classList.contains(this.shownClass);
  }

  unobserve(elements) {
    elements.forEach((element) => this.observer.unobserve(element));
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
  }

  show(elements) {
    const ordered = elements.slice().sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    const steps = { side: -1, main: -1 };
    const lastRow = { side: null, main: null };
    ordered.forEach((element) => {
      const region = element.closest(this.sidebarSelector) ? 'side' : 'main';
      const parent = element.parentElement;
      const row = parent && getComputedStyle(parent).display === 'contents' ? parent : element;
      if (row !== lastRow[region]) {
        steps[region] += 1;
        lastRow[region] = row;
      }
      element.style.setProperty('--d', Math.min(steps[region], this.maxSteps) * this.step + 'ms');
      element.classList.add(this.shownClass);
    });
  }

  hide(element) {
    Dom.withoutTransition(element, () => element.classList.remove(this.shownClass));
  }

  showVisible() {
    const height = window.innerHeight;
    const visible = this.items.filter((element) => {
      if (this.isShown(element) || element.offsetParent === null) {
        return false;
      }
      const box = element.getBoundingClientRect();
      return box.top < height && box.bottom > 0;
    });
    if (visible.length) {
      this.unobserve(visible);
      this.show(visible);
    }
  }

  showAtPageEnd() {
    const atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (!this.paused && atEnd) {
      this.showVisible();
    }
  }

  openingText() {
    return this.items.filter((element) => element.matches(this.openingSelector) && element.offsetParent !== null);
  }

  replayOpeningText() {
    const elements = this.openingText();
    elements.forEach((element) => this.hide(element));
    window.requestAnimationFrame(() => this.show(elements));
  }

  inSection(target) {
    if (!target.matches(this.headingSelector)) {
      return this.openingText();
    }
    const headings = Array.from(document.querySelectorAll(this.headingSelector));
    const next = headings[headings.indexOf(target) + 1] || null;
    return this.items.filter((element) => {
      const after = element === target || target.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING;
      const before = !next || next.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_PRECEDING;
      return after && before;
    });
  }
}
