const plugins = require("../lib/event");
const {
    command,
    isPrivate,
    clockString,
    getUrl,
    parsedJid,
    isAdmin
    
} = require("../lib");
const {
    BOT_INFO
} = require("../config");
const config = require("../config");
const { tiny } = require("../lib/fancy_font/fancy");
const Jimp = require("jimp");
const got = require("got");
const fs = require("fs");
const { PluginDB, installPlugin } = require("../lib/database/plugins");

command(
    {
        pattern: "ping",
        fromMe: isPrivate,
        desc: "To check ping",
        type: "user",
    },
    async (message, match, client) => {
        const start = new Date().getTime();
      let { key } = await message.sendMessage(`*Ping*`);
        const end = new Date().getTime();
var speed = end - start;
 
await new Promise(t => setTimeout(t,0))
         await message.client.sendMessage(message.jid,{text:`*Pong*
${speed} *ms*` , edit: key});
});

command(
  {
    pattern: "menu",
    fromMe: isPrivate,
    desc: "Show All Commands",
    dontAddCommandList: true,
    type: "user",
  },
  async (message, match, m, client) => {
try{
    if (match) {
      for (let i of plugins.commands) {
        if (
          i.pattern instanceof RegExp &&
          i.pattern.test(message.prefix + match)
        ) {
          const cmdName = i.pattern.toString().split(/\W+/)[1];
          message.reply(`\`\`\`Command: ${message.prefix}${cmdName.trim()}
Description: ${i.desc}\`\`\``);
        }
      }
    } else {
      let { prefix } = message;
      let [date, time] = new Date()
        .toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
        .split(",");
        let usern = message.pushName
        const readMore = String.fromCharCode(8206).repeat(4001);
      let menu = `\n╭━━━〔 ${BOT_INFO.split(";")[0]} 〕━━━┈
    ╭──────────────
  ❖ │  *OWNER*: ${BOT_INFO.split(";")[1]}
  ❖ │  *USER*: ${usern}
  ❖ │  *DATE*: ${date}
  ❖ │  *TIME*: ${time}
  ❖ │  *COMMANDS*: ${plugins.commands.length}
  ❖ │  *MODE*: ${config.WORK_TYPE}
  ❖ │  *PREFIX*: ${config.HANDLERS}
  ❖ │  *VERSION*: ${require("../package.json").version}
    ╰──────────────
╰━━━━━━━━━━━━━━━┈\n ${readMore}`
      let cmnd = [];
      let cmd;
      let category = [];
      plugins.commands.map((command, num) => {
        if (command.pattern instanceof RegExp) {
          cmd = command.pattern.toString().split(/\W+/)[1];
        }

        if (!command.dontAddCommandList  && cmd !== undefined) {
          let type = command.type ? command.type.toLowerCase() : "misc";

          cmnd.push({ cmd, type });

          if (!category.includes(type)) category.push(type);
        }
      });
cmnd.sort();
      category.sort().forEach((cmmd) => {
        menu += `\n ╭─────────────┈⚆`;
        menu += `\n  │ 「 *${cmmd.toUpperCase()}* 」`;
        menu += `\n ╰┬────────────┈⚆`
        menu += `\n ╭┴────────────┈⚆`;
        let comad = cmnd.filter(({ type }) => type == cmmd);
        comad.forEach(({ cmd }) => {
          menu += `\n❆  ${cmd.trim()}`;
        });
        menu += `\n ╰─────────────┈⚆`;
      });
      let penu = tiny(menu)
      let img = config.BOT_INFO.split(';')[2]
      return await message.sendFromUrl(img, {fileLength: "5555544444", gifPlayback: true, contextInfo: { externalAdReply: {
title: config.BOT_INFO.split(";")[0],
body: "",
sourceUrl: "",
mediaUrl: "",
mediaType: 1,
showAdAttribution: true,
renderLargerThumbnail: false,
thumbnailUrl: config.BOT_INFO.split(";")[2] }}, caption: (penu)}, {quoted: message })
    }
}catch(e){
message.reply(e)
}
  }
);

