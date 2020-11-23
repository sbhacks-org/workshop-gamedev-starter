function preload() {
    this.load.spritesheet("frog", "assets/frog.png", { frameWidth: 16, frameHeight: 16 });
    this.load.image("tiles", "assets/tiles.png");
    this.load.image('spike', 'assets/images/goal.png');
    this.load.image('spike', 'assets/images/lava.png');
    this.load.image('spike', 'assets/images/spike.png');
    this.load.tilemapTiledJSON("map", "maps/map_example.json");
}

function create() {
    var map = this.make.tilemap({ key: "map" });
    var tileset = map.addTilesetImage("tiles", "tiles");

    var platforms = map.createStaticLayer("Platforms", tileset);
    platforms.setCollisionByExclusion(-1, true);

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

    this.physics.add.collider(this.player, platforms);
    this.physics.world.setBounds(0, 0, map.width * map.tileWidth, map.height * map.tileHeight);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.cameras.main.startFollow(this.player);
}

function resetGame(player, y) {
    player.setX(0);
    player.setY(y);
}

function update() {
    this.player.anims.play("moving", true);
    this.player.setVelocityX(250);
    if(this.cursors.space.isDown && this.player.body.blocked.down) {
        this.player.setVelocityY(-470);
    }
    if(this.player.body.blocked.right) {
        resetGame(this.player, this.startY);
    }
}

var config = {
    type: Phaser.AUTO,
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