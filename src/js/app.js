var userData;
var userId;
var candidatesData = new Array();

//access new voter whenever one is added
/* votersRef.on("child_added", snap => {
  let user = snap.val();
}); */

//access new candidate whenever one is added
candidatesRef.on("value", snap => {
  //console.log(snap);
  //console.log(snap.val()); // this method will return full user data object
  dataObject = snap.val();

  dataKeys = Object.keys(dataObject)
  //candidatesData = 

  // loop through View to get the candidate data for later use
  for (let i = 0; i < dataKeys.length; i++) {
    let key = dataKeys[i];
    let value = dataObject[key]; //get data object for candidate i

    candidatesData[i] = value;
  }

  console.log('candid data', candidatesData); //show all the candidate data retrieved from database

});


/* Get the currently signed-in user
The recommended way to get the current user is by setting an observer on the Auth object:
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
  } else {
    // No user is signed in.
  }
}); */

/* votersRef.on("value", snap => {
  console.log(snap);
  console.log(snap.key); // this key will output users
  console.log(snap.val()); // this method will return full user data object
});
 */
function login() {
  console.log("got here login");

  var email = $('#email').val();
  var password = $('#password').val();

  firebase.auth().signInWithEmailAndPassword(email, password)
  .then(function(){
    console.log("user is logged in");

    var user = firebase.auth().currentUser;  //to the get the user Or you can monitor states by using the snippet above this one
    console.log(user);
    if (user) {
      userId = user.uid;

      //get voter signup data like profile picture link, email and so on
      votersRef.orderByChild("uid").equalTo(userId).on("value", (snap) => { //query data for particular user with Id of loggedIn user
        console.log(snap.val());
        userData = snap.val;
      });
    } else {
      // No user is signed in.
    }


    //now redirect user to another page
    window.location.replace("http://localhost:3000/election.html");
  })
  .catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // ...
  });
};


function logoutUser() {
  console.log("logout started");

  firebase.auth().signOut().then(function() {
    // Sign-out successful.
  }).catch(function(error) {
    // An error happened.
  });
};


App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  registernin:[],
  votednin:[],
  votedAccount:[],
  usernin:null,
  registrationDeadline:new Date("07/09/2019"),
  votingDeadline:new Date("07/09/2019"),
  votingEnded : false,

  
  init: async () =>
  {
     //   Get the currently signed-in user
    // The recommended way to get the current user is by setting an observer on the Auth object:
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        // User is signed in.
      } else {
        // No user is signed in.
        //now redirect user to another page
        window.location.replace("http://localhost:3000/login.html");
      }
    });

    // Load candidates.
    let content = $('#content');
    let candidateTemplate = $('#candidateTemplate');

    console.log('data', candidatesData);

    candidatesRef.on("value", snap => {
      //console.log(snap);
      //console.log(snap.val()); // this method will return full user data object
      dataObject = snap.val();
    
      dataKeys = Object.keys(dataObject)
      //candidatesData = 
    
      // loop through View to get the candidate data for later use
      for (let i = 0; i < dataKeys.length; i++) {
        let key = dataKeys[i];
        let value = dataObject[key]; //get data object for candidate i
    
        candidatesData[i] = value;

        candidateTemplate.find('.panel-title').text(value.fname);

        candidateTemplate.find('.candidate-name').text(value.lname);
        candidateTemplate.find('#img').attr('src', value.pic_url);

        candidateTemplate.find('.candidate-age').text(value.age);

        candidateTemplate.find('.candidate-post').text(value.position);
        candidateTemplate.find('.candidate-party').text(value.party);
        /* candidateTemplate.find('#logo').attr('src', data[i].logo); */
        candidateTemplate.find('.btn-vote').attr('data-id', value.uid);
        //document.querySelector(".candidate-name").innerHTML = `${name}`;

        content.append(candidateTemplate.html());
      }
    });
    
    return await App.initWeb3();   
  },
  
    initWeb3: async ()=> 
    {
     if(window.ethereum){

      App.web3Provider = window.ethereum;
      try{
        await window.ethereum.enable();
      }catch(error){
        console.error ("User denied account access")
      }
     }
     else if (window.web3){
       App.web3Provider = window.web3.currentProvider;
     }
     else{
       App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
       web3 = new Web3(App.web3Provider);
     }
    //  web3 = new Web3(App.web3Provider);
     return App.initContract();

 },

  initContract: () => 
  {
    $.getJSON("Election.json", (election) => 
    {
      
      App.contracts.Election = TruffleContract(election);

      App.contracts.Election.setProvider(App.web3Provider);      
      //App.addedEvent();
   App.bindEvents();
    //App.ValidateUSers()
    return App.render();
    }
    );     
  },

  bindEvents: () =>
   {
    $(document).on('click', '.btn-vote', App.castVote);
    
    App.contracts.Election.deployed().then(function(instance) 
    {
      instance.votedEvent({},
        {
        fromBlock: 0,
        toBlock:'latest'
      }
      ).watch(function(error, event)
      {
        console.log("event triggered", event)
        //App.render();
      })
    })
  },

  //This does the main function
  render: async () => 
  {
    try
    { 
      
      var loader= $("#loader");
      var content = $("#content");     

      loader.show();
      setTimeout(function(){
      },5000);
      content.hide();    

      //load account data
      web3.eth.getCoinbase(function(err, account)
      {
        if (err===null)
        {
          App.account = account;
          console.log(account);
          //document.querySelector("#accountAddress").innerHTML= `The contract is connected to account: ${account}`;
        }
      });     
      
      //load Contract data
      let instance = await App.contracts.Election.deployed();
      const candidatesCount = await instance.getNumOfCandidates();    
        let candidatesResults = $("#candidatesResults");
        candidatesResults.empty();

        for (let i = 1; i<=candidatesCount ; i++)
        { 

          console.log(candidatesCount.toNumber())        
          let candidate = await instance.candidates(i);          
          let id = candidate[0];    
          let name = candidate[1];
          let party = candidate[2];
          let voteCount = candidate[3]; 

          let row = "<tr><th>"+ id + "</th><td>" + name + "</td><td>" + party + "</td><td>" + voteCount + "</td></tr>"

           candidatesResults.append(row);     
          };
       let hasVoted = await instance.voted(App.account) ;   
       console.log(hasVoted);
        
      if(hasVoted)
      {
       let a= App.votedAccount.push(newNin)// push the voters id if the candidate has voted
       console.log(a);
      $("#content1").hide(); //hide the content and go back to the mainpage
      $("#mainpage").show();
    }
      loader.hide();
      content.show();
      throw new Error("oops");
    }
      catch(err){
        console.log(err)
      }
  }, 
  
  //This function is for voting 
  castVote : async(e) => 
  {
    e.preventDefault();
    
    try{    
      let candidateId = parseInt($(event.target).data('id'));
      console.log(candidateId);

      let instance = await App.contracts.Election.deployed();
      // This calls the function from the contract
      let voting = await instance.vote(candidateId, 
        {
          from: App.account,gas:"6721975"
        });     
      //await  voting.send();
      refreshVoteTotals();
      web3.eth.getAccounts((accounts,error) => 
      {
        if(error)
        {
          console.log(error); 
        }  
        if (voting){
        alert('Voting Successful!');  
       }
        else
        {
          alert('Not Successful')
        } 
        $("#content").hide();     
        $("#loader").show();          
        })
      }       
        catch(err)
        {
          console.log(err.message);
       } 
  },

