
function registerVoter() {
  console.log("got here voter");
  var firstName = $('#fname').val();

  var lastName = $('#lname').val();
  var phone = $('#phone').val();
  var age = $('#age').val();
  var age = $('#nin').val();

  var picture = $('#picture').prop('files')[0];

  var email = $('#email').val();
  var password = $('#password').val();

  var date = new Date();
  var timeInMillisec = date.getTime();

  var fileURL;

  var picRef = 'v' + timeInMillisec;

  // Create a child reference
  var uploadTask = storageRef.child('voter_images/' + picRef).put(picture);

  // Register three observers for upload state:
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
      fileURL = downloadURL;
      
      //now create voter authentication
      firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(function(){
        console.log("authentication profile created");

        var user = firebase.auth().currentUser;
        console.log(user);
        if (user) {
          var uid = user.uid;

        } else {
          // No user is signed in.
        }

        // this object will hold the new user information
        let newVoter = {
          "uid": uid,
          "email": email,
          "fname": firstName,
          "lname": lastName,
          "age": age,
          "nin":nin,
          "phone": phone,
          "picture": fileURL
        };

        console.log(newVoter);

        //then return success if data was saved
        votersRef.push(newVoter, function () {
          //now create auth for user with email and password
          console.log("voter data has been inserted");
          let response= confirm("Proceed");
        if(response){
          $('#email').val('');
          $('#fname').val('');
          $('#lname').val('');
          $('#age').val('');
          $('#nin').val('');
          $('#picture').val('');  
          $('#phone').val('');  
        }
        else{
          $("#content0").show();     
           $("#loader0").hide();}

          /* votersRef.on("value", snap => {
            console.log(snap);
            console.log(snap.key); // this key will output users
            console.log(snap.val()); // this method will return full user data object
          }); */

          //now redirect user to another page
          //window.location.replace("http://localhost:3000/login.html");

        });

      })
      .catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        
        console.log(errorMessage);

      });

    });
  });
}