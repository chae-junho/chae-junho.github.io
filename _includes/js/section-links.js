class SectionLinks {
  constructor(nav, { excluded = '.masthead__menu-home-item' } = {}) {
    this.anchors = {};
    this.ids = [];
    Array.from(nav.querySelectorAll('a[href*="#"]')).forEach((anchor) => {
      const id = Dom.fragmentOf(anchor.getAttribute('href'));
      if (id && document.getElementById(id) && !anchor.closest(excluded)) {
        this.anchors[id] = anchor;
        this.ids.push(id);
      }
    });
  }

  has(id) {
    return Object.prototype.hasOwnProperty.call(this.anchors, id);
  }

  markCurrent(currentId) {
    this.ids.forEach((id) => {
      this.anchors[id].classList.toggle('is-current', id === currentId);
    });
  }
}
