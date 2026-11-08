from pathlib import Path
H=Path(__file__).parent
parts=['engine_core.js']+['games_%d.js'%i for i in range(1,12) if (H/('games_%d.js'%i)).exists()]+['engine_end.js']
js='\n'.join((H/p).read_text() for p in parts)
(H/'arcade_engine.js').write_text(js)
print(len(js))
