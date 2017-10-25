// Simple SpaceShooter (Extra web lab) by Anton Kozyrev KM-62

var shootBullet = false;
var barrer_limit = 30; // 30 by default
var health_points = [];
var bullets = [];
var enemy_bullets = [];
var meteors = [];
var enemy_shoot_cooldown = 30;
var EnemyCooldownTicker = 0;
var shoot_cooldown = 15; // 1.5 sec of reloading weapon
var frame_rate = 50;
var meteorcooldown = 0;
var MeteorSpawnerTicker = 0;
var CooldownTicker = 0;
var bullet_speed = 15;
var enemy_bullet_speed = 5;
var meteor_speed = 5;
var ufo_Xspeed = 1;
var ufo_Yspeed = 3;
var game_period = 0;
var use_crossair = false;
var ufo_spawned = false;

function rect(color, x, y, width, height) {
    this.color = color;
    this.x = x;
    this.y = y; 
    this.width = width;
    this.height = height; 
    this.draw = function() {
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.width, this.height);
    };
}

function circlecollision(objA, objB) {
    if (!(((Math.abs((objA.y + objA.radius) - (objB.y))) > 2 * objA.radius) || ((Math.abs((objB.y - objB.radius) - (objA.y - objA.radius))) > 2 * objA.radius)) && (objA.x + objA.width > objB.x && objA.x < objB.x + objB.width))
	{
        return true;
    }
    else {
        return false;
    }
}

function CircleAndTriangleCollision(objA, objB) {
    if ((objA.x + objA.difX1 > objB.x && objA.x - objA.difX1 < objB.x) && (objA.y + objA.difY2 > objB.y - objB.radius && objB.y + objB.radius > objA.y + objA.difY2)) {
        return true;
    }
    else {
        return false;
    }
}

function circle(color, x, y, radius, isStroked) {
	this.color = color;
	this.x = x;
    this.y = y; 
	this.width = radius;
	this.height = radius;
    this.radius = radius;
	this.draw = function() {
        context.beginPath();
		context.arc(this.x, this.y, this.radius, 0, 2*Math.PI, false);
		context.fillStyle = this.color;
		context.fill();
		context.closePath();
		if (isStroked) 
		{
			context.strokeStyle = this.color;
			context.stroke();
		}
    };
}

function triangle(color, x1, y1, x2, y2, x3, y3){
	this.color = color;
	
	this.x = (x1 + x2 + x3) / 3;
    this.y = (y1 + y2 + y3) / 3;
	
	this.x1 = x1;
	this.x2 = x2;
	this.x3 = x3;
	this.y1 = y1;
	this.y2 = y2;
	this.y3 = y3;
	
	this.difY1 = y1 - this.y;
	this.difY2 = y2 - this.y;
	this.difY3 = y3 - this.y;
	
	this.difX1 = x1 - this.x;
	this.difX2 = x2 - this.x;
	this.difX3 = x3 - this.x;
	
	this.lowborder = Math.min(this.y1, this.y2, this.y3);
	this.highborder = Math.max(this.y1, this.y2, this.y3);
	this.draw = function() {
		context.beginPath();
		context.moveTo(x1, this.y1);
		context.lineTo(x2, this.y2);
		context.lineTo(x3, this.y3);
		context.fillStyle = this.color;
		context.fill();
    };
}

function rectcollision(objA, objB) {
    if (objA.x + objA.width > objB.x && objA.x < objB.x + objB.width && objA.y + objA.height > objB.y && objA.y < objB.y + objB.height) {
        return true;
    }
    else {
        return false;
    }
}

function ImageObject(source, x, y, width, height) {
	this.img = new Image();
	this.img.src = source;
	this.draw = function() {
		context.drawImage(this.img, x, y, width, height);
    };
}

function ImageRect(source, x, y, width, height) {
	let IMGwidth, IMGheight; 
	var img = new Image();
	img.src = source;
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	/*
	img.onload = function(){
		IMGwidth = img.width;
		IMGheight = img.height;	
	}
	*/
	this.draw = function() {
		context.drawImage(img, this.x, this.y, this.width, this.height);
	}
}

function playerMove(e) {
    if (start) {
		
		var x = e.pageX;
		var y = e.pageY;
		
		if ((y < game.y + game.height - player.height / 2 - barrer_limit) && (y > game.y  + player.height / 2 + barrer_limit))
		player.y = y - (player.height / 2);
	
		crossair.x = x - (crossair.width / 2);
		crossair.y = y - (crossair.height / 2);
    }
}

