# Brooks & Carolyn Otis — memorial site

A simple static site for GitHub Pages: three links (historical photos, memorial photos, video), a photo
viewer with slideshow, and a guestbook.

- Live site: https://bbest.github.io/memorial/
- Edit names, dates, links and guestbook settings in [`config.js`](config.js).

## Photos

The viewer reads `img/historical/photos.json`. To rebuild it from a folder of originals (macOS):

```sh
python3 bin/build_photos.py ~/Downloads/Photos_slideshow img/historical
```

Captions come from file names (e.g. `Fickle Hill 1973.jpg`); edit `photos.json` to change them.

## Guestbook setup (about 5 minutes)

Guests sign without an account. Entries land in a Google Sheet you own; delete a row to remove an entry.

1. Create a Google Form with two questions, in this order: **Name** (short answer) and **Message**
   (paragraph). In Settings, turn off "Collect email addresses" and any sign-in requirement.
2. Find the entry ids: ⋮ menu › **Get pre-filled link**, type `NAME` and `MESSAGE`, click **Get link**, copy
   it. It looks like `…/viewform?usp=pp_url&entry.123456=NAME&entry.789012=MESSAGE`.
3. In `config.js` set:
   - `form_action`: that link's base with `viewform` replaced by `formResponse`,
     e.g. `https://docs.google.com/forms/d/e/1FAIpQL…/formResponse`
   - `entry_name`: `entry.123456`, `entry_message`: `entry.789012`
4. Responses tab › **Link to Sheets** to create the responses sheet. In the sheet: File › Share ›
   **Publish to web** › choose the responses tab and **Comma-separated values (.csv)** › Publish. Paste
   the URL into `sheet_csv`.
5. Commit and push. New entries show up within a few minutes (Google caches the published CSV).

## Local preview

```sh
python3 -m http.server 8000   # then open http://localhost:8000
```
