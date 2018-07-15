const botconfig = require("./jsonFiles/botconfig.json");
const Discord = require("discord.js");
const tatsu = require("tatsumaki.js");
const fs = require("fs");
const bot = new Discord.Client({ disableEveryone: true });
const tatsuClient = new tatsu.Client(botconfig.tatsumakiKey);
bot.commands = new Discord.Collection();

fs.readdir("./commands/", (err, files) => {

    if (err) console.log(err);

    let jsfile = files.filter(f => f.split(".").pop() === "js")
    if (jsfile.length <= 0) {
        console.log("Couldn't find commands.");
        return;
    }

    jsfile.forEach((f, i) => {
        let props = require(`./commands/${f}`);
        console.log(`${f} loaded!`);
        bot.commands.set(props.help.name, props);
    });

});

bot.on("ready", async () => {
    console.log(`${bot.user.username} is online on ${bot.guilds.size} server/s!`);
    bot.user.setActivity(`on ${bot.guilds.size} guilds.`, { type: "PLAYING" });
});

bot.on("message", async message => {
    if (message.author.bot) return;
    if (message.channel.type === "dm") return;

    checkRole(message);

    let prefix = botconfig.prefix;
    let messageArray = message.content.split(" ");
    let cmd = messageArray[0];
    let args = messageArray.splice(1);

    let commandfile = bot.commands.get(cmd.slice(prefix.length));
    if (commandfile) commandfile.run(bot, message, args);
});



async function checkRole(message) {
    let guildRoles = require('./jsonFiles/guildRoles.json');
    let roles, senderScore;
    try {
        guildRoles.guilds.forEach(e => {
            if(e.id == message.guild.id) roles = e.roles;
        });

        let guildRanking = await tatsuClient.guildLeaderboard(message.guild.id, message.guild.memberCount);

        guildRanking.forEach(e => {
            if (e) {
                if (e.user_id == message.member.id) senderScore = e.score;
            }
        });

        let roleID = Math.floor(senderScore / 1000);
        if (roleID > 15) roleID = 15;
        let role = message.guild.roles.find("name", roles[roleID]);

        if (role) {
            if (!message.member.roles.has(role.id)) {
                roles.forEach(r => {
                    r = message.guild.roles.find("name", r);
                    if (r) {
                        if (message.member.roles.has(r.id)) {
                            message.member.removeRole(r).catch(console.error);
                        }
                    } else {
                        Console.log(`Can't find the ${r.name} role.`);
                    }
                });
                message.member.addRole(role).catch(console.error);
                message.channel.send(`<@${message.member.id}> leveled up to the ${role.name} race!`);
            }
        } else {
            console.log("an error has occured");
        }
    } catch (err) {
        console.log(err);
    }
}

bot.login(botconfig.discordToken);