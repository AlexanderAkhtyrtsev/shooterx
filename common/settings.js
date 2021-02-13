var savef = file$("data/save").create()

function setPlayer(id, name){
	if(in_game)return;
	name = name || L.player + " " +id

	player[id] = name;

	if(id == 1) $("#hp1, #ammo1").show()
	
	else if(id == 2) $("#hp2, #ammo2").show()
	if( player[1] && player[2] )new_game();

}

function show_settings(){
	var c = file$("common/settings.ht").read()
	var ar = c.match(/##[\w]+/g) || [];
	for(var i=0; i<ar.length; i++)
		c = c.replace(ar[i], L[ar[i].replace( /^##/, "" )])
	
$("#sett_overlay").html(c)
$("#play_btn").focus()
$("input[type=text], input[type=button]").css({"border":"1px solid #343"})

$(".wp_ic").hover(
	function(){$(this).css("opacity",1)},
	function(){if($(this).height() == 20)$(this).css("opacity",0.5)}
	).click(function(){	
$(".wp_ic").removeClass("wp_checked").css("opacity",0.5)
$(this).toggleClass("wp_checked").css("opacity",1)
})


$(".sq1").click(function(){ $(".sq1").removeClass("sq1_checked"); $(".sq1").css("opacity",0.5); $(this).toggleClass("sq1_checked"); })
$(".sq2").click(function(){ $(".sq2").removeClass("sq2_checked"); $(".sq2").css("opacity",0.5); $(this).toggleClass("sq2_checked") })
$(".sq1, .sq2").hover(function(){$(this).css("opacity", 1)},function(){if(!($(this).hasClass("sq1_checked")||$(this).hasClass("sq2_checked")))$(this).css("opacity",0.5)})

	
	var st = savef.asArray(true);
	
	$("#pl1_nm").val(st[0] || "")
	$("#pl2_nm").val(st[1] || "")

	if(!!+st[2])$("#cb_bot1").click()
	if(!!+st[3])$("#cb_bot2").click()

	
	$("#stmoney").val(st[6] || 3000)
	$(".wp_ic[value='"+(st[7] || default_weapon)+"']").click()
	
	
	
	$(".sq1").eq(+st[4] || 2).addClass("sq1_checked")
	$(".sq2").eq(+st[5] || 2).addClass("sq2_checked")
	
	$("[name=lmt][value="+st[8]+"]").click()
	$("#"+(st[8]==1?"r":"w")+"lmt").val(st[9])
	}

			
function start_game() {
var pl1, pl2,
	round_lmt, win_lmt,
	start_money, start_weapon;
	
	var lmt_radio_checked_val = $("[name=lmt]:checked").val()
		if(lmt_radio_checked_val == 1)round_lmt = n$($("#rlmt").val())
	else if(lmt_radio_checked_val == 2)win_lmt = n$($("#wlmt").val())
	

	start_money = Math.max(n$($("#stmoney").val()), 0)
	start_weapon = $(".wp_checked").val()
	
	pl1 = $("#pl1_nm").val()
	pl2 = $("#pl2_nm").val()
	
	var save_ar = [
		pl1, pl2, 
		+$("#cb_bot1").prop("checked"), +$("#cb_bot2").prop("checked"),
		$(".sq1_checked").val(), $(".sq2_checked").val(),
		start_money, start_weapon,
		lmt_radio_checked_val, (lmt_radio_checked_val == 1 ? round_lmt : win_lmt)
		]
	
	savef.create(1).add(save_ar.join("\n"))
	
	

	
	if( weapons[start_weapon] ){
		give_weapon(start_weapon, 1)
		give_weapon(start_weapon, 2)
	}
		
	if( typeof start_money == "number" )money[1] = money[2] = start_money
	 
	  
	  
	if( round_lmt > 0 )round_limit = round_lmt;
	if( win_lmt > 0 )win_limit = win_lmt;	
	if($("#1hpmod").prop("checked"))max_hp = 1

	$("#settings").animate({opacity: 1}, 500, function(){
	
	$("[id^=pl]").show()

	if($("#cb_bot1").prop("checked"))add_bot($(".sq1_checked").val(), 1)
	else setPlayer(1, pl1)
		
	if($("#cb_bot2").prop("checked"))add_bot($(".sq2_checked").val(), 2)
	else setPlayer(2, pl2)
		
		var c = "<div id=vs style='position:absolute;width:100%;top:110'>"
			c+= "<table width=100% align=center style=font-size:30><tr><td align=center width=30%>"+player[1]+"</td><td align=center style=font-size:45 width=40%>VS.</td><td align=center width=30%>"+player[2]+"</td></tr></table>"
		c += "</div>"
	$("#settings").html(c)
	setTimeout(function(){
		$("#vs").animate({"left":"-100%"}, function(){
			$(this).remove()
			})
	}, 3000)
	$( this ).fadeOut(3500, function(){
		$(this).remove()
		$("#sett_overlay").remove()
	})
	
	new_game();
	})
	
		$("#hp1, #hp2, #ammo1, #ammo2, #tablo, #money1, #money2").show()
}

function toggle_entnm(id){
	if($("#cb_bot"+id).prop("checked"))
	{	$("#pl"+id+"_nm").attr("disabled", "")
		$("#ent_nm"+id).attr("disabled", "")
	}
	else {	
		$("#pl"+id+"_nm").removeAttr("disabled")
		$("#ent_nm"+id).removeAttr("disabled")
	}
}


function show_controls(){
	var tmp = []
	var c = "<table width=100%>"
		c+= "<tr style='background:#5b5555;text-align:center'><td width=33.3%>"+L.action+"</td><td width=33.3%>"+L.player+" 1</td><td width=33.3%>"+L.player+" 2</td></tr>"
		c+= "<tr><td width=33.3%>"+L.stand_up+"</td>"
		
		c+= "<td width=33.3%>"
		for(var i=0; i<sett[1].Stand.length; i++)tmp.push(Keys[sett[1].Stand[i]])
		c+= tmp.join(", ") + "</td>"
		
		tmp = []
		c+= "<td width=33.3%>"
		for(var i=0; i<sett[2].Stand.length; i++)tmp.push(Keys[sett[2].Stand[i]])
		c+= tmp.join(", ") + "</td>"
	
		c+= "</tr>"; tmp = []
		
		c+= "<tr><td width=33.3%>"+L.seat+"</td>"
		
		c+= "<td width=33.3%>"
		for(var i=0; i<sett[1].Seat.length; i++)tmp.push(Keys[sett[1].Seat[i]])
		c+= tmp.join(", ") + "</td>"
		
		tmp = []
		c+= "<td width=33.3%>"
		for(var i=0; i<sett[2].Seat.length; i++)tmp.push(Keys[sett[2].Seat[i]])
		c+= tmp.join(", ") + "</td>"
	
		c+= "</tr>"; tmp = []
		
		c+= "<tr><td width=33.3%>"+L.fire+"</td>"
		
		c+= "<td width=33.3%>"
		for(var i=0; i<sett[1].Shot.length; i++)tmp.push(Keys[sett[1].Shot[i]])
		c+= tmp.join(", ") + "</td>"
		
		tmp = []
		c+= "<td width=33.3%>"
		for(var i=0; i<sett[2].Shot.length; i++)tmp.push(Keys[sett[2].Shot[i]])
		c+= tmp.join(", ") + "</td>"
	
		c+= "</tr>"; tmp = []
		
		c+= "<tr><td width=33.3%>"+L.reload+"</td>"
		
		c+= "<td width=33.3%>"
		for(var i=0; i<sett[1].Reload.length; i++)tmp.push(Keys[sett[1].Reload[i]])
		c+= tmp.join(", ") + "</td>"
		
		tmp = []
		c+= "<td width=33.3%>"
		for(var i=0; i<sett[2].Reload.length; i++)tmp.push(Keys[sett[2].Reload[i]])
		c+= tmp.join(", ") + "</td>"
	
		c+= "</tr>"; tmp = []
	
		c+= "<tr><td width=33.3%>"+L.buy_menu+"</td>"
		
		c+= "<td width=33.3%>"
		for(var i=0; i<sett[1].BuyMenu.length; i++)tmp.push(Keys[sett[1].BuyMenu[i]])
		c+= tmp.join(", ") + "</td>"
		
		tmp = []
		c+= "<td width=33.3%>"
		for(var i=0; i<sett[2].BuyMenu.length; i++)tmp.push(Keys[sett[2].BuyMenu[i]])
		c+= tmp.join(", ") + "</td>"
	
		c+= "</tr>"; tmp = []
	
		c+= "</table>"
	
		
	 if(!$("#shadow")[0]) $("body").append("<div id=shadow></div>")	 
		 $("#shadow").fadeTo(600, 0.8).click(hide_controls)
	$("body").append("<div id=info onclick=hide_controls()></div>")
	$("#info").html(c).css("left", $('body').width()/2 - $("#info").width() / 2)
}

function hide_controls() {
	$('#info').remove();
	$('#shadow').fadeOut(function(){ $(this).remove() })
}
