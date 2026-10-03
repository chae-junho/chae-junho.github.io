class Dom {
  static rem() {
    return parseFloat(getComputedStyle(document.documentElement).fontSize);
  }

  static token(name) {
    return getComputedStyle(document.documentElement).getPropertyValue('--' + name).trim();
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
