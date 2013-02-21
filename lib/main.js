// The main module of the BingPinTab Add-on.
// Modules needed are `require`d, similar to CommonJS modules.
// In this case, creating a Widget that opens a new tab needs both the
// `widget` and the `tabs` modules.
var Widget = require("widget").Widget;
var tabs = require('tabs');

var {Cc, Ci, Cr} = require("chrome");
var data = require('sdk/self').data;
var tabutils = require('sdk/tabs/utils');

//var ss = require("sdk/simple-storage").storage;

////if (!ss.BingPinTab_Active)
//  ss.BingPinTab_Active = 0;

var bingPinTabIsOn = false;

exports.main = function()
{

  // Widget documentation: https://addons.mozilla.org/en-US/developers/docs/sdk/latest/modules/sdk/widget.html
  var widget = new Widget(
  {
    // Mandatory string used to identify your widget in order to
    // save its location when the user moves it in the browser.
    // This string has to be unique and must not be changed over time.
    id: "BingPinTab-widget-1",

    // A required string description of the widget used for
    // accessibility, title bars, and error reporting.
    label: "BingPin Tab",

    // An optional string URL to content to load into the widget.
    // This can be local content or remote content, an image or
    // web content. Widgets must have either the content property
    // or the contentURL property set.
    //
    // If the content is an image, it is automatically scaled to
    // be 16x16 pixels.
    //contentURL: "http://www.mozilla.org/favicon.ico",
    contentURL: data.url('sound-icon_off.jpg'),
    contentScriptWhen: 'ready',
    contentScriptFile: data.url('widget/widget.js')

  });

  widget.port.on('left-click', function()
  {
    if (bingPinTabIsOn)
    {
      attachToTabs(false);
      active = true;
      console.log('Remove PinTabs Sound Notification');
    }
    else
    {
      attachToTabs(true);
      active = false;
      console.log('Add PinTabs Sound Notification');
    }
    widget.contentURL = toggleActivation() ? data.url('sound-icon_on.gif') : data.url('sound-icon_off.jpg');
  });


  //If tab is active.  RemoveEventListener if enable
  tabs.on('activate', function(tab)
  {
    if (tab.isPinned)
    {
      var index = tab.index
      var i = 0;
      tabutils.getTabs().forEach(function (tabXUL)
      {
        if (index == i)
        {
          var browser = tabutils.getBrowserForTab(tabXUL);
          if (bingPinTabIsOn)
          {
            browser.removeEventListener('DOMTitleChanged', soundPlay);
            console.log('Active Tab : ' + tab.title + ' disable sound');
          }
        }
        i++;
      });
    } //if (tab.isPinned)
  });

  //If tab is become inactive.  AddEventListener if enable
  tabs.on('deactivate', function(tab)
  {
    if (tab.isPinned)
    {
      var index = tab.index
      var i = 0;
      tabutils.getTabs().forEach(function (tabXUL)
      {
        if (index == i)
        {
          var browser = tabutils.getBrowserForTab(tabXUL);
          if (bingPinTabIsOn)
          {
            browser.addEventListener('DOMTitleChanged', soundPlay);
            console.log('Inactive Tab : ' + tab.title + ' enable notification sound');
          }
        }
        i++;
      });
    }//if (tab.isPinned)
  });

};

function toggleActivation()
{
  bingPinTabIsOn = !bingPinTabIsOn;
  return bingPinTabIsOn;
}


// actual function
function attachToTabs(addEvent)
{
  tabutils.getTabs().forEach(function (tab)
  {
    if (tab.pinned)
    {
      var browser = tabutils.getBrowserForTab(tab);
      if (addEvent)
      {
        browser.addEventListener('DOMTitleChanged', soundPlay);
      }
      else
      {
        browser.removeEventListener('DOMTitleChanged', soundPlay);
      }
    }
  });
}

function soundPlay()
{
  try
  {
    var sound = Cc["@mozilla.org/sound;1"].createInstance(Ci.nsISound);
    sound.play(newURI(data.url('ding.wav')));
  }
  catch (e)
  {
   console.log(e);
  }
}

// utility function
function newURI(uriStr, base)
{
  var ios = Cc['@mozilla.org/network/io-service;1'].getService(Ci.nsIIOService);
  try
  {
    var baseURI = base ? ios.newURI(base, null, null) : null;
    return ios.newURI(uriStr, null, baseURI);
  }
  catch (e)
  {
    if (e.result === Cr.NS_ERROR_MALFORMED_URI)
    {
     throw new Error("malformed URI: " + uriStr);
    }
    else if (e.result === Cr.NS_ERROR_FAILURE || e.result === Cr.NS_ERROR_ILLEGAL_VALUE)
    {
      throw new Error("invalid URI: " + uriStr);
    }
  }
  return null;
}
