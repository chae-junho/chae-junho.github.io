class GlobeTint {
  constructor({ filterId = 'globe-land', widgetColor = '#3dc0ff', landColor }) {
    this.filterId = filterId;
    this.widgetColor = widgetColor;
    this.landColor = landColor;
    this.range = 1 - GlobeTint.luminance(Dom.channels(widgetColor));
    this.funcs = [];
    this.frame = 0;
  }

  static luminance(channels) {
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  }

  install(parent) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'visitors__defs');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.innerHTML = '<filter id="' + this.filterId + '" color-interpolation-filters="sRGB">'
      + '<feColorMatrix type="matrix" values="' + this.greyscaleMatrix() + '"/>'
      + '<feComponentTransfer><feFuncR type="linear"/><feFuncG type="linear"/><feFuncB type="linear"/></feComponentTransfer></filter>';
    parent.insertBefore(svg, parent.firstChild);
    this.funcs = Array.from(svg.querySelectorAll('feComponentTransfer > *'));
    this.apply();
  }

  greyscaleMatrix() {
    const row = '0.2126 0.7152 0.0722 0 0';
    return [row, row, row, '0 0 0 1 0'].join(' ');
  }

  apply() {
    const land = Dom.channels(this.landColor);
    this.funcs.forEach((func, index) => {
      const slope = (1 - land[index]) / this.range;
      func.setAttribute('slope', slope.toFixed(4));
      func.setAttribute('intercept', (1 - slope).toFixed(4));
    });
  }

  retint(landColor) {
    this.landColor = landColor;
    this.apply();
  }

  follow(token, duration) {
    cancelAnimationFrame(this.frame);
    const end = performance.now() + duration;
    const step = () => {
      this.retint(Dom.token(token));
      if (performance.now() < end) {
        this.frame = requestAnimationFrame(step);
      }
    };
    this.frame = requestAnimationFrame(step);
  }
}
