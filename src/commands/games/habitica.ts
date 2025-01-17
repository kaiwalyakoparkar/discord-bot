import CommandInt from "../../interfaces/CommandInt";
import {
  AchievementInt,
  HabiticaAchievementInt,
  HabiticaUserInt,
} from "../../interfaces/commands/HabiticaInt";
import axios, { AxiosResponse } from "axios";
import { MessageEmbed } from "discord.js";
import { beccaErrorHandler } from "../../utils/beccaErrorHandler";

const habitica: CommandInt = {
  name: "habitica",
  description: "Gets user profile information on the given <id>.",
  parameters: ["`<id>`: the user id of the profile to look up"],
  category: "game",
  run: async (message) => {
    try {
      const { Becca, channel, commandArguments } = message;

      // Get the next argument as the user id.
      const id = commandArguments.shift();

      // Check if the user id is not valid.
      if (!id) {
        await message.channel.send(
          "It would be nice if you told me the Habitica ID you want me to search for *before* you send me off on the hunt."
        );
        await message.react(message.Becca.no);
        return;
      }

      // Get the Habitica API key from the environment.
      const key = process.env.HABITICA_KEY || "Error finding key.";

      // Get the headers.
      const headers = {
        "x-client": "285a3335-33b9-473f-8d80-085c04f207bc-DiscordBot",
        "x-api-user": "285a3335-33b9-473f-8d80-085c04f207bc",
        "x-api-key": key,
      };

      // Get the user data from the Habitica API.
      let user: AxiosResponse<HabiticaUserInt> | null = null;
      try {
        user = await axios.get<HabiticaUserInt>(
          `https://habitica.com/api/v3/members/${id}`,
          { headers }
        );
      } catch (err) {
        if (err) {
          user = null;
        }
      }

      // Check if the user data result is not success.
      if (!user || !user.data || !user.data.success) {
        await message.channel.send(
          "I am afraid I come back empty handed. That user does not appear to exist."
        );
        await message.react(message.Becca.no);
        return;
      }

      const { auth, profile, stats } = user.data.data;

      const url = `https://habitica.com/profile/${id}`;

      // Create a new empty embed.
      const userEmbed = new MessageEmbed();

      // Add the light purple color.
      userEmbed.setColor(Becca.color);

      // Add the profile name to the embed title.
      userEmbed.setTitle(profile.name);

      // Add the user profile url to the embed title url.
      userEmbed.setURL(url);

      // Add the profile description to the embed description.
      userEmbed.setDescription(`@${auth.local.username}: Stats`);

      // Add the user class to an embed field.
      userEmbed.addField("Class", stats.class, true);

      // Add the user hp to an embed field.
      userEmbed.addField("HP", `${~~stats.hp}/${stats.maxHealth}`, true);

      // add the user mp to an embed field.
      userEmbed.addField("MP", `${stats.mp}/${stats.maxMP}`, true);

      // Add the user stats to an embed field.
      userEmbed.addField(
        "Stats",
        `STR: ${stats.str}, CON: ${stats.con}, INT: ${stats.int}, PER: ${stats.per}`
      );

      // Add the user experience to an embed field.
      userEmbed.addField(
        "Experience",
        `${stats.exp} - ${stats.toNextLevel} to reach the next level.`
      );

      // Add the user join date to an embed field.
      userEmbed.addField(
        "Join date",
        new Date(auth.timestamps.created).toLocaleDateString(),
        true
      );

      // Add the user last seen to an embed field.
      userEmbed.addField(
        "Last seen",
        new Date(auth.timestamps.loggedin).toLocaleDateString(),
        true
      );

      // Send the user embed to the current channel.
      await channel.send(userEmbed);

      // Get the user achievements data from the Habitica API.
      const achievements = await axios.get<HabiticaAchievementInt>(
        `https://habitica.com/api/v3/members/${id}/achievements`,
        { headers }
      );

      // Check if the user achievements data result is not success.
      if (!achievements.data.success) {
        await message.channel.send(
          "That user has not had any notable achievements."
        );
        await message.react(message.Becca.no);
        return;
      }

      const { basic, onboarding, seasonal, special } = achievements.data.data;

      // Convert the achievements list to an string list.
      const getAchievementList = (achievements: AchievementInt[]): string => {
        const list = achievements
          .filter((el) => el.earned)
          .map((el) => el.title)
          .join(", ");

        // Check if the list is not empty.
        if (list.length) {
          return list;
        } else {
          return "None";
        }
      };

      // Create a new empty embed.
      const achievementsEmbed = new MessageEmbed();

      // Add the light purple color.
      achievementsEmbed.setColor(Becca.color);

      // Add the profile name to the embed title.
      achievementsEmbed.setTitle(profile.name);

      // Add the user profile url to the embed title url.
      achievementsEmbed.setURL(url);

      // Add the profile description to the embed description.
      achievementsEmbed.setDescription(`@${auth.local.username}: Achievements`);

      // Add the basic achievements list to an embed field.
      achievementsEmbed.addField(
        "Basic achievements",
        getAchievementList(Object.values(basic.achievements))
      );

      // Add the onboarding achievements list to an embed field.
      achievementsEmbed.addField(
        "Onboarding achievements",
        getAchievementList(Object.values(onboarding.achievements))
      );

      // Add the seasonal achievements list to an embed field.
      achievementsEmbed.addField(
        "Seasonal achievements",
        getAchievementList(Object.values(seasonal.achievements))
      );

      // Add the special achievements list to an embed field.
      achievementsEmbed.addField(
        "Special achievements",
        getAchievementList(Object.values(special.achievements))
      );

      // Send the achievements embed to the current channel.
      await channel.send(achievementsEmbed);

      // Create a new empty embed.
      const questsEmbed = new MessageEmbed();

      // Add the light purple color.
      questsEmbed.setColor(Becca.color);

      // Add the profile name to the embed title.
      questsEmbed.setTitle(profile.name);

      // Add the user profile url to the embed title url.
      questsEmbed.setURL(url);

      // Add the profile description to the embed description.
      questsEmbed.setDescription(`@${auth.local.username}: Quests`);

      // Get the user quests.
      const quests = Object.values(user.data.data.achievements).sort();

      // Get the middle length of the quests.
      const middle = ~~(quests.length / 2);

      // Add the first middle of the quests to an embed field.
      questsEmbed.addField("Quests", quests.slice(0, middle).join(", "));

      // Add the second middle of the quests to an embed field.
      questsEmbed.addField("More quests", quests.slice(middle).join(", "));

      // Send the quests embed to the current channel.
      await channel.send(questsEmbed).catch(async () => {
        await message.channel.send(
          "That user has completed too many quests. I cannot possibly keep track of all of them."
        );
        await message.react(message.Becca.no);
        return;
      });
      await message.react(message.Becca.yes);
    } catch (error) {
      await beccaErrorHandler(
        error,
        message.guild?.name || "undefined",
        "habitica command",
        message.Becca.debugHook,
        message
      );
    }
  },
};

export default habitica;
