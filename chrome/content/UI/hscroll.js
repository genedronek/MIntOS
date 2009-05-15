//For horizonal scroll

var hsl_counter = 0;

function HScrollList (uiitems, width, optitem) {
  try {
  	
  	this.hsl_id = hsl_counter++;
    this.items = uiitems;
    this.itemboxWidth = width;
    this.optItem = optitem;
    this.selected = -1;
    this.start = 0;
    this.end = -1;
		
    this.rootbox = document.createElement("box");
    //this.rootbox.setAttribute ("align", "end");
    this.itembox = document.createElement("box");
    this.itembox.setAttribute ("style", "width:" + this.itemboxWidth + "px");	
    //this.itembox.setAttribute ("align", "stretch");
    this.itembox.setAttribute ("style", "overflow:hidden");
    this.itembox.maxwidth = this.itemboxWidth;
    this.itembox.startpad = 0;
    this.la = createElement("image", arrowLeft);
    this.la.hscroll = this;
    this.la.setAttribute ("onclick", "hscrollArrowClick(this,event)");
    this.ra = createElement("image", arrowRight);
    this.ra.hscroll = this;
    this.ra.setAttribute ("onclick", "hscrollArrowClick(this,event)");
    this.rootbox.appendChild (this.la);
    this.rootbox.appendChild (this.itembox);
    this.rootbox.appendChild (this.ra);
    
    if (optitem) 
    	this.rootbox.appendChild (optitem);
		//this.popupButton = createElement("image", popupButton);
		//this.rootbox.appendChild (this.popupButton);
		
    this.display = HSLDisplay;
    this.redrawItembox = HSLRedrawItembox;
    this.clearItembox = HSLClearItembox;
    this.scroll = HSLScroll;
  } catch (ex) {
    showStatus ("[UI/hscroll.HScrollList] " + ex.message);
  }
}

function HSLDisplay (parent) {
  try {
    parent.appendChild (this.rootbox);
		this.redrawItembox (true);	
  } catch (ex) {
    showStatus ("[UI/hscroll.HSLDisplay] " + ex.message);
  }
}

function hscrollArrowClick (target, event) {
  try {
    var hscroll = target.hscroll;
    if (hscroll.la == target) hscroll.scroll (true);
    else if (hscroll.ra == target) hscroll.scroll (false);
  } catch (ex) {
    showStatus ("[UI/hscroll.hscrollArrowClick] " + ex.message);
  }
}

function HSLRedrawItembox (isLeft) {
  try {
  	var cur;
  	
  	showStatus ("[UI/hscroll.HSLRedrawItembox]start hsl_" + this.hsl_id + " start=" + this.start + " end=" + this.end);
  	
  	if (this.items.length == 0) return;
  	
  	this.clearItembox ();
  	
		//if (this.selected == -1) this.start = 0;


		cur = this.start;
		this.end = this.items.length - 1;
		
		this.itembox.setAttribute ("width", this.itemboxWidth);
		var sx = this.itembox.boxObject.x;
		while (cur < this.items.length) {
			this.itembox.appendChild (this.items[cur]);
			if (this.items[cur].boxObject.x - sx + this.items[cur].boxObject.width > this.itemboxWidth) {
				this.end = cur - 1;
				break;
			}
			if (cur != this.items.length - 1) 
				this.itembox.appendChild (createElement ("image", {src: imgsPath+"divider.png", style:"height:10px"}));
			cur++;
		}
  } catch (ex) {
    showStatus ("[UI/hscroll.HSLRedrawItembox] " + ex.message);
  }	
}

/*
function HSLRedrawItembox (isLeft) {
  try {
		for (var i = 0; i < this.items.length; i++)
			this.itembox.appendChild (this.items[i]);
  } catch (ex) {
    showStatus ("[UI/hscroll.HSLDisplayItembox] " + ex.message);
  }
}
*/

function HSLClearItembox () {
  try {		
  	while (this.itembox.firstChild) 
  		this.itembox.removeChild (this.itembox.firstChild);
  } catch (ex) {
    showStatus ("[UI/hscroll.HSLClearItembox] " + ex.message);
  }
	
}

/*
function HSLClearItembox () {
  try {		
    for (var i = 0; i < this.items.length; i++) {
    	this.itembox.removeChild (this.items[i]);
    }
  } catch (ex) {
    showStatus ("[UI/hscroll.HSLClearItembox] " + ex.message);
  }
}
*/

function HSLScroll (isLeft) {
  try {		
    var update = false;
  	
    if (isLeft) {
      //if (this.selected == 0) return;
  		
      //this.clearItembox ();
  		
      if (this.start != 0) {
        this.start--;
      }
      //this.selected--;
    } else {
      //if (this.selected == this.items.length - 1) return;
  		
      //this.clearItembox ();
  		
      if (this.end != this.items.length - 1 && this.start != this.end) {
        this.start++;
      }
      //this.selected++;
    }
  	
    this.redrawItembox (isLeft);
  	  
  } catch (ex) {
    showStatus ("[UI/UIstatus.HSLScroll] " + ex.message);
  }
}