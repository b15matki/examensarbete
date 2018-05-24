// process.env.DEBUG = 'mimemessage*'; // enables error logging for mimemessage
var fs = require('fs'); // import the fs library to read files on the disk
var mimemessage = require('mimemessage'); // imports the mimemessage library
const targetFolder = '/home/mathias/Documents/kungliga-biblioteket/deflated/';
console.log("Document insertion initiated!");

var nrFile = 0;
var numberOfRejectedFiles = 0;

/****************** Progress initialization ******************/
const progress = require('cli-progress');
const insertProgress = new progress.Bar({etaBuffer: 1000}, progress.Presets.shades_classic);

/****************** MongoDB initialization ******************/

var Mongo = require('mongodb');
var MongoClient = Mongo.MongoClient;
var Mongo_url = "mongodb://localhost:27017/";

/****************** CouchDB initialization ******************/

var nano = require('nano')('http://localhost:5984');
var dbcouch = nano.db.use('dbo');

var Mongo_client;
var dbmongo;
var gridfs;

async function connectMongo() {

  var settings = {
    poolSize: 10
  }

  Mongo_client = await MongoClient.connect(Mongo_url, settings);
  dbmongo = await Mongo_client.db("mongomydb");
  gridfs = await new Mongo.GridFSBucket(dbmongo);
}

/* Loops through the files */
var files = fs.readdirSync(targetFolder);

async function insertFiles(files) {

  await connectMongo();

  insertProgress.start(files.length, 0);

  for (let file of files) {

    try {
      /* Reading of targetet file */
      var content = fs.readFileSync(targetFolder + file, 'utf8'); // reads from the file which path is in argument and puts its content into the content variable
      content = content.replace(/\n/g, '\r\n'); // fixes lines ending so that mimemessage works: REALLY IMPORTANT
      content = content.replace(/Content-Type: null/g, 'Content-Type: text/plain'); // fixes malformated mime messages with a null content type Content-Type: 
      content = content.replace(/Content-Type: unknown/g, 'Content-Type: text/plain'); // fixes malformated mime messages with an unknown content type
      content = content.replace(/Content-Type: text\/html; iso-8859-1/g, 'Content-Type: text/html; charset=iso-8859-1'); // fixes missing charset=

      var msg = mimemessage.parse(content);

      /****************** Generation of data ******************/
      /* Extract the correct element containing the subtype & the other body */
      var filetype;
      var filecontent;
      var http_headers;
      for (var k in msg.body) {
        if (msg.body[k].header('HTTP-part') == 'Content') {
          filetype = msg.body[k].contentType()['subtype'];
          filecontent = msg.body[k].body;
        } else if (msg.body[k].header('HTTP-part') == 'Header') {
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
        HTTP_Header_Length: parseInt(msg.header('HTTP-Header-Length')),
        HTTP_Header_Md5: msg.header('HTTP-Header-MD5'),
        HTTP_Content_Length: parseInt(msg.header('HTTP-Content-Length')),
        HTTP_Content_Md5: msg.header('HTTP-Content-MD5'),
        HTTP_Url: msg.header('HTTP-URL'),
        HTTP_Archive_Time: d,

        HTTP_Headers: http_headers,

        //Second section: file
        Filetype: filetype,
        Filecontent: null
      };

      /****************** MongoDB data insertion ******************/
      try {

        // Mongo file insertion
        if (filecontent != null || filecontent != undefined || filecontent != "") {
          try {
            var upload = gridfs.openUploadStream(myobj.HTTP_Content_Md5);
            await upload.write(filecontent);
            await upload.end();
            myobj.Filecontent = "gridfs";
          } catch (err) {
            console.log("Error uploading file content to gridfs");
          }
        }

        // Mongo article insertion
        await dbmongo.collection("mongoarticles").insertOne(myobj);

      } catch (err) {
        console.log("Mongo error" + err);
      }

      /****************** CouchDB data insertion ******************/
      myobj.Filecontent = filecontent;
      await dbcouch.insert(myobj);
      nrFile++;

    } catch (err) {
      numberOfRejectedFiles++;
      console.log("Error on file " + file + ": " + err);
    }

    insertProgress.update(nrFile + numberOfRejectedFiles);
  }

  insertProgress.stop();
  
  console.log("Document insertion process completed! " + nrFile + " of files scanned in total!");
  console.log("Number of rejected files: " + numberOfRejectedFiles);
}
insertFiles(files);