import json
from bs4 import BeautifulSoup

with open('./blogspot.json') as f:
    data = json.load(f)

print(len(data))
for entry in data:
    content = entry['content']
    content = content.replace('&lt;br /&gt;', '\n\n').replace('&lt;', '<').replace('&gt;', '>')#.replace('&amp;', '&')
    soup = BeautifulSoup(content, 'html.parser')
    text = soup.get_text(separator=' ').strip()

    title = text.split()[:6]
    title = ' '.join(title)
    title = title.split('.')[0]
    title = title.replace(',', '')
    if title[-2] == ' ':
        title = title[:-2]
    title = title.strip()

    with open(f"./src/content/diary/{title.replace(' ', '-')}.md", 'w+') as f:
        f.write(f"""---
title: "{title}"
date: {entry['published']}
---
{text}
""")
