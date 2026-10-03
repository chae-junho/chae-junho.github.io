class NavPager {
  constructor(nav, menu, { buttonGap = 0.8 } = {}) {
    this.nav = nav;
    this.menu = menu;
    this.buttonGap = buttonGap;
    this.pages = [];
    this.signature = '';
    this.fresh = false;
  }

  get enabled() {
    return this.pages.length > 0;
  }

  rowAt(index) {
    return this.pages[index].element;
  }

  build() {
    const links = this.menu.links();
    const probe = this.createRow(links.map((link) => link.item), 'nav-page nav-probe');
    this.nav.appendChild(probe);
    const anchors = Array.from(probe.querySelectorAll('a'));
    const widths = anchors.map((anchor) => anchor.getBoundingClientRect().width);
    const rowPadding = this.horizontalSpace(probe, 'padding');
    const linkGap = anchors.length > 1 ? this.horizontalSpace(anchors[1], 'margin') : 0;
    this.nav.removeChild(probe);
    const rem = Dom.rem();
    const room = this.nav.getBoundingClientRect().width - this.menu.buttonWidth - this.buttonGap * rem - rowPadding;
    const groups = this.pack(widths, room, linkGap);
    const signature = groups.map((group) => group.join(',')).join('|');
    if (signature !== this.signature || !this.pages.length) {
      this.signature = signature;
      this.replacePages(links, groups);
    }
    return this.pages;
  }

  pack(widths, room, gap) {
    const groups = [];
    let current = [];
    let used = 0;
    widths.forEach((width, index) => {
      const needed = current.length ? used + gap + width : width;
      if (current.length && needed > room) {
        groups.push(current);
        current = [];
        used = 0;
      }
      used = current.length ? used + gap + width : width;
      current.push(index);
    });
    if (current.length) {
      groups.push(current);
    }
    return groups;
  }

  replacePages(links, groups) {
    this.clear();
    this.pages = groups.map((group) => {
      const element = this.createRow(group.map((index) => links[index].item), 'nav-page');
      this.nav.appendChild(element);
      return { element, ids: group.map((index) => links[index].id) };
    });
    this.fresh = true;
  }

  clear() {
    this.pages.forEach((page) => this.nav.removeChild(page.element));
    this.pages = [];
    this.signature = '';
  }

  createRow(items, className) {
    const row = document.createElement('ul');
    row.className = className;
    items.forEach((item) => row.appendChild(this.copyOf(item)));
    return row;
  }

  copyOf(item) {
    const copy = item.cloneNode(true);
    const anchor = copy.querySelector('a');
    if (anchor) {
      anchor.classList.remove('is-current');
    }
    return copy;
  }

  horizontalSpace(element, property) {
    const style = getComputedStyle(element);
    return parseFloat(style[property + 'Left']) + parseFloat(style[property + 'Right']);
  }

  markCurrent(id) {
    this.pages.forEach((page) => {
      Array.from(page.element.querySelectorAll('a')).forEach((anchor) => {
        anchor.classList.toggle('is-current', Boolean(id) && Dom.fragmentOf(anchor.getAttribute('href')) === id);
      });
    });
  }

  activate(id) {
    let active = 0;
    this.pages.forEach((page, index) => {
      if (id && page.ids.indexOf(id) >= 0) {
        active = index;
      }
    });
    const instant = this.fresh;
    this.fresh = false;
    this.pages.forEach((page, index) => {
      const apply = () => {
        page.element.classList.toggle('is-active', index === active);
        page.element.classList.toggle('is-before', index < active);
        page.element.classList.toggle('is-after', index > active);
      };
      if (instant) {
        Dom.withoutTransition(page.element, apply);
      } else {
        apply();
      }
    });
    return active;
  }
}
