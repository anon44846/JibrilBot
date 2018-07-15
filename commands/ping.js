module.exports.run = async (bot, message, args) => {
    message.channel.send("pong! (Yes I'm still alive)");
}
 
module.exports.help = {
    name: "ping"
}