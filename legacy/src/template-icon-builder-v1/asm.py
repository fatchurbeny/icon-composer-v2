import json,re
p='/home/claude/tib/build/'
t=open(p+'template.html').read()
t=t.replace('/*@ENGINE@*/',open(p+'engine.js').read()).replace('/*@ENGINE2@*/',open(p+'engine2.js').read()).replace('/*@SKILL@*/""',json.dumps(open(p+'SKILL.template.md').read(),ensure_ascii=False)).replace('/*@SAMPLE@*/null',json.dumps(json.load(open(p+'sample.json')),ensure_ascii=False))
open('/home/claude/template-icon-builder.html','w').write(t)
open('/tmp/claude-0/tib.js','w').write(re.findall(r'<script>(.*?)</script>',t,re.S)[-1])
