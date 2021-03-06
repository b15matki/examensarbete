// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Generation of statistical data for CouchDB's complexity query level 3 
// @include      http://localhost:5984/dbo/_design/testqueries/_view/complexityQuery_lvl3*
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js
// @author       Mathias Kinnander
// @match        https://chrome.google.com/webstore/category/extensions
// @grant        GM_xmlhttpRequest
// ==/UserScript==

console.log("Start");
var localURL = 'http://wwwlab.iit.his.se/b15matki/query_results/couchDB_complexityQuery_lvl3.php';
var scrapedData = [];
var responseTotalTime = "";
var queryNr = localStorage.getItem("LSqueryNr");
var currentType = localStorage.getItem("LScurrentType");
var avgResponseTime = 0;
var LSallResponseTimes = JSON.parse(localStorage.getItem("LSallResponseTimes"));

//Query specification
var startYear = 2000;
var endYear = 2005;

// Main function that calls the other functions
$(document).ready(function () {
    collectResponseTime();
    nextQuery();
});

// Saving response times
function collectResponseTime() {
    var requestStartTime = window.performance.timing.requestStart;
    var responseStartTime = window.performance.timing.responseStart;
    responseTotalTime = responseStartTime - requestStartTime;
    console.log("Response time collected: " + responseTotalTime);
}

//TODO Run 10 times for each query, save to file if time i
function nextQuery() {
        if (queryNr === null || queryNr == "undefined" || queryNr == "NaN" || queryNr == "") {
            //Increase the query number
            queryNr = 1;

            //Store the current query number
            localStorage.setItem("LSqueryNr", queryNr);
            localStorage.setItem("LSallResponseTimes", JSON.stringify([]));
            console.log("queryNr === null || queryNr == undefined || queryNr == NaN || queryNr == ");
            
            responseTime();
            window.location.replace("http://localhost:5984/dbo/_design/testqueries/_view/complexityQuery_lvl3?startkey=%222000-01-01T00:00:00Z%22&endkey=%222005-12-31T00:00:00Z%22");
        }
        else if (queryNr < 100) {
            //If the current date is equal to the mimimum start year proceed as usual
            LSallResponseTimes.push(responseTotalTime);
            localStorage.setItem("LSallResponseTimes", JSON.stringify(LSallResponseTimes));

            //Increase the query number
            queryNr++;
            localStorage.setItem("LSqueryNr", queryNr);

            responseTime();

            //Replacing the current window
            window.location.replace("http://localhost:5984/dbo/_design/testqueries/_view/complexityQuery_lvl3?startkey=%222000-01-01T00:00:00Z%22&endkey=%222005-12-31T00:00:00Z%22");
            console.log("else current is not equal to NULL");
        } else if(queryNr == 100) {

            //Summarize average times and
            var responseTimeSum = 0;
            for (var i = LSallResponseTimes.length; i--;) {
                responseTimeSum = responseTimeSum + LSallResponseTimes[i];
            }
            avgResponseTime = responseTimeSum / LSallResponseTimes.length;

            endOfquery();

            //Resetting the query
            queryNr = "";
            localStorage.setItem("LSqueryNr", queryNr);

            //Incrementing the year variable

            //Replacing the current window to the new query
            console.log("queryNR == 100");
        }
}

//Store which year is being queried
function startOfQuery() {
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
    scrapedData.push("Querying years 2000 - 2005 ");
    ajaxCall(scrapedData);
}

//Extract the response time to the textfile
function responseTime() {
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
    scrapedData.push("Query nr: " + queryNr + ". Elapsed time = " + responseTotalTime);
    ajaxCall(scrapedData);
}

//Extract the average response time and the numer of results
function endOfquery() {
    var count_data = "";
    function getACount() {
        count_data = document.body.innerText.split('key').length;
    }
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
    getACount();
    scrapedData.push("Average response time = " + avgResponseTime + ". Number of results = " + count_data-1);
    ajaxCall(scrapedData);
}
