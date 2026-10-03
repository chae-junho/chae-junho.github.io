class GlassRefraction {
  constructor(glass, { displacement = 26, blur = 5, saturation = 1.9, bezel = 17, bezelRatio = 0.95, falloff = 2.2, filterId = 'glass-refraction' } = {}) {
    this.glass = glass;
    this.displacement = displacement;
    this.blur = blur;
    this.saturation = saturation;
    this.bezel = bezel;
    this.bezelRatio = bezelRatio;
    this.falloff = falloff;
    this.filterId = filterId;
    this.image = null;
    this.drawn = '';
  }

  supported() {
    return Boolean(document.createElementNS)
      && /(Chrome|Chromium)\//.test(navigator.userAgent)
      && Boolean(window.CSS && CSS.supports && CSS.supports('backdrop-filter', 'url(#' + this.filterId + ')'))
      && !Motion.prefersReducedTransparency();
  }

  start() {
    if (!this.supported()) {
      return;
    }
    this.install();
    this.draw();
    if (window.ResizeObserver) {
      new ResizeObserver(() => this.draw()).observe(this.glass);
    } else {
      window.addEventListener('resize', () => this.draw());
    }
  }

  install() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.position = 'absolute';
    svg.innerHTML = '<filter id="' + this.filterId + '" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">'
      + '<feImage id="' + this.filterId + '-map" x="0" y="0" width="1" height="1" preserveAspectRatio="none" result="map"/>'
      + '<feDisplacementMap in="SourceGraphic" in2="map" scale="' + this.displacement + '" xChannelSelector="R" yChannelSelector="G" result="bent"/>'
      + '<feGaussianBlur in="bent" stdDeviation="' + this.blur + '" edgeMode="duplicate" result="soft"/>'
      + '<feColorMatrix in="soft" type="saturate" values="' + this.saturation + '"/></filter>';
    document.body.appendChild(svg);
    this.image = svg.querySelector('#' + this.filterId + '-map');
  }

  draw() {
    const box = this.glass.getBoundingClientRect();
    const width = Math.round(box.width);
    const height = Math.round(box.height);
    if (width < 40 || height < 20 || this.drawn === width + 'x' + height) {
      return;
    }
    this.drawn = width + 'x' + height;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    const picture = context.createImageData(width, height);
    this.fill(picture.data, width, height);
    context.putImageData(picture, 0, 0);
    this.image.setAttribute('width', width);
    this.image.setAttribute('height', height);
    this.image.setAttribute('href', canvas.toDataURL('image/png'));
    this.glass.classList.add('is-refracting');
  }

  fill(pixels, width, height) {
    const radius = height / 2;
    const bezel = Math.min(radius * this.bezelRatio, this.bezel);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const nearestX = Math.min(Math.max(x + 0.5, radius), width - radius);
        const dx = x + 0.5 - nearestX;
        const dy = y + 0.5 - height / 2;
        const distance = Math.sqrt(dx * dx + dy * dy) || 0.0001;
        const depth = radius - distance;
        let pushX = 0;
        let pushY = 0;
        if (depth < bezel) {
          const push = Math.pow(1 - Math.max(depth, 0) / bezel, this.falloff);
          pushX = -dx / distance * push;
          pushY = -dy / distance * push;
        }
        const index = (y * width + x) * 4;
        pixels[index] = Math.round(127.5 + 127 * pushX);
        pixels[index + 1] = Math.round(127.5 + 127 * pushY);
        pixels[index + 2] = 128;
        pixels[index + 3] = 255;
      }
    }
  }
}
