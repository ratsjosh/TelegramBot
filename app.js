var app = function(app) {
	var TelegramBot = require('node-telegram-bot-api'),
	    // Be sure to replace YOUR_BOT_TOKEN with your actual bot token on this line.
	    telegram = new TelegramBot("340965091:AAHNKChTKxpwOZXBgkoCO99gS6Z2DH_6QyU", { polling: true });

	telegram.on("text", (message) => {
	  if(message.text.toLowerCase().indexOf("/hellobot") === 0){
      	telegram.sendMessage(message.chat.id, "Hello " + message.chat.first_name);
	  }
	  else {
      	telegram.sendMessage(message.chat.id, "Hello world");
	  }
	});
}

module.exports = app;