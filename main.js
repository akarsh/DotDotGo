/*jslint node:true, vars:true, bitwise:true, unparam:true */
/*jshint unused:true */
// Leave the above lines for propper jshinting

// data variable to write
var dataToWrite;

// The program is using the Node.js built-in `fs` module
// to load the config.json and any other files needed
var fs = require("fs");

// Load Grove module
var groveSensor = require('jsupm_grove');

var data = [];

// Create the temperature sensor object using AIO pin 0
var temp = new groveSensor.GroveTemp(0);
console.log(temp.name());

// Read the temperature ten times, printing both the Celsius and
// equivalent Fahrenheit temperature, waiting one minute between readings
setInterval(function() {
        var celsius = temp.value();
        data.push({temp: celsius});
//        var fahrenheit = celsius * 9.0/5.0 + 32.0;
//        console.log(celsius + " degrees Celsius, or " + Math.round(fahrenheit) + " degrees Fahrenheit");
//        console.log("Temperature: " + celsius + " degrees Celsius");
    dataToWrite = celsius;
//    fs.writeFile('/formlist.csv', dataToWrite, 'utf8', function (err) {
//    if (err) {
//        console.log('Some error occured - file either not saved or corrupted file saved.');
//    } else{
//    console.log('It\'s saved!');
//  }
//});
    fs.open('list.csv', 'w', function(err, fd) {
    if (err) {
        throw 'error opening file: ' + err;
    }

    fs.write(fd, dataToWrite, 0, dataToWrite.length, null, function(err) {
        if (err) throw 'error writing file: ' + err;
        fs.close(fd, function() {
            console.log('file written');
        })
    });
});
}, 10);

var sensorObj = require('jsupm_loudness');

// Instantiate a Loudness sensor on analog pin A1, with an analog
// reference voltage of 5.0
var sensor = new sensorObj.Loudness(1, 5.0);

// Every tenth of a second, sample the loudness and output it's
// corresponding analog voltage. 
setInterval(function()
{
    if (sensor.loudness() >= 1) {
//        console.log("Detected loudness: " + sensor.loudness() + " volts");    
    }
}, 100);

// exit on ^C
process.on('SIGINT', function()
{
    sensor = null;
    sensorObj.cleanUp();
    sensorObj = null;
    console.log("Exiting.");
    process.exit(0);
});

// Initialize the hardware devices
var mic = require("jsupm_mic");
var sound = new mic.Microphone(1),
    vibration = new (require("jsupm_ldt0028").LDT0028)(2),
    screenly = new (require("jsupm_i2clcd").Jhd1313m1)(6, 0x3E, 0x62);

// Initialize the sound sensor
var ctx = new mic.thresholdContext();
ctx.averageReading = 0;
ctx.runningAverage = 0;
ctx.averagedOver = 2;


// Display a warning message on the I2C LCD display
function moving() {
  screenly.setCursor(0, 0);
  screenly.write("Huge vibes");
  screenly.setColor(255, 255, 0);
}

// Clears the I2C LCD display
function clearmvoing() {
  screenly.setCursor(0, 0);
  screenly.write("IDLE STATE");
  screenly.setColor(255, 0, 255);
}


// The program is using the Node.js built-in `path` module to find
// the file path to needed files on disk
var path = require("path");

// Load configuration data from `config.json` file. Edit this file
// to change to correct values for your configuration
var config = JSON.parse(
  fs.readFileSync(path.join(__dirname, "config.json"))
);

function notify(state) {
//  console.log("Value: " + state + " " + new Date().toISOString());
}

// Checks every 20ms to see if either vibrations or sounds are detected.
// If either are detected, and the program is not already in the
// process of notifying about the activity, it display a message
var tripped = false;
//console.log("config.VIBRATION_THRESHOLD: ", config.VIBRATION_THRESHOLD);

setInterval(function() {
    var vibes = vibration.getSample();
//    console.log("Vibration: ", vibes);
    var movement = (vibes >= config.VIBRATION_THRESHOLD);

    var buffer = new mic.uint16Array(128),
        len = sound.getSampledWindow(2, 128, buffer);

    if (!len) { return; }

    var noise = sound.findThreshold(ctx, config.NOISE_THRESHOLD, buffer, len);
//    console.log("Noise level: ", noise);

    if (movement && noise && !tripped) {
      notify("start");
      moving();
    }

    if (!(movement && noise) && tripped) {
      notify("stop");
      clearmvoing();
    }

    tripped = movement && noise;
  }, 20);

