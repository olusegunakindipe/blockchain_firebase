/* usersRef.on("child_added", snap => {
  let user = snap.val();
  let $li = document.createElement("li");
  $li.innerHTML = user.name;
  $li.setAttribute("child-key", snap.key); 
  $li.addEventListener("click", userClicked)
  userListUI.append($li);
}); */

/* var registerVoter       = $('#myForm');
var toggleMyForm = $('#toggleMyForm');

toggleMyForm.on('click', function(){
    myForm.toggle();
    myForm.is(":visible") ? $(this).html('hide') : $(this).html('show');
}) */

function registerCandidate() {

  var firstName = $('#fname').val();
  // var nin=document.getElementById('nin').value; 
  var lastName = $('#lname').val();
  var age = $('#age').val();
  var position = $('#position').val();
  var party = $('#party').val();

  var picture = $('#picture').prop('files')[0];

  var date = new Date();
  var timeInMillisec = date.getTime();
  var picRef = 'v' + timeInMillisec;
  var fileURL;

  // Create a child reference
  var uploadTask = storageRef.child('candidate_images/' + picRef).put(picture);

  // Register three observers:
  // 1. 'state_changed' observer, called any time the state changes
  // 2. Error observer, called on failure
  // 3. Completion observer, called on successful completion
  uploadTask.on('state_changed', function (snapshot) {
    // Observe state change events such as progress, pause, and resume
    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
    var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    console.log('Upload is ' + progress + '% done');
    switch (snapshot.state) {
      case firebase.storage.TaskState.PAUSED: // or 'paused'
        console.log('Upload is paused');
        break;
      case firebase.storage.TaskState.RUNNING: // or 'running'
        console.log('Upload is running');
        break;
    }
  }, function (error) {
    // Handle unsuccessful uploads
    // A full list of error codes is available at
    // https://firebase.google.com/docs/storage/web/handle-errors
    switch (error.code) {
      case 'storage/unauthorized':
        // User doesn't have permission to access the object
        break;

      case 'storage/canceled':
        // User canceled the upload
        break;

      case 'storage/unknown':
        // Unknown error occurred, inspect error.serverResponse
        break;
    }
  }, function () {
    // Handle successful uploads on complete
    // For instance, get the download URL: https://firebasestorage.googleapis.com/...
    uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
      console.log('File available at', downloadURL);
      // this object will hold the new user information
      let newCandidate = {
        "fname": firstName,
        "lname": lastName,
        "age": age,
        "position": position,
        "party": party,
        "picture": downloadURL
      };

      //then return success if data was saved
      candidatesRef.push(newCandidate, function () {
        console.log("candidate data has been inserted");
        let response= confirm("Do you want to Add Another Candidate");
        if(response){
          $('#fname').val('');
          $('#lname').val('');
          $('#age').val('');
          $('#position').val('');
          $('#picture').val('');  
          $('#party').val('');  
        }
        else{
          $("#content0").show();     
           $("#loader0").hide();}
      
      });
    });
  });


}