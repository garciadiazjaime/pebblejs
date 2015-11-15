var UI = require('ui');

function askReadyCard(data) {
  return new UI.Card({
    title: 'Ready?',
    icon: 'images/menu_icon.png',
    subtitle: data.content,
    body: 'Up: Yes'
  });
}

module.exports = askReadyCard;
