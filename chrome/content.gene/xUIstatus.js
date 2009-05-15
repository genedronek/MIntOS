

//  add statusbarpanel node to sb
function addSBP(opts,sb) 
{
	sb = sb || statusBar;
	var ele = document.createElement("statusbarpanel");
	setAttributes( ele, opts)
	sb.appendChild( ele );
}

//  function to add an image node to statusBar
function addSBI(opts,sb)
{
	sb = sb || statusBar;
	var ele = createElement("image", opts);
	sb.appendChild( ele );
}

//  create new node and set attributes
function createElement(tag,attrs)
{
		attrs = attrs || { };
		var ele = document.createElement( tag );
		setAttributes(ele,attrs)
		return ele;
}
	
//  set multiple attributes
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
	// at this point, this=chromeWindow, ele=XULElement, e=event object
	alert( ele.label + e.type );
	return false;		//  indicates handled
}


function onoffClickHandler(ele)  
{
	var isOn = ele.src.match(/\.on\./);
	if ( isOn ) 
		ele.src = ele.src.replace(/\.on\./,".off.");
	else
	 	ele.src = ele.src.replace(/\.off\./,".on.");
}

//  generate popup panel
function popupCreate( popupWin )
{
	var trails = [ 
				  	["a1", "a2", "a3", "a4", "a5", "a6"],
				  	["b1", "b2", "b3"]
					];
	var offsets = [ random(trails[0].length) ,
					random(trails[1].length) ];
	
	//  create XUL popup window, save in global
	if ( !trails || !offsets ) return;
	if ( !pup )  {
		pup = createElement( "popup", popupWin );		//  create with zero height
		byId("browser-bottombox").appendChild(pup);		//  and append into tree.
	}
	
	//  clean out previous display
	while ( pup.firstChild )
		pup.removeChild( pup.firstChild );
	
	//  rebuild display, row by row
	for (var row = 0; row < trails.length; row++) {
		createPopRow( row, pup, trails[row], offsets[row] );
	}
}
		
//  create *row*th row of display, append to popup
//  	display up to *pN* segments of *trail* data
//  	starting at *offset* from end. (which is changed by ui-click)
function createPopRow(row,pup,trail,offset)
{
	//  left arrow
	var laAttrs = { src: "chrome://sample/content/scroller/i/blue-arrows.left.png",
					style: "width: 16px; height: 20px; margin-right:0px;",
					id: 	"la",
					onclick: "arrowClickHandler(this,event,'left')"
		};
	//  right arrow
	var raAttrs = { src: "chrome://sample/content/scroller/i/blue-arrows.right.png",
					style: 	"z-index: 2; " +
							"margin-left:" +  (0) +"px;",
					id: 	"ra",
					onclick: "arrowClickHandler(this,event,'right')"
		};
	//  select default
	var sdAttrs = {	src: "chrome://sample/content/scroller/i/radio." + (row==0?"on":"off")+".jpg",
					style: 	"z-index: 2; " +
							"margin-right:" + (0) +"px;",
					id: 	"select",
					xonclick: "byId('ra').setAttribute('style',backupMargin(--popK))",
					onmouseover: "alert('mucho gusto')" 
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
						"overflow:hidden; xposition: xrelative; z-index:-1;";		
	alert("pupwidth"+pup.width);
	
	//  clip offset into range
	if ( offset + pN >= trail.length ) offset = trail.length - pN;	//  adjust down
	if ( !offset || offset < 0 )       offset = 0;					//  adjust up
	
	var nItems = Math.min( pN, trail.length-offset );	// number items to show
	var pad = pN - nItems;								// padding to right justify
	laAttrs.style += "margin-right: "+ (64*pad) +"px";	// add to leftarrow

	//  attach container for row display
	var rowBox = createElement( "box",  { 
							   				id: "row" + row, 
											width: (pWidth), 
											style: "margin-left:0px;"} );
	pup.appendChild(rowBox);
	
	//  finally, we can fill the container
	//  	leftarrow items* rightarrow seldef
	rowBox.appendChild( createElement( "image", laAttrs) );
	
	//  items
	for (var i = 0; i< nItems; i++) {
		addSBP( {	ix:			offset+i,
					label:		formatItem( trail[offset+i] ),
					style:		puiStyle,
					onclick:	"genericClickHandler(this,event)" ,
				 }, rowBox );
	}
	//  right arrow, sel default 
	rowBox.appendChild( createElement( "image", raAttrs) );
	rowBox.appendChild( createElement( "image", sdAttrs) );
}
function formatItem(item)
{
	return item; // FINISH
}

//  popup click handler
function popupClickHandler(ele)
{
	popupCreate();
	//  make the popup appear
	pup.setAttribute("height",100);			//  set new working height
	pup.openPopup( byId("onoffButton"),"before_end", 0,-5, false,false);
	
	//  toggle lightbulb color
	var pbutt = byId("popupButton");
	pbutt.src = toggleFilename( pbutt.src, ["yellow","red"] )
	
	//  TODO
}

function arrowClickHandler(ele,e)
{
	alert( ele.id )
}





















//alert("end-script")