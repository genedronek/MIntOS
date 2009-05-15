function getTime() { return (new Date).getTime() }
function byId(s) { return document.getElementById(s) }

//  attach px as default unit to strings and numbers
function intPx(i)
{
	i = i.toString();			//  cast into string
		
	if ( i.match( /\d$/ ) )		//  if ends with digit
		i = i + "px";			//  auto append  px
		
	return i;
}

//  convert string argument to integer number
// convert floating number to integer number
function int(s) { return parseInt(s.toString(),10) }



function keys(o,all) 
{
	var ret = [ ];
	if ( typeof o == "undefined" )
		return "(undefined)";
	if ( typeof o == "number" || typeof o == "string" )
		return "("+o+")";
	
	//  must be object then
	for (var i in o)  {
		if (  all       || o.hasOwnProperty(i) )
			ret.push( i + (o.hasOwnProperty(i)?"":"*") 
						//+ ("=" + o[i])
					);
	}
	return ret;
}

function values(o,all)
{
	var ret = { };
	for (var i in o)  {
		if (  all       || o.hasOwnProperty(i) )
			ret[ o[ i ] ] = i+"";
	}
	return keys(ret,all);
}

function random(n) {  return Math.floor( n * Math.random() )  }

function ranColor() {
	var hexTab = "5555556789ABCDEF";	//  light random colors
	var r = hexTab[ Math.floor( Math.random() * 16) ];
	var g = hexTab[ Math.floor( Math.random() * 16) ];
	var b = hexTab[ Math.floor( Math.random() * 16) ];
	return "#" + r + g + b;
}

// scion = beget( obj ) -> scion gets an new, empty object
//	that inherits from obj.
//	Algorithm due to Douglas Crockford

Object.beget = function (o) {
	var tmp = function () { };	//  get tmp handle to a function.
	tmp.prototype = o;			//  we can re-aim the functions prototype
	var empty = new tmp();		//  a new, empty object that inherits from o
	return empty;				//  voilå
}


//  methods to adorn strings
String.prototype.prefix = function (p)   { return (p || "") + this }
String.prototype.affix  = function (a)   { return this + (a || "") }
String.prototype.wrap   = function (p,a) { return (p||"") + this + (a||"") }
String.prototype.rep    = function (n)   { for(var s="";n-- >0;)s+=this;return s}
String.prototype.rjust  = function (w,c) { return c.rep( w-Math.min(w,this.length))+this }

