// process.env.DEBUG = 'mimemessage*'; // enables error logging for mimemessage
var fs = require('fs'); // import the fs library to read files on the disk
var mimemessage = require('mimemessage'); // imports the mimemessage library
const targetFolder = '/home/mathias/Documents/kungliga-biblioteket/uncompressed/';
console.log("Document insertion initiated!");

var nrFile = 0;

/* Loops through the files */
fs.readdirSync(targetFolder).forEach(file => {
  

  /* Reading of targetet file */
  var content = fs.readFileSync(targetFolder + file, 'utf8'); // reads from the file which path is in argument and puts its content into the content variable
  var msg = mimemessage.parse(content.replace(/\n/g, '\r\n')); // fixes lines ending so that mimemessage works: REALLY IMPORTANT
  console.log("Reading " + file);

  /****************** MongoDB initialization ******************/
  var MongoClient = require('mongodb').MongoClient;
  var Mongo_url = "mongodb://localhost:27017/";

  /****************** CouchDB initialization ******************/
  var nano = require('nano')('http://localhost:5984');
  var dbo = nano.db.use('dbo');

  /****************** Generation of data ******************/
  /* Extract the correct element containing the subtype & also the other body */
  var filetype;
  var filecontent;
  var http_headers;
  for (var k in msg.body) {
    if(msg.body[k].header('HTTP-part') == 'Content') {
      filetype = msg.body[k].contentType()['subtype']; 
      filecontent = msg.body[k].body;
    } else if(msg.body[k].header('HTTP-part') == 'Header') {
      http_headers = msg.body[k].body; 
    }
  }
  
  /* Converting the epoch time into dates */
  var utcSeconds = msg.header('HTTP-Archive-Time');
  var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
  d.setUTCSeconds(utcSeconds);

  //Standard headers
  var myobj = {
    //First Header  
    MIME_Version: msg.header('MIME_Version'), 
    Type: msg.contentType()['type'], 
    Subtype: msg.contentType()['subtype'],
    Params: msg.contentType()['params'],
    HTTP_Part: msg.header('HTTP-part'),
    HTTP_Collection: msg.header('HTTP-Collection'),
    HTTP_Harvester: msg.header('HTTP-Harvester'),
    HTTP_Header_Length: msg.header('HTTP-Header-Length'),
    HTTP_Header_Md5: msg.header('HTTP-Header-MD5'),
    HTTP_Content_Length: msg.header('HTTP-Content-Length'),
    HTTP_Content_Md5: msg.header('HTTP-Content-MD5'),
    HTTP_Url: msg.header('HTTP-URL'),
    HTTP_Archive_Time: d,

    HTTP_Headers: http_headers,

    //Second section: file
    Filetype: filetype,
    Filecontent: filecontent,
  };

  /****************** MongoDB data insertion ******************/
  MongoClient.connect(Mongo_url, function(err, db) {
    if (err){ 
      throw err;
    };

    var dbo = db.db("mongomydb");

    dbo.collection("mongoarticles").insertOne(myobj, function(err, res) {
      if (err) throw err;
      console.log(msg.header('Http-Url') +  " inserted succesfully with MongoDB");
      db.close();
    });
  });

  /****************** CouchDB data insertion ******************/
  dbo.insert(myobj, function (err, body) {
    if (!err) {
      console.log(msg.header('Http-Url') + " inserted succesfully with CouchDB");
    } else {
      console.log(err);
    }
  });

  nrFile++;
})
console.log("Document insertion process completed! " + nrFile + " of files scanned in total!");

/****************** CassandraDB ******************/
/*
var cassandra = require('cassandra-driver');
var client = new cassandra.Client({contactPoints: ['127.0.0.1'], keyspace: 'demo'});

var utcSeconds = msg.header('HTTP-Archive-Time');
var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
d.setUTCSeconds(utcSeconds);

const query = 'INSERT INTO articles_cassandra (MIME_Version, Type, Subtype, Params, HTTP_Part, HTTP_Collection, HTTP_Harvester, HTTP_Header_Length, HTTP_Header_Md5, HTTP_Content_Length, HTTP_Content_Md5, HTTP_Url, HTTP_Archive_Time, HTTP_Response, Filetype, Filecontent)'
const params = [
  msg.header('MIME_Version'), 
  msg.contentType()['type'], 
  msg.contentType()['subtype'], 
  msg.contentType()['params'], 
  msg.header('HTTP-part'), 
  msg.header('HTTP-Collection'), 
  msg.header('HTTP-Harvester'),
  msg.header('HTTP-Header-Length'), 
  msg.header('HTTP-Header-MD5'), 
  msg.header('HTTP-Content-Length'), 
  msg.header('HTTP-Content-MD5'), 
  msg.header('HTTP-URL'), 
  d, 
  //msg.body[0].body, 
  msg.body[1].contentType()['subtype'], 
  //msg.body[1].body
];

/*
console.log(msg);
for (var k in msg.body) {
  console.log(msg.body[k]);

  if(msg.body[k].header('HTTP-part') == 'Header') {
    header = msg.body[k];
  }
}
*/

//if(msg.body[1] != undefined) { Console.log("an actual file was downloaded for this file archive"; }



