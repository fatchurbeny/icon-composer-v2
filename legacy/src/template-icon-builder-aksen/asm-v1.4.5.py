"""Build output v1.4.5 with overlap-safe direct-fill Canva export."""
import json
from pathlib import Path

source = Path(__file__).resolve().parent
output = source.parents[1] / "tools" / "template-icon-builder-aksen-v1.4.5.html"
html = (source / "template-v1.4.5.html").read_text(encoding="utf-8")
html = html.replace("/*@OUTLINE@*/", (source / "icon-outline.min.js").read_text(encoding="utf-8"))
for token, filename in [("/*@ENGINE@*/", "engine.js"), ("/*@ENGINE2@*/", "engine2-v1.4.5.js")]:
    html = html.replace(token, (source / filename).read_text(encoding="utf-8"))
html = html.replace('/*@SKILL@*/""', json.dumps((source / "SKILL.template.md").read_text(encoding="utf-8"), ensure_ascii=False))
html = html.replace("/*@SAMPLE@*/null", json.dumps(json.loads((source / "sample.json").read_text(encoding="utf-8")), ensure_ascii=False))
output.write_text(html, encoding="utf-8")
print(output)
