# Junhao Cai's Personal Homepage

Live site: <https://chae-junho.github.io>

A single page academic homepage built with [Jekyll](https://jekyllrb.com/) and published with GitHub Pages.

## Credits

The layout and styling come from [AcadHomepage](https://github.com/RayeRen/acad-homepage.github.io) by Yi Ren
(MIT License), whose styles are derived from the [Minimal Mistakes](https://github.com/mmistakes/minimal-mistakes)
theme by Michael Rose. See [LICENSE](LICENSE).

The page is set in Times New Roman. Devices that do not have it get [Tinos](https://github.com/googlefonts/tinos), a
font with the same letter widths, from `assets/fonts/` (SIL Open Font License 1.1, see
`assets/fonts/LICENSE-tinos.txt`). The school emblems in `images/logos/` are the official marks of the schools.

## How the page is put together

The content lives in `_data/*.yml`. The lists on the page and the numbers in the opening paragraphs (papers, CCF A
papers, oral talks, patents, projects, scholarships) are generated from those files, so they change by themselves
when you add or remove an entry.

| To change | Edit |
| --- | --- |
| Name, bio, contact and social links, site description | `_config.yml` |
| The opening paragraphs, in English, Korean and Chinese | `_includes/intro-en.html`, `_includes/intro-ko.html`, `_includes/intro-zh.html` |
| Papers | `_data/publications.yml` |
| Patents and software copyrights | `_data/patents.yml` |
| Funded research projects | `_data/projects.yml` |
| Scholarships and awards | `_data/honors.yml` |
| Degrees | `_data/education.yml` |
| School and college logos next to the degrees | `_data/schools.yml` and `images/logos/` |
| Academic service | `_data/activities.yml` |
| Languages and skills | `_data/languages.yml`, `_data/skills.yml` |
| Top navigation | `_data/navigation.yml` |
| Photo and icons | `images/` |

Typography, colors and spacing are defined in `_sass/_custom.scss` (its first lines say which conventions of academic
CVs it follows); the templates that turn the data into HTML are in `_includes/`. The page itself,
`_pages/about.md`, only lists the sections in order.

### Notes on a few parts of the page

- **Opening paragraphs.** They are short on purpose (about 100 words, readable in half a minute): who I am and the
  pitch, the language advantage, one line of proof in numbers, and how to reach me. Everything else (GPA, orals,
  projects, service, hobbies, what is under review) is in the sections below and is not repeated. The three
  languages are written separately, each the way that language is written, and not translated from one another;
  numbers, names and lists come from the data files. So when the content changes, check the sentences in all three
  files. The Korean and Chinese wording of a role or of an achievement is kept next to the English one
  (`role_ko`, `role_zh` in `projects.yml`; `hero_ko`, `hero_zh` in `skills.yml`).
- **Colors.** One color, the crimson of Korea University (`$accent` at the top of `_sass/_custom.scss`, with a cream
  from the crest for soft backgrounds), is used for links, the language shown, the badges and the thin rules; the rest
  is gray. Only the conference badges in Publications are solid crimson (a journal badge is outlined, a paper under
  review is cream, an oral presentation is in the text of the badge: "AAAI 2026 Oral"); the labels of all other
  sections are cream boxes with crimson text. The CCF tags use the same crimson (A filled with cream, B outlined).
  A different accent would need only `$accent` (a light one also `$link` and `$badge-ink`).
- **Lists.** An entry that starts with a badge (publications, patents, projects, honors, activities) is a badge and a
  `pub__body`; the badges stand in a column of their own, so that all titles of a list start at the same place.
- **Language switch.** `_includes/hero.html` picks the language from the browser's language and remembers the
  visitor's choice.
- **Visitor globe.** `_includes/visitors.html` puts it under the profile card on wide screens and at the end of the
  page on phones and tablets.
- **Email.** It is plain text on purpose, so that it can be copied and no mail window opens. It is set in
  `_config.yml`.
- **Logos.** They are the official marks of the schools, used to show where the degrees come from.

### Adding a paper

Add an entry at the top of `_data/publications.yml`:

```yaml
- status: accepted
  type: conference          # or journal
  venue: ICML
  year: 2027
  venue_url: https://icml.cc/
  title: "Paper title"
  title_url: https://arxiv.org/abs/0000.00000   # leave out until a PDF exists
  authors: ["J Cai", "A Author", "B Author*"]
  oral: true                # shows the red (Oral) marker
  ccf: "A"                  # A, B, C or none; leave out if unknown
```

## Local preview

With Ruby and Bundler installed:

```bash
bundle install
bundle exec jekyll build                         # writes the site to _site/
python3 -m http.server 4000 --directory _site    # then open http://127.0.0.1:4000
```

Re-run `bundle exec jekyll build` after editing. On Ruby 3.x the pinned Jekyll 3.9.0 crashes in `--watch`
mode, which is why the build and a plain static server are used instead of `jekyll serve`.
