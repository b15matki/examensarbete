const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
var request = require('request');

// Type variables
var allTypes = ["plain", "x-zip-compressed", "webm", "vnd.microsoft.icon", "x-icon", "tiff", "vnd.ms-excel", "css", "postscript", "png", "atom+xml", "jpeg", "javascript", "x-javascript", "pdf", "xml", "x-shockwave-flash", "gif", "zip", "msword", "html", "x-gzip", "vnd.ms-powerpoint", "rtf"];
currentType = 0;
var query = "";

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'mongomydb';

async function searchMongoDB() {
    while (currentType < allTypes.length) {
        // TODO: average 10 samples
        for (i = 0; i < cars.length; i++) {
            console.log("Doing: " + allTypes[currentType]);

            // Use connect method to connect to the server
            var client = await MongoClient.connect(url);
            console.log("Connected correctly to server");

            const db = client.db(dbName);
            var articles = db.collection("mongoarticles");

            // Get the documents collection
            // Find some documents
            const result = await articles.find({ Filetype: allTypes[currentType] }, { HTTP_Url: 1 })

            var explain = await result.explain();
            console.log(explain.executionStats.executionTimeMillis);

            // TODO: move the code after in a separate function (????)
            const res_data = await articles.find({ Filetype: allTypes[currentType] }, { HTTP_Url: 1 }).toArray();
            console.log("res_data length: " + res_data.length);

            
        }

        //TODO HOW DO I DIVIDE THE ARRAY BY 10?
        await client.close();
        await request.post({
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            url: 'http://wwwlab.iit.his.se/b15matki/query_results/mongoDB_query3.php',
            body: "str= \r\n Current type = " + allTypes[currentType] + " Elapsed time= " + explain.executionStats.executionTimeMillis + "\r\n" + "Results: " + res_data.length
        });
        currentType++;
    }
}
searchMongoDB();