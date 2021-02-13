// Main Game Script;
// Version: 1.4c

 
var Langs = {}, L = {}
function load_langs(){
	folder$("common/lang").eachFile(function(f){
		eval( "Langs['" + f.baseName() + "']="+f.read() )
	},"json")
}
load_langs()

L = Langs.ru;

//ENGINE
var 
	keypr = [],
	max_money = 100000,
	weapons = {},
	settings = oldf.data("data/settings.dat"),
	weapons_count = 0,
	
	sound = true, paused = false, in_game  = false,
	
	player = [],
	standing = [], is_dead = [],
	can_move = [], can_shot = [],
	delay = [], is_shooting = [],
	dominating = [,0,0],
	seat_t = [], stand_t = [], spread = [],
	max_hp = 100,
	hp = [, max_hp, max_hp],
	money = [,0,0],
	winner = 0,
	clip_shots = [,0,0],
	
	win = [,0,0], rounds = 1, round_shots = [,0,0],
	round_limit = 0, win_limit = 0,
	
	ammo = [], wpsh = [],
	shots = [,0,0], damage = [,0,0],
	default_weapon = "glock",
	
	weapon = [],
	curr_weapon = [], weapons_by_price = [],
	has_weapons = [, {}, {}],
	shock_t = [];
	

	
// Math
		var max = Math.max,
			min = Math.min,
			abs = Math.abs;
	
read_weapon_data();
//bots
var bot = {};
var bots = [[], [], [], [], []];
var BOTS_COUNT = 0;
var bot_enabled = [];
var T = true, F = false;
for(var i in settings)
	for(var j in settings[i])
		settings[i][j] = String(settings[i][j]).split(/,[\s]*/)
var sett = [];	
sett[1] = settings.First
sett[2] = settings.Second

function iskeypr(ar){
	ar = $.map(ar, function(v){ return "keypr["+v+"]" })
	return eval(ar.join("||"))
}


$( document.body ).bind({
	keydown: function(){
		keypr[event.keyCode] = true
		if(keypr[17]&&keypr[70])
		return false;
	},
	keyup: function(e){
		e = event.keyCode;
		keypr[e] = false
		if(e == 27)pause_toggle()
		if(intro_active && e != 116)intro_end()
	}
})