command(
  {
    pattern: "list",
    fromMe: isPrivate,
    desc: "Show All Commands",
    type: "user",
    dontAddCommandList: true,
  },
  async (message, match, { prefix }) => {
    let menu = `╭───────┈┫「 *𝐂𝐨𝐦𝐦𝐚𝐧𝐝 𝐋𝐢𝐬𝐭* 」┣┈────♡`;
    menu += `\n│\n`;

    let cmnd = [];
    let cmd, desc;
    plugins.commands.map((command) => {
      if (command.pattern) {
        cmd = command.pattern.toString().split(/\W+/)[1];
      }
      desc = command.desc || false;

      if (!command.dontAddCommandList && cmd !== undefined) {
        cmnd.push({ cmd, desc });
      }
    });
    cmnd.sort();
    cmnd.forEach(({ cmd, desc }, num) => {
      menu += `│  ${(num += 1)}. *${cmd.trim()}*`;
      if (desc) menu += `\n│  Use: \`\`\`${desc}\`\`\``;
      menu += `\n│\n`;
    });
    menu += `╰───────┈┫「 ${config.BOT_INFO.split(";")[0]} 」┣┈────♡`;
    return await message.reply(message.jid, { text: (tiny(menu)) })
})

command(
  {
    pattern: "install ?(.*)",
    fromMe: true,
    desc: "Install External plugins",
    type:'user'
  },
  async (message, match) => {
    if (!match) return await message.sendMessage("*_Plugin Url not found_*");
    for (let Url of getUrl(match)) {
      try {
        var url = new URL(Url);
      } catch {
        return await message.sendMessage("*_Invalid Url_*");
      }

      if (url.host === "gist.github.com") {
        url.host = "gist.githubusercontent.com";
        url = url.toString() + "/raw";
      } else {
        url = url.toString();
      }
      var plugin_name;
      var response = await got(url);
      if (response.statusCode == 200) {
        var commands = response.body
          .match(/(?<=pattern:)(.*)(?=\?(.*))/g)
          .map((a) => a.trim().replace(/"|'|`/, ""));
        plugin_name =
          commands[0] ||
          plugin_name[1] ||
          "__" + Math.random().toString(36).substring(8);

        fs.writeFileSync("./plugins/" + plugin_name + ".js", response.body);
        try {
          require("./" + plugin_name);
        } catch (e) {
          fs.unlinkSync("/xasena/plugins/" + plugin_name + ".js");
          return await message.sendMessage("*_Invalid Plugin_*\n ```" + e + "```");
        }

        await installPlugin(url, plugin_name);

        await message.sendMessage(
          `*_Plugin installed : ${commands.join(",")}_*`
        );
      }
    }
  }
);

command(
  { 
      pattern: "allplug", 
      fromMe: true, 
      desc: "plugin list",
      type:'user'},
  async (message, match) => {
    var mesaj = "";
    var plugins = await PluginDB.findAll();
    if (plugins.length < 1) {
      return await message.sendMessage("*_No external plugins installed_*");
    } else {
      plugins.map((plugin) => {
        mesaj +=
          "```" +
          plugin.dataValues.name +
          "```: " +
          plugin.dataValues.url +
          "\n";
      });
      return await message.sendMessage(mesaj);
    }
  }
);

command(
  {
    pattern: "remove(?: |$)(.*)",
    fromMe: true,
    desc: "Remove external plugins",
    type:'user'
  },
  async (message, match) => {
    if (!match) return await message.sendMessage("*_Need a plugin name_*");

    var plugin = await PluginDB.findAll({ where: { name: match } });

    if (plugin.length < 1) {
      return await message.sendMessage("*_Plugin not found_*");
    } else {
      await plugin[0].destroy();
      delete require.cache[require.resolve("./" + match + ".js")];
      fs.unlinkSync("./plugins/" + match + ".js");
      await message.sendMessage(`*_Plugin ${match} deleted, restart_*`);
    }
  }
);

