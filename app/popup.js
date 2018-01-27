function importScores() {
    if (document.getElementById('StuFullName').checked) {
        var identType = 'StuFullName';
    } else if (document.getElementById('StuLastFirst').checked) {
        var identType = 'StuLastFirst';
    } else if (document.getElementById('StuNum').checked) {
        var identType = 'StuNum';
    } else {
        var identType = 'PermID'; //Not currently implemented
    };
    var dataObj = {
        identtype: identType,
        assignments: getAssignments(document.getElementById('scores').value, identType),
        scores: repackScores(document.getElementById('scores').value, identType),
        command: "import"
    };
    sendToContentScript(dataObj);
    //sendToContentScript({ command: "getRoster" });  //I don't understand why I need to do this to get it to work.  Or maybe I don't anymore?
};

function getAssignments(scores, identType) {
	var scoresArray = scores.split("\n");
	var assignments = scoresArray[0].split(/\t|,/);
	if (identType == 'StuLastFirst') {
		assignments.splice(0,2);
	}
	else if (identType == 'StuNum' || identType == 'StuFullName') {
        assignments.splice(0, 1);
	}
	return assignments;
}

function repackScores(scores, identType) {
    var scoresObject = {};
    var scoresArray = scores.split("\n");
    if (identType == 'StuLastFirst') {
        for (i = 1; i < scoresArray.length; i++) {
            if (scoresArray[i]) {
                var student = scoresArray[i].split(/\t|,/);
                var name = student[1].trim().toLowerCase() + " " + student[0].trim().toLowerCase();
                var score = [];
                for (j = 2; j < student.length; j++){
                	score.push(student[j].trim());
                }
                scoresObject[i] = 
                    {
                        Name: name,
                        Score: score
                    };
            };
        };
    } else if (identType == 'StuFullName') {
        for (i = 1; i < scoresArray.length; i++) {
            if (scoresArray[i]) {
                var student = scoresArray[i].split(/\t|,/);
                var name = student[0].trim().toLowerCase();
                var score = [];
                for (j = 1; j < student.length; j++) {
                    score.push(student[j].trim());
                }
                scoresObject[i] =
                    {
                        Name: name,
                        Score: score
                    };
            };
        };
    } else if (identType == 'StuNum') {
        for (i = 1; i < scoresArray.length; i++) {
            var student = scoresArray[i].split(/\t|,/);
            var score = [];
            for (j = 1; j < student.length; j++){
            	score.push(student[j].trim());
            }
            scoresObject[i] =
                {StuNum: student[0].trim(), Score: score};
        }
    } else {
        // for Perm ID, to implement if I ever figure out how to get Perm ID from Aeries.NET
    };
    return scoresObject;
};

function sendToContentScript(message) {
    chrome.tabs.getSelected(null, function (tab) {
        chrome.tabs.sendMessage(tab.id, { command: message.command, message: message }, function () {
        });
    });
};

function getRoster() {
    sendToContentScript({ command: "getRoster" });
    chrome.tabs.create({
        url: chrome.extension.getURL('roster.html'),
        active: false
    }, function (tab) {
        // After the tab has been created, open a window to inject the tab
        chrome.windows.create({
            tabId: tab.id,
            type: 'popup',
            focused: true,
            width: 560,
            height: 720
            // incognito, top, left, ...
        });
    });
}

// When the popup HTML has loaded
window.addEventListener("load", function (evt) {
    document.getElementById('importscores').addEventListener('submit', importScores);
    document.getElementById('close').onclick = function () { window.close() };
    document.getElementById('getroster').onclick = function () { getRoster() };
});