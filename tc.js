var SBrick = require('./controllers/sbrick');
var Gpio = require('onoff').Gpio;

var switchgreif = new Gpio(23, 'in', 'both');
var switchporsche = new Gpio(24, 'in', 'both');
//var button3 = new Gpio(25, 'in', 'both');

var porsche;
var greif;

var greifrunVel = 165;
var greifstoppingVel = 0;

var porscheRunVel = -205;
var porscheStoppingVel = 0;

var waitid = 0;
var nrRuns = 0;

function movegreif (vel) {
    greif.move (1,vel);
    greif.move (2,vel);
    greif.move (3,-vel);
}
function moveporsche (vel) {
    porsche.move (1,vel);
}

function stopgreif () {
    switchgreif.unwatch();
    nrRuns--;
    console.log ("stopgreif() - nr runs: " + nrRuns);
    if (0 === nrRuns) {
        movegreif (greifstoppingVel);
        setTimeout (movegreif.bind(this, 0), 500);
        startTrain (moveporsche, porscheRunVel, stopporsche, switchporsche, 2);
    } else {
        setTimeout (
            switchgreif.watch.bind(switchgreif,watcher.bind(this, stopgreif)) , 3000 );
    }
}

function stopporsche () {
    switchporsche.unwatch();
    nrRuns--;
    console.log ("stopporsche() - nr runs: " + nrRuns);
    if (0 === nrRuns) {
        moveporsche (porscheStoppingVel);
        setTimeout (moveporsche.bind(this, 0), 1000);
        startTrain (movegreif, greifrunVel, stopgreif, switchgreif, 4);
    } else {
        setTimeout (
            switchporsche.watch.bind(switchporsche,watcher.bind(this, stopporsche)) , 3000 );
    }
}

var nrTrains = 0;
var trainCounter = 0;

function watcher (callback, err, value) {
    if (value !== 0) {
        if (callback) {
            callback ();
        }
    }
}

function startTrain (moveFunc, vel, stopFunc, waitSwitch, maxRuns) {
    nrRuns = Math.floor ((Math.random()*maxRuns)+1);
    var timeout = Math.floor((Math.random()*7000));
    console.log ("startTrain() - nr runs: " + nrRuns + ", timeout: " + timeout);

    setTimeout (moveFunc.bind(this, vel/6), timeout);
    setTimeout (moveFunc.bind(this, vel/3), timeout+500);
    setTimeout (moveFunc.bind(this, vel/2), timeout+1000);
    setTimeout (moveFunc.bind(this, 2*vel/3), timeout+1500);
    setTimeout (moveFunc.bind(this, 5*vel/6), timeout+2000);
    setTimeout (moveFunc.bind(this, vel), timeout+2500);
    setTimeout (
        waitSwitch.watch.bind(waitSwitch,watcher.bind(this, stopFunc)) , 5500+timeout );
}

function startTrains () {
    nrTrains++;
    console.log ("start trains: " + nrTrains);
    if (nrTrains == 2) {
        startTrain (movegreif, greifrunVel, stopgreif, switchgreif, 5);
//        startTrain (moveporsche, porscheRunVel, stopporsche, switchporsche, 2);
    }
}

function prepareTrains () {
    porsche.connect (porsche.startUpdating.bind(porsche, startTrains) );
    greif.connect (greif.startUpdating.bind(greif, startTrains) );
}

function waiting () {
    porsche = SBrick.sbricks ['0007802e21c0'];
    greif = SBrick.sbricks ['0007802e39c0'];
    if (greif && porsche) {
        clearInterval (waitid);
        console.log ("START!");
        prepareTrains ();
    }
}

waitid = setInterval (waiting, 1000);
