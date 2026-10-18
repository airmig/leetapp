# LeetApp — leetapp.org

One-page website for **LeetApp**, an AI apps & games development studio.

- Static HTML/CSS/JS, no build step
- 9 languages: English (default), Español, Français, Italiano, Português, Deutsch, 한국어, 中文, 日本語
  (switchable from the header, remembered per visitor, shareable via `?lang=xx`)
- Animated canvas background, live pixel-game demo in the hero, reduced-motion support
- Hosted on GitHub Pages with the custom domain in `CNAME`

## Structure

```
index.html              page markup (all text has data-i18n keys)
assets/css/style.css    styles
assets/js/i18n.js       translations — edit copy here, one block per language
assets/js/main.js       language switcher, animations, contact form (mailto)
assets/img/             logo.svg, og.png (social share image), icon-180.png
assets/work/            project showcase assets (sprites, parallax layers, screenshots)
CNAME                   www.leetapp.org
```

Run locally: `python3 -m http.server` and open http://localhost:8000.

## Deploy on GitHub Pages

1. Repo **Settings → Pages**
2. **Source:** Deploy from a branch → Branch `main`, folder `/ (root)` → Save
3. **Custom domain:** `www.leetapp.org` → Save (already set by the `CNAME` file)
4. When the DNS check passes, tick **Enforce HTTPS** (the certificate can take up to ~1 hour)

## DNS on Namecheap

Namecheap → **Domain List** → `leetapp.org` → **Manage** → **Advanced DNS**.

First delete the default records Namecheap adds (the `URL Redirect Record` for `@` and the
`CNAME` record for `www` pointing to `parkingpage.namecheap.com`). Then add:

| Type          | Host  | Value                 | TTL       |
|---------------|-------|-----------------------|-----------|
| A Record      | `@`   | `185.199.108.153`     | Automatic |
| A Record      | `@`   | `185.199.109.153`     | Automatic |
| A Record      | `@`   | `185.199.110.153`     | Automatic |
| A Record      | `@`   | `185.199.111.153`     | Automatic |
| AAAA Record   | `@`   | `2606:50c0:8000::153` | Automatic |
| AAAA Record   | `@`   | `2606:50c0:8001::153` | Automatic |
| AAAA Record   | `@`   | `2606:50c0:8002::153` | Automatic |
| AAAA Record   | `@`   | `2606:50c0:8003::153` | Automatic |
| CNAME Record  | `www` | `airmig.github.io.`   | Automatic |

Make sure **Nameservers** on the Domain tab is set to *Namecheap BasicDNS*.

Optional but recommended: verify the domain under GitHub **Settings (your profile) → Pages →
Add a domain**, which gives you a `TXT` record (`_github-pages-challenge-airmig`) to add in
Namecheap. This prevents anyone else from claiming the domain on GitHub Pages.

Check propagation:

```
dig leetapp.org +short        # should list the four 185.199.x.153 addresses
dig www.leetapp.org +short    # should show airmig.github.io
```

## Contact email

The contact form opens the visitor's mail app addressed to `airmig@gmail.com`.
To change it, edit the address in `index.html` (the visible link) and `assets/js/main.js` (the form).
