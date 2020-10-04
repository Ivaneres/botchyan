const settings = require("../settings.json");

module.exports = {
    getRoleStats: async (client) => {
        const guild = client.guilds.resolve(settings.guild);
        const members = await guild.members.fetch();
        const roleStats = {};
        for (const roleName in settings.roles) {
            const role = await guild.roles.fetch(settings.roles[roleName]);
            roleStats[role.name] = members.filter(m => m.roles.cache.has(role.id)).array().length;
        }
        return roleStats;
    }
}