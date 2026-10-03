class ScrollFlag {
  constructor(root, { className = 'is-scrolled', threshold = 4 } = {}) {
    this.root = root;
    this.className = className;
    this.threshold = threshold;
    this.scrolled = false;
  }

  start() {
    window.addEventListener('scroll', () => this.update(), { passive: true });
    this.update();
  }

  update() {
    const scrolled = window.scrollY > this.threshold;
    if (scrolled !== this.scrolled) {
      this.scrolled = scrolled;
      this.root.classList.toggle(this.className, scrolled);
    }
  }
}
