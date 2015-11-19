var UI = require('ui');
var Vector2 = require('vector2');

function counterCard(step) {
  var loadingWindow = new UI.Window();
  var text = new UI.Text({
    position: new Vector2(0, 25),
    size: new Vector2(144, 30),
    text: step,
    font: 'bitham-42-bold',
    color: '#ffffff',
    textAlign: 'center'
  });
  loadingWindow.add(text);
  return loadingWindow;
}

module.exports = counterCard;
