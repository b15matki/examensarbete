// ==UserScript==
// @name         CouchDB query script 3
// @namespace    http://tampermonkey.net/
// @version      1.0
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
var avgResponseTime = 0;
var LSallResponseTimes = JSON.parse(localStorage.getItem("LSallResponseTimes"));

//Query specification
var allTypes = ["html", "gif", "pdf", "jpeg", "x-realaudio", "msword", "vnd.ms-excel", "octet-stream", "png", "plain", "x-shockwave-flash", "vnd.ms-powerpoint", "javascript", "xml", "mpeg", "css", "x-zip-compressed", "postscript", "zip", "rss+xml", "bmp", "mp4", "x-javascript", "x-wav", "basic", "rtf", "vnd.openxmlformats-officedocument.wordprocessingml.document", "x-js", "x-msmetafile", "svg", "x-ms-wmv", "x-java-vm", "x-pn-realaudio", "x-vcard", "vnd.openxmlformats-officedocument.presentationml.template", "octet-strem", "x-icon", "pjpeg", "atom+xml", "x-ms-wmz", "tiff", "x-pointplus", "x-director", "java-archive", "quicktime", "x-msdos-program", "x-gzip", "vnd.microsoft.icon", "x-java-archive", "vnd.openxmlformats-officedocument.spreadsheetml.sheet", "webm", "vnd.ms-pps", "x-component", "x-ms-bmp", "jpg", "msexcel", "vnd.djvu", "js", "x-sh", "x-msvideo", "x-ms-asf", "x-msdownload", "mspowerpoint", "x-font-woff", "mac-binhex40", "x-tar", "vnd.ms-fontobject", "svg+xml", "x-httpd-php", "xhtml+xml", "midi"];

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
    if (currentType === null || currentType == "undefined" || currentType == "NaN" || currentType == "") {
        currentType = 0;
        localStorage.setItem("LScurrentType", currentType);
        console.log("CurrentType initialized");
    }

    console.log("Current Type: " + currentType);
    if (currentType < allTypes.length) {
        console.log("currentType < allTypes.length");
        if (queryNr === null || queryNr == "undefined" || queryNr == "NaN" || queryNr == "") {
            //Increase the query number
            queryNr = 1;

            //Store the current query number
            localStorage.setItem("LSqueryNr", queryNr);
            localStorage.setItem("LSallResponseTimes", JSON.stringify([]));
            console.log("queryNr === null || queryNr == undefined || queryNr == NaN || queryNr == ");
            
            responseTime();
            window.location.replace("http://localhost:5984/dbo/_design/testqueries/_view/query3?key=%22" + allTypes[currentType] + "%22");
        }
        else if (queryNr < 5) {
            //If the current date is equal to the mimimum start year proceed as usual
            LSallResponseTimes.push(responseTotalTime);
            localStorage.setItem("LSallResponseTimes", JSON.stringify(LSallResponseTimes));

            //Increase the query number
            queryNr++;
            localStorage.setItem("LSqueryNr", queryNr);

            responseTime();

            //Replacing the current window
            window.location.replace("http://localhost:5984/dbo/_design/testqueries/_view/query3?key=%22" + allTypes[currentType] + "%22");
            console.log("else current is not equal to NULL");
        } else if(queryNr == 5) {

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
            currentType++;
            localStorage.setItem("LScurrentType", currentType);

            //Replacing the current window to the new query
            window.location.replace("http://localhost:5984/dbo/_design/testqueries/_view/query3?key=%22" + allTypes[currentType] + "%22");
            console.log("queryNR == 5");
        }
    }
}

//Store which year is being queried
function startOfQuery() {
    console.log("Querying: " + currentType);
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
    scrapedData.push("Querying: " + currentType);
    ajaxCall(scrapedData);
}

//Extract the response time to the textfile
function responseTime() {
    console.log("query number response time");
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
    console.log("Average response time intitiated");
    var count_data = "";
    function getACount() {
        console.log("Count the number of keys");
        count_data = document.body.innerText.split('key').length;
    }
    function ajaxCall(data) {
        console.log("Try to get an ajax call");
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
    scrapedData.push("Average response time = " + avgResponseTime + ". Number of results = " + count_data);
    ajaxCall(scrapedData);
}
