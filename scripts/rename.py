import os

months = [ "jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec" ]
monthsLong = [ "january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december" ]
base = "./src/data/photography/"

for i, month in enumerate(months):
    os.rename(base + month + ".json", base + monthsLong[i] + ".json")