{//#KEYS
var keys_t = setInterval(function(){
	if(in_game){
		if( !bot_enabled[1] ) {
		if(iskeypr(sett[1].Stand) && !iskeypr(sett[1].Seat))stand(1);
		if(iskeypr(sett[1].Seat) && !iskeypr(sett[1].Stand))seat(1)
		if(iskeypr(sett[1].Shot))shot(1)
		if(iskeypr(sett[1].Reload))reload(1)
		if(!iskeypr(sett[1].Shot))wpsh[1] = false;
		//#BUYING 1
		for(var i=49; i<min(58, 58+weapons_count); i++)
			if( keypr[i] )buy_weapon(weapons[i-49].key, 1)
				
		buymenu(1, iskeypr(sett[1].BuyMenu))
		}
		else wpsh[1] = false;


		if( !bot_enabled[2] ) {
		if(iskeypr(sett[2].Stand) && !iskeypr(sett[2].Seat))stand(2);
		if(iskeypr(sett[2].Seat) && !iskeypr(sett[2].Stand))seat(2)
		if(iskeypr(sett[2].Shot))shot(2)
		if(iskeypr(sett[2].Reload))reload(2)
		if(!iskeypr(sett[2].Shot))wpsh[2] = false;
		//#BUYING 1
		for(var i=97; i<min(106, 97+weapons_count); i++)
			if( keypr[i] )buy_weapon(weapons[i-97].key, 2)
				
		buymenu(2, iskeypr(sett[2].BuyMenu))
		}
		else wpsh[2] = false;
	}
	if(keypr[192]){
		console();
		keypr = [];
		return false;
	}
},1)

//BLOCK_END
//#LOADING_DATA
function read_weapon_data(){
	var ar = file$("data/weapons.dat").read().split(/weapon[\.]+End/)[0].split(/[\s]*end[\s]*/gi)
	var nm;
	for(var i=0; i<ar.length; i++){
		ar[i] = ar[i].replace(/^weapon\s/i,"").split("\n")
		nm = ar[i][0] = ar[i][0].toLowerCase()
		weapons[ nm ] = {anim:{},sound:{}, key: nm}
		weapons[ i ] = weapons[nm]
		for(var j=1; j<ar[i].length; j++){
			ar[i][j] = ar[i][j].replace(/^\s/,"").replace(/[\s]*:[\s]*/,":")
			var p = ar[i][j].split(":")
			if( p.length == 2 ){
			if( /^maxdmg$/i.test(p[0]) )weapons[ nm ].max_damage = +p[1]
			else if( /^mindmg$/i.test(p[0]) )weapons[ nm ].min_damage = +p[1]
			else if( /^reload$/i.test(p[0]) )weapons[ nm ].anim.reloadTime = +p[1]
			else weapons[ nm ][ p[0].toLowerCase() ] = isNaN(p[1]) ? p[1] : +p[1]
			}
		}

		weapons[ nm ].anim.stand = "src/" + nm + "/stand1.gif"
		weapons[ nm ].anim.seat = "src/" + nm + "/seat1.gif"
		weapons[ nm ].anim.shot = "src/" + nm + "/shot1.gif"
		weapons[ nm ].anim.reload = "src/" + nm + "/reload1.gif"
		weapons[ nm ].sound.shot = "sound/" + nm + "/shot.wav"
		weapons[ nm ].sound.reload = "sound/" + nm + "/rld.wav"
	}
	weapons_count = ar.length;
	weapons.none = {
		name: "none",
		cost: 0,
		speed: 0,
		type: 1,
		ammo: 0,
		min_damage:0, max_damage:0,
		anim: {
				stand: "src/none/man1.gif", 
				shot: "src/none/man1.gif", 
				seat:"src/none/seat1.gif", 
				reload:"src/none/seat1.gif"
			   },
		sound: {}
	}
	var prices = [], names=[], names2 = [], prices2 = [];
	for(var i=0; i<weapons_count; i++){
		prices.push(weapons[i].cost);
		prices2.push(weapons[i].cost);
		names.push(weapons[i].key);
	}
	prices.sort(function(a,b){ if(a > b)return -1;else if(a<b) return 1; else return 0 })
	for(i=0; i<prices.length; i++){
		names2.push( names[indexOf(prices2, prices[i])] )
	}
	weapons_by_price = names2;
}

//#INTRO
var WINDOW = [508, 435]
var logo_t, intro_active = false;
var logo = "ShOOTeR X!"
function intro(){
	intro_end()
}


function intro_end(){
	intro_active = false;
	window.resizeTo(WINDOW[0], WINDOW[1])
	//# END INTRO
	$('#main').show()
	$('#main_head').show()
	show_settings()
	snd_icon.show()
	$("#money1").show()
	$("#money2").show()
	$("#tablo").show()
	$("#buymenu").show()
	$("#snd_sett").fadeIn()
	$("#main_head").append("<img onclick=pause() id=pause style=\"position:absolute;cursor:pointer;z-index:5;top:4;right:5;\" src=src/icons/pause.gif>")
}	
	


//#SOUND
var tag_bgsn_length = 40;
$("body").append("<div id=bgsounds></div>")
for(var i=0; i<=tag_bgsn_length; i++)$("#bgsounds").append("<bgsound id=\"bs"+i+"\"/>")
$("bgsound").attr("volume", $(".sndsett").eq(3).val())


var snd_icon = "<IMG id=snd_icon style=\"display:none;position:absolute;top:0;left:2\" src=\"src/icons/sound_on.gif\" height=40>"
var snd_sett = "<div id=snd_sett style='display:none;position:absolute;top:0;left:0;'><style>.sndsett{position:absolute;filter:alpha(opacity=30)}</style>"
	
		snd_sett += "<img class=sndsett value=-2000 src='src/icons/sound_wave.gif' height=15 style=left:30;top:14>"
		snd_sett += "<img class=sndsett value=-1000 src='src/icons/sound_wave.gif' height=20 style=left:38;top:11>"
		snd_sett += "<img class=sndsett value=0 src='src/icons/sound_wave.gif' height=32 style=left:46;top:4>"
	
$("#main_head").append(snd_icon).append(snd_sett)
var b=(function(){
		
			var el = $(".sndsett").eq(1)
			$(".sndsett").css("opacity",1)
			$("bgsound").attr("volume",el.val())
			var f = 0;
		$(".sndsett").each(function(i){	
			if(el[0] == $(".sndsett")[i-1])
			f = 1	
			if(f)$(".sndsett").eq(i).css("opacity",0.3)
		})	
	})()
	
	
$(".sndsett").mousedown(function(){
	var el = $(this)
			$(".sndsett").css("opacity", 1)
			$("bgsound").attr("volume", el.val())
			var f = 0;
		$(".sndsett").each(function(i){	
			if(el[0] == $(".sndsett")[i-1])
			f = 1	
			if(f)
			$(".sndsett").eq(i).css("opacity",0.3)
		})	
	})
	

	
snd_icon = $("#snd_icon").click(function(){
		sound = !sound;
		if(sound){
			snd_icon.attr("src","src/icons/sound_on.gif")
			$(".sndsett").fadeIn()
		}
		else {
			snd_icon.attr("src","src/icons/sound_off.gif")
			$(".sndsett").fadeOut()
		}
	})
	
	
var bgs_n = 0;
function playsound(snd){
	if( sound ){
		$("#bs"+bgs_n).attr('src',snd)
		bgs_n = bgs_n >= tag_bgsn_length-1 ? 0 : bgs_n + 1
	}
}

//#HTML
$( document ).ready( function(){
	var c = "<div id=ammo1></div><div id=ammo2></div><div id=hp1></div><div id=hp2></div><div style=left:100; id=damage1></div><div style=right:80; id=damage2></div>" +
	"<div id=tablo></div>" +
	"<div id=money1 style='left:20'></div><div id=money2 style='left:370'></div>" + 
	"<div id=dominating1 style='top:215;left:15'></div><div id=dominating2 style='top:210;left:450'></div>"
	$("#game").append(c)
	$("#hp1, #hp2").hide()
	$("#damage1, #damage2").css({
		position:"absolute",
		bottom: 110,
		"font-weight":"bolder",
		"color": "#A00",
		"font-size":"12"})
	$("#money1, #money2").hide().css({
		"font-family": "Arial Black", 
		"font-size": 12,
		"z-index": 0,
		position: "absolute",
		color: "#756E6E", 
		top: 170, width: 200
		})
		
	$('#dominating1, #dominating2').css({
		"font-family"	: "Arial Black", 
		"font-size"		: 12,
		"z-index"		: 0,
		"position"		: "absolute",
		"color"			: "#756E6E"
	})

	$("#money2").css("top", 193)
		
	$("#tablo").css({
		"background":"#756E6E",
		width: 240,
		height: 25,
		position: "absolute",
		top: 0, left: 122,
		border: "1px solid gray",
		opacity: .6
	}).hide() 
	
	$("img").on("dragstart", function(){ return false })
	
})


//PAUSE

function pause(){
	if( in_game && !paused ){
		 paused = true;
		 $("#pause").hide()
		 if(!$("#shadow")[0]) $("body").append("<div id=shadow></div>")	 
		 $("#shadow").stop().fadeTo(500, 0.8)
		 if( !$("#pause_s")[0] )$("body").append("<img id=pause_s onclick=unpause() ondragstart=\"return false\" src=src/icons/play.gif>")
			$("#pause_s").css({left: $("body").width()/2-$("#pause_s").width()/2,top: $("body").height()/2-$("#pause_s").height()/2})
	}
}

function unpause(){
	if( paused ){
		paused = false;
		$("#pause_s").remove()
		$("#pause").show()
		$("#shadow").stop().fadeOut(500, function(){ $("#shadow").remove() })
	}
}

function pause_toggle(){ 
	!paused ? pause() : unpause()
}



function rerror(msg, url, ln){
	var m = file$(unescape(url).replace(/^file\:[\/]+/,"")).name()
	alert("Error:\n"+msg+"\nLine: "+ln+"\nModule: "+m)
	return true;
}

window.onerror = rerror;

		
	intro();

}
{//GAME

function anim(id, src){
	if( src )$("#player"+id).attr("src", src)
	return anim[id]
}

anim[1] = {}; anim[2] = {}


		
function give_weapon(wp, id){

		if(!weapons[wp] || (id != 1 && id != 2))return;
		
			anim[id].seat =  weapons[wp].anim.seat.replace(1, id)
			anim[id].stand =  weapons[wp].anim.stand.replace(1, id)
			anim[id].r_snd = weapons[wp].sound.reload
			anim[id].snd = weapons[wp].sound.shot
			anim[id].shot =  weapons[wp].anim.shot.replace(1, id)
			anim[id].reload =  weapons[wp].anim.reload.replace(1, id)
			anim[id].dl = weapons[wp].speed
			anim[id].ammo = n$(weapons[wp].ammo)

			ammo[id] = n$(weapons[wp].ammo)
			has_weapons[id][weapon[id]] = clip_shots[id];

			weapon[id] = wp
			clip_shots[id] = n$( has_weapons[id][wp] ); 
			show_ammo()
			spread[id] = 0;
			curr_weapon[id] = weapons[wp]
			
			if(!is_dead[id] && can_move[id])anim(id, standing[id]?anim[id].stand:anim[id].seat)
		
}
		
	
//#BUYING
function can_buy(wp, id){  return (in_game && !paused && weapon[id] != wp) && (money[id] >= weapons[wp].cost ||  has_weapon(wp, id) )  }

function has_weapon(wp, id) {
	return !isNaN(has_weapons[id][wp])
}

function buy_weapon(wp, id){
	var t;
	if( t=can_buy(wp, id) )
	{
		if( !has_weapon(wp, id) ) {
			money[id] -= weapons[wp].cost;
			show_money(id)
		}
		give_weapon(wp, id)
	}
	return t;
}

	
//#NEWGAME
function new_game(){ 
if( (round_limit > 0 && rounds > round_limit) || (win_limit > 0 && (win[1] >= win_limit || win[2] >= win_limit)) )end_game();

else {
	in_game = true;
	standing = [,T,T]
	is_dead = []
	can_move = [, 1, 1]
	can_shot = [, 1, 1]
	round_shots = [,0,0]
	clip_shots = [,0,0]
	for(var h=1; h<3; h++)
		for(var i in has_weapons[h])
			has_weapons[h][i] = 0;
	shots = [,0,0]
	spread = [,0,0]
	damage = [,0,0]
	hp = [,max_hp, max_hp]
	give_weapon(weapon[1] == "none" ? default_weapon : weapon[1], 1)
	give_weapon(weapon[2] == "none" ? default_weapon : weapon[2], 2)
	show_ammo();show_hp()
	seat(1); seat(2)
	show_score();
	show_money();
	$("#damage1").empty()
	$("#damage2").empty()
	$(".hurt_blood, .wpdrop").remove()
}

}

var t_end;
function end_game(){
	in_game = false;
	var top_pos = $("body").height() / ( winner == 0 ? 2 : 3 )
	var c = "<div id=shadow></div>"
		c+= "<div id=winner_name class=h>" + (player[winner] || "Ничья") + "</div>"
		c+= "<div id=text_win class=h>win!</div>"
	$("body").append(c)
	$("#shadow").fadeTo(600, 0.8)
	var d1 = $("#winner_name")
	var d2 = $("#text_win")

		d1.show().css({
			position: "absolute",
			"font-size" : 90, color: "white", "z-index": 6,
			left: -d1.width()
		}).css("top", top_pos - d1.height() / 2).animate({left: $("body").width()/2 - d1.width()/2})
		if( winner != 0 )
		d2.show().css({
			position: "absolute",
			"font-size" : 70, color: "white", "z-index": 6,
			top: top_pos + 70,
			left: $("body").width() + d2.width()
		}).animate({left: $("body").width()/2 - d2.width()/2})
		
	
}



function stand(id){
	if(!is_dead[id] && !standing[id] && can_move[id] && in_game && !paused){
		standing[id] = true
		stand_t[id] = +new Date();
		seat_t[id] = null
		anim(id, anim[id][is_shooting[id] ? "shot" : "stand" ])
	}
}

function seat(id){
	if(!is_dead[id] && standing[id] && can_move[id] && in_game && !paused)	{
		standing[id] = false
		wpsh[id] = false
		shots[id] = 0
		stand_t[id] = null;
		seat_t[id] = +new Date()
		anim(id, anim[id].seat)
	}
}


function weapon_drop(id){
	if(in_game && !paused && weapon[id] != "none"){
	var wp = weapon[id];
	var xpos = [0, 89, 405]	
	var ypos = 250 + (standing[id] ? 0 : 25)
	if($(".wpdrop"+id).size() > 5)$(".wpdrop"+id).eq(0).remove()
	$("#game").append("<img src='src/"+wp+"/"+wp+"_"+id+".gif' class='wpdrop wpdrop"+id+" wp"+id+wp+"' style='position:absolute;left:"+xpos[id]+";top:"+ypos+"'>")
	var el = $(".wp"+id+wp+":last-child")
	var h1 = $("#player"+id).height();
	var h2 = el.height();
	var h = (h2 * h1 / 300);
	el.css("height", h).animate({top:318-el.height()}, {easing:"linear", duration: 250}).css("left", el.offset().left - el.width()*0.4)
	has_weapons[id][wp] = false
	give_weapon("none", id);
	}
}


function dead(id){
	if( !is_dead[id] ){
		anim(id, anim[id].dead ? anim[id].dead : "src/deaths/" + rand("punch", "heart") + id + ".gif")
		is_dead[id] = true;
		weapon_drop(id);
		standing[id] = false;
		playsound("sound/dead.wav")
		dominating[id] = 0
		var en = id == 1 ? 2 : 1
		has_weapons[id] = {};
		money[en] += (++dominating[en])*100;
		show_money()
		show_dominating(1); show_dominating(2);
		win[en]++;
		show_score()
		rounds++;
		setTimeout(new_game, 1000*rand(2,3))
	}
}


function reload(id){
	if(weapon[id] != "none" && clip_shots[id] > 0 && !is_dead[id] && can_move[id] && in_game && !paused){
	seat(id)
	can_move[id] = false
	anim(id, anim[id].reload)
	playsound(anim[id].r_snd)
	setTimeout(function(){can_move[id]=true; clip_shots[id]=0; show_ammo();}, curr_weapon[id].anim.reloadTime)}
}

var SPREAD_T = setInterval(function(){
	for(var id=1; id<3; id++)
	if( in_game && !paused && !is_dead[id] ){ 
		spread[id] -= standing[id] ? max(0.1, curr_weapon[id].spread/5) : curr_weapon[id].spread/2; 
		var m = curr_weapon[id].min_damage
		spread[id] = spread[id].range(0, m)
		}
}, 100)


//#SHOT
function shot(id){
if(weapon[id] == "none" || !in_game || paused || (id !=1 && id!=2))return;
var en = id == 1 ? 2 : 1;
if ( can_move[id] && can_shot[id] && standing[id] && !is_dead[id] && !delay[id] && !wpsh[id]) {
if(clip_shots[id] == anim[id].ammo) {
	var emp_snd = curr_weapon[id].type == 1 ? "sound/emp2.wav" : "sound/emp.wav"
	playsound(emp_snd);
	is_shooting[id] = false;
}


else {
	anim(id, anim[id].shot)
	playsound(anim[id].snd);
	is_shooting[id] = true
	clip_shots[id]++
	shots[id]++
	if(standing[en])getDamage(en)
	spread[id] = (spread[id] + curr_weapon[id].spread).range(0, curr_weapon[id].min_damage)
	ammo[id] = anim[id].ammo - clip_shots[id]
	round_shots[id]++
}
	delay[id] = true
	setTimeout(function(){delay[id] = false; is_shooting[id]=false;}, anim[id].dl)
	show_ammo();
	if(curr_weapon[id].type == 1)wpsh[id] = true;
}
}

 

function getDamage(id){ 
	var en = id == 1 ? 2 : 1;
	var d;
	if(round_shots[en] == 0 && hp[en] == max_hp) d = curr_weapon[en].max_damage
	else d = rand(curr_weapon[en].min_damage, curr_weapon[en].max_damage)
	
		d = n$( d - spread[en] )
		
	if( d < 1 )return
	
		hp[id] -= d
		show_hurt(d, id)
		show_dmg(d, id); 
		
		money[en] += d * 10
		show_money(en);
		damage[id] += d
		can_shot[id] = false
		shock_t = setTimeout(function(){
			if(!is_dead[id])
			can_shot[id] = true;
		}, d*10)
		
		if( !is_dead[id] )playsound( d < 50 ? "sound/hit2.wav" : "sound/hit.wav")
		if( hp[id] <=0 ){ 
	
			anim[id].dead = d <= 30 ? "src/deaths/neck"+id+".gif" : anim[id].dead = "src/deaths/" + rand("punch", "heart", "headshot") + id + ".gif"
			dead(id);
		
	}
	show_hp();
	$("#damage"+id).html(damage[id])
}




}//GAME_BLOCK_END
//#UI USER INTERFACE
var ammo_icon = "src/icons/ammo.gif";

