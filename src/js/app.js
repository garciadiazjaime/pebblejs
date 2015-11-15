/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var Vector2 = require('vector2');
var ajax = require('ajax');
var Vibe = require('ui/vibe');
var Accel = require('ui/accel');

var API_URL = 'http://10.0.6.80:3000/api/todoist/project/155704829/items';
var state = 'init';
var cardStart;
var cartGetReady;

var waitingTime = 3000;

var main = new UI.Card({
  title: 'Pebble.js',
  icon: 'images/menu_icon.png',
  subtitle: '1 subtitle',
  body: '2 body',
  subtitleColor: 'indigo', // Named colors
  bodyColor: '#9a0036' // Hex colors
});

main.show();


var wsUri = 'ws://10.0.6.80:3333/';

function testWebSocket() {
  websocket = new WebSocket(wsUri);
  websocket.onopen = function(evt) {
    console.log('onopen', JSON.stringify(evt));
  };

  websocket.onclose = function(evt) {
    console.log('onClose', JSON.stringify(evt));
  };

  websocket.onmessage = function(evt) {
    Vibe.vibrate('short');
    console.log('onmessage', JSON.stringify(evt.data));
    state = evt.data;
    if (state === 'start_routine') {
      console.log('start_routine');
      stateStartRoutine();
    }

  };

  websocket.onerror = function(evt) {
    console.log('onerror', JSON.stringify(evt));
  };
}
testWebSocket();

function stateStartRoutine() {
  cardStart = new UI.Card({
    title: 'State A',
    icon: 'images/menu_icon.png',
    subtitle: 'Are you ready to start?',
    body: 'Up: Yes \n Down: No'
  });

  cardStart.on('click', 'up', function(e) {
    if (state === 'start_routine') {
      stateGetReady();
    }
  });

  cardStart.show();
}

function stateGetReady() {
  state = 'get_ready';
  cartGetReady = new UI.Card({
    title: 'Get Ready',
    body: 'loading...'
  });
  cartGetReady.show();
  cardStart.hide();
  stateLongVibe();
}

function stateLongVibe() {
  if (state === 'get_ready') {
    state = 'long_vibe';
    setTimeout(function() {
      // Vibe.vibrate('double');
      stateReadAccel();
    }, waitingTime);
  }
}

function stateSmallVibe() {
  Vibe.vibrate('short');
}

var storeValue = [];
var storeTime = [];

function stateReadAccel() {
  state = 'read_accel';
  Accel.init();
  Accel.config({
    rate: 50,
    samples: 5
  });

  cartGetReady.on('accelData', function(e) {
  //  console.log('Accel data: ' + JSON.stringify(e.accels));
    var data = e.accels;
    // data.map(function(item){
    //   printAccelRecord(item);
    // });
    value = getAccelRef(data[0]);
    // console.log(value);
    storeValue.push(value);
    storeTime.push(data[0].time);
    if (detectChange(storeValue, storeTime)) {
      storeValue = [];
      storeTime = [];
    }
  });
}

function getAccelRef(data) {
  var root = 4;
  var x = Math.pow(Math.abs(data.x) || 1, 1 / root);
  var y = Math.pow(Math.abs(data.y) || 1, 1 / root);
  var z = Math.pow(Math.abs(data.z) || 1, 1 / root);
  return Math.round(Math.abs(x * y * z));
}

var enableVibe = true;
var staticTimes = 0;
var dinamycTimes = 0;

function detectChange(storeValue, storeTime) {
  var waitMills = 100;
  if (storeValue.length > 1) {
    var timeStart = storeTime[0];
    var timeEnd = storeTime[storeTime.length - 1];
    var timeElapse = Math.abs(timeStart - timeEnd);
    // console.log(timeStart, timeEnd, timeElapse, waitMills);
    if (timeElapse > waitMills) {
      var min = storeValue.min();
      var max = storeValue.max();
      var diff = Math.abs(min - max);
      // console.log(storeValue.length, storeTime.length, min, max, diff);
      if (diff < 18) {
        staticTimes++;
        dinamycTimes = 0;
        if (staticTimes > 3) {
          enableVibe = true;
          dinamycTimes = 0;
        }
      }
      else {
        dinamycTimes++;
        staticTimes = 0;
        if (dinamycTimes > 0 && enableVibe) {
          stateSmallVibe();
          enableVibe = false;
          dinamycTimes = 0;
        }
      }
      console.log(diff, staticTimes, dinamycTimes);
      return true;
    }
  }
  return false;
}

Array.prototype.max = function() {
  return Math.max.apply(null, this);
};

Array.prototype.min = function() {
  return Math.min.apply(null, this);
};
//
// main.on('click', 'select', function(e) {
//   var wind = new UI.Window({
//     fullscreen: true,
//   });
//   var textfield = new UI.Text({
//     position: new Vector2(0, 65),
//     size: new Vector2(144, 30),
//     font: 'gothic-24-bold',
//     text: 'Text Anywhere!',
//     textAlign: 'center'
//   });
//   wind.add(textfield);
//   wind.show();
// });
//
// main.on('click', 'down', function(e) {
//   var card = new UI.Card();
//   card.title('A Card');
//   card.subtitle('Is a Window');
//   card.body('The simplest window type in Pebble.js.');
//   card.show();
// });
