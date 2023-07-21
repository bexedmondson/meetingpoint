import { find_path } from 'dijkstrajs';
import london from '../data/london.json';

var map = [];

function getStationId(station) {
    return london.stations.find((s) => {
        return s.name == station;
    }).id;
}

function getStationFromId(id) {
    return london.stations.find((s) => {
        return s.id == id;
    }).station;
}

function buildMap()
{
    london.connections.forEach((c) => {
        
    });
}


function findAveragePathLength(starts, end) {
    var totalPath = 0;

    (console.log(london.connections), '')

    starts.forEach(start => {
        let startId = getStationId(start);
        let endId = getStationId(end);

        let thisPath = find_path(london.connections, startId, endId);
        
        (console.log(thisPath), '')
        totalPath += thisPath.length;
    });

    (console.log(totalPath), '')

    let average = totalPath / starts.length;

    (console.log(average), '')
    
    return average;
}

function findMeetingPoint(starts, ends) {
    var minEnd = ends[0];
    var minAverage = -1;

    map = buildMap();

    ends.forEach(end => {
        let averagePathLength = findAveragePathLength(starts, end);
        if (minAverage === -1 || minAverage > averagePathLength)
        {
            minAverage = averagePathLength;
            minEnd = end;
        }
    });

    return minEnd;
}

export {findMeetingPoint};