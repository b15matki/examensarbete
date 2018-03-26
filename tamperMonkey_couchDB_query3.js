// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Generation of statistical data for CouchDB's query 3
// @include      http://localhost:5984/dbo/_design/testqueries/_view/query3*
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js
// @author       Mathias Kinnander
// @match        https://chrome.google.com/webstore/category/extensions
// @grant        GM_xmlhttpRequest
// ==/UserScript==

console.log("Start");
var localURL='http://wwwlab.iit.his.se/b15matki/query_results/couchDB_query3.php';
var scrapedData=[];
var responseTotalTime = "";
var currentType = localStorage.getItem("LScurrentType");
var allTypes = ["plain", "x-zip-compressed", "webm", "vnd.microsoft.icon", "x-icon", "tiff", "vnd.ms-excel", "css", "postscript", "png", "atom+xml", "jpeg", "javascript", "x-javascript", "pdf", "xml", "x-shockwave-flash", "gif", "zip", "msword", "html" , "x-gzip", "vnd.ms-powerpoint", "rtf"];
// Main function that calls the other functions
$(document).ready(function(){
    collectResponseTime();
    nextQuery();
});

// Saving response times
function collectResponseTime(){
    var requestStartTime = window.performance.timing.requestStart;
    var responseEndTime = window.performance.timing.responseEnd;
    responseTotalTime = responseEndTime - requestStartTime;
}

function nextQuery(){
    //If the current date is equal to the mimimum start year proceed as usual
    if (currentType === null || currentType == "undefined" || currentType == "NaN" || currentType == ""){
        currentType = 0;
        window.location.replace("http://localhost:5984/dbo/_design/testqueries/_view/query3?key=%22" + allTypes[currentType] + "%22");
    } else if (currentType < allTypes.length){
        toTextFile();
        currentType++;
        console.log("Calling with " + currentType +": " + allTypes[currentType]);
        window.location.replace("http://localhost:5984/dbo/_design/testqueries/_view/query3?key=%22" + allTypes[currentType] + "%22");
    }

    localStorage.setItem("LScurrentType", currentType);
    console.log("Script looped through");
}


//Extract the data to a text file
function toTextFile(){
    console.log("Trying to save " + currentType +": " + allTypes[currentType]);
    function ajaxCall(data) {
      try {
      GM_xmlhttpRequest({
          method: 'POST',
          url: localURL,
          data: 'str=' + encodeURIComponent(data) + '\r\n',
          headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
          },
      });
      } catch (ex1) {
          console.log(ex1);
      }
    }
    scrapedData.push(allTypes[currentType]);
    scrapedData.push(responseTotalTime);
    ajaxCall(scrapedData);
    console.log("Saved " + currentType +": " + allTypes[currentType]);
  }
