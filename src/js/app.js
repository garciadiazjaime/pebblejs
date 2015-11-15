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
      Vibe.vibrate('long');
      Vibe.vibrate('long');
      Vibe.vibrate('long');
      stateReadAccel();
    }, waitingTime);
  }
}

function stateReadAccel() {
  state = 'read_accel';
  Accel.init();
  Accel.config({
    rate: 100
  });

  cartGetReady.on('accelData', function(e) {
  //  console.log('Accel data: ' + JSON.stringify(e.accels));
    var data = e.accels;
    console.log('====');
    printAccelRecord(data[0]);
    console.log('====');
  });
}

function printAccelRecord(data) {
  console.log('x:' + data.x + '\t\ty: ' + data.y + '\t\tz: ' + data.z);
  var PEBBLE_URL = 'http://10.0.6.80:3000/api/pebble/accel?data=' + JSON.stringify(data);
  console.log('PEBBLE_URL', PEBBLE_URL);
  ajax({ url: PEBBLE_URL, type: 'json' }, function(data) {
    console.log('ajax response', data);
  });
}
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
