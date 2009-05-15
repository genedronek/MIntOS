/*
 *  UI common.js - generic and shared functions between panels
 */

//  extended create node
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

function deleteElement(ele)
{
	if ( !ele || !ele.parentNode ) return;
	//lert('delete ele' + ele )
	ele.parentNode.removeChild( ele );
	//delete ele;
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
	var q = "\.", p = ".";			//  quoted, plain 
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
	
	//  swap element with image, save once for restore
	//  make the popup's popup appear
	var pop2 = createElement( "popup", { id: "pop2", height: 0, width: 50 }, byId("browser-bottombox") );
	pop2.openPopup( ele, "before_end", 0,-15, false,false);
	pop2.sizeTo(50,70);			//  set new working height
	//setTimeout( function (){pop2.parentNode.removeChild(pop2)}, 700 );
/*	
	var img = createElement( "image", { src: imgsPath + "jumprope.png" } );
	var parent = ele.parentNode;
	//parent.replaceChild( img, ele);
	
	img.setAttribute( "onmouseout", "genericOutHandler(this,event)" );
	if ( !img.restore ) {
		//  these two attrs are for our private use
		img.restore = ele;
		//ele.restore = img;
	}
*/
	//return false;		//  no bubble/default
}
function closePop2() 
{ 
	pop2.parentNode.removeChild(pop2); 
	delete pop2; 
	//alert(pop2) 
};
 
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
	