import { find_path } from './dijkstrajs-2/dijkstra.js';
import london from '../tubemaps/datasets/london.json';

var map = [];


function PathInfo(average, end, path) {
    this.average = average;
    this.end = end;
    this.path = path;
}

function getStationId(station) {
    return london.stations.find((s) => {
        return s.name == station;
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

    console.log(map)

    return map;
}

function findAveragePathLength(starts, end) {
    var totalPath = 0;

    var endPathInfo = new PathInfo();
    endPathInfo.end = end;

    console.log("hello")

    starts.forEach(start => {
        let startId = getStationId(start);
        let endId = getStationId(end);

        let thisPath = find_path(map, startId, endId);

        totalPath += thisPath.cost;
    });

    let average = totalPath / starts.length;

    endPathInfo.average = average;
    
    return endPathInfo;
}

function findMeetingPoint(starts, ends) {
    var minPathInfo = {average: -1};

    ends.forEach(end => {
        let endPathInfo = findAveragePathLength(starts, end);
        if (minPathInfo.average === -1 || minPathInfo.average > endPathInfo.average)
        {
            minPathInfo = endPathInfo;
        }
    });

    return minPathInfo;
}

export {buildMap, findMeetingPoint, getStationFromId};