function show_ammo(){
	if( in_game && !paused){
		ammo[1] = anim[1].ammo - clip_shots[1];
		ammo[2] = anim[2].ammo - clip_shots[2];
		$("#ammo1").html("<img style=float:left; height=14 src=\""+ammo_icon+"\">"+ammo[1])
		$("#ammo2").html("<img style=float:left; height=14 src=\""+ammo_icon+"\">"+ammo[2])
	}
}


// #BUYMENU
function buymenu(id, s){
	if( s ){
		var y = 100, x = id == 1 ? 35 : 345, n = 1;
		var c = "<div class='buymenu' id='buymenu"+id+"' style='left:"+x+";top:"+y+"'>"
			c+= "<table width=100%>"
		for(var wp in weapons)
			if(isNaN(wp) && wp != "none") 
				c += "<tr" +(weapon[id] == wp ? " style='background:#770'" : !can_buy(wp, id) ? " style='background:#400'" : "" ) + "><td width=5%>" + (n++) + "</td><td width=35%>" + weapons[wp].name + "</td><td width=40% style='text-align:center'><img style=height:15 src=\"src/" + wp + "/" + wp + "_1.gif\"></td><td width=20% align=center>" + (has_weapon(wp, id) ? "-" : "$"+weapons[wp].cost) + "</td></tr>"
			c+= "</table></div>"
		if(!$("#buymenu"+id)[0]) $("body").append(c)
		else $("#buymenu"+id).replaceWith(c)
	}
	else $("#buymenu"+id).remove()
}
	//#DAMAGE
