/*
 *  UI popup.js - functions to support popup window
 */
 
//  create *row*th row of display from input trail
//      append to popup node
//  	we display up to *pN* segments of *the trail* data
//  	starting at *offset*. (which is changed by ui-clicks)
function createPopRow(row,pup,trail,offset)
{
  //alert("pupwidth"+pup.width);
	
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
	
  //  finally, we can fill the container
  //  	leftarrow items* rightarrow seldef
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

//  popup click handler
function popupClickHandler(ele)
{
  //  randomize offsets each pop
  //for(var i = 0; i < UItrails.length; i++)
  //  UIoffsets[i] = random( UItrails[i].length );
	try {
		if ( !pup )  {
	    pup = createElement( "popup", popupWin );		//  create with zero height
	    byId("browser-bottombox").appendChild(pup);		//  and append into tree.
	  }
		
	  //  make the popup appear
	  pup.setAttribute("height",200);			//  set new working height
	  //pup.openPopup( byId("onoffButton"),"before_end", 0,5, false,false);
	  pup.openPopup( byId("popupButton"),"before_end", 0,5, false,false);
		//pup.setAttribute( "onmouseout", "popupOutHandler(this,event)" );
		pup.uiState = ele.uiState;
		pup.setAttribute ("onpopupshown", "popupShownHandler(this,event)");
		
		  //  populate popup
	  popupInit(ele.uiState);
		
	  //  toggle lightbulb color
	  var pbutt = byId("popupButton");
	  pbutt.src = toggleFilename( pbutt.src, ["yellow","red"] )
	}  catch (ex) {
		showStatus ("[UI/UIpopup.popupClickHandler] " + ex.message);
	}
}

function popupShownHandler (ele, e) {
	
	try {
		showStatus ("[UI/UIpopup.popupShownHandler]");
		var listpup = ele.uiState.listPopup;
		listpup.redrawItembox ();
		ele.uiState.statusScrollList.redrawItembox (true);
	} catch (ex) {
		showStatus ("[UI/UIpopup.popupShownHandler] " + ex.message);
	}
}

function popupOutHandler (ele, e) {
	try {
		ele.hidePopup ();
	} catch (ex) {
		showStatus ("[UI/UIpopup.popupOutHandler] " + ex.message);
	}
}

function popupOverHandler(ele,e)
{
  e = e || { };
  //alert( ele.id + ele.parentNode.id );
  var img = createElement( "image", { src: imgsPath + "jumprope.png" } );
  var cn;								//  child node
  pup.sizeTo( pWidth, 200 );
	
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


function arrowClickHandler(ele,e,dir)
{
  var row = ele.getAttribute("rowIx");
  //alert("row " + row );
  UIoffsets[ row ] += dir;				//  update global 
  popupCreate({ });
}

function setDefaultRow(row)
{
  clearRadioButtons();
  setRadioButton( row, "on");
  UIdefault = row;
}
//  set all on radio buttons off
function clearRadioButtons()
{
  //alert("crb");
  for (var row = 0; row < UItrails.length; row++)
    setRadioButton(row,"off");
}
//  a rows radiobutton state is set "on" or "off"
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
      node.setAttribute( "src",
    src.replace( /radio\.[a-z]+\./, 
    "radio." + state + "." ) );
  }
}
//  function to allocate, attach, and populate popup window
function popupInit(uiState)
{
  //  allocate XUL popup once, save in global
  if ( !pup )  {
    pup = createElement( "popup", popupWin );		//  create with zero height
    byId("browser-bottombox").appendChild(pup);		//  and append into tree.
  }

  //  synthesize random UIoffsets for given UItrails
  //UIoffsets = [ ];
  //for(var i = 0; i < UItrails.length; i++)
  //  UIoffsets.push( random( UItrails[i].length ) );

	
  //  clean out any prior content
  while ( pup.firstChild )
    pup.removeChild( pup.firstChild );
	
  //var box = createElement( "box", { width: 100, height: 30, id: "headbox", style: "float:right;" }, pup );
  //var stack = createElement( "stack", { width: 100, height: 30, style: "border: 1px solid blue;" }, box );
  //stack.appendChild( document.createTextNode( "now is the time") );
  //stack.appendChild( createElement( "image", { src: imgsPath + "paw.png" } ) );
  //stack.appendChild( createElement( "image", { src: imgsPath + "arrows.png" } ) );
	
  //pup.appendItem("fooo",999);
	
  //  compose the display row by row
  //for (var row = 0; row < UItrails.length; row++) {
  //  createPopRow( row, pup, UItrails[row], UIoffsets[row] );
  //}
  pup.appendChild (uiState.listPopup.itembox);
  uiState.listPopup.redrawItembox ();
  //uiState.statusScrollList.redrawItembox (true);
}
		
//  function to shut popup
function popupClose()
{
  if ( pup ) {
    //  make the popup appear
    pup.setAttribute("height",0);			//  clear working height
    pup.closePopup( );
  }
}
	