const HEADING = '.page__content > h1';
const LARGE_SCREEN = '(min-width: 57.8125em)';

class Site {
  constructor(root) {
    this.root = root;
  }

  start() {
    this.attempt(() => new ScrollFlag(this.root).start());
    this.attempt(() => new InputModality(this.root).start());
    this.attempt(() => new PhdYear(document).start());
    this.attempt(() => Fold.startAll(document));
    const reveal = this.attempt(() => Reveal.create(this.root, {
      openingSelector: '.hero .hero__text > p',
      sidebarSelector: '.sidebar',
      headingSelector: HEADING,
    }));
    const tint = new GlobeTint({ landColor: Dom.token('globe-land') });
    this.attempt(() => this.startLanguageSwitch(reveal));
    this.attempt(() => this.startAccentPicker(tint));
    this.attempt(() => this.startVisitors(tint));
    this.attempt(() => this.startNavigation(reveal));
    if (reveal) {
      this.attempt(() => reveal.start());
    }
  }

  attempt(step) {
    try {
      return step();
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  startLanguageSwitch(reveal) {
    const hero = document.querySelector('.hero');
    if (hero) {
      new LanguageSwitch(hero, { onChange: () => reveal && reveal.replayOpeningText() }).start();
    }
  }

  startAccentPicker(tint) {
    const group = document.querySelector('.accent-picker');
    if (group) {
      new AccentPicker(group, { onChange: () => tint.follow('globe-land', 900) }).start();
    }
  }

  startVisitors(tint) {
    const column = document.querySelector('.sidebar');
    const sticky = column ? new StickyColumn(column, { wideQuery: LARGE_SCREEN, watched: '.profile_box' }) : null;
    const box = document.querySelector('.visitors');
    const globe = box && VisitorGlobe.create({
      wideQuery: LARGE_SCREEN,
      widgetUrl: box.getAttribute('data-widget'),
      tint,
      onLayout: () => sticky && sticky.update(),
    });
    if (sticky) {
      sticky.start();
    }
    if (globe) {
      globe.start();
    }
  }

  startNavigation(reveal) {
    const nav = document.getElementById('site-nav');
    const links = nav && new SectionLinks(nav);
    if (!links || !links.ids.length) {
      return;
    }
    const masthead = document.querySelector('.masthead');
    const content = document.querySelector('.page__content');
    const bar = new NavBar(nav, links);
    const spy = new ScrollSpy(links.ids, { masthead, nav, onChange: (id) => bar.setCurrent(id) });
    const select = (id) => {
      if (links.has(id)) {
        spy.select(id);
      }
    };
    const jump = reveal && this.createJump(reveal, bar, masthead, content);
    new InPageLinks({
      onNavigate: ({ id, target, anchor, origin }) => {
        if (jump) {
          jump.arrive(target, origin);
        }
        select(id);
        bar.menu.closeAfterChoosing(anchor);
      },
    }).start();
    new SectionClicks({ content, firstId: links.ids[0], onSelect: select }).start();
    bar.start();
    spy.start();
    new GlassRefraction(bar.glass.element).start();
  }

  createJump(reveal, bar, masthead, content) {
    const band = new SectionBand({ content, masthead, headingSelector: HEADING, leadSelector: '.hero .lang-switch' });
    band.start();
    return new SectionJump({ reveal, band, lens: bar.lens });
  }
}

new Site(document.documentElement).start();
