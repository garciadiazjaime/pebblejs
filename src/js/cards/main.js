var UI = require('ui');

function mainCard() {
  return new UI.Card({
    title: 'Pebble.js',
    icon: 'images/menu_icon.png',
    subtitle: 'Beefe',
    body: 'Let\'s do this',
    subtitleColor: 'black', // Named colors
    bodyColor: '#FF000B' // Hex colors
  });
}

module.exports = mainCard;
