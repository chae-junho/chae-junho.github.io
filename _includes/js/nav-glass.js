class NavGlass {
  constructor(nav) {
    this.nav = nav;
    this.element = document.createElement('span');
    this.element.className = 'nav-glass';
    this.element.setAttribute('aria-hidden', 'true');
    this.light = document.createElement('span');
    this.light.className = 'nav-light';
    this.element.appendChild(this.light);
    this.pointer = { x: 0, y: 0 };
    this.frame = 0;
    nav.insertBefore(this.element, nav.firstChild);
  }

  start() {
    this.nav.addEventListener('pointermove', (event) => this.follow(event));
    this.nav.addEventListener('pointerleave', () => this.element.classList.remove('is-lit'));
  }

  follow(event) {
    const box = this.element.getBoundingClientRect();
    this.pointer = { x: event.clientX - box.left, y: event.clientY - box.top };
    this.element.classList.add('is-lit');
    if (!this.frame) {
      this.frame = window.requestAnimationFrame(() => {
        this.frame = 0;
        this.element.style.setProperty('--mx', this.pointer.x + 'px');
        this.element.style.setProperty('--my', this.pointer.y + 'px');
      });
    }
  }

  place({ left, top, width, height }, { instant = false } = {}) {
    const apply = () => {
      this.element.style.left = left + 'px';
      this.element.style.top = top + 'px';
      this.element.style.width = width + 'px';
      this.element.style.height = height + 'px';
    };
    if (instant) {
      Dom.withoutTransition(this.element, apply);
    } else {
      apply();
    }
  }

  reveal() {
    this.element.classList.add('is-placed');
  }

  freeze() {
    this.element.style.transition = 'none';
  }

  thaw() {
    Dom.settle(this.element);
    this.element.style.transition = '';
  }
}
