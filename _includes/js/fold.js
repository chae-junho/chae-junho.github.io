class Fold {
  constructor(details, { shortDuration = 420, springDuration = 900 } = {}) {
    this.details = details;
    this.summary = details.querySelector('summary');
    this.shortDuration = shortDuration;
    this.springDuration = springDuration;
    this.animation = null;
    this.opening = null;
  }

  static supported() {
    return Boolean(Element.prototype.animate) && !Motion.prefersReducedMotion();
  }

  static startAll(root) {
    if (Fold.supported()) {
      Array.from(root.querySelectorAll('details')).forEach((details) => new Fold(details).start());
    }
  }

  start() {
    if (this.summary) {
      this.summary.addEventListener('click', (event) => {
        event.preventDefault();
        this.toggle();
      });
    }
  }

  toggle() {
    const opening = this.opening === null ? !this.details.open : !this.opening;
    const from = this.details.getBoundingClientRect().height;
    if (this.animation) {
      this.animation.cancel();
      this.animation = null;
    }
    this.details.style.height = '';
    const heights = this.measureHeights();
    this.opening = opening;
    this.details.style.overflow = 'hidden';
    const body = Array.from(this.details.children).filter((child) => child !== this.summary);
    body.forEach((child) => {
      child.animate({ opacity: opening ? [0, 1] : [1, 0] }, { duration: this.shortDuration, easing: Motion.curve('ease'), fill: 'both' });
    });
    const animation = this.details.animate({ height: [from + 'px', (opening ? heights.open : heights.closed) + 'px'] }, this.timing(opening));
    this.animation = animation;
    animation.onfinish = () => this.finish(animation, opening, body);
  }

  measureHeights() {
    this.details.open = true;
    const open = this.details.getBoundingClientRect().height;
    this.details.open = false;
    const closed = this.details.getBoundingClientRect().height;
    this.details.open = true;
    return { open, closed };
  }

  timing(opening) {
    if (opening && Motion.supportsSpring()) {
      return { duration: this.springDuration, easing: Motion.curve('spring') };
    }
    return { duration: this.shortDuration, easing: Motion.curve('ease') };
  }

  finish(animation, opening, body) {
    if (this.animation !== animation) {
      return;
    }
    this.details.open = opening;
    this.details.style.overflow = '';
    this.animation = null;
    this.opening = null;
    body.forEach((child) => child.getAnimations().forEach((running) => running.cancel()));
  }
}
