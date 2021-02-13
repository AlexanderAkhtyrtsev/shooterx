var INF = Infinity;
var WSCR = new AX("WScript.Shell");
var x,y;
$("body").mousemove(function(e){
	var o = $("#game").offset()
	x = e.clientX-o.left; y = e.clientY - o.top;
	$("#coords").html("X: "+x+"  Y: "+y)
})


var oldf = {
	data: function (file, nObj){
		var o = file$(file);
		if( !o.exists() )return {};
		var obj = []; 
		var _obj = [];
		var tree = [];
		var t = 0, len = 0, s,
			ar = o.asArray();
		
		for(var i=0; i<ar.length; i++){
			s = String(ar[i]).trim();
			if( /[\S\s]+[\s]*\{/.test(s) ){
				s = s.replace(/\{/,"").trim();
				if( s.length == 0 )continue;
				if( tree.push(s) == 1 )len++;
				eval("obj['" + tree.join("']['") + "'] = []");
				_obj = eval("obj['" + tree.join("']['") + "']");
			}
			
			else if( /\}/.test(s) ){
				tree.splice(tree.length-1, 1)
				_obj = eval("obj['" + tree.join("']['") + "']");
			}
			
			else {
				if( /[\s]*=[\s]*/.test(s) ){
				var s1 = s.replace(/[\s]*=[\s]*/,"=");
				var ar2 = [s.substr(0, s.indexOf("=")).trim(), s.substr(s.indexOf("=")+1, s.length).trim()];
				
				if( ar2[1] == "true" )ar2[1] = true;
				else if( ar2[1] == "false" )ar2[1] = false;
				else if( !isNaN(ar2[1]) && String(ar2[1]).length > 0 ) ar2[1] = +ar2[1];
				_obj[ar2[0]] = ar2[1];
				}
				else if(s.length){
				if( s[1] == "true" )s = true;
				if( s[1] == "false" )s = false;
				else if( !isNaN(s) && String(s).length > 0 ) s = +s;
					_obj.push(s);
				}
			}
		}
		

		
		var parse_obj = function(o){
			var tb = "";  for(var i=0; i<t; i++)tb += "\t";
			t++; 
			var s = "{\n";
	
			for(var i in o){
				s += tb + "\t"
				if( typeof o[i] == "object" ) s += i + " " + parse_obj( o[i] );
				else s += i + " = " + o[i]+ "\n";
			}
			s+= tb+"}\n";
			t--;
		return s;
		}
	var conc = function(obj1, obj2){
		   if( typeof obj1 == "object" )
			 for(var i in obj2)
			   if(typeof obj2[i] == "object" && obj2[i]){
                       if( typeof obj1[i] != "object" || !obj1[i] )obj1[i] = [];
                          conc(obj1[i], obj2[i]);
                    }
			   else if(obj2[i] == null)delete obj1[i];
			   else obj1[i] = obj2[i];
		}
		
		if( typeof nObj == "object" ){
	
			conc(obj, nObj);
		
			var c = "";
			var L = 0;
			for(var i in obj)
			  if( obj[i] && typeof obj[i] == "object" )c += i + " " + parse_obj(obj[i]);
			
			return file$(file).create(1).add(c);
		}
		obj.length = len;
		return obj
	}
	
}
 