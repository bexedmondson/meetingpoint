import { find_path, single_source_shortest_paths } from './dijkstrajs-2/dijkstra.js';
import connections from '../tubemaps/datasets/connections.json';
import stations from '../tubemaps/datasets/stations.json' with { type: "json" };

let map = {};


function PathInfo(average, end, paths) {
    this.average = average;
    this.end = end;
    this.paths = paths;
    this.isValid = true;
}

function getStationId(station) {
    return Object.values(stations).find((s) => {
        return s.name === station;
    }).id;
}

function getStationFromId(id) {
    let nosuffix = id;
    if (nosuffix.includes("_")) {
        nosuffix = nosuffix.substring(0, nosuffix.indexOf("_"));
    }

    return stations[nosuffix].name;
}

async function buildMap() {
    connections.forEach((c) => {
        let connections1 = {};

        if (c.source_suffix in map) {
            connections1 = map[c.source_suffix];
        }

        connections1[c.target_suffix] = Number(c.time);
        map[c.source_suffix] = connections1;

        if (c.one_way === "0") {
            let connections2 = {};
            if (c.target_suffix in map) {
                connections2 = map[c.target_suffix];
            }
            connections2[c.source_suffix] = Number(c.time);
            map[c.target_suffix] = connections2;
        }
    });
    console.log(map)

    return map;
}

function findAveragePathLength(startGraphs, end) {
    let totalPath = 0;

    let endPathInfo = new PathInfo();
    endPathInfo.end = end;

    endPathInfo.paths = [];

    let canFindRouteFromAll = true;

    startGraphs.every(start => {
        console.log(start)

        let endId = getStationId(end);

        console.log(stations[start.startId])
        console.log(stations[endId])

        let startLineIds = stations[start.startId]["lines"]
        let endLineIds = stations[endId]["lines"]
        let possiblePaths = []

        startLineIds.every(startLineId => {
            endLineIds.every(endLineId => {
                console.log("finding path from " + start.startId + "_" + startLineId + " to " + endId + "_" + endLineId);
                let thisPath = find_path(map, start.startId + "_" + startLineId, endId + "_" + endLineId, start.startGraph);
                possiblePaths.push(thisPath);
            })
        })

        let bestPathForStart = null;
        possiblePaths.every(possiblePath => {
            if (bestPathForStart == null || bestPathForStart.cost > possiblePath) {
                bestPathForStart = possiblePath;
            }
        });

        endPathInfo.paths.push(bestPathForStart);

        if (bestPathForStart.cost === undefined) {
            canFindRouteFromAll = false;
            return false;
        }

        totalPath += bestPathForStart.cost;

        return true;
    });

    if (!canFindRouteFromAll)
    {
        endPathInfo.isValid = false;
    }

    endPathInfo.average = totalPath / startGraphs.length;
    
    return endPathInfo;
}

function findMeetingPoint(starts, ends) {
    let minPathInfo = {average: -1};

    let startGraphs = []

    starts.forEach(start => {
        let startId = getStationId(start);
        startGraphs.push({
            start: start,
            startId: startId,
            startGraph: single_source_shortest_paths(map, startId)
        });
    })

    ends.forEach(end => {
        let endPathInfo = findAveragePathLength(startGraphs, end);

        if (!endPathInfo.isValid)
            return;

        if (minPathInfo.average === -1 || minPathInfo.average > endPathInfo.average)
        {
            minPathInfo = endPathInfo;
        }
    });

    return minPathInfo;
}

export {buildMap, findMeetingPoint, getStationFromId};
