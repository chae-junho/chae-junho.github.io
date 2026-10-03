class ScrollSpy {
  constructor(ids, { masthead, nav, onChange, topLine = 0.25, sharpness = 8 }) {
    this.ids = ids;
    this.masthead = masthead;
    this.nav = nav;
    this.onChange = onChange;
    this.topLine = topLine;
    this.sharpness = sharpness;
    this.locked = false;
    this.waiting = false;
    this.shownId = null;
    this.schedule = this.schedule.bind(this);
    this.update = this.update.bind(this);
  }

  start() {
    window.addEventListener('scroll', this.schedule, { passive: true });
    window.addEventListener('resize', this.schedule);
    ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach((name) => {
      window.addEventListener(name, (event) => this.release(event), { passive: true });
    });
    this.update();
  }

  select(id) {
    this.locked = true;
    this.show(id);
  }

  release(event) {
    if (!this.locked) {
      return;
    }
    if (event.type === 'mousedown' && this.nav.contains(event.target)) {
      return;
    }
    this.locked = false;
    this.schedule();
  }

  schedule() {
    if (!this.waiting) {
      this.waiting = true;
      window.requestAnimationFrame(this.update);
    }
  }

  update() {
    this.waiting = false;
    if (!this.locked) {
      this.show(this.sectionAtLine());
    }
  }

  sectionAtLine() {
    const barBottom = this.masthead ? this.masthead.getBoundingClientRect().bottom : 0;
    const room = window.innerHeight - barBottom;
    const line = barBottom + room * (this.topLine + (1 - this.topLine) * Math.pow(this.scrollProgress(), this.sharpness));
    let current = this.ids[0];
    this.ids.forEach((id) => {
      if (document.getElementById(id).getBoundingClientRect().top <= line) {
        current = id;
      }
    });
    return current;
  }

  scrollProgress() {
    const furthest = document.documentElement.scrollHeight - window.innerHeight;
    return furthest > 0 ? Math.min(1, Math.max(0, window.scrollY / furthest)) : 0;
  }

  show(id) {
    if (id !== this.shownId) {
      this.shownId = id;
      this.onChange(id);
    }
  }
}
