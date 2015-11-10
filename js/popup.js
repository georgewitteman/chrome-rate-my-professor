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
        if(searchField.value == "empty") {
            changeState("empty");
        } else {
            startEverything();
        }
    });
});

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
        //console.log("College Name: " + college); // DEBUG

        var professorName = document.getElementById("professor").value;
        //console.log("professorName before format: " + professorName); // DEBUG

        professorName = formatName(professorName);
        //console.log("professorName: " + professorName); // DEBUG

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

    //console.log("Name: " + name); // DEBUG
    //console.log("Get TID URL: " +
    //"http://www.ratemyprofessors.com/search.jsp?queryoption=HEADER&queryBy=teacherName&schoolName="
    //+ college + "&query=" + name); // DEBUG

    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://www.ratemyprofessors.com/search.jsp?queryoption=HEADER&queryBy=teacherName&schoolName=' +college+'&query=' + name, true);
    xhr.responseType = 'text';
    xhr.onload = function(e) {
        //Parse the TID from the search response
        var tid = parseTID(this.response);
        // Check to make sure the TID is valid
        if(!isTID(tid)) {
            //console.log("Error with search..."); // DEBUG
            printError("Could not find that professor on RateMyProfessors. If the professor has " +
                       "a middle name try taking that out, or try another name altogether.");
        } else {
            //console.log("TID: " + tid); // DEBUG
            getRating(tid);
        }
    };
    xhr.send();
}

// Gets the rating from the RateMyProfessors page
function getRating(tid) {
    var xhr = new XMLHttpRequest();

    var url = "http://www.ratemyprofessors.com/ShowRatings.jsp?tid=" + tid;
    //console.log("URL: " + url); // DEBUG

    xhr.open('GET', 'http://www.ratemyprofessors.com/ShowRatings.jsp?tid='+tid, true);
    xhr.responseType = 'document';
    xhr.onload = function(e) {
        var source = this.response;
        var ratings = parseEverything(source);

        viewRating(ratings, url);
    };
    xhr.send();
}

// Prints the rating in the popup
function viewRating(ratings, url) {
    changeState("search");

    document.getElementById("professor").value = ratings["name"];

    var numberRatings = document.getElementById('numRatings');
    numberRatings.innerHTML = ratings["number-of-ratings"];

    var overallRating = document.getElementById('overallRating');
    overallRating.innerHTML = ratings["overall-quality"];

    var gradeRating = document.getElementById('gradeRating');
    gradeRating.innerHTML = ratings["average-grade"];

    var helpRating = document.getElementById('helpRating');
    helpRating.innerHTML = ratings["helpfulness"];

    var clarityRating = document.getElementById('clarityRating');
    clarityRating.innerHTML = ratings["clarity"];

    var easyRating = document.getElementById('easyRating');
    easyRating.innerHTML = ratings["easiness"];

    var commentsBox = document.getElementById('comments');
    commentsHTML = "";
    comments = ratings["comments"];
    for(var i = 0; i < comments.length; i++) {
        commentsHTML += "<div class=\"comment\"><div class=\"comment_rating\">";
        commentsHTML += "<span class=\"com_rating\">Date: " + ratings["comments"][i]["date"] + "</span>";
        commentsHTML += "<span class=\"com_rating\">Class: " + ratings["comments"][i]["class"] + "</span>";
        commentsHTML += "<span class=\"com_rating\">Helpfulness: " + ratings["comments"][i]["helpfulness"] + "</span>";
        commentsHTML += "<span class=\"com_rating\">Easiness: " + ratings["comments"][i]["easiness"] + "</span>";
        commentsHTML += "<span class=\"com_rating\">Clarity: " + ratings["comments"][i]["clarity"] + "</span></div>";
        commentsHTML += "<div class=\"comment_text\">" + ratings["comments"][i]["comment"];
        commentsHTML += "</div></div>";
    }
    commentsBox.innerHTML = commentsHTML;

    var webLink = document.getElementById("webLink");
    webLink.innerHTML = "<a href=" + url + ">View full review on RateMyProfessors.com</a>";
}
