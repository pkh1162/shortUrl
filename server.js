var express = require("express");
var request = require("request");


var short = [];
var count = 0;
var ans = {};
var url = "";

var app = express();
app.set("view engine", "pug");


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
    res.end();
})


app.get("/*", function(req, res){
    
    if (req.params[0] != ""){
        var item = req.params[0].slice(-1);
        //console.log(item);
    
        if (short[item] != undefined){
            //console.log(req.params[0]);
            if (req.params[0] == short[item][0]){
                res.redirect(short[item][1]);
                //console.log("short worked");
            }
            else {
                res.send("Sorry, couldn't redirect : \n" + short);
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







app.listen(8080, function(){
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
    
    short[count] = ["a" + count.toString(), passedUrl];
    
    ans = {
    original : url,
    short : short[count][0]
    }
    count++;
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
            //Website exists
            setUpShorts(url);
            res.writeHead(200, {"Content-Type" : "application/json"});     //100% need this line. It is good practice to always set up the headers, but in 
            //this case it is also vital for the service to function properly. Without this line, /new requests which ended in .com would result in 
            //a pop-up asking me to save the page as a binary file.
            res.write(JSON.stringify(ans));
     }
     else{
            //Website does not exist.
            res.writeHead(200, {"Content-Type" : "text/html"})
            res.write("Sorry, I don't believe that website could be found.");
     }
     res.end();
}


function currentCodes(res){
    
    res.write("CODES:\n\n")
    for (var code in short){
        res.write(short[code][0] + ":   " + short[code][1] + "\n");
    }
    res.end();
}