const express = require('express')
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const neo4j = require('neo4j-driver').v1;
const session = require('../database-connection/neo4jconnection');
const router = express.Router();
const expsession = require('express-session')
let proteinname=0;
let combinedscoreminval 
let combinedscoremaxval 
let databaseminval 
let databasemaxval 
let experimentalminval 
let experimentalmaxval 
let textminingminval 
let textminingmaxval 
let coexpressionminval 
let coexpressionmaxval 


//get all proteins
router.get('/proteinlist',(req,res)=>{
    session
        .run('Match(n:protein) Return(n) LIMIT 500')
        .then(function(neoresult){
            var proteinArr = [];
            neoresult.records.forEach(function(record){
                proteinArr.push({
                    name: record._fields[0].properties.name  
                })
            })
            res.header('Access-Control-Allow-Origin', "*");
            res.header('Access-Control-Allow-Headers', "*"); 
            res.send(proteinArr)
        })
            .catch(function(err){
                console.log(err);
            })
        })

// redirect to Add page
router.get('/addpage',(req, res)=>{
    res.render('addprotein')
})

router.get('/mainpage',(req, res)=>{
    res.render('index')
})

router.get('/searchpage',(req, res)=>{
    res.render('search')
})

router.get('/interactomepage',(req, res)=>{
    res.render('interactome')
})

router.get('/addproteininterlinking',(req, res)=>{
    res.render('addproteininterlinking')
})



router.post('/getinteractionvalues',(req,res,next)=>{
    const sourceprotein = req.body.sourceproteinname;
    const targetprotein = req.body.targetproteinname;
    console.log("sourceprotein" + sourceprotein)
    console.log("targetprotein" + targetprotein)
    var lproteinArr = [];
    // reading the raw data from neo4j and saving it in array
    session
    .run('Match(n:protein {name:{nameParam1}})-[r]->(b:protein {name:{nameParam2}}) Return(r)',{nameParam1:sourceprotein, nameParam2:targetprotein})
    .then(function(linkneoresult){
        linkneoresult.records.forEach(function(record){
            lproteinArr.push({
                combinedscore: record._fields[0].properties.combinedscore,
                database: record._fields[0].properties.database,
                experimental: record._fields[0].properties.experimental,
                coexpression: record._fields[0].properties.coexpression,
                textmining: record._fields[0].properties.textmining,
            })
            res.render('interactomeresult',{
                proteindetails:lproteinArr, sourceprotein,targetprotein 
            }) 
        })
    })
    })

router.post('/getsearchvalue',(req, res)=>{
    proteinname = req.body.proteinname
    combinedscoreminval =  parseInt(req.body.combinedscoreminval)
    combinedscoremaxval = parseInt(req.body.combinedscoremaxval)
    databaseminval = parseInt(req.body.databaseminval)
    databasemaxval = parseInt(req.body.databasemaxval)
    experimentalminval = parseInt(req.body.experimentalminval)
    experimentalmaxval = parseInt(req.body.experimentalmaxval)
    textminingminval = parseInt(req.body.textminingminval)
    textminingmaxval = parseInt(req.body.textminingmaxval)
    coexpressionminval = parseInt(req.body.coexpressionminval)
    coexpressionmaxval = parseInt(req.body.coexpressionmaxval)
    relationalvalue = req.body.relationalvalue
    console.log(relationalvalue)
    if(relationalvalue == 1){
        console.log("Inside searchresult")
        res.render('searchresult')
    }
    else if(relationalvalue == 2){
        console.log("Inside searchresulttwo")
        res.render('searchresulttwo')
    }
})

// To get the list of linked proteins      

