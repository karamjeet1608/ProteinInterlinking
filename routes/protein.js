const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const neo4j = require("neo4j-driver").v1;
const session = require("../database-connection/neo4jconnection");
const router = express.Router();
const expsession = require("express-session");
let proteinname = 0;
let combinedscoreminval;
let combinedscoremaxval;
let databaseminval;
let databasemaxval;
let experimentalminval;
let experimentalmaxval;
let textminingminval;
let textminingmaxval;
let coexpressionminval;
let coexpressionmaxval;
let numberofrecords;

//get all proteins
router.get("/proteinlist", (req, res) => {
  session
    .run("Match(n:protein) Return(n) LIMIT 20")
    .then(function (neoresult) {
      var proteinArr = [];
      neoresult.records.forEach(function (record) {
        proteinArr.push({
          EnsembleName: record._fields[0].properties.EnsembleName,
          Interactortype: record._fields[0].properties.Interactortype,
          ProteinName: record._fields[0].properties.ProteinName,
          GeneNames: record._fields[0].properties.GeneNames
        });
      });
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "*");
      res.send(proteinArr);
      /* res.send(neoresult) */
    })
    .catch(function (err) {
      console.log(err);
    });
});

// redirect to Add page
router.get("/addpage", (req, res) => {
  res.render("addprotein");
});

router.get("/mainpage", (req, res) => {
  res.render("index");
});

router.get("/searchpage", (req, res) => {
  res.render("search");
});

router.get("/interactomepage", (req, res) => {
  res.render("interactome");
});

router.get("/addproteininterlinking", (req, res) => {
  res.render("addproteininterlinking");
});

router.post("/getinteractionvalues", (req, res, next) => {
  const sourceprotein = req.body.sourceproteinname;
  const targetprotein = req.body.targetproteinname;
  /* console.log("sourceprotein" + sourceprotein)
    console.log("targetprotein" + targetprotein) */
  var lproteinArr = [];
  // reading the raw data from neo4j and saving it in array
  session
    .run(
      "Match(n:protein {name:{nameParam1}})-[r]->(b:protein {name:{nameParam2}}) Return(r)",
      { nameParam1: sourceprotein, nameParam2: targetprotein }
    )
    .then(function (linkneoresult) {
      linkneoresult.records.forEach(function (record) {
        lproteinArr.push({
          combinedscore: record._fields[0].properties.combinedscore,
          database: record._fields[0].properties.database,
          experimental: record._fields[0].properties.experimental,
          coexpression: record._fields[0].properties.coexpression,
          textmining: record._fields[0].properties.textmining
        });
        res.render("interactomeresult", {
          proteindetails: lproteinArr,
          sourceprotein,
          targetprotein
        });
      });
    });
});

router.post("/getsearchvalue", (req, res) => {
  console.log(req.body.interactor);
  console.log(req.body.kinase);
  console.log(req.body.substrate);
  proteinname = req.body.proteinname;
  combinedscoreminval = parseInt(req.body.combinedscoreminval);
  combinedscoremaxval = parseInt(req.body.combinedscoremaxval);
  databaseminval = parseInt(req.body.databaseminval);
  databasemaxval = parseInt(req.body.databasemaxval);
  experimentalminval = parseInt(req.body.experimentalminval);
  experimentalmaxval = parseInt(req.body.experimentalmaxval);
  textminingminval = parseInt(req.body.textminingminval);
  textminingmaxval = parseInt(req.body.textminingmaxval);
  coexpressionminval = parseInt(req.body.coexpressionminval);
  coexpressionmaxval = parseInt(req.body.coexpressionmaxval);
  relationalvalue = req.body.relationalvalue;
  numberofrecords = parseInt(req.body.numberofrecords);
  console.log(numberofrecords);
  console.log(relationalvalue);
  if (relationalvalue == 1) {
    console.log("Inside searchresult");
    res.render("searchresult");
  } else if (relationalvalue == 2) {
    console.log("Inside searchresulttwo");
    res.render("searchresulttwo");
  }
});

// To get the list of linked proteins

