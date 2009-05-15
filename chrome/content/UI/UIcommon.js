/*
 *  UI common.js - named constants and functions in common to UI 
 */
 


//
//  shared constants that control the dynamic creation of most UI elements
//  
var imgsPath   =  "chrome://sample/content/UI/i/";
var sbpStyle = 		"background: rgb(236,233,216); " +
  "border-left: 1px solid rgb(259,258,249);" +
  "border-top:  2px solid rgb(259,258,249);" +
  "border-right:  2px solid rgb(180,180,150);" +
  "border-bottom: 2px solid rgb(106,106,88);" +
  "color: blue; margin:0, padding:auto; xwidth:16px; yheight:8px; overflow:hidden;";
var imgStyle =	 	"border: 1px solid gray; " + "background: rgb(236,233,216); " +
  "margin-left:0px; margin-right:0px; width: 10px; height: 10px; opacity:0.8;"; 
var arrowLeft   = { src: imgsPath+"arrows.black.left2.png",  style: imgStyle }
var arrowRight  = { src: imgsPath+"arrows.black.right2.png", style: imgStyle }
var onoffButton = { src: imgsPath+"brain.on.png", 
  id: "onoffButton", 						//  where popup is anchored
  onclick: "onoffClickHandler(this)" }
var popupButton = { src: imgsPath+"bulb.yellow.png", style: "background: rgb(236,233,216); ",
  id: "popupButton", width: "22px", height: "10px",
  onclick: "popupClickHandler(this)"}
var pN			= 4;  //  popup width ( integer segments )
var pWidth		= pN*64 + 2*12 + 22 + 6;
//var popupWin    = { id: "popupWin", width: pWidth, height: "0", position: "before_start" };
var popupWin    = { id: "popupWin", width: 404, height: "0", position: "before_start" };
var popupWin2    = { id: "popupWin2", width: 404, height: "0", position: "before_start" };
var statusBar;		//  retain statusbar ele
var pup;			//  retain popup ele

//New variables/constants defined
const STATUS_ITEMBOX_LENGTH = 360;
const POPUP_ITEMBOX_LENGTH = 360;
var curUIState;

var UItrails = [ 
  ["a1", "a2", "a3", "a4", "a5", "a6", "a7"],
  ["b1", "b2", "b3"],
  ["c1", "c2", "c3", "c4", "c5", "c6"]
];
	
var UIoffsets = [ ];

var UIdefault = -1;		//  default is ix into UItrails


//  generic create new node
//    optional set attributes
//    optional append to parent
function createElement(tag,attrs,parent)
{
  attrs = attrs || { };
  var ele = document.createElement( tag );
  setAttributes( ele, attrs);
  if ( parent )
    parent.appendChild( ele );
  return ele;
}
	
//  generic set multiple attributes
function setAttributes(ele,o)
{
  for (var i in o) {
    if ( o.hasOwnProperty(i) )
      ele.setAttribute( i, o[i] );
  }
}

//  toggle filename string .component. using "[word1 word2]
function toggleFilename(s,words)
{
  var q = "\.", p = ".";			//  quoted plain 
  var patts = [ new RegExp(  q+ words[0] +q  ),
    new RegExp(  q+ words[1] +q  ) ];
  if (s.match( patts[0] ) )
    return s.replace( patts[0], p+ words[1] +p);
  else
    return s.replace( patts[1], p+ words[0] +p);
}



//  use via onclick="genericClickHandler(this,event)"
function genericClickHandler(ele,e) 
{ 
  e = e || { };
  //  when called this=chromeWindow, ele=XULElement, e=event object
  alert( ele.label + e.type );
  return false;		//  indicates handled
}


function genericOverHandler(ele,e)
{
  e = e || { };
  //alert( ele.label + e.type + ele.nodeName + ele.childNodes.length )
  var img = createElement( "image", { src: imgsPath + "jumprope.png" } );
  var cn;								//  child node
	
  //setTimeout( function (e) { genericOutHandler( img, {type:"timeout"} ) }, 1000 );
  var parent = ele.parentNode;
  parent.replaceChild( img, ele);
  img.setAttribute( "onmouseout", "genericOutHandler(this,event)" );
  if ( !img.restore ) {
    //  these two attrs are for our private use
    img.restore = ele;
    //ele.restore = img;
  }
  return false;		//  no bubble/default
}
function to(e)
{
  alert("to");
}
function genericOutHandler(ele,e)
{
  e = e || { };
  var parent = ele.parentNode;
  //alert( parent.id + parent.nodeName +ele.restore );
	
  if ( ele.restore ) {
    parent.replaceChild( ele.restore, ele );
    delete ele.restore;
  }
  return false;		//  no bubbling/default
}
	