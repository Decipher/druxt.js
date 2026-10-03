---
'druxt-router': patch
---

fix(#3): visiting a language-prefixed front page with a trailing slash, such as `/es/`, no longer redirects to `/es`.

Sites behind a web server that adds a trailing slash to directory-style paths, such as nginx, no longer loop between `/es` and `/es/` with a "too many redirects" error.
