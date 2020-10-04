import json

import discord
from discord.ext import commands

from context import BotchyanContext
from verification import UserVerification
from dotenv import load_dotenv
from os import environ, listdir
import logging

logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(message)s')


class Botchyan(commands.Bot):

    def __init__(self, config_path, members_path, **kwargs):
        load_dotenv("./key.env")
        self.config = Botchyan.load_config(config_path)
        self.verification = UserVerification(members_path)
        super().__init__(**kwargs, command_prefix=self.config["prefix"])
        self.load_cogs("./cogs")
        logging.info("Bot started")

    @staticmethod
    def load_config(path):
        with open(path) as fp:
            return json.load(fp)

    def load_cogs(self, path):
        for file in listdir(path):
            if not file.endswith(".py") or file.startswith("__init__"):
                continue
            self.load_extension(f"{path.replace('./', '')}.{file.replace('.py', '')}")

    async def get_context(self, message, *, cls=BotchyanContext):
        """
        when you override this method, you pass your new Context subclass to the super() method, which tells the bot to
        use the new MyContext class
        """
        return await super().get_context(message, cls=cls)

    async def on_reaction_add(self, reaction, user):
        """
        This does not work for messages that are no longer in Discord's cache. If there are issues with the bot not
        responding to user's reactions after a long period of time, use on_raw_reaction_add()
        """
        await self.verification.process_reaction(reaction, user)

    async def on_command_error(self, context, exception):
        if isinstance(exception, commands.CommandNotFound):
            return
        if isinstance(exception, commands.MissingRequiredArgument):
            await context.send(f"Missing argument `{exception.param.name}`")
            return
        if isinstance(exception, commands.MemberNotFound) or isinstance(exception, commands.UserNotFound):
            await context.send(str(exception))
            return
        raise exception


intents = discord.Intents.default()
intents.members = True
bot = Botchyan("./config/settings.json", "./whois.json", owner_id=191948412650913802, intents=intents)
bot.run(environ.get("BOT_TOKEN"))
