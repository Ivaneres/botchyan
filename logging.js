module.exports = {
    logDate: function(string) {
        var date = new Date().toISOString().replace("T", " ").substring(0, 19);
        console.log("[" + date + "] " + string);
    }
}