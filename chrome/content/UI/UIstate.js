//Defining the state of the UI

function UIstate (trailList) {
  try {
    this.trails = trailList;					//The trails that are passed from the system
    this.statusDisplay = displayDefaultTrailOnStatusBar;		
		
    this.uiItems = createUIItems (this.trails);	//The UI elements that corresond to trails
    this.defaultTrail = 0; 					//Which of the trails is the default trail (displayed on status bar)
    if (trailList.length > 1) {
  	  this.popupButton = createElement("image", popupButton);
 	  	this.popupButton.uiState = this;
    	//statusBar.appendChild (this.popupButton);
    }
    
		this.statusScrollList = new HScrollList (this.uiItems[this.defaultTrail], 
			STATUS_ITEMBOX_LENGTH, this.popupButton);	
		
		if (trailList.length > 1)
			this.listPopup = new TrailListPopup (this.uiItems, this.defaultTrail);
		
    //this.popupScrollLists = new Array ();
    //for (var i = 0; i < this.trails.length; i++)
    //  this.popupScrollLists[i] = new HScrollList (this.uiItems[i], POPUP_ITEMBOX_LENGTH);

  } catch (ex) {
    showStatus ("[UIstate.UIstate] " + ex.message);	
  }
}

/*
function initScrollState (trail, max) {
	try {
		var res = new Object ();
		var selected, start, end;	
		
	  if (trail.length > max) res.selected = max - 1;
	  else res.selected = trail.length - 1;
	
		res.start = res.selected - max + 1;
		if (res.start < 0) res.start = 0;
			
		res.end = res.start + max - 1;		
		if (res.end >= trail.length)
			res.end = trail.length - 1;
			
		return res;
	} catch (ex) {
		showStatus ("[UIstate.initScrollState] " + ex.message);	
	}
}
*/

function createTooltip (button, uiItem) {
	try {
		var tt = byId ("tooltipTemplate");
		tt = tt.cloneNode (true);
		tt.setAttribute ("id", "tooltipTemplate_" + uiItem.id);
		statusBar.appendChild (tt);
		if (uiItem.imagesrc)
			tt.appendChild (createElement( "image", { src: uiItem.imagesrc } ) );
		else 
			tt.appendChild (createElement( "label", { value: uiItem.realURI }));
    
    button.setAttribute ("tooltip", tt.id);
            
	} catch (ex) {
		showStatus ("[UIstate.createTooltip] " + ex.message);	
	}
}

function createUIItems (trails) {
  try {
		
    var res = new Array ();
    for (var t = 0; t < trails.length; t++) {
      var trail = trails[t];
      res[t] = new Array ();
      for (var i = 0; i < trail.length; i++) {
        var ele = createUIElement (trail[i].optItemType, trail[i].id); 	
        switch (trail[i].optItemType) {
          case URL_OPT_ITEM:
          case SCP_OPT_ITEM:
           	//ele.setAttribute ("style", "groove");
            ele.setAttribute ("style", "color:" + trail[i].style.color);
            //ele.setAttribute ("style", "margin-left:0px");
            //ele.setAttribute ("style", "margin-right:0px");
            ele.setAttribute ("label", trail[i].label);
            ele.setAttribute( "onclick", "statusButtonClick(this,event)" );
            createTooltip (ele, trail[i]);
            break;
          case TEXT_INPUT_OPT_ITEM:
          case PSWD_INPUT_OPT_ITEM:
            ele.setAttribute ("value", trail[i].value);
            break;
        }
        ele.trailItem = trail[i];
        res[t][i] = ele;
      }
    }	  
    return res;
  } catch (ex) {
    showStatus ("[UIstate.createUIItems] " + ex.message);	
  }
	
  return null;
}

function statusButtonClick (ele, e) {
	try {	
		showStatus ("[UI/UIstatus.statusButtonClick] ");
		ele.trailItem.click (ele.trailItem);
	} catch (ex) {
    showStatus ("[UI/UIstate.statusPopupClick] " + ex.message);
  }
}


