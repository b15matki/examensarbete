// ==UserScript==
// @name         Tampermonkey script
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
var localURL = 'http://wwwlab.iit.his.se/b15matki/query_results/couchDB_query3.php';
var scrapedData = [];
var responseTotalTime = "";
var queryNr = localStorage.getItem("LSqueryNr");
var currentType = localStorage.getItem("LScurrentType");
var avgResponseTime = "";
var LSallResponseTimes = JSON.parse(localStorage.getItem("LSallResponseTimes"));
var allTypes = ["plain", "x-zip-compressed", "webm", "vnd.microsoft.icon", "x-icon", "tiff", "vnd.ms-excel", "css", "postscript", "png", "atom+xml", "jpeg", "javascript", "x-javascript", "pdf", "xml", "x-shockwave-flash", "gif", "zip", "msword", "html", "x-gzip", "vnd.ms-powerpoint", "rtf"];
// Main function that calls the other functions
$(document).ready(function () {
    collectResponseTime();
    nextQuery();
});

// Saving response times
function collectResponseTime() {
    var requestStartTime = window.performance.timing.requestStart;
    var responseStartTime = window.performance.timing.responseStart;
    responseTotalTime = responseEndTime - requestStartTime;
    console.log("Response time collected: " + responseTotalTime);
}

//TODO Run 10 times for each query, save to file if time i
function nextQuery() {
    if (currentType < allTypes.length) {
        if (queryNr === null || queryNr == "undefined" || queryNr == "NaN" || queryNr == "") {
            queryNr = 1;
            localStorage.setItem("LSqueryNr", queryNr);
            localStorage.setItem("LSallResponseTimes", JSON.stringify([]));
        }
        else if (queryNr < 10) {
            //If the current date is equal to the mimimum start year proceed as usual
            if (currentType === null || currentType == "undefined" || currentType == "NaN" || currentType == "") {
                LSallResponseTimes.push(responseTotalTime);
                localStorage.setItem("LSallResponseTimes", JSON.stringify(LSallResponseTimes));
                currentType = 0;
                localStorage.setItem("LScurrentType", currentType);
                window.location.replace("http://localhost:5984/dbo/_design/testqueries/_view/query3?key=%22" + allTypes[currentType] + "%22");
            } else {
                LSallResponseTimes.push(responseTotalTime);
                localStorage.setItem("LSallResponseTimes", JSON.stringify(LSallResponseTimes));
                queryNr++;
                localStorage.setItem("LSqueryNr", queryNr);
                window.location.replace("http://localhost:5984/dbo/_design/testqueries/_view/query3?key=%22" + allTypes[currentType] + "%22");
            }
            console.log("Script looped through");
        } else if (queryNr == 10) {

            //Summarize average times and
            var responseTimeSum = 0;
            for (var i = localStorage.getItem("LSallResponseTimes").length; i--;) {
                responseTimeSum += LSallResponseTimes[i];
            }
            avgResponseTime = responseTimeSum / LSallResponseTimes.length;
            
            toTextFile();
            
            queryNr = 1;
            localStorage.setItem("LSqueryNr", queryNr);
            
            currentType++;
            localStorage.setItem("LScurrentType", currentType);
            
            LSresponseTotalTime = "";
            localStorage.setItem("LScurrentType", currentType);

            window.location.replace("http://localhost:5984/dbo/_design/testqueries/_view/query3?key=%22" + allTypes[currentType] + "%22");
        }
    }
}

//Extract the data to a text file
function toTextFile() {
    console.log("Trying to save " + currentType + ": " + allTypes[currentType]);
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
    scrapedData.push(allTypes[currentType]); //Saves the current type
    scrapedData.push(LSallResponseTimes); //Saves all the response times
    scrapedData.push(avgResponseTime); //Saves the average of all the response times
    ajaxCall(scrapedData);
    console.log("Saved " + currentType + ": " + allTypes[currentType]);
}