var UI = require('ui');

function completeCard() {
  return new UI.Card({
    title: 'Done',
    icon: 'images/menu_icon.png',
    subtitle: 'You rock',
    body: ':)'
  });
}

module.exports = completeCard;
