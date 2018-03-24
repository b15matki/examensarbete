// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Generation of statistical data for CouchDB's query 2
// @include      http://localhost:5984/dbo/_design/testqueries/_view/query2*
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js
// @author       Mathias Kinnander
// @match        https://chrome.google.com/webstore/category/extensions
// @grant        GM_xmlhttpRequest
// ==/UserScript==

console.log("Start");
var localURL='http://wwwlab.iit.his.se/b15matki/query_results/couchDB_query2.php';
var scrapedData=[];
var responseTotalTime = "";
var startYear = 1997;
var currentYear = localStorage.getItem("LScurrentYear");
var endYear = 2017;

// Main function that calls the other functions
$(document).ready(function(){
    collectResponseTime();
    nextQuery();
});

// Saving response times
function collectResponseTime(){
    var responseStartTime = window.performance.timing.responseStart;
    var responseEndTime = window.performance.timing.responseEnd;
    responseTotalTime = responseEndTime - responseStartTime;
}

function nextQuery(){
  //If the current date is equal to the mimimum start year proceed as usual
  if (currentYear === null || currentYear == "undefined" || currentYear == "NaN" || currentYear == ""){
    currentYear = startYear;
    toTextFile();
    currentYear++;
    localStorage.setItem("LScurrentYear", currentYear);
    window.location.replace("http://localhost:5984/dbo/_design/testqueries/_view/query2?startkey=%221998-01-01T00:00:00Z%22&endkey=%221998-12-31T00:00:00Z%22");
    console.log("if currentyear == NULL");
  }
  //If the current date is in between the start year and the end year modify the URL
  else if (currentYear <= endYear){
    toTextFile();
    currentYear++;
    localStorage.setItem("LScurrentYear", currentYear);
    window.location.replace("http://localhost:5984/dbo/_design/testqueries/_view/query2?startkey=%22"+ currentYear + "-01-01T00:00:00Z%22&endkey=%22" + currentYear + "-12-31T00:00:00Z%22");
    console.log("if currentyear != NULL");
  }
}

//Extract the data to a text file
function toTextFile(){
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
    scrapedData.push(responseTotalTime);
    ajaxCall(scrapedData);
    console.log("toTextFile");
  }
