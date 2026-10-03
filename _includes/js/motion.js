class Motion {
  static prefersReducedMotion() {
    return Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  static prefersReducedTransparency() {
    return Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-transparency: reduce)').matches);
  }

  static supportsSpring() {
    return Boolean(window.CSS && CSS.supports && CSS.supports('transition-timing-function', 'linear(0, 1)'));
  }

  static curve(name) {
    return Dom.token(name);
  }
}
