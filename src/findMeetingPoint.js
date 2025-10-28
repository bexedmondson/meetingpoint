import { find_path, single_source_shortest_paths } from './dijkstrajs-2/dijkstra.js';
import london from '../tubemaps/datasets/london.json';

let map = [];


function PathInfo(average, end, paths) {
    this.average = average;
    this.end = end;
    this.paths = paths;
    this.isValid = true;
}

function getStationId(station) {
    return london.stations.find((s) => {
        return s.name === station;
    }).id;
}

function getStationFromId(id) {
    return london.stations.find((s) => {
        return s.id === id;
    }).name;
}

async function buildMap() {
    london.connections.forEach((c) => {
        let connections1 = {};

        if (c.source in map) {
            connections1 = map[c.source];
        }

        connections1[c.target] = Number(c.time);
        map[c.source] = connections1;

        if (c.one_way === "0") {
            let connections2 = {};
            if (c.target in map) {
                connections2 = map[c.target];
            }
            connections2[c.source] = Number(c.time);
            map[c.target] = connections2;
        }
    });

    return map;
}

function findAveragePathLength(startGraphs, end) {
    let totalPath = 0;

    let endPathInfo = new PathInfo();
    endPathInfo.end = end;

    endPathInfo.paths = [];

    let canFindRouteFromAll = true;

    startGraphs.every(start => {
        let endId = getStationId(end);

        let thisPath = find_path(map, start.startId, endId, start.startGraph);

        endPathInfo.paths.push(thisPath);

        if (thisPath.cost === undefined) {
            canFindRouteFromAll = false;
            return false;
        }

        totalPath += thisPath.cost;
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