//function to refresh vote totals
  refreshVoteTotals:  async()=>
   {
    let instance = await App.contracts.Election.deployed(); 
    let totalVotes = await instance.totalVotes().call();
    $("#total-votes").html(totalVotes.toString());

    var hasVoted = await instance.hasVoted(account).call();

    $("#vote-status-alert").removeClass("blinking");
    if (hasVoted) {
      $("#vote-status-alert").text("Your vote has been registered.")
    } else {
      $("#vote-status-alert").text("You have not voted yet.")
    }

    if (!hasVoted && !votingEnded) {
      $(".vote-button").removeClass("hidden");
    } else {
      $(".vote-button").addClass("hidden");
    }
},

endVoting :async ()=> 
{
  let instance = await App.contracts.Election.deployed(); 
  let end = await instance.endVoting();
  let success = await end.send();
    if (success) {
      location.reload();
    } else {
      console.log("Error: you don't have permission to end voting.")
    }
},

addVoters: (e)=>{
    
 // e.preventDefault();
  
  var fullname=$('#fullname').val(); 
 // var nin=document.getElementById('nin').value; 
  var address=$('#address').val(); 
  var phonenumber =$('#phonenumber').val(); 
  var nin = $('#nin').val();

  var password =$('#key').val(); 

  let itemsArray=[];
  localStorage.setItem('items',JSON.stringify(itemsArray));
  const data = JSON.parse(localStorage.getItem('items'));

  itemsArray.push(nin,password);
  localStorage.setItem('items', JSON.stringify(itemsArray));

  data.forEach(item=>{
    App.addVoters(item);
  });
  alert('Voter Successfully Added')
  let response= confirm("Do you want to Add Another Voter");
  if(response){
    $('#fullname').val('');
    $('#address').val('');
    $('#phonenumber').val('');
    $('#nin').val('');  
    $('#key').val('');  
 // $("#loader1").show();
  }
  else{
    $("#content1").hide();     
    $("#loader1").show();
  }
},

  ValidateUSers: async ()=> 
      {
        try{
        let myItems= JSON.parse(localStorage.getItem('items'));

         let newNin=$('#nin2').val();
         let newKey=$('#key2').val();
         if (newNin==myItems[0] && newKey==myItems[1] ){
          $('#nin2').val('');
          $('#key2').val('');
           alert('You are Registered and you can proceed to vote');
           $("#content2").hide();
          $("#content1").show();
          return;
          }
          else{
            alert('You are not registered or Incorrect Information');
            $('#nin2').val('');
            $('#key2').val('');
          }
        // const result = await instance.compare(newNin, App.nin);
        // console.log(result);
        // if (result){
        //   alert('you can proceed to vote!');
        // }
        // else
        // {
        //   alert('You not registered yet');
        //   $("#loader").hide();
        //   $("#content2").show();
        // } 
        // let votedAcc = $.inArray(App.account, App.votedAccount)
        // if(!votedAcc && result){
        //   alert("You have already voted");
        //   $("#content2").hide();     
        //   $("#loader2").show();
        // }
        //   console.log(newNin);
        //   web3.eth.getAccounts((accounts,error) => 
        //   {
        //     if(error){
        //       console.log(error); 
        //     }  
             document.getElementById('voting').style.display = 'block';
             document.getElementById('auth').style.display = 'none';
             document.getElementById('registration').style.display = 'none';
             document.getElementById('counting').style.display = 'none';       
            // })
          }       
            catch(err)
            {
              console.log(err.message);
           } 
      },   
 

  // function called when the "Register Votters button is clicked" button is clicked
  registerDiv: function() 
  {
    // alert(App.registrationDeadline);
    var currentDate = new Date();
    if(App.registrationDeadline<currentDate){
      alert('registration has closed ');
      return;
    }
    document.getElementById('auth').style.display = 'none';
    document.getElementById('voting').style.display = 'none';
    document.getElementById('registration').style.display = 'block';
    document.getElementById('counting').style.display = 'none';
  },

      // function called when the "Vote button is clicked" button is clicked
      authDiv: function() 
      {
        var currentDate = new Date();
        if(App.votingDeadline<currentDate){
          alert('voting has closed return');
          return;
        }
        document.getElementById('voting').style.display = 'block';
        
        document.getElementById('counting').style.display = 'none';
      },

        
    // function called when the "Vote button is clicked" button is clicked
    countVoteDiv: ()=>
     {
          var currentDate = new Date();
          if(App.votingDeadline>currentDate){
            alert('You can only count vote when the election is over');
            return;
          }
      document.getElementById('voting').style.display = 'none';
      
    
      document.getElementById('counting').style.display = 'block';
    },


    resetVoters:()=>
    {
      var sure= confirm("Are you sure you want to clear the data");
      if(sure){
        document.getElementById('fullname').value=""; 
        document.getElementById('nin').value=""; 
        document.getElementById('address').value=""; 
        document.getElementById('phonenumber').value=""; 
        document.getElementById('nin').value=""; 
        document.getElementById('password').value=""; 
      }
    },


    registerCandidate2: function() 
    {
      var confirm= confirm("Add candidate data?");
      if(confirm){
        document.getElementById('fname').value=""; 
        document.getElementById('lname').value=""; 
        document.getElementById('phone').value=""; 
        document.getElementById('party').value=""; 
      }
    },

    registerVoter: (e)=>{
      console.log("got here voter");
      var firstName=$('#fname').val(); 
     
      var lastName=$('#lname').val(); 
      var phone =$('#phone').val(); 
      var age = $('#age').val();
      
      //var picture =$('#picture').val(); 
      
       //now call firebase to save data
       const voterRef = dbRef.child('voters');
       // this object will hold the new user information
       let newVoter = {
                       "fname": firstName,
                       "lname": lastName,
                       "age": age,
                       "phone":phone,
                       //"position": position
                       
                     };
        
       //then return success if data was saved
       voterRef.push(newVoter, function(){
         console.log("voter data has been inserted");
         alert('Voter Successfully Added');
         let response= confirm("Do you want to Add Another Voter");
         if(response){
           $('#fname').val('');
           $('#lname').val('');
           $('#age').val('');
           $('#phone').val('');
           
         }
      //    else{
      //      $("#content0").hide();     
      //       $("#loader0").show();}
       
      })

     },

     registerCandidate: (e)=>{ 
       console.log("got here iinner");
      var firstName=$('#fname').val(); 
      // var nin=document.getElementById('nin').value; 
      var lastName=$('#lname').val(); 
      var age = $('#age').val();
      var position =$('#position').val(); 
      var party =$('#party').val();
      var picture =$('#picture').val();
      
      //now call firebase to save data
      const candidateRef = dbRef.child('candidates');

      // this object will hold the new user information
      let newCandidate = {
                      "fname": firstName,
                      "lname": lastName,
                      "age": age,
                      "position": position,
                      "party": party,
                      "picture": picture
                    };
      
      //then return success if data was saved
      candidateRef.push(newCandidate, function(){
        console.log("candidate  data has been inserted");
        alert('Candidate Successfully Added');
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
          $("#content0").hide();     
           $("#loader0").show();}
      
      })}
     
    
};

$(()=> 
{
  $(window).load(()=>
   {
    App.init();
  });
});
