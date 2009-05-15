/*
 *  UI status.js - functions supporting the UI status line
 */

function setONOFFbutton(state)
{
  byId("onoffButton").setAttribute( "src", imgsPath + "brain." + state + ".png");
}

//  add statusbarpanel node to sb
//  
function addSBP(opts,sb) 
{
  sb = sb || statusBar;
  var ele = document.createElement("statusbarpanel");
  setAttributes( ele, opts);
  sb.appendChild( ele );
}

//  function to add an image node to statusBar
function addSBI(opts,sb)
{
  sb = sb || statusBar;
  var ele = createElement("image", opts);
  sb.appendChild( ele );
  return ele;
}

//  handle clicks to onoff button
function onoffClickHandler(ele)  
{
  var isOn = ele.src.match(/\.on\./);
  if ( isOn ) 
    ele.src = ele.src.replace(/\.on\./,".off.");
  else
    ele.src = ele.src.replace(/\.off\./,".on.");
		
  //  notify sample of change
  if ( window.userControl )
    window.userControl( !isON );
}



function statusInit() {
	try {
	  if ( statusBar )
    	return;						//  only initialize once
	  statusBar = document.getElementById("status-bar");		//  convenience handle

	} catch (ex) {
		showStatus ("[UI/UIstatus.statusInit] " + ex.message);
	}
}

var statusLeftArrow, statusRightArrow, statusPopupButton;
//"items" is a list of UI elements. "cur" is the current item
function statusDisplayList (hsl) {
	try {
		
		hsl.display (statusBar);

	} catch (ex) {
		showStatus ("[UI/UIstatus.statusDisplayList] " + ex.message);
	}
} 

function statusRemoveItems (hsl) {
  //  clear out status line
  try {
 		var tmp = hsl.rootbox;
 		if (tmp.parentNode != null) 
	 		tmp.parentNode.removeChild (tmp);
  } catch (ex) {
  	showStatus ("[UI/UIstatus.statusRemoveItems] " + ex.message);
  }
}

function statusRightArrowClick (obj, evt) {
	try {
		if (curUIState == null) return;
		curUIState.statusScroll (false);
	} catch (ex) {
		showStatus ("[UI/UIstatus.statusRightArrowClick] " + ex.message);
	}
}

function statusLeftArrowClick (obj, evt) {
	try {
		if (curUIState == null) return;
		curUIState.statusScroll (true);
	} catch (ex) {
		showStatus ("[UI/UIstatus.statusLeftArrowClick] " + ex.message);
	}
}

