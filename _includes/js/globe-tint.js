class GlobeTint {
  constructor({ token = 'globe-land', widgetColor = '#3dc0ff', steps = 6 } = {}) {
    this.token = token;
    this.widgetColor = widgetColor;
    this.steps = steps;
    this.layers = [];
    this.source = '';
    this.applied = '';
    this.timer = 0;
  }

  static channelsOf(hex) {
    return [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255);
  }

  static luminance(channels) {
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  }

  static hexOf(channels) {
    return '#' + channels.map((value) => Math.round(Math.min(1, Math.max(0, value)) * 255).toString(16).padStart(2, '0')).join('');
  }

  attach(layers) {
    if (!layers.length) {
      return;
    }
    const image = /url\(["']?data:image\/svg\+xml;base64,([^"')]+)["']?\)/.exec(getComputedStyle(layers[0]).backgroundImage);
    if (!image) {
      return;
    }
    this.layers = layers;
    this.source = atob(image[1]);
    this.apply();
  }

  apply() {
    const color = Dom.token(this.token);
    if (!this.source || color === this.applied) {
      return;
    }
    const land = Dom.channels(color);
    if (!land) {
      return;
    }
    const range = 1 - GlobeTint.luminance(GlobeTint.channelsOf(this.widgetColor));
    const svg = this.source.replace(/#[0-9a-f]{6}\b/gi, (hex) => {
      const lightness = 1 - GlobeTint.luminance(GlobeTint.channelsOf(hex));
      return GlobeTint.hexOf(land.map((value) => 1 - ((1 - value) / range) * lightness));
    });
    const image = 'url("data:image/svg+xml;base64,' + btoa(svg) + '")';
    this.layers.forEach((layer) => {
      layer.style.backgroundImage = image;
    });
    this.applied = color;
  }

  follow(duration) {
    clearInterval(this.timer);
    const end = performance.now() + duration;
    this.timer = setInterval(() => {
      this.apply();
      if (performance.now() >= end) {
        clearInterval(this.timer);
      }
    }, duration / this.steps);
  }
}
