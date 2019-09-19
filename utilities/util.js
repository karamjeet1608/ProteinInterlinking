const express = require('express')
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const neo4j = require('neo4j-driver').v1;
const sqldb = require('../database-connection/sqlconnection');
const session = require('../database-connection/neo4jconnection');
const proteinroute = require('../routes/protein')
const expsession = require('express-session')
const router = express.Router();
let arr = [];


// sql code to read all the data 
sqldb.execute('SELECT * from homosapienproteinslinking')
    .then(([rows])=>{
        rows.forEach((row)=>{
            arr.push({
                id: row.id,
                protein1:row.protein1,
                protein2:row.protein2,
                neighborhood: row.neighborhood,
                fusion:row.fusion,
                cooccurence: row.cooccurence,
                coexpression: row.coexpression,
                experimental: row.experimental,
                database: row.database,
                textmining: row.textmining,
                combinedscore: row.combinedscore
            })
        })  
    })     
    .catch(err=>{
        console.log(err)
 })

 // Add proteins into NEo4j database
router.post('/addproteins',function(req,res,next){
    let id;
    let protein1;
    let protein2;
    let neighborhood;
    let fusion;
    let cooccurence;
    let coexpression;
    let experimental;
    let database;
    let textmining;
    let combinedscore
     arr.forEach(function(val){
                 protein1 = val.protein1;
                 protein2 = val.protein2;
                 neighborhood = val.neighborhood;
                 fusion = val.fusion;
                 cooccurence = val.cooccurence;
                 coexpression = val.coexpression;
                 experimental = val.experimental;
                 database = val.database;
                 textmining = val.textmining;
                 combinedscore = val.combinedscore
     session
         .run('Merge(n:Protein{name:{nameParam}})RETURN n.name',{nameParam:protein2})
         .then(function(result){
             res.send("Success");
         })
         .catch(function(err){
             console.log(err)
         });
     })
     session.close();
 }) 

 //adding Relationship into NEO
router.post('/createrelation',function( req, res,next){
   let id; 
   let protein1;
   let protein2;
   let neighborhood;
   let fusion;
   let cooccurence;
   let coexpression;
   let experimental;
   let database;
   let textmining;
   let combinedscore
    arr.forEach(function(val){
                protein1 = val.protein1;
                protein2 = val.protein2;
                neighborhood = val.neighborhood;
                fusion = val.fusion;
                cooccurence = val.cooccurence;
                coexpression = val.coexpression;
                experimental = val.experimental;
                database = val.database;
                textmining = val.textmining;
                combinedscore = val.combinedscore
    session
    .run('MATCH(a:Protein {name:{nameParam}}),(b:Protein{name:{nameParam2}}) MERGE(a)-[r:ON_INTERACTION_WITH {neighborhood:{neighborhoodParam}, fusion:{fusionParam}, cooccurence:{cooccurenceParam}, coexpression:{coexpressionParam}, experimental:{experimentalParam},database:{databaseParam}, textmining:{textminingParam},combinedscore:{combinedscoreParam}}]-(b) RETURN a,b', {nameParam:protein1, nameParam2:protein2,neighborhoodParam:neighborhood,fusionParam:fusion,
     cooccurenceParam:cooccurence, coexpressionParam:coexpression, experimentalParam: experimental,databaseParam:database,
    textminingParam:textmining,combinedscoreParam:combinedscore })
    .then(function(result2){
        res.send("Successful");
    })
    .catch(function(err){
        console.log(err)
        });
    })
})

module.exports = router;