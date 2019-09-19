const express = require('express')
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const neo4j = require('neo4j-driver').v1;
const session = require('../database-connection/neo4jconnection');
const router = express.Router();
const expsession = require('express-session')
let proteinname=0;


//get all proteins
router.get('/proteinlist',(req,res)=>{
    session
        .run('Match(n:Protein) Return(n) LIMIT 100')
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
    const sourceprotein = req.body.sourceproteinname
    const targetprotein = req.body.targetproteinname 
    session
        .run('Match(n:Protein {name:{nameParam1}})-[r]->(b:Protein {name:{nameParam2}}) Return(r)',{nameParam1:sourceprotein, nameParam2:targetprotein})
        .then(function(linkneoresult){
            console.log(linkneoresult)
            var lproteinArr = [];
            linkneoresult.records.forEach(function(record){
               // console.log(record._fields[0].properties);
                lproteinArr.push({
                    fusion: record._fields[0].properties.fusion,
                    combinedscore: record._fields[0].properties.combinedscore,
                    database: record._fields[0].properties.database,
                    cooccurence: record._fields[0].properties.cooccurence,
                    experimental: record._fields[0].properties.experimental,
                    neighborhood: record._fields[0].properties.neighborhood,
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
    res.render('searchresult')
})
 // To get the list of linked proteins      
router.get('/getsearchvalue',(req,res,next)=>{
    console.log('inside getsearchvalue')
    console.log(proteinname)
    var searchedproteinname = proteinname
     session
         .run('MATCH (a:Protein {name:{nameParam}})-[r]->(b:Protein)RETURN a,b,r limit 30',{nameParam:searchedproteinname})
         .then(function(neoresult){
             var proteinArr = [];
             var nodesArr = [];
             var sourceArr = [];
             var targetArr = [];
             var linkArr = [];
             var ui = {};
             neoresult.records.forEach(function(record){
                 sourceArr.push({
                     protein : record._fields[0].properties.name
                 })
                 targetArr.push({
                     protein : record._fields[1].properties.name
                 })
                 proteinArr = sourceArr.concat(targetArr);
                 var duplicate = [];
                 nodesArr = proteinArr.filter(function(el) {
                   if(duplicate.indexOf(el.protein)==-1){
                       duplicate.push(el.protein);
                       return true;
                   }
                       return false
                   });
 
                 linkArr.push({
                     source: record._fields[0].properties.name,
                     target: record._fields[1].properties.name,
                     relationship:record._fields[2].type,
                     relationshipdetails: record._fields[2].properties
                 })
             })
            res.header('Access-Control-Allow-Origin', "*");
            res.header('Access-Control-Allow-Headers', "*");
            ui = {"nodes":nodesArr,"links":linkArr };
            res.send(ui)  
        })
        .catch(function(err){
            console.log(err);
        })
    })





module.exports = router;