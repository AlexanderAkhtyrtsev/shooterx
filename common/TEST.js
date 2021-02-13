var INF = Infinity;
var WSCR = new AX("WScript.Shell");


$("body").mousemove(function(e){
	var o = $("#game").offset()
	x = e.clientX-o.left; y = e.clientY - o.top;
	$("#coords").html("X: "+x+"  Y: "+y)
})

var tr;
var dem = [
	]
function record(){
	var st = false;
	dem = []
	var stdt = +new Date();
	tr = setInterval(function(){
		if( !st && iskeypr(sett[2].Stand) ) { dem.push([+new Date()-stdt, sett[2].Stand]); st = true; stdt = +new Date(); }
		if( iskeypr(sett[2].Shot) ) { dem.push([+new Date()-stdt, sett[2].Shot]); stdt = +new Date(); }
		if( iskeypr(sett[2].Reload) ) { dem.push([+new Date()-stdt, sett[2].Reload]); stdt = +new Date(); }
		
		if( iskeypr(sett[2].Seat) && st ){
			st = false;
			dem.push([+new Date()-stdt, sett[2].Seat]); 
			stdt = +new Date();
		}
	}, 1)
}

function stop(){ clearInterval(tr) }

function play(){
var str = []
var t = 0;
	document.title = "Playing..."
	for(var i=0; i<dem.length; i++){
		str[i] = "keypr["+dem[i][1]+"] = true; setTimeout(\"keypr["+dem[i][1]+"] = false\",1)"
		setTimeout(str[i], t+=dem[i][0])
	}
	setTimeout(function(){ document.title = "ShOOTeR X!" }, t+100)
}