// Create the light sensor object using AIO pin 3
var light = new groveSensor.GroveLight(3);

// Read the input and print both the raw value and a rough lux value,
function readLightSensorValue() {
//    console.log(light.name() + " raw value is " + light.raw_value() +
//            ", which is roughly " + light.value() + " lux");
}
setInterval(readLightSensorValue, 10);

// Load configuration data from `config.json` file. Edit this file
// to change to correct values for your configuration
var config = JSON.parse(
  fs.readFileSync(path.join(__dirname, "config.json"))
);

// Initialize the hardware devices
var accelerometer = require("jsupm_mma7660");
// Instantiate an MMA7660 on I2C bus 0
var accel = new accelerometer.MMA7660(0, 76),
    screen = new (require("jsupm_i2clcd").Jhd1313m1)(6, 0x3E, 0x62);

// The program is using the `superagent` module
// to make the remote calls to the data store
var request = require("superagent");

// Initialize the accelerometer to enable 64 samples per second
accel.setModeStandby();
accel.setSampleRate(1);
accel.setModeActive();

// Display message on RGB LCD when program checking
// USGS earthquake data
function checking() {
  console.log("Checking...");
  screen.setCursor(0, 0);
  screen.setColor(0, 255, 0);
  screen.write("Checking...");
}

// Display message on RGB LCD when USGS indicated an
// earthquake occurred
function warn() {
//  console.log("Earthquake!");
  screen.setCursor(0, 0);
  screen.setColor(255, 0, 0);
  screen.write("Earthquake!");
}

// Display message on RGB LCD when USGS indicated no
// earthquake occurred
function noquake() {
//  console.log("No quake.");
  screen.setCursor(0, 0);
  screen.setColor(0, 0, 255);
  screen.write("No quake.");
}

// Clear RGB LCD after checking
function stop() {
  screen.setCursor(0, 0);
  screen.setColor(0, 0, 0);
  screen.write("Not Checking");
}

// Calls USGS to verify that an earthquake
// has actually occurred in the user's area
function verify() {
  checking();
  function callback(err, res) {
    if (err) { return console.error("err:", err); }

    // check if there were any quakes reported
    if (res.body.features.length) {
      warn();
    } else {
      noquake();
    }

    // turn off after 15 seconds
    setTimeout(stop, 15000);
  }

  // we'll check for quakes in the last ten minutes
  var time = new Date();
  time.setMinutes(time.getMinutes() - 10);

  request
    .get("http://earthquake.usgs.gov/fdsnws/event/1/query")
    .query({ format: "geojson" })
    .query({ starttime: time.toISOString() })
    .query({ latitude: config.LATITUDE })
    .query({ longitude: config.LONGITUDE })
    .query({ maxradiuskm: 500 })
    .end(callback);
}

// Main function checks every
// 100ms to see if there has been motion detected
// by the accelerometer. If so, it calls verify to
// check the USGS API and see if an earthquake has
// actually occurred, and displays info on the display
function main() {
  var ax, ay, az;
  ax = accelerometer.new_floatp();
  ay = accelerometer.new_floatp();
  az = accelerometer.new_floatp();

  var prev = false;

  setInterval(function() {
    accel.getAcceleration(ax, ay, az);
    var quake = accelerometer.floatp_value(ax) > 1;
    if (quake && !prev) { verify(); }
    prev = quake;
  }, 10);
}

main();

//Relayr messaging with values

var mraa = require('mraa'); //require mraa
console.log('MRAA Version: ' + mraa.getVersion()); //write the mraa version to the console

var mqtt = require('mqtt');

var client = mqtt.connect({
  servers:[{'host':'mqtt.relayr.io'}],
  username: "6b2a58df-d022-42e9-92d2-038fcf6c79e3",
  password: "Nn_pk-M4aI4a",
  clientId: "TaypY39AiQumS0gOPz2x54w",
  protocol : 'mqtts'
});


