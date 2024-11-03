import json
import os
import yaml

months = [ 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december' ]

for month in months:
    with open('./src/data/photography/' + month + '.json', 'r', encoding='utf-8') as src, open("./src/content/photography/" + month + ".md", 'w+', encoding='utf-8') as dest:
        dest.write("---\n")
        srcJson = json.load(src)
        srcJson["title"] = srcJson["name"]
        srcJson.pop("name")
        yaml.dump(srcJson, dest, default_flow_style=False)
        dest.write("---\n")

