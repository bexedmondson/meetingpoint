import json
from itertools import combinations  

with open('../tubemaps/datasets/london.json', 'r') as f:
    london = json.load(f)

stationslist = london["stations"]
stations = {}
for s in stationslist:
    stations[s["id"]] = s

connections = london["connections"]

for i in stations:
    s = stations[i]
    s["lines"] = []

for c in connections:
    line = c["line"]
    if line not in stations[c["source"]]["lines"]:
        stations[c["source"]]["lines"].append(line)
    if line not in stations[c["target"]]["lines"]:
        stations[c["target"]]["lines"].append(line)

    c["source_suffix"] = c["source"] + "_" + c["line"]
    c["target_suffix"] = c["target"] + "_" + c["line"]
    
for i in stations:
    s = stations[i]
    change_line_pairs = list(combinations(s["lines"], 2))
    for p in change_line_pairs:
        p0 = s["id"] + "_" + p[0]
        p1 = s["id"] + "_" + p[1]
        new_connection = {
            "source": s["id"],
            "target": s["id"],
            "line": "30",
            "one_way": "0",
            "notes": "",
            "time": "2",
            "source_suffix": p0,
            "target_suffix": p1,
        }
        connections.append(new_connection)

    for l in s["lines"]:
        p0 = s["id"]
        p1 = s["id"] + "_" + l
        new_connection = {
            "source": s["id"],
            "target": s["id"],
            "line": "31",
            "one_way": "0",
            "notes": "",
            "time": "2",
            "source_suffix": p0,
            "target_suffix": p1,
        }
        connections.append(new_connection)



with open('../tubemaps/datasets/stations.json', 'w') as f:
    json.dump(stations, f, indent=2)
with open('../tubemaps/datasets/connections.json', 'w') as f:
    json.dump(connections, f, indent=2)