router.get("/getsearchvalue", (req, res, next) => {
  var searchedproteinname = proteinname;
  /* var searchedproteinname = "ENSP00000002165"; */
  console.log(searchedproteinname)
  var neoArray = [];
  var filteredneoArray = [];
  var neoArrayInteractor = [];
  var proteinArray = [{ protein: "" }];
  var i = 0;
  var j = 0;
  var numberofrecordval = numberofrecords;
  var kinase = true;
  var interactor = true;
  var substrate = true;

  // reading the raw data from neo4j and saving it in array

  session
    .run(
      "MATCH (a:protein)-[r]->(b:protein) WHERE a.EnsembleName =  $nameParam OR a.ProteinName =  $nameParam OR a.GeneNames =  $nameParam RETURN a,r,b limit $limitval ",
      { nameParam: searchedproteinname, limitval: numberofrecordval }
    )
    .then(function (neoresult) {
      neoresult.records.forEach(function (record) {
        neoArray.push({
          source: record._fields[0].properties.ProteinName,
          target: record._fields[2].properties.ProteinName,
          relationship: record._fields[1].type,
          relationshipdetails: record._fields[1].properties
        });
      });

      //filtering the data based on different conditions and saving it into an array

      neoArray.forEach(function (neoArrayvalue) {
        combinescore = parseInt(
          neoArrayvalue.relationshipdetails.combinedscore
        );
        database = parseInt(neoArrayvalue.relationshipdetails.database);
        experimental = parseInt(neoArrayvalue.relationshipdetails.experimental);
        textmining = parseInt(neoArrayvalue.relationshipdetails.textmining);
        coexpression = parseInt(neoArrayvalue.relationshipdetails.coexpression);
        if (
          combinescore >= combinedscoreminval &&
          combinescore <= combinedscoremaxval &&
          database >= databaseminval &&
          database <= databasemaxval &&
          experimental >= experimentalminval &&
          experimental <= experimentalmaxval &&
          textmining >= textminingminval &&
          textmining <= textminingmaxval &&
          coexpression >= coexpressionminval &&
          coexpression <= coexpressionmaxval
        ) {
          filteredneoArray.push({
            source: neoArrayvalue.source,
            target: neoArrayvalue.target,
            relationship: neoArrayvalue.relationship,
            relationshipdetails: neoArrayvalue.relationshipdetails
          });
        }
      });

      // constructing nodes and links array for D3.js

      filteredneoArray.forEach(function (protein) {
        if (proteinArray[i].protein != protein.source) {
          proteinArray.push({
            protein: protein.source
          });
          i = i + 1;
        }
        if (proteinArray[j].protein != protein.target) {
          proteinArray.push({
            protein: protein.target
          });
          j = j + 1;
        }
      });
      proteinArray.shift();
      /* console.log("filteredneoArray" + filteredneoArray) */
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "*");
      d3Data = { nodes: proteinArray, links: filteredneoArray };

      res.send(d3Data);
    })
    .catch(function (err) {
      console.log(err);
    });
});

router.get("/getsearchvaluetworelation", (req, res, next) => {
  var searchedproteinname = proteinname;
  var neoArray = [];
  var filteredneoArray = [];
  var proteinArray = [{ protien: "" }];
  var i = 0;
  var j = 0;
  var numberofrecordval1 = numberofrecords;

  // reading the raw data from neo4j and saving it in array

  session
    .run(
      "MATCH (a:protein)-[r]->(b:protein)-[e]->(c:protein) WHERE a.EnsembleName =  $nameParam OR a.ProteinName =  $nameParam RETURN a,r,b,e,c limit $limitval",
      { nameParam: searchedproteinname, limitval: numberofrecordval1 }
    )
    .then(function (neoresult) {
      neoresult.records.forEach(function (record) {
        neoArray.push({
          source: record._fields[0].properties.EnsembleName,
          target: record._fields[2].properties.EnsembleName,
          relationship: record._fields[1].type,
          relationshipdetails: record._fields[1].properties
        });
        neoArray.push({
          source: record._fields[2].properties.EnsembleName,
          target: record._fields[4].properties.EnsembleName,
          relationship: record._fields[3].type,
          relationshipdetails: record._fields[3].properties
        });
      });

      //filtering the data based on different conditions and saving it into an array

      neoArray.forEach(function (neoArrayvalue) {
        combinescore = parseInt(
          neoArrayvalue.relationshipdetails.combinedscore
        );
        database = parseInt(neoArrayvalue.relationshipdetails.database);
        experimental = parseInt(neoArrayvalue.relationshipdetails.experimental);
        textmining = parseInt(neoArrayvalue.relationshipdetails.textmining);
        coexpression = parseInt(neoArrayvalue.relationshipdetails.coexpression);

        if (
          combinescore >= combinedscoreminval &&
          combinescore <= combinedscoremaxval &&
          database >= databaseminval &&
          database <= databasemaxval &&
          experimental >= experimentalminval &&
          experimental <= experimentalmaxval &&
          textmining >= textminingminval &&
          textmining <= textminingmaxval &&
          coexpression >= coexpressionminval &&
          coexpression <= coexpressionmaxval
        ) {
          filteredneoArray.push({
            source: neoArrayvalue.source,
            target: neoArrayvalue.target,
            relationship: neoArrayvalue.relationship,
            relationshipdetails: neoArrayvalue.relationshipdetails
          });
        }
      });

      // constructing nodes and links array for D3.js

      filteredneoArray.forEach(function (protein) {
        if (proteinArray[i].protein != protein.source) {
          proteinArray.push({
            protein: protein.source
          });
          i = i + 1;
        }
        if (proteinArray[j].protein != protein.target) {
          proteinArray.push({
            protein: protein.target
          });
          j = j + 1;
        }
      });
      proteinArray.shift();

      var duplicate = [];
      nodesArr = proteinArray.filter(function (el) {
        if (duplicate.indexOf(el.protein) == -1) {
          duplicate.push(el.protein);
          return true;
        }
        return false;
      });

      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "*");
      d3Data = { nodes: nodesArr, links: filteredneoArray };

      res.send(d3Data);
    })
    .catch(function (err) {
      console.log(err);
    });
});



module.exports = router;
