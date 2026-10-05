class Dom {
  static rem() {
    return parseFloat(getComputedStyle(document.documentElement).fontSize);
  }

  static token(name) {
    return getComputedStyle(document.documentElement).getPropertyValue('--' + name).trim();
  }

  static channels(color) {
    if (!Dom.palette) {
      Dom.palette = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
    }
    Dom.palette.fillStyle = '#010203';
    Dom.palette.fillStyle = color;
    if (Dom.palette.fillStyle === '#010203') {
      return null;
    }
    Dom.palette.clearRect(0, 0, 1, 1);
    Dom.palette.fillRect(0, 0, 1, 1);
    return Array.from(Dom.palette.getImageData(0, 0, 1, 1).data).slice(0, 3).map((value) => value / 255);
  }

  static translation(element) {
    const match = getComputedStyle(element).transform.match(/matrix\(([^)]+)\)/);
    const values = match ? match[1].split(',') : [];
    return { x: parseFloat(values[4]) || 0, y: parseFloat(values[5]) || 0 };
  }

  static settle(element) {
    return element.offsetWidth;
  }

  static withoutTransition(element, change) {
    element.style.transition = 'none';
    change();
    Dom.settle(element);
    element.style.transition = '';
  }

  static replay(element, className, duration) {
    element.classList.remove(className);
    Dom.settle(element);
    element.classList.add(className);
    if (duration) {
      setTimeout(() => element.classList.remove(className), duration);
    }
  }

  static fragmentOf(href) {
    return (href || '').split('#')[1] || '';
  }
}