var dmgn = [,0,0]

function show_dmg(d, p){
	if(p==1||p==2){
	d = n$(d);
	var x = p == 1 ? 100 : 444, y = 195
		x -= rand(30)
		if (dmgn[p] > 18) {
			dmgn[p] = 0;
		}
		y -= dmgn[p] * 10
		dmgn[p]++;
	$("#game").append("<div class=dmg" + p + " style=\"color:a00;font-size:12;position:absolute;top:" + y + ";left:" + x + "\">" + d + "</div>")
	sleep(function () {
		$(".dmg" + p).eq(0).remove();
		if ($(".dmg" + p).size() == 0)
			dmgn[p] = 0
	}, 1000)
	}
}

function show_hurt(d, p){
	var id=rand(9999999)
	var y = 300 + rand(-10,10)
	var x = (p==1?30:400)+rand(-20,40)
	var h = max(min(50, d/2), 10);
	y = min( 340-h, y)
	$("#game").append("<img id="+id+" class=hurt_blood src=\"src/blood/"+rand(1,5)+".gif\" height="+h+" style=position:absolute;left:"+x+";top:"+y+">")
	$("#"+id).fadeOut(5000, function(){$("#"+id).remove()})
}

//Displaying HP
var 
	hurt = "src/blood/hurt.gif",
	hp_icon = "src/icons/hp.gif"