router.get('/getsearchvalue',(req,res,next)=>{
    var searchedproteinname = proteinname
    var neoArray = []
    var filteredneoArray = []
    var proteinArray = [{protien:""}]
    var i=0;
    var j=0;

// reading the raw data from neo4j and saving it in array

    session
        .run('MATCH (a:protein {name:{nameParam}})-[r]->(b:protein)RETURN a,r,b limit 2',{nameParam:searchedproteinname})
        .then(function(neoresult){
            neoresult.records.forEach(function(record){
            neoArray.push({
                source : record._fields[0].properties.name,
                target : record._fields[2].properties.name,
                relationship:record._fields[1].type,
                relationshipdetails: record._fields[1].properties
            })
        })

//filtering the data based on different conditions and saving it into an array

        neoArray.forEach(function(neoArrayvalue){
            combinescore = parseInt(neoArrayvalue.relationshipdetails.combinedscore)
            database = parseInt(neoArrayvalue.relationshipdetails.database)
            experimental = parseInt(neoArrayvalue.relationshipdetails.experimental)
            textmining = parseInt(neoArrayvalue.relationshipdetails.textmining)
            coexpression = parseInt(neoArrayvalue.relationshipdetails.coexpression)

            if( (combinescore >= combinedscoreminval  && combinescore <= combinedscoremaxval) && (database >= databaseminval  && database <= databasemaxval) && (experimental >= experimentalminval  && experimental <= experimentalmaxval)&& (textmining >= textminingminval  && textmining <= textminingmaxval) && (coexpression >= coexpressionminval  && coexpression <= coexpressionmaxval))
            {
                filteredneoArray.push({
                    source : neoArrayvalue.source,
                    target : neoArrayvalue.target,
                    relationship : neoArrayvalue.relationship,
                    relationshipdetails: neoArrayvalue.relationshipdetails
                })
            }
        })

// constructing nodes and links array for D3.js

        filteredneoArray.forEach(function(protein){
            if(proteinArray[i].protein != protein.source)
            {
                proteinArray.push({
                    protein: protein.source
                });
                i=i+1;
            } 
            if(proteinArray[j].protein != protein.target)
            {
                proteinArray.push({
                    protein: protein.target
                });
                j=j+1;
            } 
        })
        proteinArray.shift()
        res.header('Access-Control-Allow-Origin', "*");
        res.header('Access-Control-Allow-Headers', "*");
        d3Data = {"nodes":proteinArray,"links":filteredneoArray};

        res.send(d3Data)     
        })
        .catch(function(err){
            console.log(err);
        })
    })

    router.get('/getsearchvaluetworelation',(req,res,next)=>{
        var searchedproteinname = '9606.ENSP00000000233'
        var neoArray = []
        var filteredneoArray = []
        var proteinArray = [{protien:""}]
        var i=0;
        var j=0;
    
    // reading the raw data from neo4j and saving it in array
    
        session
            .run('MATCH (a:protein {name:{nameParam}})-[r]->(b:protein)-[e]->(c:protein)RETURN a,r,b,e,c limit 10',{nameParam:searchedproteinname})
            .then(function(neoresult){
                neoresult.records.forEach(function(record){
                neoArray.push({
                    source : record._fields[0].properties.name,
                    target : record._fields[2].properties.name,
                    relationship:record._fields[1].type,
                    relationshipdetails: record._fields[1].properties
                })
                neoArray.push({
                    source : record._fields[2].properties.name,
                    target : record._fields[4].properties.name,
                    relationship:record._fields[3].type,
                    relationshipdetails: record._fields[3].properties
                })

            })
    
//filtering the data based on different conditions and saving it into an array
    
            neoArray.forEach(function(neoArrayvalue){
                combinescore = parseInt(neoArrayvalue.relationshipdetails.combinedscore)
                database = parseInt(neoArrayvalue.relationshipdetails.database)
                experimental = parseInt(neoArrayvalue.relationshipdetails.experimental)
                textmining = parseInt(neoArrayvalue.relationshipdetails.textmining)
                coexpression = parseInt(neoArrayvalue.relationshipdetails.coexpression)
    
                if( (combinescore >= combinedscoreminval  && combinescore <= combinedscoremaxval) && (database >= databaseminval  && database <= databasemaxval) && (experimental >= experimentalminval  && experimental <= experimentalmaxval)&& (textmining >= textminingminval  && textmining <= textminingmaxval) && (coexpression >= coexpressionminval  && coexpression <= coexpressionmaxval))
                {
                    filteredneoArray.push({
                        source : neoArrayvalue.source,
                        target : neoArrayvalue.target,
                        relationship : neoArrayvalue.relationship,
                        relationshipdetails: neoArrayvalue.relationshipdetails
                    })
                }
            })
    
// constructing nodes and links array for D3.js
    
            filteredneoArray.forEach(function(protein){
                if(proteinArray[i].protein != protein.source)
                {
                    proteinArray.push({
                        protein: protein.source
                    });
                    i=i+1;
                } 
                if(proteinArray[j].protein != protein.target)
                {
                    proteinArray.push({
                        protein: protein.target
                    });
                    j=j+1;
                } 
            })
            proteinArray.shift()

            var duplicate = [];
                 nodesArr = proteinArray.filter(function(el) {
                   if(duplicate.indexOf(el.protein)==-1){
                       duplicate.push(el.protein);
                       return true;
                   }
                       return false
                   });

            res.header('Access-Control-Allow-Origin', "*");
            res.header('Access-Control-Allow-Headers', "*");
            d3Data = {"nodes":nodesArr,"links":filteredneoArray};
    
            res.send(d3Data)     
            })
            .catch(function(err){
                console.log(err);
            })
        })

module.exports = router;