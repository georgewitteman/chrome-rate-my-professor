/***************************************************************************************************
 *
 *  RateMyProfessors Viewer
 *  by George Witteman
 *
***************************************************************************************************/

/*
====================================================================================================
== RUN ON LOAD =====================================================================================
====================================================================================================
*/

// On popup load get any selected text and put it into the professor input field
$(function(){
    chrome.tabs.query({active:true, windowId: chrome.windows.WINDOW_ID_CURRENT},
    function(tab) {
        chrome.tabs.sendMessage(tab[0].id, {method: "getSelection"},
        function(response){
            changeState("loading");
            var searchField = document.getElementById('professor');
            var selectedText = response.data;
            searchField.value = selectedText.trim();
            if(checkProfText(searchField.value)) {
                startEverything();
            } else {
                changeState("home");
            }
        });
    });
});

// On popup load create an event listener for links in the popup window
// Note: Necessary to allow links to be clickable
$(function(){
   $('body').on('click', 'a', function(){
     chrome.tabs.create({url: $(this).attr('href')});
     return false;
   });
});

// When you click enter in professor text field virtually click "View Rating" button
$(function(){
    $("#professor").keyup(function(event){
        if(event.keyCode == 13){
            $("#view_rating").click();
        }
    });
});

$(function() {
    $("#view_rating").click(function(event) {
        var searchField = document.getElementById('professor');
        if(searchField.value == "loading") {
            changeState("loading");
        } else if(searchField.value == "empty") {
            changeState("empty");
        } else {
            startEverything();
        }
    });
});

/*
====================================================================================================
== HELPER FUNCTIONS ================================================================================
====================================================================================================
*/

// Check if inputed text is actually a professor
function checkProfText(input) {
    if(input == null || input == "" || input == "+") {
        return false;
    } else {
        return true;
    }
}

// Parse the inputed name
function formatName(theName) {
    var name = theName;
    name.trim();
    name = name.replace(/[^a-zA-Z0-9]+/g, "+");

    return name;
}

// Prints the given error message in the popup
function printError(theError) {
    changeState("search");
    document.getElementById("errorArea").style.display = "block";
    var errorArea = document.getElementById('errorArea');
    errorArea.innerHTML = theError;
    document.getElementById("ratings").style.display = "none";
}

// Check to make sure TID is valid
function isTID(aTID) {
    return !isNaN(parseFloat(aTID)) && isFinite(aTID);
}

function changeState(stateName) {
    switch(stateName) {
        case "home":
            document.getElementById('main_body').style.display = "block";
            document.getElementById('loading').style.display = "none";
            if(document.getElementById('logo') != null) {
                document.getElementById('logo').id = 'logo_home';
                document.getElementById('input_field').id = 'input_field_home';
            }
            break;
        case "search":
            document.getElementById("errorArea").style.display = "none";
            document.getElementById("ratings").style.display = "block";
            document.getElementById('main_body').style.display = "block";
            document.getElementById('loading').style.display = "none";
            if(document.getElementById('logo_home') != null) {
                document.getElementById('logo_home').id = 'logo';
                document.getElementById('input_field_home').id = 'input_field';
            }
            break;
        case "empty":
            document.getElementById('main_body').style.display = "none";
            break;
        case "loading":
            document.getElementById("errorArea").style.display = "none";
            document.getElementById("ratings").style.display = "none";
            document.getElementById('main_body').style.display = "block";
            document.getElementById('loading').style.display = "block";
            if(document.getElementById('logo_home') != null) {
                document.getElementById('logo_home').id = 'logo';
                document.getElementById('input_field_home').id = 'input_field';
            }
            break;
        default: break;
    }
}

/*
====================================================================================================
== PARSERS =========================================================================================
====================================================================================================
*/

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

    ratings.splice(2,1); // Get rid of hotness
    return ratings;
}

function parseComments(commentsSource) {
    var commentsElements = commentsSource.getElementsByClassName("commentsParagraph");
    var commentsHTML = "";
    for(i = 0; i < commentsElements.length; i++) {
        commentsHTML += "<div class=\"comment\">" + commentsElements[i].innerHTML.replace(/(\r\n|\n|\r)/gm," ").replace(/\s+/g," ") + "</div>\n";
    }
    return commentsHTML;
}

/*
====================================================================================================
== MAIN FUNCTIONS ==================================================================================
====================================================================================================
*/

// Start the shit
function startEverything() {
    chrome.storage.sync.get("college", function(response) {
        var college = response["college"];

        if(!college) {
            chrome.tabs.create({ 'url': 'chrome://extensions/?options=' + chrome.runtime.id });
        }
        console.log("College Name: " + college);

        var professorName = document.getElementById("professor").value;
        console.log("professorName before format: " + professorName);

        professorName = formatName(professorName);
        console.log("professorName: " + professorName);

        if(checkProfText(professorName)) {
            getTID(professorName, college);
        } else {
            printError("You've forgotten to put in a professor!")
        }
    });
}

// Gets the TID of the professor
function getTID(professor, college) {
    var name = professor;
    college = formatName(college);

    console.log("Name: " + name);
    console.log("Get TID URL: " + "http://www.ratemyprofessors.com/search.jsp?queryoption=HEADER&queryBy=teacherName&schoolName=" +college+"&query=" + name)

    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://www.ratemyprofessors.com/search.jsp?queryoption=HEADER&queryBy=teacherName&schoolName=' +college+'&query=' + name, true);
    xhr.responseType = 'text';
    xhr.onload = function(e) {
        //Parse the TID from the search response
        var tid = parseTID(this.response);
        // Check to make sure the TID is valid
        if(!isTID(tid)) {
            console.log("Error with search...");
            printError("Could not find that professor on RateMyProfessors. If the professor has " +
                       "a middle name try taking that out, or try another name altogether.");
        } else {
            console.log("TID: " +tid);
            getRating(tid);
        }
    };
    xhr.send();
}



// Gets the rating from the RateMyProfessors page
function getRating(tid) {
    var xhr = new XMLHttpRequest();

    var url = "http://www.ratemyprofessors.com/ShowRatings.jsp?tid=" + tid;
    console.log("URL: " + url);

    xhr.open('GET', 'http://www.ratemyprofessors.com/ShowRatings.jsp?tid='+tid, true);
    xhr.responseType = 'document';
    xhr.onload = function(e) {
        var source = this.response;
        var ratings = parseRatings(source);
        var name = parseProfName(source);
        var numRatings = parseNumRatings(source);
        var comments = parseComments(source);

        viewRating(ratings,url,name,numRatings, comments);
    };
    xhr.send();
}

// Prints the rating in the popup
function viewRating(ratings,url,name,numRatings, comments) {

    changeState("search");

    document.getElementById("professor").value = name;

    var numberRatings = document.getElementById('numRatings');
    numberRatings.innerHTML = numRatings;

    var overallRating = document.getElementById('overallRating');
    overallRating.innerHTML = ratings[0].innerHTML;

    var gradeRating = document.getElementById('gradeRating');
    gradeRating.innerHTML = ratings[1].innerHTML;

    var helpRating = document.getElementById('helpRating');
    helpRating.innerHTML = ratings[2].innerHTML;

    var clarityRating = document.getElementById('clarityRating');
    clarityRating.innerHTML = ratings[3].innerHTML;

    var easyRating = document.getElementById('easyRating');
    easyRating.innerHTML = ratings[4].innerHTML;

    var commentsBox = document.getElementById('comments');
    commentsBox.innerHTML = comments;

    var webLink = document.getElementById("webLink");
    webLink.innerHTML = "<a href=" + url + ">View full review on RateMyProfessors.com</a>";
}
