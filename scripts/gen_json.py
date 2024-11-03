import json
import os

months = [ 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december' ]
monthPics = {}

for month in months:
    monthPics[month] = os.listdir('./src/assets/photography/' + month)

for i, month in enumerate(months):
    with open('./src/data/photography/' + month + '.json', 'w+', encoding='utf-8') as f:
        base = "/src/assets/photography/" + month + "/"
        photos = list(map(lambda src: { "src": base + src, "alt": "" }, monthPics[month]))
        json.dump({
            "index": i + 1,
            "thumb": {
                "src": base + monthPics[month][0],
                "alt": "",
            },
            "name": month,
            "photos": photos,
        }, f, ensure_ascii=False, indent=2)

