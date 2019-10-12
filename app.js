const express = require('express')
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const neo4j = require('neo4j-driver').v1;
const sqldb = require('./database-connection/sqlconnection');
const session = require('./database-connection/neo4jconnection');
const proteinroute = require('./routes/protein')
const utilroute = require('./utilities/util')
const expsession = require('express-session')
let arr = [];

//view engine setup

app.set('views',path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//middleware

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname, '/public')));
app.use('/api/protein/', proteinroute);
app.use('/api/util/', utilroute);
app.use(expsession({secret: 'my secret', resave: false, saveUninitialized:false}));

 //get all proteins
app.get('/',(req,res)=>{
    session
        .run('Match(n:protein) Return(n) limit 100')
        .then(function(neoresult){
            var proteinArr = [];
            neoresult.records.forEach(function(record){
                proteinArr.push({
                    name: record._fields[0].properties.name  
                })
            })
            res.render('index');
            
        })
            .catch(function(err){
                console.log(err);
            })
        })

app.listen(3600);
console.log('Server started on localhost:3600')

module.exports=app; 