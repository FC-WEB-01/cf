from pathlib import Path
import re
root = Path(__file__).resolve().parent
index = root / 'index.html'
css = root / 'assets' / 'styles.css'
visuals = (
    ('Illustration fintech : jeune actif', 'epargne-mobile.webp', 800, 600, 'Jeune actif consultant son épargne sur smartphone', 'hero-visual', 'fetchpriority="high"'),
    ('Icône assurance-vie :', 'assurance-vie.webp', 256, 256, '', 'product-visual', 'loading="lazy"'),
    ('Icône PER :', 'per.webp', 256, 256, '', 'product-visual', 'loading="lazy"'),
)
for _, name, _, _, _, _, _ in visuals:
    if not (root / 'images' / name).is_file():
        raise SystemExit(f'Image manquante : images/{name}')
html = index.read_text(encoding='utf-8')
for prefix, name, w, h, alt, cls, attr in visuals:
    if f'src="images/{name}"' in html:
        continue
    pattern = r'<div class="placeholder"><span class="placeholder-description">' + re.escape(prefix) + r'[^<]*</span><span class="placeholder-format">[^<]*</span></div>'
    replacement = f'<img class="site-visual {cls}" src="images/{name}" alt="{alt}" width="{w}" height="{h}" {attr} decoding="async">'
    html, count = re.subn(pattern, replacement, html)
    if count != 1:
        raise SystemExit(f'Encart introuvable ou ambigu : {prefix}')
style = css.read_text(encoding='utf-8')
if '.site-visual{' not in style:
    style += '\n.site-visual{display:block;width:100%;height:auto;object-fit:contain}.hero-visual{aspect-ratio:4/3;border-radius:14px}.product-visual{aspect-ratio:1/1;max-width:176px;margin-bottom:18px}\n'
index.write_text(html, encoding='utf-8')
css.write_text(style, encoding='utf-8')
print('Trois visuels intégrés ; les autres encarts sont inchangés.')
