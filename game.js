function initializeGame() {

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

    function collectCoin(player, coin) {
        coin.disableBody(true, true);
        ++(this.score);
        this.scoreText.setText("Coins: " + this.score.toString() + " / " + this.maxCoins.toString());
    }

    function hitSpike(player, spike) {
        this.resetGame();
    }

    function hitLava(player, lava) {
        this.resetGame();
    }

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
        this.load.tilemapTiledJSON("map", "maps/map_1.json");
    }

    function create() {
        this.resetGame = resetGame;
        this.collectCoin = collectCoin;
        this.hitSpike = hitSpike;
        this.hitLava = hitLava;
        this.reachGoal = reachGoal;

        var map = this.make.tilemap({ key: "map" });
        var tileset = map.addTilesetImage("tiles", "tiles");

        var platforms = map.createStaticLayer("Platforms", tileset);
        platforms.setCollisionByExclusion(-1, true);

        var spikes = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });

        var spikeObjects = map.getObjectLayer("Spikes")["objects"];
        var spikeObject;
        for(var i = 0; i < spikeObjects.length; ++i) {
            spikeObject = spikes.create(spikeObjects[i].x, spikeObjects[i].y - spikeObjects[i].height, "spike").setOrigin(0, 0);
            spikeObject.body.setSize(spikeObject.width, spikeObject.height - 8).setOffset(0, 8);
        }

        var lava = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });

        var lavaObjects = map.getObjectLayer("Lava")["objects"];
        var lavaObject;
        for(var i = 0; i < lavaObjects.length; ++i) {
            lavaObject = lava.create(lavaObjects[i].x, lavaObjects[i].y - lavaObjects[i].height, "lava").setOrigin(0, 0);
        }

        this.coins = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });

        this.maxCoins = 0;
        var coinObjects = map.getObjectLayer("Coins")["objects"];
        var coinObject;
        for(var i = 0; i < coinObjects.length; ++i) {
            coinObject = this.coins.create(coinObjects[i].x, coinObjects[i].y - coinObjects[i].height, "coin").setOrigin(0, 0);
            coinObject.body.setSize(coinObject.width - 8, coinObject.height - 7).setOffset(4, 4);
            ++(this.maxCoins);
        }

        var goals = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });

        var goalObjects = map.getObjectLayer("Goals")["objects"];
        var goalObject;
        for(var i = 0; i < goalObjects.length; ++i) {
            goalObject = goals.create(goalObjects[i].x, goalObjects[i].y - goalObjects[i].height, "goal").setOrigin(0, 0);
            goalObject.body.setSize(spikeObject.width - 15, spikeObject.height).setOffset(8, 0);
        }

        var y;
        for(y = 0; y < map.height; ++y) {
            if(map.getTileAt(0, y, true).index != -1) {
                break;
            }
        }

        this.startY = (y - 1) * map.tileHeight;

        this.player = this.physics.add.sprite(0, this.startY, "frog");
        this.player.setCollideWorldBounds(true);

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
        this.physics.world.setBounds(0, 0, map.width * map.tileWidth, map.height * map.tileHeight);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.cameras.main.startFollow(this.player);
        this.score = 0;
        this.won = false;
        this.scoreText = this.add.text(8, 8, "Coins: 0 / " + this.maxCoins.toString(), { font: "12px Arial", fill: "#ffffff" });
        this.scoreText.setScrollFactor(0);

        var screenCenterX = this.cameras.main.width >> 1;
        var screenCenterY = this.cameras.main.height >> 1;
        this.winText = this.add.text(screenCenterX, screenCenterY - 30, "You Won!", { font: "48px Arial", fill: "#ffffff", align: "center" });
        this.winText.setOrigin(0.5, 0.5);
        this.winText.setScrollFactor(0);
        this.winText.setVisible(false);

        this.winCoinText = this.add.text(screenCenterX, screenCenterY + 10, "0 of " + this.maxCoins.toString() + " coins collected!", { font: "16px Arial", fill: "#ffffff", align: "center" });
        this.winCoinText.setOrigin(0.5, 0.5);
        this.winCoinText.setScrollFactor(0);
        this.winCoinText.setVisible(false);

        this.replayText = this.add.text(screenCenterX, screenCenterY + 35, "Press space to play again...", { font: "18px Arial", fill: "#ffffff", align: "center" });
        this.replayText.setOrigin(0.5, 0.5);
        this.replayText.setScrollFactor(0);
        this.replayText.setVisible(false);
    }

    function update() {
        if(this.won) {
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
            // Check if spacebar is down and if player is touching the ground
            // Set player velocity to 470 in -y direction if yes
            if(this.player.body.blocked.right) {
                this.resetGame();
            }
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