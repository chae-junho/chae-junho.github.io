class SectionClicks {
  constructor({ content, firstId, onSelect }) {
    this.content = content;
    this.firstId = firstId;
    this.onSelect = onSelect;
  }

  start() {
    document.addEventListener('click', (event) => this.handle(event));
  }

  handle(event) {
    if (event.button !== 0 || !event.target.closest || !event.target.closest('.page__content')) {
      return;
    }
    const block = this.blockOf(event.target);
    if (block) {
      this.onSelect(this.headingIdBefore(block));
    }
  }

  blockOf(element) {
    let block = element;
    while (block && block.parentElement !== this.content) {
      block = block.parentElement;
    }
    return block;
  }

  headingIdBefore(block) {
    let heading = block;
    while (heading && !(heading.matches && heading.matches('h1[id]'))) {
      heading = heading.previousElementSibling;
    }
    return heading ? heading.id : this.firstId;
  }
}
