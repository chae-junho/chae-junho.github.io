class StickyColumn {
  constructor(column, { wideQuery, watched, slack = 3, freeClass = 'sidebar--free', fillClass = 'sidebar--fill', measureClass = 'sidebar--measuring' }) {
    this.column = column;
    this.wide = window.matchMedia(wideQuery);
    this.watched = watched;
    this.slack = slack;
    this.freeClass = freeClass;
    this.fillClass = fillClass;
    this.measureClass = measureClass;
  }

  start() {
    window.addEventListener('resize', () => this.update());
    window.addEventListener('load', () => this.update());
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => this.update());
    }
    const content = this.column.querySelector(this.watched);
    if (content && window.ResizeObserver) {
      new ResizeObserver(() => this.update()).observe(content);
    }
    this.update();
  }

  update() {
    this.column.classList.remove(this.freeClass, this.fillClass);
    if (!this.wide.matches) {
      return;
    }
    this.column.classList.add(this.measureClass);
    const offset = parseFloat(getComputedStyle(this.column).top) || 0;
    const fits = this.column.offsetHeight + offset + this.slack <= window.innerHeight;
    this.column.classList.remove(this.measureClass);
    this.column.classList.add(fits ? this.fillClass : this.freeClass);
  }
}
