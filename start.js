var Discord = require("discord.js");
var bot = new Discord.Client();
var request = require("request");
var async = require("async");
var moment = require("moment");
const fs = require("fs");

var DateDiff = require('date-diff');

var log4js = require('log4js');
log4js.configure({ appenders: [
    { type: "console" },
    { type: "dateFile", filename: "logs/loggerrino.log", pattern: "-yyyy-MM-dd", alwaysIncludePattern: false }
]});

var logger = log4js.getLogger();
var config;

try {
    config = fs.readFileSync("config.txt", "utf8");
    config = config.split("|");
} catch (e) {
    logMessage("err", "global", "global", "Failed to read config.txt, did you run `setup.sh` correctly?");
}

var isEnabled = true;

function logMessage(level, sender, channel, message) {
    var content = "<" + sender + "@" + channel + "> " + message;
    switch (level) {
        case "info":
            logger.info(content);
            break;
        case "err":
            logger.error(content);
            break;
        case "warn":
            logger.warn(content);
            break;
    }
}


bot.on("ready", () => {
    logMessage("info", "global", "global", "connected");
});

bot.on("reconnecting", () => {
    logMessage("info", "global", "global", "attempting to reconnect");
});

bot.on("disconnect", () => {
    logMessage("info", "global", "global", "disconnected");
});

bot.on("warning", warn => {
    logMessage("warn", "global", "global", warn);
});

bot.on("error", e => {
    logMessage("err", "global", "global", e);
});

bot.on("message", raw => {
    // taking the raw message object and making it more usable
    var sender = raw.author.username + "#" + raw.author.discriminator;
    var channel = raw.channel;
    var guild = raw.guild;
    var msg = raw.content;
    var source;

    if ((typeof channel.guild != "undefined") && (typeof channel.name != "undefined")) {
        source = channel.guild.name + "#" + channel.name;
    } else { source = "unknown"; }

    if (source.includes("Discord Bots") && sender != config[1]) return;

    if (msg == "+enable" && sender == config[1]) {
        if (isEnabled) {
            channel.sendMessage("I'm already enabled.");
            logMessage("info", sender, channel, "tried to enable when i'm already enabled");
        } else {
            isEnabled = true;
            channel.sendMessage("Enabled.");
            logMessage("info", sender, channel, "+enable");
        }
    } else if (msg == "+disable" && sender == config[1]) {
        if (!isEnabled) {
            channel.sendMessage("I'm already disabled.");
            logMessage("info", sender, channel, "tried to enable when i'm already disabled");
        } else {
            isEnabled = false;
            channel.sendMessage("Disabled.");
            logMessage("info", sender, channel, "+disable");
        }
    }
});

bot.on("guildMemberAdd", raw => {
    var diff = new DateDiff(new Date(), raw.user.createdAt);
    var username = raw.user.username + "#" + raw.user.discriminator;

    var chan = bot.guilds.first().channels.find("name", config[2].substring(1).trim());

   if (diff.minutes() < 86400) {
    	async.series([
            function(callback) {
                raw.send("Due to your account being too new, you have been banned as a precaution. If you would like to appeal the ban in order to join the server, please join the server linked below.\n\n https://discord.gg/E8DUxmA");
                callback(null, "send");
            },
            function(callback) {
				setTimeout(function(){}, 2000);
                raw.ban();
                chan.send(bot.guilds.first().owner + " - Banning " + raw + " for being too new.");
				logMessage("info", username, "global", "banning " + username + ", account created <= 24 hours");
                callback(null, "ban");
            }
        ],
        function(err, results) {
            if (err != null) {
                logMessage("err", "global", "global", "failed to perform async operations for banning");
            }
        });
	}
	if (diff.minutes() > 86400) {
        if (typeof raw.user != "undefined") { 
const embed = new Discord.RichEmbed();
  embed.addField(`${raw.user.username}#${raw.user.discriminator}`, `${raw.user.id}`, true)
          .setColor(54696)
          .setFooter(' ', ' ')
          .setThumbnail(`${raw.user.displayAvatarURL}`)
          .setURL(`${raw.user.displayAvatarURL}`)
          .addField('Joined Discord on', `${moment(raw.user.createdAt).format('DD MMM YYYY HH:mm')}`, true)
          .addField('Joined this server on', `${moment(raw.joinedAt).format('DD MMM YYYY HH:mm')}`, true)
      chan.send({ embed: embed });
	  }
}});

bot.login(config[0]);