function show_hp(){
	if( in_game && !paused){
		var 
			hp_o1 = n$(max(0, hp[1])),
			hp_o2 = n$(max(0, hp[2]));

		$("#hp1").html("<img height=14 style=z-index:2;float:left; src=\""+hp_icon+"\">"+ (hp[1] <= 25 ? "<font color=#770000>"+hp_o1+"</font>" : hp_o1) )
		$("#hp2").html("<img height=14 style=z-index:2;float:left; src=\""+hp_icon+"\">"+ (hp[2] <= 25 ? "<font color=#770000>"+hp_o2+"</font>" : hp_o2) )
		if(hp[1] <= 0)dead(1);
		if(hp[2] <= 0)dead(2);
	}
 }
 
 
function show_dominating(id) {
	$("#dominating" + id).html( dominating[id] > 1 ? "x"+dominating[id] : "" );
}
 
var money2 = [];
function show_money(id){
	if(id != 1 && id != 2){
		show_money(1);
		show_money(2);
		return;
	}
	
	money[id] = money[id].range(0, max_money);
	if(money2[id] === undefined)money2[id] = money[id];
	var t = 1;
	if( money2[id] != money[id] ){
		t = 1000;
		var D = money[id] - money2[id];
		if( D > 0 ) D = " + " + D;
		else D = " - " + abs(D)
		$("#money"+id).html("$" + money2[id] + D)
	}
	money2[id] = money[id]
	clearInterval(money2[id+4])
	money2[id+4] = setTimeout(function(){
		$("#money"+id).html("$" + money[id])
	}, t)
}

