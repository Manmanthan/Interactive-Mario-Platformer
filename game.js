let config = {
    type: Phaser.AUTO,

    scale: {
        mode: Phaser.Scale.FIT,
        width: 800,
        height: 600,
    },

    backgroundColor: 0xffff11,

    physics: {
        default: "arcade",
        arcade: {
            gravity: {
                y: 1000,
            },
            debug:false,
        }
    },

    scene: {
        preload: preload,
        create: create,
        update: update,
    },
};


let game = new Phaser.Game(config);

let player_config = {
    player_speed:150,
    player_jumpspeed:-600,
}



// GameLoop Functions


function preload() {
    this.load.image("ground", "Assets/topground.png");
    this.load.image("sky", "Assets/background.png");
    this.load.image("apple", "Assets/apple.png");
    this.load.image("ray", "Assets/ray.png");
    this.load.spritesheet("dude", "Assets/dude.png", {
        frameWidth: 32,
        frameHeight: 48
    });

}


function create() {
    W = game.config.width;
    H = game.config.height;

    // Add tile sprites
    let ground = this.add.tileSprite(0, H - 128, W, 128, "ground");
    ground.setOrigin(0, 0);

    // Create background
    let background = this.add.sprite(0, 0, "sky");
    background.setOrigin(0, 0);
    background.displayWidth = W;
    background.depth = -2;
    
    // Create rays on the top of the background
    let rays = [];
    for(let i = -10; i <= 10;i++) {
        let ray = this.add.sprite(W/2,H-100,"ray");
        ray.displayHeight = 1.5 * H;
        ray.setOrigin(0.5,1);
        ray.alpha = 0.2;
        ray.angle = i*10;
        ray.depth = -1;
        rays.push(ray);
    }
    
    // Tween
    this.tweens.add({
        targets:rays,
        props:{
            angle:{
                value:"+=20"
            },
        },
        duration:6000,
        repeat:-1,
    });
    

    // Create player
    this.player = this.physics.add.sprite(100, 100, "dude", 4);
    console.log(this.player);
    // Set the bounce values for the player
    this.player.setBounce(0.3);
    this.player.setCollideWorldBounds(true);
    // Player animations and player movements
    this.cursors = this.input.keyboard.createCursorKeys();
    this.anims.create({
        key:"left",
        frames:this.anims.generateFrameNumbers("dude",{start:0,end:3}),
        frameRate:10,
        repeat:-1,
    });
    this.anims.create({
        key:"right",
        frames:this.anims.generateFrameNumbers("dude",{start:5,end:8}),
        frameRate:10,
        repeat:-1,
    });
    this.anims.create({
        key:"center",
        frames:this.anims.generateFrameNumbers("dude",{start:4,end:4}),
        frameRate:10,
    });
    
    
    
    // Create apple
    let fruits = this.physics.add.group({
        key:"apple",
        repeat:8,
        setScale:{x:0.2,y:0.2},
        setXY:{x:10,y:0,stepX:100}
    });    
    // Add bouncing effect to all the apples
    fruits.children.iterate(function(f){
        f.setBounce(Phaser.Math.FloatBetween(0.4,0.7));
    });
    
    
    // Create more platforms
    let platforms = this.physics.add.staticGroup();
    platforms.create(600,350,"ground").setScale(2,0.5).refreshBody();
    platforms.create(600,150,"ground").setScale(2,0.5).refreshBody();
    platforms.create(200,250,"ground").setScale(2,0.5).refreshBody();
    platforms.add(ground);
    
    
    // Add physics to the ground
    this.physics.add.existing(ground);
    ground.body.allowGravity = false;
    console.log(ground);
    ground.body.immovable = true;
    
    
    // Add collision detection between player and ground
    this.physics.add.collider(ground,this.player);
    this.physics.add.collider(platforms,this.player);
//    this.physics.add.collider(ground,fruits);
    this.physics.add.collider(platforms,fruits);
    this.physics.add.overlap(this.player,fruits,eatFruit,null,this);
    
    // Create Cameras
    this.cameras.main.setBounds(0,0,W,H);
    this.physics.world.setBounds(0,0,W,H);
    this.cameras.main.startFollow(this.player,true,true);
    this.cameras.main.setZoom(1.5);
}


function update() {
    if(this.cursors.left.isDown){
        this.player.setVelocityX(-player_config.player_speed);
        this.player.anims.play("left",true);
    }else if(this.cursors.right.isDown){
        this.player.setVelocityX(player_config.player_speed);
        this.player.anims.play("right",true);
    }else{
        this.player.setVelocityX(0);
        this.player.anims.play("center",true);
    }
    
    // Add jumping ability and stop the player when in air
    if(this.cursors.up.isDown && this.player.body.touching.down){
        this.player.setVelocityY(player_config.player_jumpspeed);
    }
}

function eatFruit(player,fruit){
    fruit.disableBody(true,true);
}
