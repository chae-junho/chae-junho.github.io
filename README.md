# Junhao Cai's homepage

https://chae-junho.github.io

A one page academic homepage made with Jekyll and GitHub Pages. The layout is based on
[AcadHomepage](https://github.com/RayeRen/acad-homepage.github.io) by Yi Ren (MIT, see LICENSE). Tinos
(SIL Open Font License) in `assets/fonts/` is the fallback for Times New Roman.

## Change the content

The page is built from the files in `_data/`. Edit one and the list changes, and so do the numbers in the opening
text (papers, patents, projects). Each file starts with a short comment that explains its fields.

| To change | Edit |
| --- | --- |
| Papers | `_data/publications.yml` |
| Patents and software | `_data/patents.yml` |
| Research projects | `_data/projects.yml` |
| Honors and awards | `_data/honors.yml` |
| Education | `_data/education.yml` (logos: `_data/schools.yml` and `images/logos/`) |
| Experience (RA, TA, positions) | `_data/experience.yml` |
| Academic activities | `_data/activities.yml` |
| Languages | `_data/languages.yml` |
| Skills | `_data/skills.yml` |
| Top menu | `_data/navigation.yml` |
| Name, bio, links, email | `_config.yml` |
| Opening text | `_includes/intro-en.html`, `intro-ko.html`, `intro-zh.html` |
| Photo | `images/profile-avatar.jpg` |
| Color | `$accent` and `$link` in `_sass/_variables.scss` |

To add a paper, put an entry at the top of `_data/publications.yml`:

```yaml
- status: accepted
  type: conference          # or journal
  venue: ICML
  year: 2027
  venue_url: https://icml.cc/
  title: "Paper title"
  title_url: https://doi.org/...    # optional
  authors: ["J Cai", "A Author", "B Author*"]
  oral: true                # optional
  ccf: "A"                  # optional: A, B, C or none
```

## Preview

```bash
bundle install                                   # once
bundle exec jekyll build
python3 -m http.server 4000 --directory _site    # then open http://127.0.0.1:4000
```

Run the build again after each change. `jekyll serve` crashes with the pinned Jekyll on Ruby 3, which is why the
build and a plain server are used.

## Publish

```bash
git add -A
git commit -m "Update"
git push origin master
```

GitHub Pages rebuilds the site in a minute or two.
