class SectionJump {
  constructor({ reveal, band, lens }) {
    this.reveal = reveal;
    this.band = band;
    this.lens = lens;
    this.version = 0;
  }

  cancel() {
    this.version += 1;
    this.band.end();
  }

  arrive(target, origin) {
    const elements = this.reveal.inSection(target);
    if (!elements.length) {
      return;
    }
    const version = this.version;
    const fresh = elements.filter((element) => !this.reveal.isShown(element));
    this.reveal.unobserve(fresh);
    this.lens.charge();
    this.reveal.pause();
    let finished = false;
    let timer = 0;
    const finish = () => {
      if (finished) {
        return;
      }
      finished = true;
      clearTimeout(timer);
      window.removeEventListener('scrollend', finish);
      this.reveal.resume();
      this.reveal.show(fresh);
      this.reveal.showVisible();
      this.lens.release();
      if (version === this.version) {
        this.band.show(target, elements, origin);
      }
    };
    const distance = this.distanceTo(target);
    if (distance < 3) {
      window.requestAnimationFrame(finish);
      return;
    }
    if ('onscrollend' in window) {
      window.addEventListener('scrollend', finish);
    }
    timer = setTimeout(finish, Math.min(1400, 400 + distance * 0.35));
  }

  distanceTo(target) {
    const wanted = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    return Math.abs(target.getBoundingClientRect().top - wanted);
  }
}
