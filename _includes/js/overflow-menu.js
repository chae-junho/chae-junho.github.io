class OverflowMenu {
  constructor(nav, { homeItem = '.masthead__menu-home-item' } = {}) {
    this.nav = nav;
    this.homeItem = homeItem;
    this.button = nav.querySelector('button');
    this.list = nav.querySelector('.visible-links');
    this.panel = nav.querySelector('.hidden-links');
    this.items = Array.from(this.list.children);
    this.entries = [];
    this.button.addEventListener('click', () => this.toggle());
  }

  get buttonWidth() {
    return parseFloat(getComputedStyle(this.button).width);
  }

  links() {
    return this.items
      .filter((item) => !item.matches(this.homeItem))
      .map((item) => ({ item, id: this.idOf(item) }));
  }

  restore() {
    if (this.panel.children.length || this.list.children.length !== this.items.length) {
      this.items.forEach((item) => this.list.appendChild(item));
      Array.from(this.panel.children).forEach((child) => this.panel.removeChild(child));
    }
    this.entries = [];
  }

  fitsWithoutButton() {
    this.restore();
    return this.list.offsetWidth <= this.nav.getBoundingClientRect().width;
  }

  keep(ids) {
    const kept = this.items.filter((item) => item.matches(this.homeItem) || ids.indexOf(this.idOf(item)) >= 0);
    this.arrange(this.list, kept);
    this.entries = this.items
      .filter((item) => !item.matches(this.homeItem))
      .map((item) => ({ id: this.idOf(item), element: kept.indexOf(item) >= 0 ? this.copyOf(item) : item }));
  }

  showMissing(visibleIds) {
    this.arrange(this.panel, this.entries.filter((entry) => visibleIds.indexOf(entry.id) < 0).map((entry) => entry.element));
  }

  copyOf(item) {
    const copy = item.cloneNode(true);
    copy.querySelector('a').classList.remove('is-current');
    return copy;
  }

  arrange(parent, items) {
    const unchanged = parent.children.length === items.length && items.every((item, index) => parent.children[index] === item);
    if (unchanged) {
      return;
    }
    Array.from(parent.children).forEach((child) => {
      if (items.indexOf(child) < 0) {
        parent.removeChild(child);
      }
    });
    items.forEach((item) => parent.appendChild(item));
  }

  idOf(item) {
    return Dom.fragmentOf(item.querySelector('a').getAttribute('href'));
  }

  showButton(shown) {
    this.button.classList.toggle('hidden', !shown);
    if (!shown) {
      this.panel.classList.add('hidden');
      this.button.classList.remove('close');
    }
  }

  isOpen() {
    return this.button.classList.contains('close');
  }

  toggle() {
    this.panel.classList.toggle('hidden');
    this.button.classList.toggle('close');
  }

  closeAfterChoosing(element) {
    if (this.panel.contains(element) && this.isOpen()) {
      this.toggle();
    }
  }
}
