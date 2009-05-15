/*
 *  UI status.js - functions supporting the UI status line
 */

function setONOFFbutton(state)
{
	//alert("setONOFFbutton"+state)
	var ele = byId("onoffButton");
	//alert("onoffEle"+ele);
	var ret = ele.setAttribute( "src", imgsPath + "brain." + state + ".png");
	//alert("ret" +ret)
}

function setPopupButton(state)
{
	byId("popupButton").setAttribute("src", imgsPath +"bulb."+ state +".png")
}

//  add statusbarpanel element to sb
//  
function addSBP(opts,sb) 
{
	sb = sb || statusBar;
	//  wrapper for vertical centering in statusbar
	var box = createElement( "vbox", { }, sb), ele;
	
	//  wrap spacers around element
	createElement( "spacer", { flex: 1 }, box);
	opts.tt = random(3);
	var ele = createSBP(opts,box);
	createElement( "spacer", { flex: 1 }, box);   //  to center vertically

	//  attach to statusbar
	sb.appendChild( ele );
}

function createSBP(opts,box)
{
	switch (opts.tt) {
	  default:
	  case "url":
		ele = createElement("statusbarpanel", opts, box);
		break;
	  case "input":
		ele = createElement("textbox", opts, box);
		setAttributes( ele, { style: "height: 19px; width: 2em;"+
		 							 "font-color:  red ;" } );
		break;
	  case "password":
		ele = createElement("textbox", opts, box);
		break;
	}
	return ele;
}

//  function to add an image node to statusBar
function addSBI(opts,sb)
{
	sb = sb || statusBar;
	var box = createElement( "vbox", { }, sb);
	createElement( "spacer", { flex: 1 }, box);
	var ele = createElement("image", opts, box);
	createElement( "spacer", { flex: 1 }, box);   //  centers image vertically
}


//  handle clicks to onoff button
//  TODO:  needs "userControl" call into monitor that
//  will shut monitoring down/start up.

function onoffClickHandler(ele)  
{
	var isOn = ele.src.match(/\.on\./);
	if ( isOn ) 
		ele.src = ele.src.replace(/\.on\./,".off.");
	else
	 	ele.src = ele.src.replace(/\.off\./,".on.");
		
	//  notify brain of new state
	var isOn = ele.src.match(/\.on\./);
	if ( window.userControl )
		return( window.userControl( isOn ) );
	
	//  here if no brain, so supply spinal reflex
	return (isOn) ? statusInit() : statusClose();
}



function statusInit() 
{
	deleteElement( statusBar );
	//alert( "statusInit" +statusBar) ;
	statusBar = createElement( "box", { id: "trailboss" }, byId("status-bar"));
	
	addSBP( { label: "done", onclick: "statusClose( )" });
	addSBI( arrowLeft );

	//  TODO:  need to use default trail, not just first
	//  controls which trail to show on status line
	var trail = UItrails[0];
	var n = trail.length;
	for (; n > 0; n--) {
		var item = trail[n-1];
		var opts = {	
					id:			"s" + n,
					label:			item.label || ("s"+n),
					emptytext:  	item.label || ("s"+n), 
					tt: 			item.tt || (random(3)),
					style:			sbpStyle,
			      	onclick:		"genericClickHandler(this,event)",  
			      	onmouseover:	"genericOverHandler(this,event)", 
			      	onmousemove:	null,
		}
		addSBP( opts );
	}
	addSBI( arrowRight );
	addSBI( popupButton );
		//  lights orange whenever more than one trail
		setPopupButton( (UItrails.length > 1) ? "red" : "yellow" );
	addSBI( onoffButton );
}


//  remove everything except the onoff button.
function statusClose()
{
	deleteElement( statusBar );
	statusBar = createElement( "box", { id: "trailboss" }, byId("status-bar"));
	addSBI( onoffButton );
	setONOFFbutton("off");
}
