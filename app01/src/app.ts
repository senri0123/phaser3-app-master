import "phaser";
import { GameConfig } from "./config"

window.addEventListener("load", () => {
    let text = "";
    if (GameConfig.title) {
        text += GameConfig.title;
    }
    text += ":";
    if (GameConfig.version) {
        text += GameConfig.version;
    }

    console.log(text);
    var game: Phaser.Game = new Phaser.Game(GameConfig);
});

