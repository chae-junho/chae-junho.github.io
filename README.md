# Junhao Cai's homepage

https://chae-junho.github.io

A one page academic homepage made with Jekyll and GitHub Pages. The layout started from
[AcadHomepage](https://github.com/RayeRen/acad-homepage.github.io) by Yi Ren (MIT, see LICENSE). Tinos
(SIL Open Font License) in `assets/fonts/` is the fallback for Times New Roman.

## Change the content

The page is built from the files in `_data/`. Edit one and the list changes, and so do the numbers in the opening
text (papers, patents, projects).

| To change | Edit |
| --- | --- |
| Papers | `_data/publications.yml` |
| Patents and software | `_data/patents.yml` |
| Research projects | `_data/projects.yml` |
| Honors and awards | `_data/honors.yml` |
| Education | `_data/education.yml` |
| Experience (RA, TA, positions) | `_data/experience.yml` |
| School emblems | `_data/schools.yml` (an optional `url` makes an emblem a link) and `images/logos/` |
| Academic activities | `_data/activities.yml` |
| Languages | `_data/languages.yml` |
| Skills | `_data/skills.yml` |
| Top menu | `_data/navigation.yml` |
| Name, bio, email, profile links | `_config.yml`, `_data/links.yml` |
| Opening text | `_includes/intro-en.html`, `intro-ko.html`, `intro-zh.html` |
| Photo | `images/profile-avatar.jpg` |
| Colors to choose from | `_data/themes.yml` (the first one is the default) |

To add a paper, put an entry at the top of `_data/publications.yml`:

```yaml
- status: accepted
  type: conference
  venue: ICML
  year: 2027
  venue_url: https://icml.cc/
  title: "Paper title"
  title_url: https://doi.org/...
  authors: ["J Cai", "A Author", "B Author*"]
  oral: true
  ccf: "A"
```

## Fields of the data files

publications.yml: `status` is accepted or review; `type` is conference or journal; `venue` and `year` make the badge
(`oral: true` adds "Oral"); `venue_url`; `title`; `title_url` adds a DOI or PDF link; `authors` (a trailing `*` is kept,
the name set as `me` in `_config.yml` is bold); `ccf` is A, B, C or none; `bk` is free text; `impact_factor` and `scie`
make one tag ("SCIE, IF 8.2"); `topic`. A row with `status: review` and a `count` stands for papers under review.

patents.yml: `kind` is patent or software; `year`; `title`; `url`; `authors`; `topic`. A row with `status: review` and a
`count` stands for filings under review.

projects.yml: `agency`; `badge_extra`; `title` and `title_ko`; `from` and `to`; `since`; `role` with `role_ko` and `role_zh`; `program`; `topics`.

honors.yml: `degree` groups the rows (Ph.D., M.S., B.E.); `name`; `times`; `rank`; `bold`. A `hero` number puts the honor
in the opening text, worded by `hero_en`, `hero_ko` and `hero_zh`.

education.yml: `period`, `degree`, `school`, `tag`, `gpa`, `highlights`. The Ph.D. entry whose period ends with Present
gives the year of study named in the opening text. `schools.yml` gives the emblems of a school by the same `name`.

experience.yml: `degree` and `school` link a row to the entry of education.yml, whose period it shows unless the row has
a `period` of its own; `roles` is a list written on one line.

activities.yml: `venue` (the badge, with its year), `url`, `role`, and a `year` that is not shown. languages.yml: `name`,
`short` (Native or Professional, used by the opening text), `level`, `detail`. skills.yml: `name`, `tags`, `suffix`,
`items`. navigation.yml: `title` and `url`, the id of a section.

## Code

Styles: `assets/css/main.scss` lists the files of `_sass/` in order, one per part of the page (top bar, profile card,
labels, lists, school emblems, opening text, visitor globe, entrance animation). Colors are in `_palette.scss`,
curves and sizes in `_tokens.scss`.

Scripts: `assets/js/main.js` joins the files of `_includes/js/` into one script. Each file is one class with its own
options: `NavBar` (the glass top bar, made of `NavGlass`, `NavLens`, `NavPager` and `OverflowMenu`), `ScrollSpy`,
`InPageLinks`, `Reveal` with `SectionBand` and `SectionJump`, `Fold`, `GlassRefraction`, `LanguageSwitch`,
`AccentPicker`, `VisitorGlobe`, and `Site`, which creates and connects them. A class that is not needed can be left out of
`main.js` and of `Site`.

## Icons

The page loads no icon font. Each icon is an SVG outline kept in `_data/icons.yml` as a name, a width and a path,
drawn in a box that is 512 high. `_includes/icons.html` writes all of them once at the top of every page as a hidden
sprite, and `{% include icon.html name="github" %}` draws one. An icon is as tall as the text around it and takes its
color (the `.glyph` rules are in `_sass/_icons.scss`).

The links in the profile card are listed in `_data/links.yml`, one line per service in the order they appear. A line
gives the key the service has under `author:` in `_config.yml`, its label, the name of its icon and a URL pattern, in
which `%s` stands for the value of the key (a user name or a full link). A line without a pattern is a plain text row,
like the location and the email address. A service is shown when its key has a value, so to show one that is already
listed, fill in its key:

```yaml
author:
  github: your-user-name
  dblp: "https://dblp.org/pid/..."
```

To add a service that is not listed, put one line in `_data/links.yml` with a new key, set that key under `author:`,
and, if its icon is not in `_data/icons.yml` yet, add an entry there. For a Font Awesome Free icon, `width` is the third
number of the `viewBox` in its SVG file and `path` is the `d` of its `path`.

The outlines come from Font Awesome Free 5.5.0 (icons under CC BY 4.0, https://fontawesome.com/license/free) and
Academicons 1.8.0 (SIL Open Font License 1.1).

## Preview

```bash
bundle install
bundle exec jekyll build
python3 -m http.server 4000 --directory _site
```

Open http://127.0.0.1:4000. Run the build again after each change.

## Publish

```bash
git add -A
git commit -m "Update"
git push origin master
```

GitHub Pages rebuilds the site in a minute or two.
