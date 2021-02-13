//bots
var bot = [];
var bot_names = [];
var bot_enabled = [, false, false];
function wait(f, t){
	t = max(1, n$(t));
	setTimeout(f, t)	
}


function load_bots(){
	bot_names = file$("data/botnames.dat").read().split(/\n/);
}


	load_bots();
function add_bot(level, id){
	bot_enabled[id] = true;
	var t;
	bot[id] = t = {
		l: +level
	}
	var r = rand(0, bot_names.length-1)
	setPlayer(id, bot_names[r])
	bot_names.splice(r, 1);
	Bot(id);
}



function Bot( id ){	if(bot_enabled[id]) setTimeout(function(){

	var en = id == 1 ? 2 : 1, 
	b = bot[id];
	var S = 5 - b.l;
	var r, adl;
		switch(b.l){
			case 0: 
				r = rand(350, 500);
				adl = rand(200, 600);
			break;
			case 1: 
				r = rand(300, 380);
				adl = rand(50, 120);
			break;
			case 2: 
				r = rand(200, 300);
				adl = rand(0, 50);
			break;
			case 3: 
				r = rand(100, 250); 
				adl = rand(0, 10);
			break;
			case 4: 
				r = rand(60, 200); 
				adl = 0;
			break;
		}
	b.r = r;

	if(is_dead[id]){
		b.attack = false;
		return Bot(id)
	}
	// Bot buy
	if(!standing[id]){var i=0,index=indexOf(weapons_by_price,curr_weapon[id].key);if(index>-1)while(weapons_by_price[i]&&index!=i&&!buy_weapon(weapons_by_price[i],id))i++;}
	

	breload(id);
	
	
	if(b.attack){
		if(!standing[id]){
			if(!b.stand){
				if( b.l > 2 ){
					if( !can_shot[id] ) b.attack = false;
					else b.stand = +new Date()
				}
				else b.stand = +new Date()
			}
			else if( date$(b.stand).passed(r).ms )stand(id);
		}
		else {
			if( b.l > 2 && !can_shot[id] ) b.stand = b.attack = false;
			else if( date$(stand_t[id]).passed(adl).ms || !adl )shot(id)
		}
	}
	
	else {
		if(standing[id])b.seat_t = rand(400, 3000)
		seat(id);
		b.stand = false;
	}
	
	if( !is_dead[en] && (standing[en] || date$(seat_t[id]).passed( b.seat_t ).ms) && !rand(3) )b.attack = true;
	
	
	else if( !standing[en] && shots[id] >= S*rand(1,S*S+1) )b.attack = false;
	
	Bot(id)
}, 1) }


function breload(id){
	var b = bot[id];
	if( !ammo[id] && ((b.l <= 1 && !rand(3)) || b.l > 1) )reload(id);
}