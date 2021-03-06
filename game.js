function initializeGame() {

    // Reset the game when a player loses or restarts
    function resetGame() {
        this.player.body.setAllowGravity(true);
        this.player.setX(0);
        this.player.setY(this.startY);
        this.score = 0;
        this.scoreText.setText("Coins: 0 / " + this.maxCoins.toString());
        var coinObjects = this.coins.getChildren();
        for(var i = 0; i < coinObjects.length; ++i) {
            coinObjects[i].enableBody(false, 0, 0, true, true);
        }
        this.won = false;
        this.winText.setVisible(false);
        this.winCoinText.setVisible(false);
        this.replayText.setVisible(false);
    }

    // Update the score when a player collects a coin
    function collectCoin(player, coin) {
        coin.disableBody(true, true);
        ++(this.score);
        this.scoreText.setText("Coins: " + this.score.toString() + " / " + this.maxCoins.toString());
    }

    // Reset the game when a player hits a spike
    function hitSpike(player, spike) {
        this.resetGame();
    }

    // Reset the game when a player hits lave
    function hitLava(player, lava) {
        this.resetGame();
    }

    // Reset the game when a player reaches the goal
    function reachGoal(player, goal) {
        this.winText.setVisible(true);
        this.winCoinText.setText("Coins: " + this.score.toString() + " of "  + this.maxCoins.toString() + " coins collected!");
        this.winCoinText.setVisible(true);
        this.replayText.setVisible(true);
        this.won = true;
    }

    function preload() {
        this.load.spritesheet("frog", "assets/frog.png", { frameWidth: 16, frameHeight: 16 });
        this.load.image("tiles", "assets/tiles.png");
        this.load.image("coin", "assets/coin.png");
        this.load.image("goal", "assets/goal.png");
        this.load.image("lava", "assets/lava.png");
        this.load.image("spike", "assets/spike.png");

        // TODO:
        // Change map_example.json to a map of your choice
        this.load.tilemapTiledJSON("map", "maps/map_example.json");
    }

    function parseObjects(group, name, x, y, offsetX, offsetY, spriteName) {
        var mapObjects = this.map.getObjectLayer(name)["objects"];
        var mapObject;
        for(var i = 0; i < mapObjects.length; ++i) {
            mapObject = group.create(mapObjects[i].x, mapObjects[i].y - mapObjects[i].height, spriteName).setOrigin(0, 0);
            if(name != "Lava") mapObject.body.setSize(mapObject.width - x, mapObject.height - y).setOffset(offsetX, offsetY);
            if(name == "Coins") ++(this.maxCoins);
        }
    }

    function create() {
        // Add all collision handlers to the game object
        this.resetGame = resetGame;
        this.collectCoin = collectCoin;
        this.hitSpike = hitSpike;
        this.hitLava = hitLava;
        this.reachGoal = reachGoal;

        this.parseObjects = parseObjects;

        // Parse the map
        this.map = this.make.tilemap({ key: "map" });
        var tileset = this.map.addTilesetImage("tiles", "tiles");

        this.platforms = this.map.createStaticLayer("Platforms", tileset);
        this.platforms.setCollisionByExclusion(-1, true);

        // Add the different categories in-game objects
        this.spikes = this.physics.add.group({ allowGravity: false, immovable: true });
        this.lava = this.physics.add.group({ allowGravity: false, immovable: true });
        this.coins = this.physics.add.group({ allowGravity: false, immovable: true });
        this.goals = this.physics.add.group({ allowGravity: false, immovable: true });

        this.maxCoins = 0;

        // Add all of the tiled objects
        this.parseObjects(this.spikes, "Spikes", 0, 8, 0, 8, "spike");
        this.parseObjects(this.lava, "Lava", 0, 0, 0, 0, "lava");
        this.parseObjects(this.coins, "Coins", 8, 7, 4, 4, "coin");
        this.parseObjects(this.goals, "Goals", 15, 0, 8, 0, "goal");

        // Calculate a good starting position (highest platform at x = 0)
        for(this.startY = 0; this.startY < this.map.height; ++(this.startY)) {
            if(this.map.getTileAt(0, this.startY, true).index != -1) break;
        }
        this.startY = (this.startY - 1) * this.map.tileHeight;

        // Add the player to the game
        this.player = this.physics.add.sprite(0, this.startY, "frog");
        this.player.setCollideWorldBounds(true);

        // Create an animation from the spritesheet
        this.anims.create({
            key: "moving",
            frames: this.anims.generateFrameNumbers("frog", { start: 0, end: 2 }),
            frameRate: 10,
            repeat: -1
        });

        // TODO:
        // Add player collision with platforms
        // Add player collision with spikes and call hitSpike()
        // Add player collision with lava and call hitLava()
        // Add player overlap with coins and call collectCoin()
        // Add player overlap with goals and call reachGoal()
        this.physics.world.setBounds(0, 0, this.map.width * this.map.tileWidth, this.map.height * this.map.tileHeight);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.cameras.main.startFollow(this.player);

        // Add the text for coins collected
        this.scoreText = this.add.text(8, 8, "Coins: 0 / " + this.maxCoins.toString(), { font: "12px Arial", fill: "#ffffff" });
        this.scoreText.setScrollFactor(0);

        var screenCenterX = this.cameras.main.width >> 1;
        var screenCenterY = this.cameras.main.height >> 1;

        // Create win screen text
        this.winText = this.add.text(screenCenterX, screenCenterY - 30, "You Won!", { font: "48px Arial", fill: "#ffffff", align: "center" });
        this.winText.setOrigin(0.5, 0.5).setScrollFactor(0).setVisible(false);

        this.winCoinText = this.add.text(screenCenterX, screenCenterY + 10, "0 of " + this.maxCoins.toString() + " coins collected!", { font: "16px Arial", fill: "#ffffff", align: "center" });
        this.winCoinText.setOrigin(0.5, 0.5).setScrollFactor(0).setVisible(false);

        this.replayText = this.add.text(screenCenterX, screenCenterY + 35, "Press space to play again...", { font: "18px Arial", fill: "#ffffff", align: "center" });
        this.replayText.setOrigin(0.5, 0.5).setScrollFactor(0).setVisible(false);

        // Reset the score & win variables
        this.score = 0;
        this.won = false;
    }

    function update() {
        if(this.won) { // If the player has won, keep them still until they press space
            this.player.setVelocityX(0);
            this.player.setVelocityY(0);
            this.player.body.setAllowGravity(false);
            if(this.cursors.space.isDown) {
                this.resetGame();
            }
        } else {
            // TODO:
            // Add player animation "moving"
            // Set player velocity to 250 in +x direction
            // Check if the up arrow key is down and if player is touching the ground
            // Set player velocity to 470 in -y direction if yes
            // Check if a player runs into the wall, then reset the game
        }
    }

    var config = {
        type: Phaser.AUTO,
        backgroundColor: "#000000",
        scale: {
            mode: Phaser.Scale.FIT,
            parent: "game-container",
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 400,
            height: 300
        },
        physics: {
            default: "arcade",
            arcade: {
                gravity: { y: 2000 },
                debug: false
            }
        },
        scene: {
            preload,
            create,
            update,
        }
    };

    var game = new Phaser.Game(config);
}
window.addEventListener("load", initializeGame);