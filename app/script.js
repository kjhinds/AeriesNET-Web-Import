var inputScore = function (StudentNumber, StudentScore, Assignments, Skip) {
    //document.getElementsByClassName("assignments")[0].rows[0].cells[7].children[0].textContent = "100";
    var lastColumnVisted = 0;
    var lastRowVisited = 0;
    var foundName = false;
    var students = document.getElementsByClassName("assignments")[0].rows;
    for (var i = 0; i < Assignments.length; i++)
    {
        if (!Skip.includes(Assignments[i]))
        {
            for (var row = 0; row < students.length; row++) {
                if (students[row].getAttribute("data-sn") == StudentNumber) {
                    foundName = true;
                    var assignmentsList = students[row].cells;
                    for (var an = 0; an < assignmentsList.length; an++) {
                        if (assignmentsList[an].getAttribute("data-an") == Assignments[i].trim()) {
                            assignmentsList[an].children[0].textContent = StudentScore[i];
                            assignmentsList[an].dispatchEvent(new MouseEvent("click", {
                                "view": window,
                                "bubbles": true,
                                "cancelable": false
                            }));
                            lastColumnVisted = an;
                            lastRowVisited = row;
                        }

                    }
                }

            }
        }
    }

    //Hacky nonsense to get Aeries to trigger their score updating
    if (lastRowVisited == 0) lastRowVisited = 1;
    students[lastRowVisited-1].cells[lastColumnVisted].dispatchEvent(new MouseEvent("click", {
        "view": window,
        "bubbles": true,
        "cancelable": false
    }));

    if (!foundName) {
        var notFound = "Student number: ";
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
               var rosterFullName = rosterName[1] + " " + rosterName[0];
               if ( rosterFullName == name) {
                   scoresTable.push({
                       StuNum: roster[j].StuNum,
                       Score: scores[i].Score
                   });
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
            StuName: students[i].textContent.toLowerCase()
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
        if (students[row].cells[1].children[0].children[0].children[0].textContent.toLowerCase() == studentName.toLowerCase())
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
    var assignmentsSkipped = [];
    for (var i = 0; i < assignments.length; i++) {
        if (!isAssignmentEmpty(assignments[i])) {
            assignmentsSkipped.push(assignments[i]);
        }
    }
    for (var student in scoresTable) {
        notFoundList += inputScore(scoresTable[student].StuNum, scoresTable[student].Score, assignments, assignmentsSkipped);
    }
    if (notFoundList != "")
    {
        window.alert("Skipped the following students: \n" + notFoundList)
    }
}

var isAssignmentEmpty = function(assignment) {
    var empty = true;
    var assignmentColumn = null;
    var students = document.getElementsByClassName("assignments")[0].rows;
    for (var j = 0; j < students[0].cells.length; j++) {
        var readAssignment = students[0].cells[j].getAttribute("data-an");
        if (readAssignment == assignment.trim()) {
            assignmentColumn = j;
        }
    }
    if (assignmentColumn == null) {
        window.alert("Could not find assignment " + assignment + ". Skipping.")
        return false;
    }
    for (var j = 0; j < students.length - 1; j++) { 
        if (students[j].cells[assignmentColumn].children[0].textContent != '' &&
            students[j].cells[assignmentColumn].getAttribute("data-is-notapplicable") == "False") {
            empty = false;
        }
    }
    if (!empty) {
        return window.confirm("Overwrite data in Assignment " + assignment + "?")
    }
    return true
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