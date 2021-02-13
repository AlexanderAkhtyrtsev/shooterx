/* LibFunc.JS by AlexanderV2 */
{ var LibFunc = 162410;
	var FSO, WS,
		ActiveXObject = AX = typeof ActiveXObject == "undefined" ? Object : ActiveXObject;
		
		FSO = new AX("Scripting.FileSystemObject");
		WS = new AX("WScript.Shell");

function n$(num, fix){
	if(isNaN(fix))fix = 0;
	num = num == undefined ? 0 : num;
	if(typeof num == "string" && isNaN(num))
		num = num.replace(/[^0-9\(\)\+\-\/\*\.(Infinity)]+|(E[\+\-][0-9]+)/gi,"");
	try{ num = eval(num); }
	catch(e){ return 0 }
	num = +num;
	return +num.toFixed(fix) || 0;
}

function isFloat(n){return !isNaN(n) && /\./.test(n)}

function rand() {
	var args = arguments;
	if(args.length > 0){	
		if(args.length == 1 && typeof args[0] == "number")return n$(Math.random() * args[0], isFloat(args[0]) ? 10 : 0)	;
		else if(args.length == 2 && typeof args[0] == "number" && typeof args[1] == "number" ){
			var min = args[0], max = args[1], fix = isFloat(args[0]) || isFloat(args[1]) ? 3 : 0;
			if(min > max)return n$(min, fix);
			return n$(max - n$((max - min)*Math.random(), fix), fix);
		}
				
		else {
			var ar = args[n$(Math.random() * (args.length-1))];
			if(typeof ar == "function")return ar.call();
			else if(typeof ar == "object"){
				if(ar.length > 0)return ar[ n$(Math.random() * (ar.length-1)) ];
				else {
					var ar2 = [];
					for(var i in ar)ar2.push(i);
					return ar2[ n$( Math.random() * (ar2.length-1) ) ];
				}
			}
			else return ar;
		}
		}
	else return Math.round(Math.random());
}


function RegRead(key){
	key = key || "";
	var v = "";
	try { v = WS.RegRead(key.replace(/\//g,"\\")) }
	catch(e) {return v}
	return v;
}

function RegWrite(key, val,type){
	type = n$(type);
	key = key || "";
	WS.RegWrite(key.replace(/\//g, "\\"), val);
}

function RegDelete(key){
	key = key || "";
	try {
		WS.RegDelete(key.replace(/\//g, "\\"));
		return true;
	}
	catch(e) {
		return false
	}
}

function file$(file) {
	var WS = new ActiveXObject("WScript.Shell"),
		FSO = new ActiveXObject("Scripting.FileSystemObject");
	file = unescape(String(file).replace(/^file:[\/]+/,""));

	var o = new String(file);
		o.exists = function() { return FSO.FileExists(file) };
		var fGet = o.exists() ? FSO.GetFile(file) : {};
		
		o.size = function() { return fGet.size || -1 };
		
		o.type = function() { return fGet.type || "" };
		o.path = function() { 
			return (fGet.path || file).replace(/\\/g,"/")
		};
		o.name = function(newname) { 
				if(  o.exists() && newname != null ) return o.rename(newname);
				return fGet.name || "";
		}
		o.baseName = function() { return o.exists() ? FSO.GetBaseName(file) : "" };
		o.ext  = function(ext) { 
			var ex = o.exists();
				if( ext != null ){
					var f = file$(file);
					return ex ? f.rename(o.baseName() + "." + ext) : f;
				}
			return ex ? FSO.GetExtensionName(file).toLowerCase() : ""
		};
		o.folder$ = function() { return o.exists() ? folder$(FSO.GetParentFolderName(o.path()) || {}) : {} };
		o.shortPath = function() { return fGet.ShortPath || ""	 };

	o.add = function(text, newline) {
		try{
		if( newline == undefined )newline = true;
		text = text == undefined ? "" : String(text);
		if(!o.exists())FSO.CreateTextFile(file, false);
		var a = o.attr();
			o.attr(a&2);
		var f1 = FSO.OpenTextFile(file, 8);
			text = text.replace(/\n$/,"");
			newline ? f1.WriteLine(text) : f1.Write(text);
			f1.Close();
			o.attr(a);
		} catch(e){
			alert(e.name+": "+e.message + "\nFile: "+file);
		}
			return file$(file);
	};
		
	o.asArray = function(arg1, arg2){ // asArray(with_blank_lines:bool); asArray(start:int, end:int); asArray(end:int);
		var regex = (typeof arg1 == "boolean" ? !!arg1 : typeof arg2 == "boolean" ? !!arg2 : false) ? "\n"  : /\n/;
		if( o.exists() ) {
			var start_pos, end_pos;
			if(typeof arg1 == "number" && typeof arg2 == "number") { start_pos = arg1; end_pos = arg2; }
			else if(typeof arg1 == "number" && typeof arg2 != "number") { start_pos = 0; end_pos = arg1; }
			else if(typeof arg1 != "number" && typeof arg2 != "number") {return file$(file).read().split(regex)}
			return file$(file).read().split(regex).slice(start_pos, end_pos)
		}
		return [];
	};
	
	o.asJSON = function(){
		return parseJSON(o.read());
	}
	
	o.attr = function(n){
		if(o.exists()){
		try { 
			if(typeof n == "number" && n >= 0)FSO.GetFile(file).Attributes = n; 
			else return FSO.GetFile(file).Attributes; 
		}
		catch(e){}
		}
		return file$(file);
	};

	o.ChangeLine = function(line, value) {
		if(o.exists())
		{ 
			line = n$(line);
			if( line < 0 ) line = o.lines() + line;
			if(line != 0)
			{
				var a = o.attr();
				o.attr(a&2);
				var lines = file$(file).read().split("\n");
					lines[line-1] = value;
					file$(file).create(1).add(lines.join("\n"));
				o.attr(a);
			}
		}	
		return file$(file);
	};

	o.copy = function(src, overwrite, t){
		overwrite = !!overwrite;
		if(src == undefined)src = "";
		if( t == undefined ) t = true;
		f_src = folder$(src);
		if( o.exists() ){
		var a = o.attr();
			o.attr(a&2);
			var new_path = (f_src.exists() ? f_src.path() + "/" + o.name() : /\\/.test(src) ? src : file$(file).folder$().path() + "/" + src) ;
			if( !(file$(new_path).exists() && !overwrite) ) FSO.CopyFile(o.path(), new_path, overwrite);
			if( file$(new_path).exists() )
			if(!!t)return file$(new_path);
			return file$(file);
		}
		return file$(file);
	};
	
	o.copyAs = function(f, overwrite, t){
		t = t == undefined ? true : !!t;
		overwrite = !!overwrite;
		if( o.exists() ){
			if(!FSO.FolderExists(f)){
				if(!FSO.FileExists(f) || (FSO.FileExists(f) && overwrite)){
					var a = o.attr(); o.attr(a&2);
					FSO.CopyFile(o.path(), f, overwrite);
					o.attr(a);
				}
				if(t)return file$(f);
				else return file$(file);
			}
		}
		return file$(file);
	};

	o.create = function(index) {
		if(file.length > 0){
			if(!o.exists())
				try{FSO.CreateTextFile(file, false).Close();}
				catch(e){	WS.PopUp("ERROR:\t" + e.message + "\nFile:\t" + file,0,"Error",16) }
			if(o.exists() && !!index){
				var a = o.attr();
				o.attr(0);
				FSO.CreateTextFile(file, true).Close();
				file$(file).attr(a);
			}
		}
		return file$(file);
	};
	
	o.create_shortcut = function(p){
		if(o.exists()){
			var T = typeof p == 'object';
			var path = folder$(T ? "" : p).path() + "\\" + (T && T.ext() ? o.name() : o.baseName()) + ".lnk";
			var tPath =  "\"" + o.path() + "\"";
			var S = WS.CreateShortCut(path);
			if( T ){
				if( p.arg || p.arguments )S.Arguments = p.arg || p.arguments;
				if( p.descr || p.description )S.Description = p.descr || p.description;
				if( p.full_name )S.FullName = p.full_name;
				if( p.hk )S.HotKey = p.hk;
				if( p.icon )S.IconLocation = p.icon;
				if( p.wndstyle )S.WindowStyle = p.wndstyle;
				if( p.WkDir )S.WorkingDirectory = p.WkDir;
			}
			S.TargetPath = tPath;
			S.save();
			return file$( !T || (T && p.link) ? path : file );
		}
		return file$(file);
	};
	
	
	o.decode = function() {
		if( o.exists() ){
			var f = decode( file$(file).read() );
			file$( file ).create(1).add(f);
		}
		return file$(file); 
	};

	o.Delete = function() {
		var f = file$(file);
		if(f.exists()){
			f.attr(0);
			FSO.DeleteFile(f.path());
		}
		return file$(file);
	};
	
	o.del = o.Delete;
	
	o.deleteBlankLines = function(){
		if(o.exists()){
			var f = o.read().replace(/[\n]{2,}/g,"\n").replace(/^\n/,"");
			o.wipe();
			if( f.length )o.add(f);
		}
		return file$(file);
	};

	o.deleteLine = function(n) { 
		n = n$(n);
		var lns = o.lines();
		if( n < 0 ) n += lns;
		if(o.exists() && n > 0 && n <= lns){
			var a = o.attr(); o.attr(a&2);
			var ar = file$(file).read().split("\n");
			ar.splice(n-1, 1);
			file$(file).create(1).add(ar.join("\n").replace(/\n\n$/,""));
			o.attr(a);
		}
		return file$(file);
	};

	o.eachLine = function(func, start) {
		if( o.exists() )
		{
			var a = o.attr();
					o.attr(a&2);
			var f = o.asArray(true);
			if( start === undefined || isNaN(start) || start < 0) start = 0;
				for(var i=start; i<f.length; i++)
					{
						$i = $ln = i+1;
						value$ = v$ = $curr_line = f[i];
						var v = typeof func == "function" ? func.apply(this, [$i, value$]) : eval(func);
						if(v === false)break;
					}
					delete $i; delete $ln;
					delete $value; delete v$;
					delete $curr_line;
				o.attr(a);
		}
		return file$(file);
	};

	o.encode = function() {
		if( o.exists() )
		{	var a = o.attr();
					o.attr(a&2);
			var f = encode( file$(file).read() );
			file$( file ).create(1).add(f);
			o.attr(a);
		} 
		return file$(file); 
	};
	
	o.escape = function(){
		if( o.exists() ){
			var s = escape(o.read());
			o.wipe().add(s);
		}
		return file$(file);
	};

	o.get = function(){ return o.exists() ? FSO.GetFile(file) : {} };
	
	o.ini = function(){ // ???
		var obj = {};
		if( o.exists() ){
			var curr_obj,
			v = "", tmp, ar = o.asArray();
				
			for(var i=0; i<ar.length; i++)
			{
				v = ar[i].trim();
				if(  /^\[[\s\S]+\]$/.test(v) )curr_obj = (obj[v.replace(/[\[\]]/g,"")]={});
				
				else if( /=/.test(v) ){
					tmp = v.split(/=/);
					if(tmp.length == 2){
						if(/,/.test(tmp[1])) tmp[1] = tmp[1].split(/,[\s]*/);
						curr_obj[tmp[0]] = tmp[1];
					}
				}
			}
		}
		return obj;
	};
	
	o.insertAfterLine = function(line, value){
		line = n$(line); value = String(value || "");
		if( o.exists() && line > 0){
			var ar = o.asArray(true);
			for(var i=ar.length; i>line; i--)
				ar[i] = ar[i-1];
				ar[line] = value;
			return file$(file).create(1).add(ar.join("\n"))
		}
		return o;
	};
	
	o.insertBeforeLine = function(line, value){
		line = n$(line) - 1; value = String(value || "");
		if( o.exists() && line > 0){
			var ar = o.asArray(true);
			for(var i=ar.length; i>line; i--)
				ar[i] = ar[i-1];
				ar[line] = value;
			return file$(file).create(1).add(ar.join("\n"))
		}
		return o;
	};
	
	o.lines = function(n, v) {
		
			if(n === undefined) {
				if( !o.exists() )return 0;
				var f1 = FSO.OpenTextFile( o.path(), 1 ),
				ln = 1;
				while( !f1.AtEndOfStream ){ f1.SkipLine(); ln++ };
				f1.close();
				return ln;
			}
	
			else if(o.exists() && typeof n == "function")
				return file$(file).eachLine(n); 
			
			else if(!isNaN(n))
				if(o.exists())
					if(v != undefined)return o.ChangeLine(n, v);
					else return o.ReadLine(n);
		return 0;
	};
	
	o.move = function(path, overwrite) {
		if( o.exists() ) {
		try{
			path = (path || folder$().path()).replace(/[\/\\]+/g, "/").replace(/[\/]+$/g, "");
			var new_path = path + "/" + o.name();
			var f = file$(new_path);
			if(folder$(path).exists()){
				if( f.exists() ){
					if(overwrite){
						f.Delete();
						var a = o.attr(); o.attr(a&2);
						FSO.MoveFile(file, new_path);
						return file$(new_path).attr(a);
					}
					else return file$(file);
				}
				else {
					var a = o.attr(); o.attr(a&2);
					FSO.MoveFile(file, new_path);
					return file$(new_path).attr(a);
				}
			}
		}
		catch(e){WS.PopUp("ERROR:\t" + e.message + "\nFile:\t" + file,0,"Error",16)}
		}
		return file$(file);
	};

	o.open = function() {
		if(o.exists())WS.Run("\""+o.path()+"\"", 0); 
		return file$(file);
	};
	
	o.plus = function(ln, n){
		if( o.exists() && !isNaN(n) ){
			return o.lines(ln, n$(n$(o.lines(ln)||0)+n));
		}
		return 0;
	};

	o.read = function(n) {
		var value = ""; 
		if( o.exists() )
		{
			var f1=FSO.OpenTextFile(file, 1);
			if( !f1.AtEndOfStream )value = f1.ReadAll().replace(/\r/g,"");
			f1.Close();
		}	
		return value;
	};
	
	

	o.ReadLine = function(line) {
		if( o.exists() && line != 0 ){
			var n = 1, v = "",
			f1 = FSO.OpenTextFile(file,1);
			if( line < 0 ) line = o.lines() + line;
			while( n++ != line ){
				if( f1.AtEndOfStream ){
					f1.close(); return v;
					break
				};
				else f1.SkipLine();
			}
				if(!f1.AtEndOfStream)v = f1.ReadLine();
				f1.close();
				return v
		}
		else return "";
	};

	o.rename = function(newname) {
		if( o.exists() ) {
			newname = file$(file).folder$() + "/" + newname;
			if( !file$(newname).exists() )FSO.MoveFile(file, newname);
			return file$(newname);
		}
		else return file$(file);
	};

	o.unescape = function(){
		if( o.exists() ){
			var s = unescape(o.read());
			o.wipe().add(s);
		}
		return file$(file);
	};
	
	o.wipe = function() {
		if(o.exists()){
			var a = o.attr();
			o.attr(a&2);
			var f1 = FSO.OpenTextFile(file, 2);
			f1.Close();
			o.attr(a);
		}
	return file$(file);
	};
	
	o.write = function(t){
		try{ file$(file).create(1).add(t); }
		catch(e){WS.PopUp("ERROR:\t" + e.message + "\nFile:\t" + file,0,"Error",16)}
		return file$(file);
	};
	
	return o;
}


/* #FOLDER$ */

function folder$(f) {
	var FSO = new ActiveXObject("Scripting.FileSystemObject"),
		WS = new ActiveXObject("WScript.Shell");
	if( f == undefined || f == "") f = FSO.GetAbsolutePathName("");
	else if(/^\?[\w]+/.test(f)) {
		/*
		AllUsersDesktop
		AllUsersStartMenu
		AllUsersPrograms
		AllUsersStartup
		Desktop
		Favorites
		Fonts
		MyDocuments
		NetHood
		PrintHood
		Programs
		Recent
		SendTo
		StartMenu
		Startup
		Template
		*/
		var itm = WS.specialfolders.item(f.match(/\?[\w]+/).toString().replace(/^\?/,""));
		if( itm )f = f.replace(/^\?[\w]+/i, itm);
	}
	var fex = FSO.FolderExists(f),
		dex = FSO.DriveExists(f);
	var	o  = new String(fex || dex ? f : "");

	f = String(f);

	
	if(!fex && FSO.FileExists(f)) f = file$(f).folder$();

	var isDrive = /^[a-zA-Z]\:[\/\\\s]*$/.test(f) && dex;

	var	folderGet 		= isDrive ? FSO.GetDrive(f).RootFolder : fex ? FSO.GetFolder(f) : {};

	o.exists  		= function(){ return fex };
	o.isDrive 		= function(){ return isDrive };
	o.path 			= function(){ return fex ? String(folderGet.path).replace(/\\/g,"/") : "" };
	o.size 			= function(){ 
		try{ return isDrive ? FSO.GetDrive(f).TotalSize : o.exists() ? folderGet.size : 0; }
		catch(e){return 0}
	};
	o.name 			= function(){ return isDrive ? FSO.GetDriveName(f) : o.exists() ? folderGet.Name : "" };
	o.rootFolder 	= function(){ return !isDrive && o.exists() ? FSO.GetParentFolderName(o.path()) : "" };
	o.RootFolder	= function(){ return !isDrive ? o.rootFolder() : o.path() };
	o.shortPath 	= function(){ return folderGet.shortPath || "" };

		
	o.attr = function(n) {
		if( o.exists() ){
		try {
			if(n == undefined)return folderGet.Attributes;
			else if(typeof n == "number" && n >= 0)folderGet.Attributes = n; 
		}
				catch(e){}
		}	
		return folder$(f);
	};

	o.back = function(n){
		if( o.exists() ){
			var ar = o.path().split("/");
			var len = ar.length;
			if( isNaN(n) || n < 0 )n = 1;
			n = Math.min(len-1, n);
			for(var i=0; i<n; i++)ar.splice(len-i-1,1);
			return folder$( ar.join("/") )
		}
		return folder$(folder);
	};

	o.create = function(p){
		if(!o.exists())FSO.CreateFolder(f);
		if(typeof p != "undefined"){
			p = p.replace(/\//g,"\\").split(/\\/);
			var nf = folder$(f).create();
			for(var i in p)nf = nf.folder$(p[i]).create();
			return nf;
		}
		return folder$(f);
	};
	 
	o.create_shortcut = function(path, link_to_shortcut){
			if(o.exists()){
				path = folder$(path).path() + "\\" + o.name() + ".lnk";
				var s = WS.CreateShortCut(path);
				s.TargetPath = o.path();
				s.save();
				return !!link_to_shortcut ? file$(path) : folder$(f);
			}
			return folder$(f);
	};
	 
	o.copy = function(src, t){
		src = src || "";
		t = t == undefined ? true : !!t;
		if(o.exists())
		{
			var rg = eval("/"+o.name()+"$/");
			if(!rg.test(src))src += o.name();
			if(!folder$(src).exists())FSO.CopyFolder(f, src); 
			return folder$(t ? src : f); 
		}
		return folder$(f);
	};
	 
	o.Delete = function() {
		if(o.exists()){
			o.attr(0);
			FSO.DeleteFolder(o.path());
		}
		return folder$(f);
	};

	o.eachFile = function(func, ext, p){
		var fls = typeof ext != "string" || ext == -1 ? o.files() : o.files(ext);
		var isFunc = typeof func == "function";
		p = n$(p);
		if( func && o.exists() && fls.length > 0 ){
			for(var i=p; i<fls.length; i++)
			{
				$i = i;
				$curr_file = file$(fls[i]);
				$f = $curr_file;
				if( (isFunc ? func.apply($curr_file, [$f, i]) : eval(func)) === false )break;
			}
			delete $i;
			delete $curr_file;
			delete $f;
		}
		return folder$(f);
	};

	o.eachFolder = function(func){
		if( func && o.exists() && o.subfolders().length > 0 ){
			var ar = o.subfolders();
			var isFunc = typeof func == "function";
			for(var i=0; i<ar.length; i++)
			{
				$i = i;
				$curr_folder = folder$(ar[i]);
				$f = folder$(ar[i]);
				if( (isFunc ? func.apply($curr_folder, [$f, i]) : eval( func )) === false )break;
			}
			delete $i;
			delete $curr_folder;
			delete $f;
		}
		return folder$(f);
	};

	o.file = function(n, ext) {
		if( o.exists() ){
		var ar = ext ? o.files(ext) : o.files();
		var fl = ar.length;
		n = n$(n);
		if(n >= 0)return file$( ar[n] );
		else if(n < 0 && fl > 0)return file$(ar[fl+n]);
		}
		return file$(null);
	};

	o.file$ = function(file){return file$(f+"/"+file)};

	o.files = function(n, fobj){
		if( o.exists() ){
		var ar = [],
			enum_fld = folderGet;
		var enm = new Enumerator(enum_fld.files);
		if( typeof n == "number" ){
			for(; !enm.atEnd(); enm.moveNext() )ar.push( String(enm.item()) );
			var f = n < 0 ? ar[ar.length+n] : ar[n];
			return fobj ? file$(f) : f;
		}
		else if(typeof n == "string"){
			 n = n.replace(/[\,\.]/g,"").match(/[a-zA-Z0-9]+/g);
			 for(; !enm.atEnd(); enm.moveNext() ){
					var itm = String( enm.item() );
					for(var i=0; i<n.length; i++){
						if(n[i].toLowerCase() == FSO.GetExtensionName(itm).toLowerCase()){
							ar.push(fobj ? file$(itm) : itm);
							break
						};
					}
				}
			return ar;
		}
		else {
			for(; !enm.atEnd(); enm.moveNext() ){
				var f = String(enm.item());
				ar.push( fobj ? file$(f) : f );
			}
			return ar;
		}
		} else return []; 
	};

	o.folder$ = function(fld){
		if( o.exists() ) return fld == undefined ? folder$(folder$(f).rootFolder()) : folder$(o.path()+"/"+fld);
		else return folder$(f);
	};

	o.get = function(){return folderGet};

	o.getDrive = function(){
		if(isDrive)
			return FSO.GetDrive(f);
		else if(!isDrive && o.exists())
			return FSO.GetDrive(FSO.GetDriveName(f));
		return {}
	};

	o.GetDrive = o.getDrive;

	o.hasSubfolders = function(){
		return o.exists() && o.get().subfolders.count;
	};

	o.move=function(p){
		p = folder$(p);

		if(o.exists() && p.exists()){
			var a = o.attr();
			p = p.path() + (p.path().match(/\/$/) ? "" : "/") + o.name();
			FSO.MoveFolder(f, p);
			folder$(p).attr(a);
		}
		return folder$(f);
	};

	o.open = function(){
		if(o.exists())
			WS.Run("\""+o.get().path+"\"");
		return folder$(f);
	};

	o.rename = function(newname){
		newname = String(newname);
		newf = folder$(newname);
		if( o.exists() && !newf.exists()) {
			newname = o.rootFolder() + "/" + newname;
			var a = o.attr();
			if(!folder$(newname).exists())FSO.MoveFolder(f, newname);
			folder$(newname).attr(a);
			return folder$(newname);
		}
			return folder$(f);
	};

	o.subfolders = function(n){
		if(o.exists()){
			var ar = [];
			var enum_fld = FSO.DriveExists(f) ? FSO.GetDrive(f).RootFolder : FSO.GetFolder(f);
			var enm = new Enumerator( enum_fld.subFolders );
			for(; !enm.atEnd(); enm.moveNext()) ar.push( String(enm.item()) );
			return ar[n] || ar;
		}
	};
	o.folders = o.subfolders;
	return o;
}

function f$(f){ return folder$(f).exists() ? folder$(f) : file$(f).exists() ? file$(f) : {} }

var folder_ = fd_ = folder$,
	file_ = fl_ = file$;

function percent(num1, from, index){
	var x;
	if ( index == undefined || index == 0 )x = !isNaN(num1)&&!isNaN(from)?(from*num1)/100:x;
	else if ( index == 1 )x = (num1*100)/from;
	return x;
}

function encode(text){
	var str = ""; text = String(text);
	for(var i=0; i<text.length; i++)str += String.fromCharCode(text.substring(i, i+1).charCodeAt(0)+8);
	return str;
}

function decode(text){
	var str = ""; text = String(text);
	for(var i=0; i<text.length; i++)str += String.fromCharCode(text.substring(i, i+1).charCodeAt(0)-8);
	return str;
}


function action$(code){
	if(event.keyCode==13)
	if(code.call)code.call();
	else if(typeof code == "string")eval(code);
}

function case$(num, one, two, more){
	num = String(num);
	var lastChar = num.charAt(num.length-1),
		penult = num.charAt(num.length-2),
		cs;
	cs = lastChar == 1 ? one : lastChar > 1 && lastChar < 5 ? two : more;
	if(num.length>1 && penult == 1 && lastChar > 1 && lastChar < 5)cs=more;
	if(num.length>1 && penult == 1 && lastChar == 1)cs=more;
	return slice_number(num)+" "+cs;
}

function sleep(func, time){
	time = time == undefined || time <=0 ? time = 1 : time;
	if(typeof func == "function") setTimeout(function(){func.call()}, time);
	else if(typeof func == "string") setTimeout(function(){eval(func)}, time);
	return time;
}

function date$(date){	
	try {
	if( date == undefined )date = new Date();
	else date = new Date(isNaN(date)?date:+date);
	date.hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
	date.h = date.getHours();
	date.minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
	date.min = date.getMinutes();
	date.seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
	date.s = date.getSeconds();
	date.day = date.getDate() < 10 ? "0"+date.getDate() : date.getDate();
	date.d = date.getDate();
	date.dn = date.getDay();
	date.month = (date.getMonth()+1) < 10 ? "0"+(date.getMonth()+1) : (date.getMonth()+1);
	date.m = date.getMonth()+1;
	date.year = n$(date.getFullYear());
	date.y = n$(date.getFullYear());

	date.fullDate = function( separator ) {
		if(separator == undefined) separator="/"; 
		return (date.day + separator + date.month + separator + date.year)
	};

	date.time = function(withSeconds, separator){
		full_time = "";
		if(separator==undefined || !separator)separator = ":";
		full_time = date.hours + separator + date.minutes;
		if(!!withSeconds)full_time += separator + date.seconds;
		return full_time;
	};

	date.passed = function(n){
		n = Math.max(0, n$(n));
		var t = n > 0;
		var date1 = +new Date();
		var date2  = +date;
		var d = date1 - date2;
		var o = new Boolean(date2 < date1);
		o.b = date2 < date1;
		o.y = t ? !! (n < (d/(1000*60*60*24*30*12))) : Math.floor(d/(1000*60*60*24*30*12));
		o.m = t ? !! (n < (d/(1000*60*60*24*30))) : Math.floor(d/(1000*60*60*24*30));
		o.d = t ? !! (n < (d/(1000*60*60*24))) : Math.floor(d/(1000*60*60*24));
		o.h = t ? !! (n < (d/(1000*60*60))) : Math.floor(d/(1000*60*60));
		o.min = t ? !! (n < (d/(1000*60))) : Math.floor(d/(1000*60));
		o.s = t ? !! (n < (d/(1000))) : Math.floor(d/(1000));
		o.ms= t ? !! (n < d) : Math.floor(d);
		
		return o;
	};

	date.left = function(){
		var o = new Object();
		var now = +new Date();
		var d = +date - now;
		o.y = Math.floor(d/(1000*60*60*24*30*12));
		o.m = Math.floor(d/(1000*60*60*24*30));
		o.d = Math.floor(d/(1000*60*60*24));
		o.h = Math.floor(d/(1000*60*60));
		o.min = Math.floor(d/(1000*60));
		o.s = Math.floor(d/1000);
		o.ms = Math.floor(d);
		return o;
	};

	return date;
	} catch(e){} 
}

function vstr(str){
	for(var i=1; i<arguments.length; i++)
		str = str.replace(/%[a-z0-9]{1}/, arguments[i]);
	return str;
}

function slice_number(s){
	if( isNaN(s) )return s;
	var c = s < 0;
	s = Math.abs(s).toFixed();
	var ns = "";
	for(var i=s.length; i>=0; i-=3)
		ns = s.substring(i, i-3) + (i>0&&i!=s.length?String.fromCharCode("0160"):"") + ns;
	return c ? "-" + ns : ns;
}

function environ(str){
	var WS = new ActiveXObject("WScript.Shell");
	return WS.ExpandEnvironmentStrings(str);
}

function int( a ) { return String(a).charCodeAt(0) }
function char( n ) { return String.fromCharCode( n ) }

// IE7-
function typeOf( arg ) {
	var ret = typeof arg;

	if( ret == "number")
		if( isFloat(arg) )return "float";
		else return ret;
	
	if( arg === null ) return "null";
	if( arg instanceof Date ) return "date"
	if( arg instanceof Array) return "array";
	return ret;
}

function cloneObj(obj){
	var o = [];
	if( typeof obj == "object") for(var i in obj)o[i] = obj[i];
	return o;
}


String.prototype.folder$ = function(){ return folder$(this) }
String.prototype.file$ = function(){ return file$(this) }

String.prototype.vstr = function(){
	var ar = [this];for(var i=0; i<arguments.length; i++)ar.push(arguments[i]);
	return vstr.apply(this, ar)
};

String.prototype.v = function(str){
	var ar = [this];for(var i=0; i<arguments.length; i++)ar.push(arguments[i]);
	return vstr.apply(this, ar)
};

String.prototype.trim = function(){
	var tr = /^[\s]+|[\s]$/, s = this;
	while( tr.test(s) ) s = s.replace(tr, "");
	return String(s);
};

String.prototype.tag = function(t){
	if(!/^[\<]/.test(t))return "<" + t + ">" + this + "</" + t + ">";
	return t+this+t.match(/^<[a-zA-Z]+[\s>]{1}/).toString().replace(/[\s>]{1}$/,"").replace(/^</,"</")+">";
};

String.prototype.encode = function(){return encode(this)};
String.prototype.decode = function(){return decode(this)};
String.prototype.end = function(s){s = s || "."; return this.replace(/[^a-zA-Z0-9à-ÿ³¿ºÀ-ß\)\]\>\"\']+$/i,"")+s};
String.prototype.c = function(){return this.substring(0,1).toUpperCase()+this.substring(1,this.length).toLowerCase()};
String.prototype.lc = function(){return this.toLowerCase()};
Number.prototype.slice = function(){return slice_number(this)};
Number.prototype.inRange = function(st, end, inc){
	if( inc === undefined )inc = true;
	var op = !!inc ? ">=" : ">";
	return eval(this + op + st + "&& " + end + op + this)
};
Number.prototype.range = function(st, end){
	return Number(this > end ? end : this < st ? st : this);
};


/* Array-functions */
var __array = _array = array = ARRAY = new Object();

function indexOf(ar, el, n){
	ar = ar || []; var m = -1;
	n = Math.max(0, n$(n));
	for(var i=n; i<ar.length; i++) 
		if(ar[i] == el){ m = i; break;}
	return m;
}

function array_unique(ar){
	var b = []; var ar2 = [];
	if( typeof ar != "object" )return ar;
	for(var i=0; i<ar.length; i++){
		if( !b[ar[i]] ){
			b[ar[i]] = true;
			ar2.push(ar[i]);
		}
	}
	return ar2;
}


function invert_array(ar){
	if( typeof ar != "object" || !ar.length)return ar;
	for(var ar2 = [], i=0; i<ar.length; i++)ar2[ i ] = ar[ ar.length-i-1 ];
	return ar2;
}


function randomize_array(ar){
	var n_ar = [];
	var rnd, len = ar.length;
	for(var i=0; i<len; i++){
		rnd = indexOf(ar, rand(ar));
		n_ar.push( ar[ rnd ] );
		ar.splice(rnd, 1);
	}
	return n_ar;
}

function array_escape( ar ) {
	if( typeof ar != "object" || !ar.length ) return [];
	var ret = []; for(var i=0; i<ar.length; i++) ret.push( escape( ar[i] ) );
	return ret;
}


function array_unescape( ar ) {
	if( typeof ar != "object" || !ar.length ) return [];
	var ret = []; for(var i=0; i<ar.length; i++) ret.push( unescape( ar[i] ) );
	return ret;
}

function array_cmp_or(ar, val){
	for(var i=0; i<ar.length; i++)
		if( ar[i] == val ) return true;
	return false;
}



array.unique = array_unique;
array.invert = invert_array;
array.randomize = randomize_array;
array.escape = array_escape;
array.unescape = array_unescape;
array.cmp_or = array_cmp_or;

/* Console */

function Elem(tagname, attr){
	var el = document.createElement(tagname);
	for(var i in attr) el [ i ] = attr[i];
	return el;
}

function gtime(){
	return (new Date()).getTime();
}

function parseHT( file ){
	file = file$(file);
	if( !file.exists ) return "";
	var ret = file.read(), i=0;
	var ar = ret.match(/##[^##]+##/g) || [];
	for(;i<ar.length; i++){
		var val = ar[i].replace( /##/g, "" );
		try { val = eval(val) }
		catch(e){ val = "[" + e.name + "] " + e.message }
		ret = ret.replace(ar[i], val);
	}
	return ret;
}

/* JSON */
function strquotes(s) { return "\"" + s + "\"" }

function tab(n) { var t = ""; for(var i=0; i<n; i++) t += "\t"; return t; }

var json_tab = 0;
function toJSON( obj, bFormat ){
	if( bFormat === undefined ) bFormat = true;
	var 
		isArray = obj !== null && obj.length !== undefined,
		types = ["undefined","function","number","boolean"],
		json = isArray ? "[" : "{",
		prop_c = 0
	;
	json_tab++
	for(var i in obj){
		prop_c ++;
		var t = typeof obj[i];
		json += (bFormat?(isArray && t == "number" ? " " : "\n"+tab(json_tab)):"") + 
			(isArray ? "" : "\""+i+"\"" + (bFormat?" : ":":"));
		if( array_cmp_or(types, t)  ) json += obj[i];
		else if( t == "object" ){
			if( obj[i] !== null ) json += toJSON(obj[i], bFormat);
				else json += "null"
		}
		else json += strquotes(obj[i]);
		json += ",";
	}
	json = json.replace(/,[\s]*$/,"");
	--json_tab;
	json += (bFormat&&prop_c?(!isArray?"\n"+tab(json_tab):" "):"")+(isArray ? "]" : "}");
	return json;
}

function parseJSON(json){
	var obj; 
	try{ eval("obj="+json); }
	catch(e) { obj = new Error("JSON parsing error.") }
	return obj;
}

String.prototype.parseJSON = function(){ return parseJSON(this) }

/* AUTH.JS Here: */
var auth = {fld: folder$("/Auth"), ent: -1};

auth.register = function(name, pass) {
	var f = auth.fld.create("users");
	if( auth.user(name).valid || !isNaN(name) || !name || !name.length )return false;
	var obj = {name: name, pass: pass, id: f.files().length, access: 0}
	f = f.file$( gtime().toString(16) );
	f.add( toJSON(obj) );
	return true;
};

auth.delete_user = function(id){
	if( auth.user(id).valid ){
		auth.user(id).f().Delete();
		return true;
	}
	return false;
}

auth.logIn = function(name, pass) {
	var curr = auth.user(name).json;
	if (curr.name == name && pass == curr.pass) auth.ent = +curr.id;
	return auth.ent;
};

auth.user = function(arg){
	var ret = {}; 
	if( arg == undefined ) arg = auth.ent;
	var prop = isNaN(arg) ? "name" : "id";
	ret.json = {name: "guest", id: -1};
	

	auth.fld.folder$("users").eachFile(function(f, i){
		var curr = parseJSON(f.read());
		if (curr[prop] == arg) {
			ret.f = function(){ return file$(f) };
			ret.json = curr;
			return false;
		}
	})
	ret.reload = function(){ if( !ret.valid) return !1; ret.f().wipe().add(toJSON(ret.json)); return !0 }
	ret.valid = !!ret.json.id && ret.json.id != -1;
	
	return ret;
}

auth.each = function(f){
	if( typeof f != "function" ) return;
	auth.fld.folder$("users").eachFile( function() {
		f.apply(auth.user( this.asJSON().id ));
	} )
}

function Include( src ) {
	document.getElementsByTagName("head")[0].appendChild(Elem("script", { src: src }));
}

var Keys=[];Keys[8]="Backspace";Keys[9]="Tab";Keys[13]="Enter";Keys[16]="Shift";Keys[17]="Ctrl";Keys[18]="Alt";Keys[19]="PauseBreak";Keys[20]="CapsLock";Keys[27]="Escape";Keys[32]="Space";Keys[33]="PageUp";Keys[34]="PageDown";Keys[35]="End";Keys[36]="Home";Keys[37]="Left";Keys[38]="Up";Keys[39]="Right";Keys[40]="Down";Keys[45]="Insert";Keys[46]="Delete";Keys[48]="D0";Keys[49]="D1";Keys[50]="D2";Keys[51]="D3";Keys[52]="D4";Keys[53]="D5";Keys[54]="D6";Keys[55]="D7";Keys[56]="D8";Keys[57]="D9";Keys[65]="A";Keys[66]="B";Keys[67]="C";Keys[68]="D";Keys[69]="E";Keys[70]="F";Keys[71]="G";Keys[72]="H";Keys[73]="I";Keys[74]="J";Keys[75]="K";Keys[76]="L";Keys[77]="M";Keys[78]="N";Keys[79]="O";Keys[80]="P";Keys[81]="Q";Keys[82]="R";Keys[83]="S";Keys[84]="T";Keys[85]="U";Keys[86]="V";Keys[87]="W";Keys[88]="X";Keys[89]="Y";Keys[90]="Z";Keys[92]="Win";Keys[93]="Cmd";Keys[112]="F1";Keys[113]="F2";Keys[114]="F3";Keys[115]="F4";Keys[116]="F5";Keys[117]="F6";Keys[118]="F7";Keys[119]="F8";Keys[120]="F9";Keys[121]="F10";Keys[122]="F11";Keys[123]="F12";Keys[96]="Num0";Keys[97]="Num1";Keys[98]="Num2";Keys[99]="Num3";Keys[100]="Num4";Keys[101]="Num5";Keys[102]="Num6";Keys[103]="Num7";Keys[104]="Num8";Keys[105]="Num9";Keys[106]="NumStar";Keys[107]="NumPlus";Keys[108]="K108";Keys[109]="NumMinus";Keys[110]="NumDot";Keys[111]="NumSlash";Keys[144]="NumLock";Keys[145]="ScrollLock";Keys[187]="Plus";Keys[189]="Minus";Keys[192]="~";for(var i in Keys)Keys[Keys[i]]=+i;
}/* END */