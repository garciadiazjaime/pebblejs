var UI = require('ui');

function mainCard() {
  return new UI.Card({
    title: 'Pebble.js',
    icon: 'images/menu_icon.png',
    subtitle: '1 subtitle',
    body: '2 body',
    subtitleColor: 'indigo', // Named colors
    bodyColor: '#9a0036' // Hex colors
  });
}

module.exports = mainCard;
