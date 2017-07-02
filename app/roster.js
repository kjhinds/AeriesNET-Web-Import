window.addEventListener("load", function(evt) {
    chrome.storage.local.get(null,function(StudentList){
            document.getElementById('roster').value = StudentList.StuList;
        });
    document.getElementById('OK').onclick = function() {window.close()};
});