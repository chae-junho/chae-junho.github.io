class OverflowMenu {
  constructor(nav, { homeItem = '.masthead__menu-home-item' } = {}) {
    this.nav = nav;
    this.homeItem = homeItem;
    this.button = nav.querySelector('button');
    this.list = nav.querySelector('.visible-links');
    this.panel = nav.querySelector('.hidden-links');
    this.items = Array.from(this.list.children);
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
    if (this.panel.children.length) {
      this.items.forEach((item) => this.list.appendChild(item));
    }
  }

  fitsWithoutButton() {
    this.restore();
    return this.list.offsetWidth <= this.nav.getBoundingClientRect().width;
  }

  collapse() {
    const home = this.items.filter((item) => item.matches(this.homeItem));
    this.arrange(this.list, home);
    this.arrange(this.panel, this.items.filter((item) => home.indexOf(item) < 0));
  }

  arrange(parent, items) {
    const unchanged = parent.children.length === items.length && items.every((item, index) => parent.children[index] === item);
    if (!unchanged) {
      items.forEach((item) => parent.appendChild(item));
    }
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
