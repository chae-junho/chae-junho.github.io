class NavLens {
  constructor(nav, before) {
    this.element = document.createElement('span');
    this.element.className = 'nav-indicator';
    nav.insertBefore(this.element, before);
  }

  place({ x, y, width, height }, mode) {
    const style = this.element.style;
    const apply = () => {
      style.width = width + 'px';
      style.height = height + 'px';
      style.translate = x + 'px ' + y + 'px';
    };
    if (mode === 'glide') {
      apply();
      style.opacity = '1';
    } else if (mode === 'appear') {
      Dom.withoutTransition(this.element, () => {
        apply();
        style.opacity = '1';
      });
    } else {
      Dom.withoutTransition(this.element, () => {
        style.opacity = '0';
        apply();
      });
      style.opacity = '1';
    }
  }

  hide() {
    this.element.style.opacity = '0';
  }

  charge() {
    this.element.classList.remove('is-released');
    this.element.classList.add('is-charging');
  }

  release() {
    this.element.classList.remove('is-charging');
    Dom.replay(this.element, 'is-released', 900);
  }
}
