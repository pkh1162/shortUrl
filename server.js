var express = require("express");
var request = require("request");
var mongo = require("mongodb").MongoClient;
var dbUrl = process.env.MONGO_URI_SHORT_URL;



var count = 0;
var ans = {};
var url = "";

var app = express();
app.set("view engine", "pug");


var short = [];

mongo.connect(dbUrl, function(err, db){
    if (err) throw err;
    
    else{
        var collection = db.collection("short_urls");
        collection.find({}, {_id:0}).toArray(function(err, data){
            if (err) throw err;
            else{
                for (var i in data){
                    short[i] = data[i];
                }
                //console.log(short);
            }
            db.close();
        })
    }
})




app.get("/", function(req, res){
    res.redirect("/home");
})

app.get("/home", function(req, res){
    res.render("index");
})



app.get("/new/*", function(req, res, next) {
    url = req.params[0];
  //  var short = "shorter url";
    
    
    var check = checkUrlFormat(url);
    
    if (check){
        
        var websiteCheck = checkWebsite(url, res, urlGoodOrBad);
        //console.log(websiteCheck);
       
        /*
        setUpShorts(url);
        res.writeHead(200, {"Content-Type" : "application/json"});     //100% need this line. It is good practice to always set up the headers, but in 
        //this case it is also vital for the service to function properly. Without this line, /new requests which ended in .com would result in 
        //a pop-up asking me to save the page as a binary file.
        res.write(JSON.stringify(ans));
         */
    
    }
    else{
        res.write("Sorry, there was an error with the format of the url you entered:   " + url);
        res.write("\nThe website must begin with http:// or https//, and include at least one period.")
        res.end();

    }

   // res.end();
   
})


app.get("/codes", function(req, res) {
    res.writeHead(200, {"Content-Type" : "text/plain"});
    currentCodes(res);
    //res.end();
})


app.get("/*", function(req, res){
    
    if (req.params[0] != ""){
        var item = req.params[0].slice(-1);
        //console.log(item);
    
        if (short[item] != undefined){
            //console.log(req.params[0]);
            if (req.params[0] == short[item]["short"]){
                res.redirect(short[item]["original"]);
                //console.log("short worked");
            }
            else {
                res.send("Sorry, " + "'" + req.params[0] + "'" + " is not a code we have in our database. Type '/codes' to see list of available url codes.");
            }     
        }
        else {
            res.send("Sorry, the short url code you entered is incorrect.")
        }
    }
    else {
        res.send("Sorry, you need to type in a shortened url code.")
    }
})







app.listen(process.env.PORT || 8080, function(){
    console.log("I'm listening...")
})


function checkUrlFormat(enteredUrl){
    var regEx = /^(https?:\/\/)/        //RegEx for string which begins with http:// or https://
    
    if (regEx.test(enteredUrl)){
        var domain = enteredUrl.slice(enteredUrl.indexOf("//") + 2);
        if (domain.indexOf(".") != -1){
            return true;
        }
        else{
            return false;
        }
        
    }
    else {
        return false;
    }
    
}

function setUpShorts(passedUrl){
    //short = "A" + Math.floor((Math.random() * 100) + 1).toString();
    count = short.length;
    
    //short[count] = ["a" + count.toString(), passedUrl];
    short[count] = {"original" : passedUrl, "short" : "a" + count.toString()};
   
    ans = short[count];
    //count++;
}


function checkWebsite(urlToCheck, res, callback){
     request(urlToCheck, function(err, response, body){
        if(!err && response.statusCode == 200){
            console.log("This website entered exists");
            callback(true, res, urlToCheck);
        }
        else if(response === undefined){
            console.log("There was a problem... (it said vaguely, website probably doesn't exist.)")
            callback(false, res, urlToCheck);
        }
        else{
            console.log("bad : " + JSON.stringify(response.statusCode));
            callback(false, res, urlToCheck);
        }   
     });
}


function urlGoodOrBad(webCheck, res, url){
     if(webCheck){
         
         mongo.connect(dbUrl, function(err, db){
             console.log("Connected to db");
             if (err) {
                 db.close();
                 throw err;
             }
             else{
                 console.log("No error");    
                 var collection = db.collection("short_urls");
                 setUpShorts(url);
                 console.log("shorts set up");
                 console.log("answer is: " + ans);
                
                 res.writeHead(200, {"Content-Type" : "application/json"});
                 collection.insert(ans, function(err){
                     if (err) throw err;
                     var tempAns = {"original": ans.original, "short": ans.short};
                     res.write(JSON.stringify(tempAns));
                     console.log("response written");
                     res.end();
                     db.close();
                 })
             }
             
            /* 
            //Website exists
            setUpShorts(url);
            res.writeHead(200, {"Content-Type" : "application/json"});     //100% need this line. It is good practice to always set up the headers, but in 
            //this case it is also vital for the service to function properly. Without this line, /new requests which ended in .com would result in 
            //a pop-up asking me to save the page as a binary file.
            res.write(JSON.stringify(ans));
            */
             
         })
                }
     else{
            //Website does not exist.
            res.writeHead(200, {"Content-Type" : "text/html"})
            res.write("Sorry, I don't believe that website could be found.");
            res.end();
     }
     //res.end();
}


function currentCodes(res){
    
    res.write("CODES:\n\n")
    
    mongo.connect(dbUrl, function(err, db){
        if (err) throw err;
        
        else{
            var collection = db.collection("short_urls");
            collection.find({}, {_id : 0}, {limit: 10}).toArray(function(err, data){
                if (err) throw err;
                
                else{
                    for (var code in data){
                        
                        res.write(JSON.stringify(data[code]));
                        res.write("\n\n")
                    }
                }
                db.close();
                res.end();
            })
        }
    })
    
    
    
    
/*    
Printing out the codes without using database.
    for (var code in short){
        res.write(short[code][0] + ":   " + short[code][1] + "\n");
    }
    res.end();
*/


}
