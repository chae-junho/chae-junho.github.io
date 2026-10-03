class NavBar {
  constructor(nav, links, { lensPadding = 0.75, resizeDelay = 150 } = {}) {
    this.nav = nav;
    this.links = links;
    this.menu = new OverflowMenu(nav);
    this.list = this.menu.list;
    this.pager = new NavPager(nav, this.menu);
    this.glass = new NavGlass(nav);
    this.lens = new NavLens(nav, this.list);
    this.lensPadding = lensPadding;
    this.resizeDelay = resizeDelay;
    this.currentId = null;
    this.placed = false;
    this.pageIndex = -1;
    this.resizeTimer = 0;
    this.relayoutFrame = 0;
  }

  start() {
    this.glass.start();
    window.addEventListener('resize', () => this.followResize());
    window.addEventListener('load', () => this.scheduleRelayout());
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => this.scheduleRelayout());
    }
    if (window.ResizeObserver) {
      new ResizeObserver(() => this.scheduleRelayout()).observe(this.nav);
    }
    this.relayout();
  }

  scheduleRelayout() {
    if (!this.relayoutFrame) {
      this.relayoutFrame = window.requestAnimationFrame(() => {
        this.relayoutFrame = 0;
        this.relayout();
      });
    }
  }

  setCurrent(id) {
    this.currentId = id;
    this.links.markCurrent(id);
    this.pager.markCurrent(id);
    this.layout();
  }

  followResize() {
    this.glass.freeze();
    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      this.relayout();
      this.glass.thaw();
    }, this.resizeDelay);
  }

  relayout() {
    this.nav.classList.remove('is-paged');
    if (this.menu.fitsWithoutButton()) {
      this.pager.clear();
      this.menu.showButton(false);
    } else {
      const pages = this.pager.build();
      this.menu.collapse();
      this.menu.showButton(pages.length > 1);
      this.pager.markCurrent(this.currentId);
    }
    this.layout();
  }

  layout() {
    const navBox = this.nav.getBoundingClientRect();
    const paged = this.pager.enabled;
    const index = paged ? this.pager.activate(this.currentId) : -1;
    this.nav.classList.toggle('is-paged', paged);
    const row = paged ? this.pager.rowAt(index) : this.list;
    const shift = Dom.translation(row).x;
    const rowBox = row.getBoundingClientRect();
    this.glass.place({
      left: rowBox.left - shift - navBox.left,
      top: rowBox.top - navBox.top,
      width: rowBox.width,
      height: rowBox.height,
    }, { instant: !this.placed });
    const link = this.currentLink(row, paged);
    if (link) {
      this.placeLens(link, navBox, shift, paged, index);
    } else {
      this.lens.hide();
    }
    this.glass.reveal();
  }

  currentLink(row, paged) {
    const link = row.querySelector('a.is-current');
    return link && (paged || link.offsetParent) ? link : null;
  }

  placeLens(link, navBox, shift, paged, index) {
    const linkBox = link.getBoundingClientRect();
    const padding = this.lensPadding * Dom.rem();
    const turned = this.placed && paged && index !== this.pageIndex;
    const mode = !this.placed ? 'appear' : turned ? 'jump' : 'glide';
    this.lens.place({
      x: linkBox.left - shift - navBox.left - padding,
      y: linkBox.top - navBox.top,
      width: linkBox.width + 2 * padding,
      height: linkBox.height,
    }, mode);
    this.placed = true;
    this.pageIndex = paged ? index : -1;
  }
}
