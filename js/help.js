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
