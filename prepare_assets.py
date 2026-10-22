"""Prepare the ten supplied photos. No network or generated imagery."""
from pathlib import Path
from collections import deque
from PIL import Image
import json

SOURCE = Path(r'C:\Users\despa\.codex\codex-remote-attachments\01a1639d-fdf8-7673-bbb7-b32614afa5e5\A37B3ACE-CEAB-4261-AE52-EEC795E21087')
DEST = Path(__file__).resolve().parents[1] / 'assets'
DEST.mkdir(exist_ok=True)
names = {1:'textbook-vocabulary', 2:'textbook-expressions', 3:'ladybug', 4:'duo', 5:'marinette', 6:'ladybug-victory', 7:'cat-noir', 8:'cat-attack', 9:'reaction', 10:'hawk-moth'}
manifest = []
for number, name in names.items():
    source = next(SOURCE.glob(f'{number}-*.jpg'))
    im = Image.open(source).convert('RGB')
    original = im.size
    if number == 3:
        # Remove only near-white pixels connected to the exterior. Preserve eyes,
        # highlights and all enclosed light details of the supplied character.
        im = im.convert('RGBA')
        w, h = im.size
        px = im.load()
        seen = set()
        todo = deque([(x, 0) for x in range(w)] + [(x,h-1) for x in range(w)] + [(0,y) for y in range(h)] + [(w-1,y) for y in range(h)])
        while todo:
            x,y = todo.popleft()
            if (x,y) in seen or not (0 <= x < w and 0 <= y < h):
                continue
            seen.add((x,y))
            r,g,b,a = px[x,y]
            if min(r,g,b) < 222 or max(r,g,b)-min(r,g,b) > 28:
                continue
            px[x,y] = (r,g,b,0)
            todo.extend(((x-1,y),(x+1,y),(x,y-1),(x,y+1)))
        box = im.getbbox()
        im = im.crop(box)
        file = DEST / f'{name}.png'
        im.save(file, optimize=True)
    else:
        im.thumbnail((1280, 1000))
        file = DEST / f'{name}.jpg'
        im.save(file, quality=89, optimize=True, progressive=True)
    manifest.append({'source':source.name, 'asset':file.name, 'original':original, 'size':im.size, 'bytes':file.stat().st_size})
(DEST/'sources.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(manifest, ensure_ascii=False))
