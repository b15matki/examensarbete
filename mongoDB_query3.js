const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
var request = require('request');
var query = "";

// Type variables
var allTypes = ["html", "gif", "pdf", "jpeg", "x-realaudio", "msword", "vnd.ms-excel", "octet-stream", "png", "plain", "x-shockwave-flash", "vnd.ms-powerpoint", "javascript", "xml", "mpeg", "css", "x-zip-compressed", "postscript", "zip", "rss+xml", "bmp", "mp4", "x-javascript", "x-wav", "basic", "rtf", "vnd.openxmlformats-officedocument.wordprocessingml.document", "x-js", "x-msmetafile", "svg", "x-ms-wmv", "x-java-vm", "x-pn-realaudio", "x-vcard", "vnd.openxmlformats-officedocument.presentationml.template", "octet-strem", "x-icon", "pjpeg", "atom+xml", "x-ms-wmz", "tiff", "x-pointplus", "x-director", "java-archive", "quicktime", "x-msdos-program", "x-gzip", "vnd.microsoft.icon", "x-java-archive", "vnd.openxmlformats-officedocument.spreadsheetml.sheet", "webm", "vnd.ms-pps", "x-component", "x-ms-bmp", "jpg", "msexcel", "vnd.djvu", "js", "x-sh", "x-msvideo", "x-ms-asf", "x-msdownload", "mspowerpoint", "x-font-woff", "mac-binhex40", "x-tar", "vnd.ms-fontobject", "svg+xml", "x-httpd-php", "xhtml+xml", "midi"];
currentType = 0;
var query = "";

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'mongomydb';

async function searchMongoDB() {
    while (currentType < allTypes.length) {

        var samples = [];
        console.log("Querying: " + currentYear);
        for (var queryNr = 0; queryNr < 100; queryNr++) {

            // Use connect method to connect to the server
            var client = await MongoClient.connect(url);

            // REMOVE WHEN DONE
            console.log("Connected, executing " + queryNr + "/" + 100);

            const db = client.db(dbName);
            var articles = db.collection("mongoarticles");

            // Get the documents collection
            // Find some documents
            var req = await articles.find({
                "Filetype": 'html',
                "HTTP_Archive_Time": {
                    "$gte": new Date(currentYear.toString().concat("-01-01T00:00:00.000Z")),
                    "$lt": new Date(currentYear.toString().concat("-12-31T00:00:00.000Z"))
                }
            }, { _id: 1 });

            // Adds the explain specification onto the req variable
            var explain = await req.explain();

            // Puts the executionTimeMillis in the end of the array
            samples.push(explain.executionStats.executionTimeMillis);

            // Save the ordinary response time
            await client.close();
            await request.post({
                headers: { 'content-type': 'application/x-www-form-urlencoded' },
                url: 'http://wwwlab.iit.his.se/b15matki/query_results/mongoDB_query2.php',
                body: "str=Query nr: " + allTypes[currentType] + ". Elapsed time = " + explain.executionStats.executionTimeMillis + "\r\n"
            });
        }

        // Use connect method to connect to the server
        var client = await MongoClient.connect(url);
        const db = client.db(dbName);
        var articles = db.collection("mongoarticles");

        //Storing the number of results into an array
        var res_data = await articles.find({
            "Filetype": 'html',
            "HTTP_Archive_Time": {
                "$gte": new Date(currentYear.toString().concat("-01-01T00:00:00.000Z")),
                "$lt": new Date(currentYear.toString().concat("-12-31T00:00:00.000Z"))
            }
        },
            { _id: 1 }).toArray();

        var count_data = res_data.length;
        console.log("Number elements: " + count_data);

        //Calculate the average from the samples array
        var responseTimeSum = 0;
        for (var i = samples.length; i--;) {
            responseTimeSum += samples[i];
        }
        var res_avg_data = responseTimeSum / samples.length;

        //Storing the average response time and number of results when one query loop has been completed
        await client.close();
        await request.post({
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            url: 'http://wwwlab.iit.his.se/b15matki/query_results/mongoDB_query2.php',
            body: "str=Average response time = " + res_avg_data + ". Number of results= " + count_data + "\r\n"
            
        });

        //Resetting the array
        res_data = "";

        //Incrementing the current year variable so that the next query searches the following year
        currentYear++;
    }
}
searchMongoDB();