function show_score(){
	winner = win[1] > win[2] ? 1 : win[2] > win[1] ? 2 : 0
	$("#main_head h1").html(L.round + " "+rounds)
	var c = "<table width=100%>"
		c+= "<tr><td width=33.33% align=center>" + player[1] + "</td><td style='font-weight:bolder;font-size:20' width=33.33% align=center>" + win[1] + ":" + win[2] + "</td><td width=33.33% align=center>" + player[2] + "</td></tr>"
		c+= "</table>"
	$("#tablo").html(c)
}
 
 
 var c = "<font class=inf style='width:40;left:0;'>v"+file$("common/main.js").lines(2).replace(/[\/]+[\s]*Version:[\s]*/,"")+"</font>"
	 c+= "<font class=inf id=coords style='right:0;width:60;'></font>"
	 for(var i=275; i>=0; i-=55)
	 c+= "<font class='inf out' style='right:"+i+";width:50;'></font>"
 $("body").append(c)
 
 var out_n_tm = [];
 function Out(n,t, time){
	 if( time > 0 ) {
		 if(!out_n_tm[n]) out_n_tm[n] = +new Date();
		else if( date$(out_n_tm[n]).passed(time).ms )
			delete out_n_tm[n];
		else return;
	 }
	 
	 $(".out").eq(+n).html(String(t))
 }
 
 
// To be continued...