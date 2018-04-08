// Look at https://stackoverflow.com/questions/6158933/how-to-make-an-http-post-request-in-node-js/12999483#12999483
var request = require('request');

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const Mongo_url = "mongodb://localhost:27017/";

var Mongo_client = await MongoClient.connect(Mongo_url);
var dbmongo = Mongo_client.db("mongomydb");

// Local variables
var currentYear = 1997;
var endYear = 2017;
var query = "";

//If the current date is equal to the mimimum start year proceed as usual
while (currentYear < endYear) {
    try {
        const findDocuments = function (db, callback) {
            // Get the documents collection
            const collection = db.mongoarticles('documents');
            // Find some documents
            collection.find({ Filetype: 'html', HTTP_Archive_Time: { $gte: ISODate("1997-01-01T00:00:00.000Z"), $lt: ISODate("1997-12-31T00:00:00.000Z") } }, { _id: 1 }).explain(“executionStats”).executionStats.executionTimeMillis){
                assert.equal(err, null);
                console.log("Found the following records");
                console.log(docs)
                callback(docs);
            };
        }
    } finally {
        await Mongo_client.close(true);
    }
    request.post(
        'http://wwwlab.iit.his.se/b15matki/query_results/mongoDB_query2.txt',
        { json: { key: 'value' } },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                data: 'str=' + encodeURIComponent(data) + '\r\n';
            }
        }
    );
    currentYear++;
}
