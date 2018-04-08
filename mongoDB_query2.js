const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
var request = require('request');

// Time variables
var currentYear = 1997; //1997
var endYear = 2017; //2017
var query = "";

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'mongomydb';

async function searchMongoDB() {
    while (currentYear <= endYear) {
        console.log("Doing: " + currentYear);

        // Use connect method to connect to the server
        var client = await MongoClient.connect(url);
        console.log("Connected correctly to server");

        const db = client.db(dbName);
        var articles = db.collection("mongoarticles");

        // Get the documents collection
        // Find some documents
        var req = await articles.find({ Filetype: 'html', HTTP_Archive_Time: { $gte: Date("" + currentYear +  "-01-01T00:00:00.000Z"), $lt: Date("" + currentYear +  "-12-31T00:00:00.000Z") } }, { _id: 1 });

        var explain = await req.explain();
        console.log(explain.executionStats.executionTimeMillis);
        console.log(req._id);

        await client.close();
        await request.post({
            headers: {'content-type' : 'application/x-www-form-urlencoded'},
            url:'http://wwwlab.iit.his.se/b15matki/query_results/mongoDB_query2.php', 
            body:"str=Current year = \r\n "+ currentYear +" Elapsed time= " + explain.executionStats.executionTimeMillis + "\r\n Number of returned results"
        });
        currentYear++;
    }
}
searchMongoDB();