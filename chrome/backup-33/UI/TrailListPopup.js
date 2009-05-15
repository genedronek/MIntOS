//Popup window to display a list of trails

var mypopups;

function TrailListPopup (trails, defaultTrail) {
	try {
		createPopups ();
		
		this.redrawItembox = TLPRedrawItembox;
		
		/*
		var laAttrs = { src: imgsPath + "arrows.blue.left.png",
    style: "width: 16px; height: 20px; " +
      "margin-right:"+ (64) +"px;",	//  right justify next
    id: 	"la",
    onclick: "arrowClickHandler(this,event,-1)",
  };
		*/
		this.itembox = document.createElement("vbox");	
		this.hscrolls = new Array ();
		this.default = defaultTrail;
		
		for (var i = 0; i < trails.length; i++) {
			if (i != defaultTrail)
				this.hscrolls[i] = new HScrollList (trails[i], POPUP_ITEMBOX_LENGTH);
			//this.box.appendChild (this.hscrolls[i]);
			//this.hscrolls[i].display (this.box);
		}	
		
	} catch (ex) {
		showStatus ("[TrailListPopup.TrailListPopup] " + ex.message);
	}
	
	return null;
}

function createPopups () {
	try {
		/*
		if (!mypopups) {
			mypopups = document.createElement ("popupset");
			mypopups.setAttribute ("id", "mypopups");
			byId ("mainPopupSet").appendChild (mypopups);
			if ( !statusPopup )  {
    		statusPopup = createElement( "popup", popupWin2 );		//  create with zero height
    		byId("mypopups").appendChild(statusPopup);		//  and append into tree.\
    		//pup2.setAttribute("hidden", "true");
 	 		}
		}*/
		if (!statusPopup )  {
    	statusPopup = createElement( "popup", popupWin2 );		//  create with zero height
    	byId("mainPopupSet").appendChild(statusPopup);		//  and append into tree.\
    	//pup2.setAttribute("hidden", "true");
 	 	}
	} catch (ex) {
		showStatus ("[UI/UIstatus.createTooltip] " + ex.message);
	}
}

function TLPRedrawItembox () {
	try {
		while (this.itembox.firstChild)
			this.itembox.removeChild (this.itembox.firstChild);
		
		for (var i = 0; i < this.hscrolls.length; i++) {
			//this.itembox.appendChild (this.hscrolls[i]);
			
			/*
			var tmp = document.createElement("box");
			var text = createElement("button", { label: "test"});
			tmp.appendChild (text);
			this.itembox.appendChild (tmp);
			*/
			if (i == this.default) continue;
			this.hscrolls[i].display (this.itembox);
			if (i < this.hscrolls.length - 1) 
				this.itembox.appendChild (createElement ("menuseparator"));
		}
	} catch (ex) {
		showStatus ("[TrailListPopup.redrawItembox] " + ex.message);
	}
}