client.on('connect', function() {

  //subscribe to commands sent from the dashboard or other clients
  client.subscribe("/v1/6b2a58df-d022-42e9-92d2-038fcf6c79e3/cmd");

  client.on('message', function(topic, message) {
  });

//simple timer to send a message every 1 minute regarding temperature
  var publisher = setInterval(function(){
      var data = [];

// Create the temperature sensor object using AIO pin 0
var temp = new groveSensor.GroveTemp(0);
        var celsius = temp.value();
        data.push({temp: celsius});
//        var fahrenheit = celsius * 9.0/5.0 + 32.0;
//        console.log(celsius + " degrees Celsius, or " +
//            Math.round(fahrenheit) + " degrees Fahrenheit");
    
    // publish a message to a topic
    var data = JSON.stringify({meaning:"Temperature", value: celsius});
    console.log(data);
    client.publish("/v1/6b2a58df-d022-42e9-92d2-038fcf6c79e3/data", data, function() {
    });
  }, 6000);
    
//simple timer to send a message every tenth of 1 second regarding loudness
  var publisher = setInterval(function(){

    // publish a message to a topic
    var data = JSON.stringify({meaning:"Sound Sensor", value: sensor.loudness()});
    console.log(data);
    client.publish("/v1/6b2a58df-d022-42e9-92d2-038fcf6c79e3/data", data, function() {
    });
  }, 100);
    
//simple timer to send a message every 20ms to see if either vibrations are detected.
    var publisher = setInterval(function(){

    // publish a message to a topic
    var vibes = vibration.getSample();
//    console.log("Vibration: ", vibes);
    var movement = (vibes >= config.VIBRATION_THRESHOLD);
    var data = JSON.stringify({meaning:"Vibration", value: vibes});
    console.log(data);
    client.publish("/v1/6b2a58df-d022-42e9-92d2-038fcf6c79e3/data", data, function() {
    });
  }, 20);
    
//simple timer to send a message every 20ms to see if either sounds are detected.
    var publisher = setInterval(function(){

    // publish a message to a topic
    var buffer = new mic.uint16Array(128),
    len = sound.getSampledWindow(2, 128, buffer);
    if (!len) { return; }
    var noise = sound.findThreshold(ctx, config.NOISE_THRESHOLD, buffer, len);
//    console.log("Noise level: ", noise);
    var data = JSON.stringify({meaning:"Noise level", value: noise});
    console.log(data);
    client.publish("/v1/6b2a58df-d022-42e9-92d2-038fcf6c79e3/data", data, function() {
    });
  }, 20);
    
    var publisher = setInterval(function(){

    // publish a message to a topic
//    console.log(light.name() + " raw value is " + light.raw_value());
    var data = JSON.stringify({meaning:"Light Sensor raw", value: light.raw_value()});
    console.log(data);
    client.publish("/v1/6b2a58df-d022-42e9-92d2-038fcf6c79e3/data", data, function() {
    });

  }, 10);
    
    //simple timer to send a message every 100th of 1 second regarding wether, there is an earthquake ture or false
    var publisher = setInterval(function(){

    // publish a message to a topic
//    console.log(light.name() + "which is roughly " + light.value() + " lux");
    var data = JSON.stringify({meaning:"Light Sensor lux", value: light.value()});
    console.log(data);
    client.publish("/v1/6b2a58df-d022-42e9-92d2-038fcf6c79e3/data", data, function() {
    });

  }, 10);
    var ax, ay, az;
    ax = accelerometer.new_floatp();
    ay = accelerometer.new_floatp();
    az = accelerometer.new_floatp();

    var prev = false;
    var publisher = setInterval(function(){

    // publish a message to a topic
    accel.getAcceleration(ax, ay, az);
    var quake = accelerometer.floatp_value(ax) > 1;
    if (quake && !prev) { verify(); }
    prev = quake;
    var data = JSON.stringify({meaning:"Earth quake", value: prev});
    console.log(data);
    client.publish("/v1/6b2a58df-d022-42e9-92d2-038fcf6c79e3/data", data, function() {
    });

  }, 10);
});