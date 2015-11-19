var UI = require('ui');

function loadingCard() {
  return new UI.Card({
    title: 'Loading',
    icon: 'images/menu_icon.png',
    subtitle: '...',
    body: ''
  });
}

module.exports = loadingCard;
