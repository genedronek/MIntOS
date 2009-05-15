// This file tracks all URL submit events. Following cases can cause a URL submit:
//   1. User press enter in URL bar
//   2. User clicking on a link within the current page (or tab-navigate and press enter)
//   3. User selecting a bookmark item
//   4. User clicking on back/forward button (or pressing corresponding key)
//   5. User clicking Home button (or pressing corresponding key) 
//   6. User clicking the reload button (or pressing corresponding key)
//   7. User interacting with our optimized UI widgets
//   8. User clicking on third-party browser extension UI widgets
//   9. Browser fetching other resource in reference to current page
//
//  Since Case 9 does not involve user interaction, we ignore URL submits caused in such cases

function waitUntilNewPageLoaded () {
  var sb= document.getElementById('content').selectedBrowser;
  var olduri = sb.currentURI.spec;

  var thread = Components.classes["@mozilla.org/thread-manager;1"]
                    .getService(Components.interfaces.nsIThreadManager)
                    .currentThread;
  while (olduri == sb.currentURI.spec)
    thread.processNextEvent(true);     
}

function submitURLWithCurrentPage () {
  var tmp = new Object ();
  var sb = document.getElementById('content').selectedBrowser;
  tmp.loc = sb.currentURI.spec;
	tmp.title = sb.contentTitle;
  newEvent (URL_SUBMIT_EVENT, tmp);
}

function procURLSubmitOnCommand (e) {
  try {
    var id = e.target.id;
    if ((id == "back-button" || id == "historyMenuBack") && !e.target.disabled) {
      debugMessage ("[urlsubmit.procURLSubmitOnCommand] back navigation!");      
      
      waitUntilNewPageLoaded ();      
      submitURLWithCurrentPage ();     
    } else if ((id == "forward-button" || id == "historyMenuForward") && !e.target.disabled) {
      debugMessage ("[urlsubmit.procURLSubmitOnCommand] forward navigation!");
      waitUntilNewPageLoaded ();      
      submitURLWithCurrentPage ();  
    } else if ((id == "home-button" || id == "historyMenuHome") && !e.target.disabled) {
      debugMessage ("[urlsubmit.procURLSubmitOnCommand] home navigation!");
    }
    
    var ln = e.target.localName;
    if (ln == "menuitem") {
      //debugMessage ("[procURLSubmitOnCommand] target=" + e.target + " id=" + e.target.id);
      if (e.target.parentNode.id == "bookmarksMenuPopup") {
        //This means that we just activated a bookmark
        debugMessage ("[urlsubmit.procURLSubmitOnCommand] Bookmark selected: " + e.target.label);
      }
    }
  } catch (ex) {
   debugMessage ("[urlsubmit.procURLSubmitOnCommand] " + ex.message); 
  } 
}

function procURLSubmitOnClick (e) {
  try {
    
    //debugMessage ("[procURLSubmitOnClick] target=" + e.target + " localName=" + e.target.localName);
    
    var ln = e.target.localName;
    if (ln == "menuitem") {
      var p = e.target.parentNode;
      if (p != null && p.parentNode != null && p.parentNode.id == "back-forward-dropmarker") {
        debugMessage ("[urlsubmit.procURLSubmitOnClick] Selected history: " + e.target.label);
      } else {
        /*
        debugMessage ("[procURLSubmitOnClick] target=" + e.target + " label=" + e.target.label + " parentLN=" 
          + p.localName + " p.pid=" + p.parentNode.id);
          */
      }
    } else if (ln == "A") {
      debugMessage ("[urlsubmit.procURLSubmitOnClick] clicked hyperlink: " + e.target);
    }
  } catch (ex) {
    debugMessage ("[urlsubmit.procURLSubmitOnClick] " + ex.message);
  }
  
  return false;
}

window.addEventListener("command", function(e) { procURLSubmitOnCommand(e); }, false);
window.addEventListener("click", function(e) { procURLSubmitOnClick(e); }, false);
