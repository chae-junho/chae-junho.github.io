class GlobeTint {
  constructor({ filterId = 'globe-land', widgetColor = '#3dc0ff', landColor }) {
    this.filterId = filterId;
    this.widgetColor = widgetColor;
    this.landColor = landColor;
  }

  static channels(hex) {
    const value = parseInt(hex.replace('#', ''), 16);
    return [(value >> 16) & 255, (value >> 8) & 255, value & 255].map((channel) => channel / 255);
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
      + '<feComponentTransfer>' + this.transfers() + '</feComponentTransfer></filter>';
    parent.insertBefore(svg, parent.firstChild);
  }

  greyscaleMatrix() {
    const row = '0.2126 0.7152 0.0722 0 0';
    return [row, row, row, '0 0 0 1 0'].join(' ');
  }

  transfers() {
    const range = 1 - GlobeTint.luminance(GlobeTint.channels(this.widgetColor));
    const land = GlobeTint.channels(this.landColor);
    return ['R', 'G', 'B'].map((name, index) => {
      const slope = (1 - land[index]) / range;
      return '<feFunc' + name + ' type="linear" slope="' + slope.toFixed(4) + '" intercept="' + (1 - slope).toFixed(4) + '"/>';
    }).join('');
  }
}
