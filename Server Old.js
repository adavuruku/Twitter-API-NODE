var express = require("express");
var bodyParser = require("body-parser");
var multer = require('multer');
var app = express();
 
app.use(bodyParser.json());

const con = require('./connection');
//get the device id
//search through my db if it exist
//if exist append url
//create a new record

// deviceResource
//     id:mongoose
//     filesPath : []
const DeviceResource = require('./app/models/deviceResource');


var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './fileServer');
  },
  filename: function (req, file, callback) {
    callback(null, Date.now() + '-' + file.originalname.toLowerCase().split(' ').join('-'));
  }
});

var upload = multer({ storage : storage,
    fileFilter: function (req, file, callback){
        if(file.mimetype==='image/jpeg' || file.mimetype==='image/png'  || file.mimetype==='image/jpg'){
            callback(null, true)
        }else{
            return callback(new Error('Only .png, .jpg and .jpeg format allowed!'), false);
        }
    },limits: function (req, file, callback) {
        fileSize: 1024*1024*5 //limit of 5MB
    }
 }).array('deviceImage');

//load the index.html
app.get('/',function(req,res){
      res.sendFile(__dirname + "/index.html");
});

//create images
app.post('/api/photo', async function(req,res){
    try{
            await upload(req,res, async function(err) {
                let filePaths = [];
                let deviceId = req.body.deviceId
                req.files.forEach(el=>{
                    filePaths.push(el.path);
                })
                if(err) {
                    return res.status(201).json({
                        message:"fail",
                        error:err
                    });
                }
                const device = await DeviceResource.find({deviceId:deviceId})
                if(device.length > 0){
                    //update - add more to images
                    const rupdateRecord = await DeviceResource.findOneAndUpdate({deviceId:device[0].deviceId},{$addToSet:{"filesPath": filePaths}})
                    res.status(200).json({message:"success",device:rupdateRecord});
                }else{
                    //create new Images
                    const newDevice = new DeviceResource({
                        _id : mongoose.Types.ObjectId(),
                        deviceId :deviceId,
                        filesPath : filePaths
                    })
                    const saveImage = await newDevice.save()
                    res.status(200).json({message:'Success',device:saveImage});
                }
            });
        
    }catch(err){
        console.log(err)
        res.status(500).json({message: "Some Errors Occured", errors: err})
    }
});


/**
 * Testing Populate
 * 
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const personSchema = Schema({
    _id: Schema.Types.ObjectId,
    name: String,
    age: Number,
    stories: [{ type: Schema.Types.ObjectId, ref: 'Story' }]
  });
  
  const storySchema = Schema({
    author: { type: Schema.Types.ObjectId, ref: 'Person' },
    title: String,
    fans: [{ type: Schema.Types.ObjectId, ref: 'Person' }]
  });
  
  const Story = mongoose.model('Story', storySchema);
  const Person = mongoose.model('Person', personSchema);
app.get('/test',async (req,res)=>{
    try {
        // const authordata = new Person({
        //     _id: new mongoose.Types.ObjectId(),
        //     name: 'Ian Fleming',
        //     age: 50
        // });

        // const author = await authordata.save()

        // const story1 = new Story({
        //     title: 'Casino Royale',
        //     author: author._id    // assign the _id from the person
        // });

        // const story = await Story.insertMany([
        //     {
        //         title: 'Madibo Onah',
        //         author: author._id
        //     },
        //     {
        //         title: 'Pogba Rayon',
        //         author: author._id
        //     },
        //     {
        //         title: 'Ryan Godinga',
        //         author: author._id
        //     },
        //     {
        //         title: 'Maxwel Oyutamel',
        //         author: author._id
        //     },
        //     {
        //         title: 'Brasel Masambe',
        //         author: author._id
        //     }
        // ])

        const person = await Person.findOne({ name: 'Ian Fleming' });

        // person.populated('stories'); // null

        // Call the `populate()` method on a document to populate a path.
        // Need to call `execPopulate()` to actually execute the `populate()`.
        const report = await person.populate('stories').execPopulate();

        const reportTWO = person.populated('stories'); // Array of ObjectIds
        // person.stories[0].name;
        res.status(200).json({author:reportTWO})
        
    } catch (error) {
        res.status(500).json({error:error})
    }
})




const LeaderSchema = new Schema({
    name: String,
    band: String
  });
  
  const BandSchema = new Schema({
    name: String
  });

  BandSchema.virtual('members', {
    ref: 'Leader', // The model to use
    localField: 'name', // Find people where `localField`
    foreignField: 'band', // is equal to `foreignField` the field in the ref model
    // If `justOne` is true, 'members' will be a single doc as opposed to
    // an array. `justOne` is false by default.
    justOne: false,
    count:true,
    options: { sort: { name: -1 }, limit: 5 } // Query options, see http://bit.ly/mongoose-query-options
  });
  
  const Leader = mongoose.model('Leader', LeaderSchema);
  const Band = mongoose.model('Band', BandSchema);




app.get('/testtwo',async (req,res)=>{
    try {

        // const bandone = new Band({
        //     name: 'Guns N\' Roses'
        // });
        // const nband = await bandone.save()
        // const peopleone = await Leader.insertMany(
        //     [
        //         {
        //             name: 'Slash',
        //             band: nband.name
        //         },
        //         {
        //             name: 'Axl Rose',
        //             band: nband.name
        //         }
        //     ]
        // );


        // const bandtwo = new Band({
        //     name: 'Motley Crue'
        // });
        // const tband = await bandtwo.save()
        // const peopletwo = await Leader.insertMany(
        //     [
        //         {
        //             name: 'Nikki Sixx',
        //             band: tband.name
        //         },
        //         {
        //             name: 'Vince Neil',
        //             band: tband.name
        //         }
        //     ]
        // );

       const data = await Band.findOne({ name: 'Motley Crue' }).populate('members', 'name');
    
        res.status(200).json({peopletwo:data.members})
        
    } catch (error) {
        res.status(500).json({error:error})
    }
})

app.listen(3000,function(){
    console.log("Working on port 3000");
});


const user = require('./app/models/usersRecord')

app.get('/testtwo',async (req,res)=>{
    try {

        // const bandone = new Band({
        //     name: 'Guns N\' Roses'
        // });
        // const nband = await bandone.save()
        // const peopleone = await Leader.insertMany(
        //     [
        //         {
        //             name: 'Slash',
        //             band: nband.name
        //         },
        //         {
        //             name: 'Axl Rose',
        //             band: nband.name
        //         }
        //     ]
        // );


        // const bandtwo = new Band({
        //     name: 'Motley Crue'
        // });
        // const tband = await bandtwo.save()
        // const peopletwo = await Leader.insertMany(
        //     [
        //         {
        //             name: 'Nikki Sixx',
        //             band: tband.name
        //         },
        //         {
        //             name: 'Vince Neil',
        //             band: tband.name
        //         }
        //     ]
        // );

    //    const data = await Band.findOne({ name: 'Motley Crue' }).populate('members', 'name');
    
        res.status(200).json({peopletwo:data.members})
        
    } catch (error) {
        res.status(500).json({error:error})
    }
})