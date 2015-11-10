/*
====================================================================================================
== PARSERS =========================================================================================
====================================================================================================
*/

/**
{
    "name": "Paul Fodor",
    "OverallQuality": "4.6",
    "Clarity": "4.5",
    "AverageGrade": "A-",
    "Helpfulness": "4.7",
    "Easiness": "3.5",
    "comments": [
        {
        "date": "03/10/2015",
        "class": "CMPU101",
        "helpfulness": "5",
        "easiness": "5",
        "clarity": "5",
        "comment": "This teacher was awesome!"
        },
        {
        "date": "03/10/2015",
        "class": "CMPU102",
        "helpfulness": "1",
        "easiness": "1",
        "clarity": "1",
        "comment": "This teacher sucked!"
        }
    ]
}


returnObject = {
    "name": "Paul Fodor",
    "number-of-ratings": "15",
    "overall-quality": "4.6",
    "clarity": "4.5",
    "average-grade": "A-",
    "helpfulness": "4.7",
    "easiness": "3.5",
    "comments": [
        {
        "date": "03/10/2015",
        "class": "CMPU101",
        "helpfulness": "5",
        "easiness": "5",
        "clarity": "5",
        "comment": "This teacher was awesome!"
        },
        {
        "date": "03/10/2015",
        "class": "CMPU102",
        "helpfulness": "1",
        "easiness": "1",
        "clarity": "1",
        "comment": "This teacher sucked!"
        }
    ]
};
*/

/** NEW **/

function parseEverything(source) {
    var returnObject = {};
    returnObject["name"] = parseProfName(source);
    returnObject["number-of-ratings"] = parseNumRatings(source);
    var mainRatings = parseRatings(source);
    console.log(mainRatings);
    returnObject["overall-quality"] = mainRatings[0].innerText;
    returnObject["average-grade"] = mainRatings[1].innerText;
    returnObject["hotness"] = "http://www.ratemyprofessors.com" +
                              mainRatings[2].children[0].children[0].attributes[0].nodeValue;
    returnObject["helpfulness"] = mainRatings[3].innerText;
    returnObject["clarity"] = mainRatings[4].innerText;
    returnObject["easiness"] = mainRatings[5].innerText;
    returnObject["comments"] = parseComments(source);
    console.log(returnObject);
    return returnObject;
}

// Parses the TID from the source code from search page
function parseTID(searchSource) {
    // Get the
    var start_index = searchSource.indexOf('<li class="listing PROFESSOR">');
    var end_index = searchSource.indexOf('</li>', start_index) + 4;
    var text = searchSource.substring(start_index, end_index);

    // Parse TID numbers
    start_index = text.indexOf('tid=') + 4;
    end_index = text.indexOf('"', start_index);

    return text.substring(start_index, end_index);
}

/** OLD
function parseEverything(source) {
    var returnObject = {};
    returnObject["name"] = parseProfName(source);
    returnObject["numRatings"] = parseNumRatings(source);
    returnObject["ratings"] = parseRatings(source);
    returnObject["comments"] = parseComments(source);
    return returnObject;
}
*/
// Parses the professor name from the professor page
function parseProfName(searchSource) {
    var text = searchSource.getElementsByClassName("result-name");
    return text[0].innerText.replace(/\s+/g,' ').trim();
}

// Parses the professor name from the professor page
function parseNumRatings(searchSource) {
    var text = searchSource.getElementsByClassName("table-toggle rating-count active");
    return text[0].innerText.replace ( /[^\d.]/g, '' );;
}

// Parses the rating information from the professor rating page
function parseRatings(ratingSource) {
    var mainRatingsElement = ratingSource.getElementsByClassName("breakdown-wrapper")[0];
    var mainRatings = mainRatingsElement.getElementsByClassName("grade");
    var otherRatingsElement = ratingSource.getElementsByClassName("faux-slides")[0];
    var otherRatings = otherRatingsElement.getElementsByClassName("rating");

    var a1 = Array.prototype.slice.call(mainRatings);

    var a2 = Array.prototype.slice.call(otherRatings);

    var ratings = a1.concat(a2);
    return ratings;
}

function parseComments(commentsSource) {
    var commentsElements = commentsSource.getElementsByClassName("commentsParagraph");
    var commenterRating = commentsSource.getElementsByClassName("rating-block");
    var dates = commentsSource.getElementsByClassName("date");
    var classNames = commentsSource.getElementsByClassName("class");
    console.log(classNames);
    var commentsJSON = [];
    for(var i = 0; i < commenterRating.length; i++) {
        commentsJSON[i] = {};
        commentsJSON[i]["comment"] = commentsElements[i].innerText;
        commentsJSON[i]["helpfulness"] = commenterRating[i].children[1].children[0].children[0].innerText;
        commentsJSON[i]["easiness"] = commenterRating[i].children[1].children[1].children[0].innerText;
        commentsJSON[i]["clarity"] = commenterRating[i].children[1].children[2].children[0].innerText;
        commentsJSON[i]["date"] = dates[i].innerText;
        commentsJSON[i]["class"] = classNames[i+1].children[0].innerText;
    }
    //commenterRating[i].children[1].innerHTML
    //commentsElements[i].innerHTML.replace(/(\r\n|\n|\r)/gm," ").replace(/\s+/g," ")



    return commentsJSON;
}

/*
{
"date": "03/10/2015",
"class": "CMPU101",
"helpfulness": "5",
"easiness": "5",
"clarity": "5",
"comment": "This teacher was awesome!"
}
*/
