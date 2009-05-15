/*
 *  UI popup.js - functions to support popup window
 */
 
//  create *row*th row of display from input trail
//      append to popup node
//  	we display up to *pN* segments of *the trail* data
//  	starting at *offset*. (which is changed by ui-clicks)
function createPopRow(row,pup,trail,offset)
{
	//alert("cpr "+ row +" "+ offset);
	
	//  clip offset within trail
	if ( offset + pN >= trail.length ) offset = trail.length - pN;	//  adjust down
	if ( !offset || offset < 0 )       offset = 0;					//  adjust up

	//  compute number Items to show
	var nItems = Math.min( pN, trail.length-offset );	// number items clipped
	var pad = pN - nItems;								// padding to right justify
	
	
	//  left arrow
	var laAttrs = { src: imgsPath + "arrows." +
							(offset > 0 ? "red" : "blue") +".left.png",
					style: "width: 16px; height: 20px; " +
							"margin-right:"+ (64*pad) +"px;",	//  right justify next
					id: 	"la",
					onclick: "arrowClickHandler(this,event,-1)",
					rowIx:	row							//  index this row in UIoffsets[]
		};
	//  right arrow
	var raAttrs = { src: imgsPath + "arrows." +
							(offset+pN < trail.length ? "red" : "blue") +".right.png",
					style: 	"width: 16px; height: 20px; ",
					id: 	"ra",
					onclick: "arrowClickHandler(this,event,+1)",
					rowIx:	row
		};
	//  select default
	var sdAttrs = {	src: imgsPath + "radio." + (row==UIdefault?"on":"off") +".jpg",
					style: 	"margin-right:" + (0) +"px;",
					id: 	"select",
					onclick: "setDefaultRow( "+ (row) +" )" 
		};
	//  popup item style
	var puiStyle = 		
						"width: " + (64) + "px;" + 
						"background: rgb(236,233,216); " +
						"border-left: 1px solid rgb(259,258,249);" +
						"border-top:  2px solid rgb(259,258,249);" +
						"border-right:  2px solid rgb(180,180,150);" +
						"border-bottom: 2px solid rgb(106,106,88);" +
						"color: blue; margin:0, padding:0; " +
						"overflow:hidden; xposition: xrelative; xz-index:-1;";		

	//  attach container for row display
	var rowBox = createElement( "box",  {  	id: "row" + row, 
											width: (pWidth), 
											style: "margin-left:0px;"} );
	pup.appendChild(rowBox);
	
	//  finally, we can fill the container with:
	//  	leftarrow item item ...item rightarrow radio
	var la = createElement( "image", laAttrs);
	rowBox.appendChild( la );
	
	//  items
	for (var i = 0; i< nItems; i++) {
		addPop( {	ix:			offset+i,
					label:		formatItem( trail[offset+i] ),
					style:		puiStyle,
					onclick:	"genericClickHandler(this,event)",
					onmouseover: "popupOverHandler(this,event)"
				 }, rowBox );
	}
	//  right arrow
	var ra = createElement( "image", raAttrs) 
	rowBox.appendChild( ra );
	
	//  select as default
	var sd = createElement( "image", sdAttrs ); 
	rowBox.appendChild(sd);
	rowBox.setAttribute( "defaultRow", row);
}

//  add node to popup
//  
function addPop(opts,sb) 
{
	var ele = document.createElement("box");
	setAttributes( ele, opts);
	ele.setAttribute( "pack", "center" );
	sb.appendChild( ele );
	//ele.appendChild( document.createTextNode("goo") );
	ele.appendChild( createElement( "image", { src: imgsPath + "paw.png" } ) );
}


function formatItem(item)
{
	return item; // FINISH
}

