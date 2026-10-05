class GlobeSpin {
  constructor() {
    this.animations = new WeakMap();
    this.adopted = false;
  }

  adopt(jq) {
    if (this.adopted || !jq || !jq.fn || !jq.fn.velocity || !Element.prototype.animate) {
      return;
    }
    this.adopted = true;
    const spin = this;
    const original = jq.fn.velocity;
    jq.fn.velocity = function (properties, options) {
      if (properties && properties.translateX && options && options.easing === 'linear') {
        this.each((index, element) => spin.run(element, properties.translateX, options.duration));
        return this;
      }
      if (properties === 'pause' || properties === 'resume') {
        const others = this.filter((index, element) => !spin.hold(element, properties === 'pause'));
        return others.length ? original.apply(others, arguments) : this;
      }
      return original.apply(this, arguments);
    };
  }

  run(element, [end, start], duration) {
    if (Motion.prefersReducedMotion()) {
      return;
    }
    const previous = this.animations.get(element);
    if (previous) {
      previous.cancel();
    }
    this.animations.set(element, element.animate(
      [{ transform: 'translateX(' + parseFloat(start) + 'px)' }, { transform: 'translateX(' + parseFloat(end) + 'px)' }],
      { duration, iterations: Infinity, easing: 'linear' }
    ));
  }

  hold(element, paused) {
    const animation = this.animations.get(element);
    if (!animation) {
      return false;
    }
    if (paused) {
      animation.pause();
    } else {
      animation.play();
    }
    return true;
  }
}
