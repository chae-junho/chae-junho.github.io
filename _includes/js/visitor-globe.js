class VisitorGlobe {
  constructor(box, { sideSlot, endSlot, wideQuery, widgetUrl, widgetId = 'mmvst_globe', timeout = 10000, tint, onLayout = () => {} }) {
    this.box = box;
    this.holder = box.querySelector('.globe-global-container');
    this.probe = box.querySelector('.visitors__size');
    this.sideSlot = sideSlot;
    this.endSlot = endSlot;
    this.wide = window.matchMedia(wideQuery);
    this.widgetUrl = widgetUrl;
    this.widgetId = widgetId;
    this.timeout = timeout;
    this.tint = tint;
    this.onLayout = onLayout;
    this.drawnSizes = new WeakMap();
    this.awake = false;
    this.stage = document.createElement('div');
    this.stage.className = 'globe-stage';
    this.holder.appendChild(this.stage);
  }

  static create(options) {
    const box = document.querySelector('.visitors');
    const sideSlot = document.getElementById('visitors-slot-side');
    const endSlot = document.querySelector('.visitors-end');
    const complete = box && box.querySelector('.globe-global-container') && box.querySelector('.visitors__size') && sideSlot && endSlot && window.matchMedia;
    return complete ? new VisitorGlobe(box, Object.assign({ sideSlot, endSlot }, options)) : null;
  }

  start() {
    this.tint.install(this.box);
    this.place();
    if (this.wide.addEventListener) {
      this.wide.addEventListener('change', () => this.place());
    } else {
      this.wide.addListener(() => this.place());
    }
    this.loadWhenIdle();
    this.observe();
  }

  place() {
    const slot = this.wide.matches ? this.sideSlot : this.endSlot;
    if (this.box.parentNode !== slot) {
      slot.appendChild(this.box);
    }
    this.fit();
    this.onLayout();
    if (window.globe_jq) {
      window.globe_jq(window).trigger('scroll');
    }
  }

  observe() {
    if (window.MutationObserver) {
      new MutationObserver(() => this.fit()).observe(this.holder, { childList: true });
    }
    if (window.ResizeObserver) {
      const watch = new ResizeObserver(() => this.fit());
      watch.observe(this.holder);
      watch.observe(this.probe);
    } else {
      window.addEventListener('resize', () => this.fit());
    }
    window.addEventListener('load', () => this.fit());
  }

  loadWhenIdle() {
    const schedule = () => {
      if (window.requestIdleCallback) {
        window.requestIdleCallback(() => this.load(), { timeout: 4000 });
      } else {
        setTimeout(() => this.load(), 1500);
      }
    };
    if (document.readyState === 'complete') {
      schedule();
    } else {
      window.addEventListener('load', schedule, { once: true });
    }
  }

  load() {
    const widget = document.createElement('script');
    widget.type = 'text/javascript';
    widget.id = this.widgetId;
    widget.async = true;
    widget.src = this.widgetUrl;
    this.holder.insertBefore(widget, this.holder.firstChild);
    widget.onerror = () => this.hide();
    setTimeout(() => {
      if (!this.holder.querySelector('.mmvst_outer')) {
        this.hide();
      }
    }, this.timeout);
  }

  wake() {
    if (!this.awake && window.globe_jq) {
      this.awake = true;
      window.globe_jq(window).trigger('load');
    }
  }

  hide() {
    this.box.style.display = 'none';
    this.onLayout();
  }

  drawnSizeOf(outer) {
    if (!this.drawnSizes.has(outer)) {
      const width = parseFloat(outer.style.width);
      if (!width) {
        return null;
      }
      this.drawnSizes.set(outer, { width, height: parseFloat(outer.style.height) });
    }
    return this.drawnSizes.get(outer);
  }

  fit() {
    const outer = this.holder.querySelector('.mmvst_outer');
    if (!outer) {
      return;
    }
    if (this.box.style.display === 'none') {
      this.box.style.display = '';
    }
    const drawn = this.drawnSizeOf(outer);
    const shown = this.probe.getBoundingClientRect().width;
    if (!drawn || !shown) {
      return;
    }
    const scale = shown / drawn.width;
    const height = drawn.height * scale;
    outer.style.transform = 'translateX(-50%) scale(' + scale + ')';
    outer.style.setProperty('height', height + 'px', 'important');
    this.holder.style.height = height + 'px';
    this.stage.style.width = shown + 'px';
    this.stage.style.height = height + 'px';
    this.adoptLabel();
    this.wake();
  }

  adoptLabel() {
    const label = document.getElementById('tooltiper');
    if (label && label.parentNode !== this.stage) {
      this.stage.appendChild(label);
    }
  }
}
