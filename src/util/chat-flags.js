
/*
 DO NOT DELETE!!!
 var fs = require('fs');
 const arr = require('fs').readdirSync('./public/img/chat-rooms');
 let output = []
 for (let i = 0; i < arr.length; i++) {
 let name = arr[i].slice(0,arr[i].length-4);
 output.push('{name: "'+ name +'", url: require("../../public/img/chat-rooms/'+arr[i]+'")}')
 }
 console.log(output);
 */

export const chatChannels = [
	{name: "spam", url: require("../../img/chat-rooms/spam.png")},
	{name: "vip", url: require("../../img/chat-rooms/vip.png")},
	{name: "arabic", url: require("../../img/chat-rooms/arabic.png")},
	{name: "armenian", url: require("../../img/chat-rooms/armenian.png")},
	{name: "bengali", url: require("../../img/chat-rooms/bengali.png")},
	{name: "bosnian", url: require("../../img/chat-rooms/bosnian.png")},
	{name: "bulgarian", url: require("../../img/chat-rooms/bulgarian.png")},
	{name: "chinese", url: require("../../img/chat-rooms/chinese.png")},
	{name: "croatian", url: require("../../img/chat-rooms/croatian.png")},
	{name: "czech", url: require("../../img/chat-rooms/czech.png")},
	{name: "danish", url: require("../../img/chat-rooms/danish.png")},
	{name: "dutch", url: require("../../img/chat-rooms/dutch.png")},
	{name: "english", url: require("../../img/chat-rooms/english.png")},
	{name: "estonian", url: require("../../img/chat-rooms/estonian.png")},
	{name: "farsi", url: require("../../img/chat-rooms/farsi.png")},
	{name: "filipino", url: require("../../img/chat-rooms/filipino.png")},
	{name: "finnish", url: require("../../img/chat-rooms/finnish.png")},
	{name: "french", url: require("../../img/chat-rooms/french.png")},
	{name: "german", url: require("../../img/chat-rooms/german.png")},
	{name: "greek", url: require("../../img/chat-rooms/greek.png")},
	{name: "hebrew", url: require("../../img/chat-rooms/hebrew.png")},
	{name: "hindi", url: require("../../img/chat-rooms/hindi.png")},
	{name: "hungarian", url: require("../../img/chat-rooms/hungarian.png")},
	{name: "indonesian", url: require("../../img/chat-rooms/indonesian.png")},
	{name: "italian", url: require("../../img/chat-rooms/italian.png")},
	{name: "korean", url: require("../../img/chat-rooms/korean.png")},
	{name: "norwegian", url: require("../../img/chat-rooms/norwegian.png")},
	{name: "polish", url: require("../../img/chat-rooms/polish.png")},
	{name: "portuguese", url: require("../../img/chat-rooms/portuguese.png")},
	{name: "romanian", url: require("../../img/chat-rooms/romanian.png")},
	{name: "russian", url: require("../../img/chat-rooms/russian.png")},
	{name: "serbian", url: require("../../img/chat-rooms/serbian.png")},
	{name: "slovak", url: require("../../img/chat-rooms/slovak.png")},
	{name: "slovenian", url: require("../../img/chat-rooms/slovenian.png")},
	{name: "spanish", url: require("../../img/chat-rooms/spanish.png")},
	{name: "swedish", url: require("../../img/chat-rooms/swedish.png")},
	{name: "thai", url: require("../../img/chat-rooms/thai.png")},
	{name: "turkish", url: require("../../img/chat-rooms/turkish.png")},
	{name: "ukrainian", url: require("../../img/chat-rooms/ukrainian.png")},
	{name: "vietnamese", url: require("../../img/chat-rooms/vietnamese.png")},
	{name: "help", url: require("../../img/chat-rooms/help.png")},

];

let chatChannelsFlag = {};

for (let room of chatChannels) {
	chatChannelsFlag[room.name] = room.url;
}

export default chatChannelsFlag;