# resize a folder of photos into img/historical/{full,thumb} and write photos.json
# usage: python3 bin/build_photos.py <photo_folder> img/historical   (macOS: uses sips)
import json, re, subprocess, sys
from pathlib import Path
src, out = Path(sys.argv[1]), Path(sys.argv[2])
(out/"full").mkdir(parents=True, exist_ok=True); (out/"thumb").mkdir(parents=True, exist_ok=True)
def caption(stem):
  s = re.sub(r'^Copy of ', '', stem)
  s = re.sub(r'-preview$', '', s)
  if re.match(r'^(IMG_\d+|[0-9A-F]{8}-[0-9A-F-]+)$', s, re.I): return ""
  s = re.sub(r'\s+\d{3}(\s+\w+)*$', '', s)  # drop scan counters like "002", "005 100", "004 Res"
  return s.replace('_', ' / ')
files = sorted(src.glob('*'), key=lambda p: (caption(p.stem) == "", p.name.lower()))
photos = []
for i, p in enumerate(files, 1):
  name = f"{i:02d}.jpg"
  for sub, size, q in (("full", 1600, "75"), ("thumb", 480, "70")):
    subprocess.run(["sips", "-s", "format", "jpeg", "-s", "formatOptions", q, "-Z", str(size), str(p), "--out", str(out/sub/name)], check=True, capture_output=True)
  photos.append({"src": f"img/historical/full/{name}", "thumb": f"img/historical/thumb/{name}", "caption": caption(p.stem)})
(out/"photos.json").write_text(json.dumps(photos, indent=1))
print(len(photos), "photos")
