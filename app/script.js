var inputScore = function (StudentNumber, StudentScore, Assignments) {
    //document.getElementsByClassName("assignments")[0].rows[0].cells[7].children[0].textContent = "100";
	var foundName = false;
    var students = document.getElementsByClassName("assignments")[0].rows;
    for (var i=0; i<Assignments.length;i++){
	    for (var row = 0; row < students.length; row++) {
            for (var sn = 0; sn < students[row].attributes.length; sn++) {
	            if (students[row].attributes[sn].name == "data-sn" &&
	                students[row].attributes[sn].value == StudentNumber) {
	                foundName = true;
	                    var assignments = students[row].cells;
	                    for (var an = 0; an < assignments.length; an++) {
                            for (var attr = 0; attr < assignments[an].attributes.length; attr++) {
	                            if (assignments[an].attributes[attr].name == "data-an" &&
	                                assignments[an].attributes[attr].value == Assignments[i].trim()) {

                                    assignments[an].children[0].textContent = StudentScore[i];
	                                assignments[an].dispatchEvent(new MouseEvent("click", {
	                                    "view": window,
	                                    "bubbles": true,
	                                    "cancelable": false
                                    }));
	                            }
	                        }
	                    }
	            }
	        }
	    }
    }

    //Hacky nonsense to get Aeries to trigger their score updating
    document.getElementsByClassName("assignments")[0].rows[1].cells[0].dispatchEvent(new MouseEvent("click", {
                                                                                            "view": window,
                                                                                            "bubbles": true,
                                                                                            "cancelable": false
    }));
    document.getElementsByClassName("assignments")[0].rows[0].cells[0].dispatchEvent(new MouseEvent("click", {
        "view": window,
        "bubbles": true,
        "cancelable": false
    }));

    if (!foundName) {
        var notFound = "Could not find student numbers:\n";
        notFound += StudentNumber;
        notFound += ", Score: ";
        notFound += StudentScore;
        notFound += "\n";
        return notFound;
    }
    else {
        return "";
    }
};

var createScoresTable = function (scores, identtype) {
    if(identtype == 'StuNum') {
        return scores;
    } else if(identtype == 'StuLastFirst' || identtype == 'StuFullName') {
        var notFound = "Could not find:\n";
        var roster = getRoster();
        var scoresTable = [];
        for ( var i in scores) {
            var name = scores[i].Name;
            var foundName = false;
            for ( j in roster) {
                var rosterName = roster[j].StuName.split(", ");
                rosterName[1] = rosterName[1].split(" ")[0];
                if ( name.includes(rosterName[0]) && name.includes(rosterName[1])) {
                    scoresTable.push({ StuNum: roster[j].StuNum, Score: scores[i].Score });
                    foundName = true;
                    break;
                }
            }
            if (!foundName) {
                notFound += name;
                notFound += ", Score: ";
                notFound += scores[i].Score;
                notFound += "\n";
            }
        }
        if (notFound.length > 18) { window.alert(notFound) };
        return scoresTable;
    } else {
        return scores;  // for Permanent ID, not implemented
    };
};

var getRoster = function(){
    var StudentTable = {};
    var students = document.getElementsByClassName("student-name-link");
    for (var i = 0; i < students.length; i++) {
        StudentTable[i] = {
            StuNum: getStudentNumber(students[i].textContent),
            StuName: students[i].textContent
        }
    }
    return StudentTable;
};

var repackRoster = function(){
    var StudentList = "";
    var students = document.getElementsByClassName("student-name-link");
    for (var i = 0; i < students.length; i++) {
        StudentList += getStudentNumber(students[i].textContent);
        StudentList += "\t";
        StudentList += students[i].textContent;
        StudentList += "\n";
    }

    return StudentList;
};

//var getStudentName = function (student) {
//    var tempName = student.textContent;
//    //var tempName = document.getElementById("Row"+rowNumber).children[1].children[0].innerHTML.split("<")[0].replace(/&nbsp;/g," ");
//    var name = tempName.split(", ");
//    var lastName = name[0].split(" ");
//    var firstName = name[1].split(" ");
//    return lastName[0] + ", " + firstName[0];
//}

var getStudentNumber = function (studentName) {
    var students = document.getElementsByClassName("students")[0].rows;
    for (var row = 0; row < students.length; row++) {
        if (students[row].cells[1].children[0].children[0].children[0].textContent == studentName)
        {
            return students[row].attributes[1].value;
        }
    }
}

var sendToContentScript = function(message, command){
    window.postMessage({ text: message, command: command}, '*');
};

var handleImport = function (scores, identType, assignments) {
    var scoresTable = createScoresTable(scores, identType);
    var notFoundList = "";
    for (var student in scoresTable) {
        notFoundList += inputScore(scoresTable[student].StuNum, scoresTable[student].Score, assignments);
    }
    if (notFoundList != "")
    {
        window.alert(notFoundList)
    }
}

window.addEventListener('message', function (event) {
    if (event.origin != "https://teacherportal.abcusd.us") {
        return false;
    } else {
        switch(event.data.text.command) {
            case "import":
                handleImport(event.data.text.scores, event.data.text.identtype, event.data.text.assignments);
                break;
            case "getRoster":
                var roster = repackRoster();
                sendToContentScript(roster, "openPopup");
                break;   
            default:
                return false;
        }
    };
});