function startGame() {
    if (!start) {
		for (var i = 0; i < 3; i++)
		{
		var temporary_point = new ImageRect('images/playerLife.png', game.x + 5 + 35 * i, game.y + 5, 33, 26)
		health_points.push(temporary_point);
		}
		meteorcooldown = getRandomInt(20, 100);
        start = true;
    }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function draw() {
    game.draw();
	BGround.draw();
	player.draw();
	enemy_ufo.draw();
	
	for (var i = 0; i < health_points.length; i++) health_points[i].draw();
	
	for (var i = 1; i < meteors.length; i++) meteors[i].draw();
	
	for (var i = 0; i < bullets.length; i++) bullets[i].draw();
	
	for (var i = 0; i < enemy_bullets.length; i++) enemy_bullets[i].draw();
	
	if (use_crossair) crossair.draw();
	
    if (!start) {
        context.fillStyle = '#ccc';
        context.fillText("Click to start", game.width / 2, game.height / 2 - 50);
        context.font = '16px Courier';
        context.textBaseline = 'top';
		context.textBaseline = 'bottom';
        context.fillStyle = '#ccc';
        context.fillText("By A.Kozyrev FPM KM-62", game.width / 2 - 30, game.height / 2 - 30);
		context.font = '16px Courier';
		context.textBaseline = 'bottom';
		shootBullet = false;
    }
	else if (start)
	{	
		canvas.onclick = function()
		{
			if (!start)
			{
				startGame();
			}
			else if (!shootBullet && start)
			{
				shootBullet = true;
				var temporary_bullet = new ImageRect('images/laserBlue01.png', player.x + 40, player.y + player.height / 2 - 5, 54, 9)
				bullets.push(temporary_bullet);
			}
		}
	}
}

function spawnMeteor() {
	var temporary_meteor;
	var type = getRandomInt(1, 7);	
	switch (type)
	{
		case 1:
			temporary_meteor = new ImageRect('images/meteorGrey_big1.png', game.x + game.width, game.y + getRandomInt(barrer_limit + game.y + player.height / 2, game.height - player.height / 2 - barrer_limit), 101, 84);
			break;
		case 2:
			temporary_meteor = new ImageRect('images/meteorGrey_big2.png', game.x + game.width, game.y + getRandomInt(barrer_limit + game.y + player.height / 2, game.height - player.height / 2 - barrer_limit), 120, 98);
			break;
		case 3:
			temporary_meteor = new ImageRect('images/meteorGrey_med1.png', game.x + game.width, game.y + getRandomInt(barrer_limit + game.y + player.height / 2, game.height - player.height / 2 - barrer_limit), 43, 43);
			break;
		case 4:
			temporary_meteor = new ImageRect('images/meteorGrey_med2.png', game.x + game.width, game.y + getRandomInt(barrer_limit + game.y + player.height / 2, game.height - player.height / 2 - barrer_limit), 45, 40);
			break;
		case 5:
			temporary_meteor = new ImageRect('images/meteorGrey_small1.png', game.x + game.width, game.y + getRandomInt(barrer_limit + game.y + player.height / 2, game.height - player.height / 2 - barrer_limit), 28, 28);
			break;
		case 6:
			temporary_meteor = new ImageRect('images/meteorGrey_small2.png', game.x + game.width, game.y + getRandomInt(barrer_limit + game.y + player.height / 2, game.height - player.height / 2 - barrer_limit), 29, 26);
			break;
		case 7:
			temporary_meteor = new ImageRect('images/meteorGrey_big3.png', game.x + game.width, game.y + getRandomInt(barrer_limit + game.y + player.height / 2, game.height - player.height / 2 - barrer_limit), 89, 82);
			break;
	};
	meteors.push(temporary_meteor);
}

function spawnUFO() {
	enemy_ufo.x = game.x + game.width;
	enemy_ufo.y = game.y + game.height / 2;
}

function update() {
    context.fillStyle = '#ccc';
    context.fillText("Score:" + game.score + "  Maximum score:" + game.maxscore, 5, game.height);
    context.font = '16px Courier';
	
	if (start && !(ufo_spawned)) {
		if (MeteorSpawnerTicker > meteorcooldown)
		{
			spawnMeteor();
			MeteorSpawnerTicker = 0;
			meteorcooldown = getRandomInt(20, 80);
		}
		else 
		{
			MeteorSpawnerTicker++;
		}
	
		game_period++;
	}
	
	if ((parseInt(game_period / 1000) > 0) && (!(game_period % 1000)) && (!ufo_spawned))	{ufo_spawned = true; spawnUFO();}	// Every 100 seconds
	
	if (ufo_spawned)
	{
		// Shooting
		
		if (EnemyCooldownTicker > enemy_shoot_cooldown)
		{
			var temp_enemy_bullet = new ImageRect('images/laserRed07.png', enemy_ufo.x - enemy_ufo.width / 2 - 20, enemy_ufo.y + enemy_ufo.height / 2, 37, 9);
			enemy_bullets.push(temp_enemy_bullet);
			EnemyCooldownTicker = 0;
		}
		else
			EnemyCooldownTicker++;
		
		// Movement
		
		enemy_ufo.x -= ufo_Xspeed + parseInt(game_period / 1000);
		
		if (ufo_Yspeed < 0)	enemy_ufo.y -= ufo_Yspeed - parseInt(game_period / 1000);
		else	enemy_ufo.y -= ufo_Yspeed + parseInt(game_period / 1000);
		
		if (enemy_ufo.y + enemy_ufo.height > game.height)
		{	
			ufo_Yspeed = -ufo_Yspeed;
			enemy_ufo.y = game.height - enemy_ufo.height;
		}
		else if (enemy_ufo.y < game.y)
		{
			ufo_Yspeed = -ufo_Yspeed;
			enemy_ufo.y = game.y;
		}
		
		console.log(enemy_bullets.length);
	}
	
	for (var i = 0; i < enemy_bullets.length; i++)
	{
		if (enemy_bullets[i].x > game.x - enemy_bullets[i].width)	enemy_bullets[i].x -= enemy_bullet_speed + parseInt(game_period / 500);
		else enemy_bullets.splice(i, i);
	}
	
	for (var i = 0; i < enemy_bullets.length; i++)
	{
		if (rectcollision(player, enemy_bullets[i])) 
		{
			enemy_bullets.splice(i, i);
			health_points.pop();
		}
	}
	
	for (var i = 0; i < bullets.length; i++)
	{
		if ((rectcollision(bullets[i], enemy_ufo)) && (i !== 0)) {game.score += 1000; ufo_spawned = false;	enemy_ufo.x = game.x + game.width; bullets.splice(i, i);}
	}
	
	if ((enemy_ufo.x + enemy_ufo.width) < game.x) {ufo_spawned = false; enemy_ufo.x = game.x + game.width;}
	
	if (shootBullet)
	{	
		if (CooldownTicker > shoot_cooldown)
		{
			CooldownTicker = 0;
			shootBullet = false;
		}
		else 
		{
			CooldownTicker++;
		}
	}
	
	for (var i = 0; i < meteors.length; i++)
	{
		for (var j = 0; j < bullets.length; j++)
		{ 
				if (rectcollision(bullets[j], meteors[i])) 
				{
					if (i !== 0 && j !== 0) game.score += 200;
					bullets.splice(j, j);
					meteors.splice(i, i);
					break;
				}
		}
	}
	
	if (rectcollision(player, enemy_ufo)) 
	{
		ufo_spawned = false;
		enemy_ufo.x = game.x + game.width;
		health_points.pop();
	}
	
	for (var i = 1; i < meteors.length; i++)
	{
		if (rectcollision(player, meteors[i])) 
		{
			meteors.splice(i, i);
			health_points.pop();
		}
	}
	
	for (var i = 0; i < bullets.length; i++)
	{
		if (bullets[i].x < game.x + game.width)	bullets[i].x += bullet_speed;
		else bullets.splice(i, i);
	}
	
	for (var i = 0; i < meteors.length; i++)
	{
		if ((meteors[i].x > game.x - meteors[i].width)) meteors[i].x -= meteor_speed + parseInt(game_period / 500);
		else meteors.splice(i, i);
	}
	
	if (health_points.length <= 0)
	{
		while (meteors.length > 0) meteors.pop();
		while (bullets.length > 0) bullets.pop();
		if (game.score > game.maxscore) game.maxscore = game.score;
		game.score = 0;
		game_period = 0;
		ufo_spawned = false;
		enemy_ufo.x = game.x + game.width;
		start = false;
	}
}

function play() {
    draw();
    update(); 
}

function init() {
    start = false;
	
	game = new rect("#000", 0, 0, 480, 320);
    game.score = 0;
	game.maxscore = 0;
	
	var players_offset_x = 50;
	var players_offset_y = 50;
	
	BGround = new ImageObject('images/darkPurple.png', 0, 0, 480, 320);
	Frame = new ImageObject('images/darkPurple.png', 0, 0, 480, 320);
	player = new ImageRect('images/player.png', game.x + players_offset_x, game.y + players_offset_y, 50, 75);
	crossair = new ImageRect('images/crossair.png', 0, 0, 36, 36);
	enemy_ufo = new ImageRect('images/ufoRed.png', game.x + game.width, game.y + game.height, 70, 70);
	
    var canvas = document.getElementById("canvas");
    canvas.width = game.width;
    canvas.height = game.height;
    context = canvas.getContext("2d");
    canvas.onmousemove = playerMove;
    canvas.onclick = startGame;
    setInterval(play, 1000 / frame_rate);	// Main syncronizer
}