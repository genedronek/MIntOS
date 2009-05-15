//  bookmarks - functions for bookmarking named trails
//
var testURL = "http://mozilla.com/?p1=1&p2=2";

function toURI(spec) {
  var ios = getIOS();
  return ios.newURI(spec, null, null);
}

//  get IO service
var bmIOS;
function getIOS()
{
	//  memoize in global
	bmIOS = bmIOS || Cc["@mozilla.org/network/io-service;1"]
								.getService(Ci.nsIIOService);
	return bmIOS;
}

//  get book mark service
var bmBMS;					//  book mark service
function getBMS()
{
	bmBMS = bmBMS || Cc["@mozilla.org/browser/nav-bookmarks-service;1"]
								.getService(Ci.nsINavBookmarksService);
	return bmBMS;
}

//  get history service
var bmHIS;					//  history service
function getHIS()
{
	bmHIS = bmHIS || Cc["@mozilla.org/browser/nav-history-service;1"]
								.getService(Ci.nsINavHistoryService);
	return bmHIS;
}

var bmABF;					//  active bookmark folderId
function addBM(ele,e) 
{
	//addFolderTo( "bookmarksMenu", "Active Bookmarks", testURL, "trailbossF");
	
	bmABF = getFolderId( "toolbar", "Active Bookmarks");
	if ( !bmABF )
		bmABF = addFolderTo( "toolbar",       "Active Bookmarks", testURL, "trailboss");
	var bm1 = addBookmarkTo( bmABF, "test1", testURL, "name1" );
	var bm2 = addBookmarkTo( bmABF, "test2", testURL, "name2" );
	
	var bms = getFolderContents( "where", "Active Bookmarks" );
}

function addFolderTo(where,title,url,keyword)
{
	var bookmarks = getBMS();
	where = (typeof where == "string") ? bookmarks[where+"Folder"] : where;
	var folderId = bookmarks.createFolder( where, title, toURI(url), bookmarks.DEFAULT_INDEX );
	alert( keys( folderId ) );
	return folderId;
}

function addBookmarkTo(where,title,url,keyword)
{
	var bookmarks = getBMS();
	where = (typeof where == "string") ? bookmarks[where+"Folder"] : where;
	var bookmarkId = bookmarks.insertBookmark(
								where,
								toURI(url),
								bookmarks.DEFAULT_INDEX,
								keyword
							);
	alert( "added " + bookmarkId )
}
//  get folderId for "Active Bookmarks"
function getFolderId(where,title)
{
	var bookmarks = getBMS();
	where = (typeof where == "string") ? bookmarks[where+"Folder"] : where;
	return bookmarks.getChildFolder( where, title);
}
function getFolderContents(where,title)
{
	var bookmarks = getBMS();
	where = (typeof where == "string") ? bookmarks[where+"Folder"] : where;
	var folderId = bookmarks.getChildFolder( where, title);
	var n = 0;
	var thrown = false;
	var ret = [ ];
	while ( !thrown ) {
		try {
			ret[ n ] = bookmarks.getIdForItemAt( where, n );
			if ( ret[n] )
				n++;
		}
		catch (e) { thrown = true; }
	}
	alert( "returning length" + ret.length )
}