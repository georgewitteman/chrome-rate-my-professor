/*
====================================================================================================
== PARSERS =========================================================================================
====================================================================================================
*/

function parseEverything(source) {
    var returnObject = {};
    returnObject["name"] = parseProfName(source);
    returnObject["numRatings"] = parseNumRatings(source);
    returnObject["ratings"] = parseRatings(source);
    returnObject["comments"] = parseComments(source);
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

    ratings.splice(2,1); // Get rid of "hotness"
    return ratings;
}

function parseComments(commentsSource) {
    var commentsElements = commentsSource.getElementsByClassName("commentsParagraph");
    var commenterRating = commentsSource.getElementsByClassName("rating-block");
    //DEBUG: console.log(commenterRating);
    var commentsHTML = "";
    for(i = 0; i < commentsElements.length; i++) {
        commentsHTML += "<div class=\"comment\">";
        commentsHTML += "<div class=\"comment_rating\">" +
                        commenterRating[i].children[1].innerHTML + "</div>";
        commentsHTML += commentsElements[i].innerHTML.replace(/(\r\n|\n|\r)/gm," ").replace(/\s+/g," ");
        commentsHTML += "</div>\n";
    }

    return commentsHTML;
}