//  popupButton click handler
function popupClickHandler(ele)
{
	//  for testing, I andomize all offsets each click
	//  TODO:  offset to be loaded from trail, or bookmark
	for(var i = 0; i < UItrails.length; i++)
		UIoffsets[i] = random( UItrails[i].length );
	
	//  re-initialize popup with redraw true
	popupInit(popupWin,true);
	
	//  make the popup appear
	pup.openPopup( byId("onoffButton"),"before_end", 0,5, false,false);
	pup.sizeTo( pWidth, 30*UItrails.length);
/*	
	//  make the popup's popup appear
	pop2.sizeTo(50,50);			//  set new working height
	pop2.openPopup( byId("popupWin"),"before_end", 0,-5, false,false);
	
	//  toggle lightbulb color
	//var pbutt = byId("popupButton");
	//pbutt.src = toggleFilename( pbutt.src, ["yellow","red"] )
*/
}


function popupOverHandler(ele,e)
{
	e = e || { };
	//alert( ele.id + ele.parentNode.id );
	var img = createElement( "image", { src: imgsPath + "jumprope.png" } );
	var cn;								//  child node
	//pup.sizeTo( pWidth, 200 ); // more elbow room 20*nrows?
	
	//setTimeout( function (e) { genericOutHandler( img, {type:"timeout"} ) }, 1000 );
/*
	var parent = ele.parentNode;
	parent.replaceChild( img, ele);
	img.setAttribute( "onmouseout", "genericOutHandler(this,event)" );
	img.setAttribute( "style", "position:relative;" );
	if ( !img.restore ) {
		//  these two attrs are for our private use
		img.restore = ele;
		//ele.restore = img;
	}
*/
	var pop2 = createElement( "popup", { id: "pop2", height: 0, width: 50 }, byId("browser-bottombox") );
	pop2.openPopup( ele, "before_end", 0,-15, false,false);
	pop2.sizeTo(50,50);			//  set new working height
	setTimeout( function (){pop2.parentNode.removeChild(pop2)}, 700 );
	return false;		//  no bubble/default
}


function arrowClickHandler(ele,e,dir)
{
	//alert(ele+e+dir)
	var row = ele.getAttribute("rowIx");
	UIoffsets[ row ] += dir;		//  update global 
	//alert("row " + row +"  "+UIoffsets[row]);
	popupInit(popupWin,true);		//  redraw true
	return false;					//  event is handled
}

function setDefaultRow(row)
{
	clearRadioButtons();
	setRadioButton( row, "on");
	UIdefault = row;
}
//  set every radio button off
function clearRadioButtons()
{
	//alert("crb");
	for (var row = 0; row < UItrails.length; row++)
		setRadioButton(row,"off");
}
//  set given row's radiobutton "on" or "off"
function setRadioButton(row,state)
{
	//alert("srb"+row + state);
	var cn = byId("row" + row).childNodes;
	if ( !cn ) return;
	
	//  look for sd image as child
	for (var i = 0; i < cn.length; i++) {
		var node = cn[ i ];
		var src = node.getAttribute( "src" );
		//alert( src );
		if ( src )
			node.setAttribute( "src", src.replace( /radio\.[a-z]+\./, 
											 "radio." + state + "." ) );
	}
}
//  function to allocate & fill popup window
var pop2;
function popupInit(popupWin,redraw)
{
	//  allocate XUL popup once, save in global
	if ( !pup )  {
		pup = createElement( "popup", popupWin );		//  create with zero height
		byId("browser-bottombox").appendChild(pup);		//  and append into tree.
	}

	if ( !redraw ) {
		//  synthesize random UIoffsets for given UItrails
		UIoffsets = [ ];
		for(var i = 0; i < UItrails.length; i++)
			UIoffsets.push( random( UItrails[i].length ) );
	}

	//  clean out any prior content
	while ( pup.firstChild )
		pup.removeChild( pup.firstChild );
	
	//  populate from UItrails
	var ht = 22 *UItrails.length;
	pup.sizeTo( pWidth, 0 );
	for (var row = 0; row < UItrails.length; row++) {
		createPopRow( row, pup, UItrails[row], UIoffsets[row] );
	}
}
		
//  function to shut popup
function popupClose()
{
	if ( pup ) {
		pup.setAttribute("height",0);			//  clear working height
		pup.closePopup( );						//  TODO: fix
	}
}
	