const fs = require("fs");
const logFile = "./log.txt";

module.exports = {
    log: function(string) {
        let date = new Date().toISOString().replace("T", " ").substring(0, 19);
        let logString = "[" + date + "] " + string;
        console.log(logString);
        let file = fs.readFileSync(logFile, "utf8");
        if (file.split("\n").length > 1000) {
            file = "";
        }
        file += logString + "\n";
        fs.writeFileSync(logFile, file);
    },
    insertBreak: function() {
        let file = fs.readFileSync(logFile, "utf8");
        file += `\n---------------------------------------------------------------------------------\n\n`;
        fs.writeFileSync(logFile, file);
    }
}