/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

 var ajax = require('ajax');
 var Vibe = require('ui/vibe');
 var Accel = require('ui/accel');
 var UI = require('ui');
 var Vector2 = require('vector2');

var mainCard = require('cards/main')();
var askReadyCardHandler = require('cards/askReady');
var counterCardHandler = require('cards/counter');
var completeCard = require('cards/complete')();
var loadingCard = require('cards/loading')();

var API_URL = 'http://10.0.6.80:3000/api/todoist/project/155704829/items';
var generalCounter = 0;
var exercises;

var askReadyCard;

// var waitingTime = 3000;


loadingCard.show();

ajax({ url: API_URL, type: 'json' },
  function(data) {
    console.log('data', JSON.stringify(data));
    exercises = data.data;
    // var items = data.data.map(function(item) {
    //   return {
    //     title: item.content,
    //     icon: 'images/menu_icon.png',
    //     subtitle: 'subtitle'
    //   };
    // });
    // console.log('items', JSON.stringify(items));
    // var menu = new UI.Menu({
    //   sections: [{
    //     items: items
    //   }]
    // });
    // menu.on('select', function(e) {
    //   console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
    //   console.log('The item is titled "' + e.item.title + '"');
    // });
    // menu.show();
    // splashCard.hide();
    mainCard.show();
    testWebSocket();
  }
);


var wsUri = 'ws://10.0.6.80:3333/';
var websocket;
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
    if (evt.data === 'pebble_start_routine') {
      stateStartRoutine();
    }
  };

  websocket.onerror = function(evt) {
    console.log('onerror', JSON.stringify(evt));
  };
}

function stateStartRoutine() {
  askReadyCard = askReadyCardHandler(exercises[generalCounter]);

  askReadyCard.on('click', 'up', function(e) {
    stateShowCounter();
  });

  askReadyCard.show();
}

var counterWindows = [];

function stateShowCounter() {
  var step = 3;
  counterWindows.push(counterCardHandler(step));
  counterWindows[counterWindows.length - 1].show();
  askReadyCard.hide();

  var interval = setInterval(function() {
    step--;
    if (step > 0) {
      counterWindows.push(counterCardHandler(step));
      counterWindows[counterWindows.length - 1].show();
    }
    else {
      clearInterval(interval);
      websocket.send('pebble_exercise_start');
      stateReadAccel();
    }
  }, 1000);
}



function stateSmallVibe() {
  Vibe.vibrate('short');
}

var storeValue = [];
var storeTime = [];
var steps = setSteps();
var countDownWindow;

function stateReadAccel() {
  Accel.init();
  Accel.config({
    rate: 50,
    samples: 5
  });
  countDownWindow = counterCardHandler(steps);
  countDownWindow.show();

  counterWindows.map(function(window) {
    window.hide();
  });

  countDownWindow.on('accelData', function(e) {
    var data = e.accels;
    value = getAccelRef(data[0]);
    storeValue.push(value);
    storeTime.push(data[0].time);
    if (detectChange(storeValue, storeTime)) {
      storeValue = [];
      storeTime = [];
    }
    var text = new UI.Text({
      position: new Vector2(0, 25),
      size: new Vector2(150, 45),
      text: steps,
      font: 'bitham-42-bold',
      color: '#ffffff',
      backgroundColor: '#000000',
      textAlign: 'center'
    });
    countDownWindow.add(text);
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
    if (timeElapse > waitMills) {
      var min = storeValue.min();
      var max = storeValue.max();
      var diff = Math.abs(min - max);
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
          steps--;
          if (steps === 0 && generalCounter < exercises.length) {
            websocket.send('pebble_exercise_complete');
            countDownWindow.hide();
            generalCounter++;
            if (generalCounter === exercises.length) {
              setStateComplete();
            }
            else {
              steps = setSteps();
              stateStartRoutine();
            }
          }
        }
      }
      console.log(diff, staticTimes, dinamycTimes);
      return true;
    }
  }
  return false;
}

function setSteps() {
  return 3;
}

function setStateComplete() {
  console.log('setStateComplete');
  completeCard.show();
  exercises.map(function() {
    countDownWindow.hide();
  });
  generalCounter = 0;
  steps = setSteps();
  websocket.send('pebble_exercise_finish');
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
