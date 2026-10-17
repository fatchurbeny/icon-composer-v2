"""Build output v1.4.1 using the unchanged shared icon engines."""
import json
from pathlib import Path

source = Path(__file__).resolve().parent
output = source.parents[1] / "tools" / "template-icon-builder-aksen-v1.4.1.html"
html = (source / "template-v1.4.1.html").read_text(encoding="utf-8")
for token, filename in [("/*@ENGINE@*/", "engine.js"), ("/*@ENGINE2@*/", "engine2.js")]:
    html = html.replace(token, (source / filename).read_text(encoding="utf-8"))
html = html.replace('/*@SKILL@*/""', json.dumps((source / "SKILL.template.md").read_text(encoding="utf-8"), ensure_ascii=False))
html = html.replace("/*@SAMPLE@*/null", json.dumps(json.loads((source / "sample.json").read_text(encoding="utf-8")), ensure_ascii=False))
output.write_text(html, encoding="utf-8")
print(output)
