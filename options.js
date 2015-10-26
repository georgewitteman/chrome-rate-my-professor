// Saves options to chrome.storage.sync.
function save_options() {
  var college = document.getElementById('college').value;
  chrome.storage.sync.set({
    college: college
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box with colleges
function restore_options() {
  chrome.storage.sync.get("college", function(items) {
      var theCollege = items["college"];
      console.log(theCollege);
      if(theCollege) {
          document.getElementById('college').value = items["college"];
      } else {
          document.getElementById('college').value = "Vassar College";
          chrome.storage.sync.set({
            college: "Vassar College"
          }, function() {
            // Update status to let user know options were saved.
            var status = document.getElementById('status');
            status.textContent = 'Options saved.';
            setTimeout(function() {
              status.textContent = '';
            }, 750);
          });
      }

  });


}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);
