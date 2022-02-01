let socket = new ReconnectingWebSocket("ws://127.0.0.1:24050/ws");

socket.onopen = () => console.log("Successfully Connected");

socket.onclose = event => {
    console.log("Socket Closed Connection: ", event);
    socket.send("Client Closed!");
};

socket.onerror = error => console.log("Socket Error: ", error);

let currentSR = new CountUp('currentSR', 0, 0, 2, .5, { useEasing: true, useGrouping: true, separator: " ", decimal: "." })
let currentPP = new CountUp('currentPP', 0, 0, 0, .5, { useEasing: true, useGrouping: true, separator: " ", decimal: ".", suffix: "pp", prefix: "Live: " })
let fcPP = new CountUp('fcPP', 0, 0, 0, .5, { useEasing: true, useGrouping: true, separator: " ", decimal: ".", suffix: "pp", prefix: "FC: " })
let ur = new CountUp('ur', 0, 0, 2, .5, { useEasing: true, useGrouping: true, separator: " ", decimal: ".", prefix: "UR: " })
let h100 = new CountUp('h100', 0, 0, 0, .5, { useEasing: true, useGrouping: true, separator: " ", decimal: "." })
let h50 = new CountUp('h50', 0, 0, 0, .5, { useEasing: true, useGrouping: true, separator: " ", decimal: "." })
let h0 = new CountUp('h0', 0, 0, 0, .5, { useEasing: true, useGrouping: true, separator: " ", decimal: "." })

// Map Stats Containers in DOM
let sr = document.getElementById('srStat');
let cs = document.getElementById('cs');
let ar = document.getElementById('ar');
let od = document.getElementById('od');
let bpm = document.getElementById('bpm');
let progressChart = document.getElementById("progress");

// Strings that hold values for DOM
let tempSR;
let tempCS;
let tempAR;
let tempOD;
let tempBPM;

// Graph Visualization
let tempStrainBase;
let smoothOffset = 2;
let smoothed;
let seek;
let fullTime;
let onepart;

socket.onmessage = event => {
    try {
        let data = JSON.parse(event.data), menu = data.menu, play = data.gameplay;
        let mapInfo = menu.bm.metadata;
        let mapStats = menu.bm.stats;
        currentSR.update(mapStats.SR);
        currentPP.update(play.pp.current);
        fcPP.update(play.pp.fc);
        ur.update(play.hits.unstableRate);
        h100.update(play.hits[100]);
        h50.update(play.hits[50]);
        h0.update(play.hits[0]);

        if (tempSR !== 'SR: ' + mapStats.fullSR) {
            tempSR = 'SR: ' + mapStats.fullSR;
            sr.innerHTML = tempSR;
        }
        if (tempCS !== 'CS: ' + mapStats.CS) {
            tempCS = 'CS: ' + mapStats.CS;
            cs.innerHTML = tempCS;
        }
        if (tempAR !== 'AR: ' + mapStats.AR) {
            tempAR = 'AR: ' + mapStats.AR;
            ar.innerHTML = tempAR;
        }
        if (tempOD !== 'OD: ' + mapStats.OD) {
            tempOD = 'OD: ' + mapStats.OD;
            od.innerHTML = tempOD;
        }
        if (tempBPM !== 'BPM: ' + mapStats.BPM.max) {
            tempBPM = 'BPM: ' + mapStats.BPM.max;
            bpm.innerHTML = tempBPM;
        }

        if (tempStrainBase != JSON.stringify(data.menu.pp.strains)) {
            tempStrainBase = JSON.stringify(data.menu.pp.strains);
            smoothed = smooth(data.menu.pp.strains, smoothOffset);
            config.data.datasets[0].data = smoothed;
            config.data.labels = smoothed;
            configSecond.data.datasets[0].data = smoothed;
            configSecond.data.labels = smoothed;
            window.myLine.update();
            window.myLineSecond.update();
        }
        if (fullTime !== data.menu.bm.time.mp3) {
            fullTime = data.menu.bm.time.mp3
            onepart = 140 / fullTime;
        }
        if (seek !== data.menu.bm.time.current && fullTime !== undefined && fullTime != 0) {
            seek = data.menu.bm.time.current;
            progressChart.style.width = onepart * seek + 'px'
        }
    } catch (err) { console.log(err); };
};

window.onload = function () {
    var ctx = document.getElementById('canvas').getContext('2d');
    window.myLine = new Chart(ctx, config);

    var ctxSecond = document.getElementById('canvasSecond').getContext('2d');
    window.myLineSecond = new Chart(ctxSecond, configSecond);
};

let config = {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            borderColor: 'rgba(255, 255, 255, 0)',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            data: [],
            fill: true,
        }]
    },
    options: {
        tooltips: { enabled: false },
        legend: {
            display: false,
        },
        elements: {
            line: {
                tension: 0.4,
                cubicInterpolationMode: 'monotone'
            },
            point: {
                radius: 0
            }
        },
        responsive: false,
        scales: {
            x: {
                display: false,
            },
            y: {
                display: false,
            }
        }
    }
};

let configSecond = {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            borderColor: 'rgba(255, 255, 255, 0)',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            data: [],
            fill: true,
        }]
    },
    options: {
        tooltips: { enabled: false },
        legend: {
            display: false,
        },
        elements: {
            line: {
                tension: 0.4,
                cubicInterpolationMode: 'monotone'
            },
            point: {
                radius: 0
            }
        },
        responsive: false,
        scales: {
            x: {
                display: false,
            },
            y: {
                display: false,
            }
        }
    }
}