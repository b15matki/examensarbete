const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
var request = require('request');
var query = "";

// Time variables
var currentYear = 2000;
var endYear = 2005;

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'mongomydb';

var query = {
    "Filetype": 'html',
    "HTTP_Url": {
        $regex: ".*skolverket\.se.*"
    },
    "HTTP_Content_Length": {
        "$gte": 1000,
        "$lt": 20000
    },
    "HTTP_Archive_Time": {
        "$gte": new Date(currentYear.toString().concat("-01-01T00:00:00.000Z")),
        "$lt": new Date(endYear.toString().concat("-12-31T00:00:00.000Z"))
    }
}

async function searchMongoDB() {
    var samples = [];
    for (var queryNr = 0; queryNr < 100; queryNr++) {

        // Use connect method to connect to the server
        var client = await MongoClient.connect(url);

        console.log("Connected, executing " + queryNr + "/" + 100);

        const db = client.db(dbName);
        var articles = db.collection("mongoarticles");

        // Get the documents collection
        // Find some documents
        var req = await articles.find(query, { _id: 1 });

        // Adds the explain specification onto the req variable
        var explain = await req.explain();

        // Puts the executionTimeMillis in the end of the array
        samples.push(explain.executionStats.executionTimeMillis);

        // Save the ordinary response time
        await client.close();
        await request.post({
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            url: 'http://wwwlab.iit.his.se/b15matki/query_results/mongoDB_complexityQuery_lvl4.php',
            body: "str=Query nr: " + queryNr + ". Elapsed time = " + explain.executionStats.executionTimeMillis + "\r\n"
        });
    }

    // Use connect method to connect to the server
    var client = await MongoClient.connect(url);
    const db = client.db(dbName);
    var articles = db.collection("mongoarticles");

    //Storing the number of results into an array
    var res_data = await articles.find(query, { _id: 1 }).toArray();

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
        url: 'http://wwwlab.iit.his.se/b15matki/query_results/mongoDB_complexityQuery_lvl4.php',
        body: "str=Average response time = " + res_avg_data + ". Number of results= " + count_data + "\r\n"
    });

    //Resetting the array
    res_data = "";
}
searchMongoDB();