function createUIElement (type, id) {
  try {
    var res;
		
    //showStatus ("[UI/UIstatus.createUIElement] type=" + type);
		
    switch (type) {
      case URL_OPT_ITEM:
      case SCP_OPT_ITEM:
        //res = urlTemplate.cloneNode (true);
        res = createElement ("toolbarbutton");

        break;
      case TEXT_INPUT_OPT_ITEM:
        res = inputTemplate.cloneNode (true);
        break;
      case PSWD_INPUT_OPT_ITEM:
        res = passwordTemplate.cloneNode (true);
        break;
    }
		
    res.id = id;

		//showStatus ("[UI/UIstatus.createUIElement] boxObject.width = " + res.boxObject.width);
    return res;
  } catch (ex) {
    showStatus ("[UI/UIstatus.createUIElement] " + ex.message);
  }
	
  return null;
}

function displayDefaultTrailOnStatusBar () {
  try {		
    statusDisplayList (this.statusScrollList);
  } catch (ex) {
    showStatus ("[UI/UIstatus.displayDefaultTrailOnStatusBar] " + ex.message);
  }
}

var statusPopup;
function mouseOverHandler (obj, event) {
	try {	
		if (obj.trailItem.imagesrc == null) return;
		
		//var popupatt = { id: "mouseoverpopup", width: 100, height: "0", position: "before_start" };

  	statusPopup.setAttribute("height", 160);	
  	statusPopup.setAttribute("width", 150);	
  	statusPopup.setAttribute("hidden", "false");	
  	//pw.openPopup( byId(obj.id),"before_end", 0, 15, false,false);
  	
  	statusPopup.openPopup( byId(obj.id),"before_end", 0, 20, false,false);
  	
    statusPopup.setAttribute( "onmouseout", "mouseOutHandler(this,event)" );
    statusPopup.obj = obj;
  	statusPopup.setAttribute( "onclick", "statusPopupClick(this,event)" );
  
    var ele = document.createElement("box");
  	//ele.setAttribute( "pack", "center" );
  	
  	while (statusPopup.firstChild) statusPopup.removeChild (statusPopup.firstChild);
  	
 	 	statusPopup.appendChild( ele );
  	//ele.appendChild( document.createTextNode("goo") );

  	ele.appendChild( createElement( "image", { src: obj.trailItem.imagesrc } ) );
    
    return false;
  } catch (ex) {
    showStatus ("[UI/UIstate.mouseOverHandler] " + ex.message);
  }
}


/*
function mouseOverHandler (obj, event) {
	try {	
		if (obj.trailItem.imagesrc == null) return;
		
		var ele = document.createElement("box");
		ele.appendChild( createElement( "image", { src: obj.trailItem.imagesrc } ) );
		
		var popup = document.createElement ("menupopup");
		byId ("main-window").appendChild (popup);
		popup.appendChild(ele);
		popup.openPopup (obj, 0, 0, "before_start", false, true);
   	popup.sizeTo( 160, 150 );
    return false;
  } catch (ex) {
    showStatus ("[UI/UIstate.mouseOverHandler] " + ex.message);
  }
}
*/

function mouseOutHandler(ele,e) {
	statusPopup.setAttribute("height", 0);	
	statusPopup.setAttribute("hidden", "true");	

  return false;		//  no bubbling/default
}

function statusPopupClick (ele, e) {
	try {	
		showStatus ("[UI/UIstatus.statusPopupClick] ");
		ele.obj.click (ele.obj.trailItem);
	} catch (ex) {
    showStatus ("[UI/UIstate.statusPopupClick] " + ex.message);
  }
}

function tooltipPopupShowing (ele, e) {
	try {	
		showStatus ("[UI/UIstatus.tooltipPopupShowing] ");
		/*
		if (e.target.trailItem.imagesrc)
			ele.appendChild (createElement( "image", { src: e.target.trailItem.imagesrc } ) );
		else 
			ele.appendChild (createElement( "label", { value: e.target.trailItem.realURI }));
			*/
		
	} catch (ex) {
    showStatus ("[UI/UIstate.tooltipPopupShowing] " + ex.message);
  }
}