function nbsp(n)	 { return "&nbsp;".rep(n) }
function sp(n)		 { return " ".rep(n) }
function basename(s) { return s.replace(/.*\//,"") }


function listProduct(a,b,vargs)
{
	var ret = [ ];
	if ( typeof a == "string" ) a = [ a ];
	if ( typeof b == "string" ) b = [ b ];
	
	for (var i = 0; i < a.length; i++)
		for (var j = 0; j < b.length; j++)
			ret .push( a[i].toString() + b[j].toString() );
	
	for ( i = 2; i < arguments.length; i++)		//  do remaining args
		ret = listProduct( ret, arguments[i] );

	return ret;
}

function listSum(a,b,vargs)
{
	if ( typeof a == "string" ) a = [ a ];
	if ( typeof b == "string" ) b = [ b ];		//  auto promote
	var ret = [ ];
	for (var i= 0; i < a.length; i++)
		ret.push( a[ i ] );
	for ( i = 0; i < b.length; i++)
		ret.push( b[ i ] );
	
	for ( i = 2; i < arguments.length; i++)		//  do remaining args
		ret = listSum( ret, arguments[i] );

	return ret;
}

function listToHash(a)
{
	var ret = { };
	for (var i = a.length; --i >= 0; )
		ret[ a[i] ] = a[i];
	return ret;
}
function hashToList(o)
{
	var ret = [ ];
	for (var i in o)
		if ( o.hasOwnProperty(i) )
			ret.push( i );
	return ret;
}

function listDifference(defd,used)
{
	var ret = [ ];
	defd = listToHash(defd);
	for (var i = 0; i < used.length; i++)
		if ( !defd[ used[i] ] )				// if ( used & !defd )
			ret.push( used[i] );
	return ret
}

function hashDifference(defd,used)
{
	ret = [ ];
	for (var i in used)
		if ( used.hasOwnProperty(i) )
			if ( typeof defd[ i ] == "undefined" )
				ret.push( i );
	return ret;
}

//  Method to wrap each element of this array
//  returns array
Array.prototype.wrapEach = 
function wrapEach(prefix,suffix) 
{
	var ret = [ ];
	for (var i = 0; i < this.length; i++) {
		ret .push( prefix + this[i] + suffix );
	}
	return ret;
}

//  flatten array into string
//  wrap each element by *prefix*,*suffix* params
//  join by *infix* param
 
Array.prototype.flatten = 
function flatten(prefix,suffix,infix) 
{
	return this.wrapEach(prefix||"",suffix||"").join(infix||"");
}

Array.prototype.each =
function each(f)
{
	var ret = [ ];
	for (var i = 0; i < this.length; i++)
		ret.push( f.call( this[i], i ) );
	return ret;
}

// interpolate object to i-th step [0...n] between o1,o2
// for every property in o1
function tweenStep(o1,o2,i,n) {
	var ret = {};
	for (name in o1) {
		if ( !o1.hasOwnProperty( name ) ) continue;
		var v1 = o1[ name ], v2 = o2[ name ];
		
		if ( typeof v2 == "undefined" ) v2 = v1;
		var f = i / n;
		
		//  all numbers are simple linear interpolation from o1...o2
		var val = v1 + f*( v2 - v1 );
		if ( v1 == v2 )
			val = v1;
			
		// for colors interpolate RGB channels separately
		if ( name.match( /color/i ) ) {
			val = map_rgb_color( v1, v2, i, n );
		}
		
		//  constrain z-index to integer values
		if ( name == "zIndex" )
			val = Math.floor( val );
			
		ret[ name ] = val;
 	}
	return ret;
}
//  parse # rr gg bb
function rgb(s) {
//alert("rgb " + s);
	var sharp = s.substr(0,1);
	var r = s.substr(1,2);
	var g = s.substr(3,2);
	var b = s.substr(5,2);
	var ret = [ parseInt(r,16), parseInt(g,16), parseInt(b,16) ];
	//alert( s + "->"+ ret[0] + ret[1] + ret[2] );
	return ret;
}
	

function map_rgb_color(v1,v2,i,n) {
	var rgb1 = rgb( v1 );
	var rgb2 = rgb( v2 );
	var rgb3 = [ ];
	var hexTab = "0123456789ABCDEF";	
	var f = i / n;			//  normalize to fraction of progress
	
	for (var j = 0; j < 3; j++) {
		var val  = Math.floor( rgb1[j] + f * (rgb2[j] - rgb1[j]) );
		var str  = hexTab[ Math.floor(val / 16) ] + hexTab[ Math.floor(val % 16) ];
		rgb3[j] = str;
	}
	var str = "#" + rgb3[0] + rgb3[1] + rgb3[2];
	//alert("map returns " + str );
	return str;
}

function showEscape(s)
{
	for (var i = 0, ret = ""; i < s.length; i++)
		ret += "\t" + s[i] + escape( s[i] );
	return ret;
}
//alert( showEscape('~!@#$%^&*(){}[]=:/,;?+\'"\\') );

function sliceNine(a,b,c,d,e,f,g,h,i)
{
	// guarantee args array
    var n = a;
    if ( arguments.length > 1 || a.constructor != Array )
    	n = [ a, b, c, d, e, f, g, h, i ];
        
    //  compose slice-nine table from array n
    return JMLtoHTML(
                    [ "table", { className: "slice9" }, 
                        [ "tr", {},
                            [ "td", {}, n[0] || ""],
                            [ "td", {}, n[1] || ""],
                            [ "td", {}, n[2] || ""] ],
                        [ "tr", {},
                            [ "td", {}, n[3] || ""],
                            [ "td", {}, n[4] || ""],
                            [ "td", {}, n[5] || ""] ],
                        [ "tr", {},
                            [ "td", {}, n[6] || ""],
                            [ "td", {}, n[7] || ""],
                            [ "td", {}, n[8] || ""] ]
                    ] );
}
  

