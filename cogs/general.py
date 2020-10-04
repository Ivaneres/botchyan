import discord
from discord.ext import commands


class General(commands.Cog):

    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    async def whois(self, ctx, member: discord.Member):
        for member in self.bot.get_all_members():
            print(member)
        await ctx.send("test")


def setup(bot):
    bot.add_cog(General(bot))
