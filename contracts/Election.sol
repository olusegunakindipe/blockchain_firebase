pragma solidity ^0.5.0;

contract Election{
    
    // The address of the account that created this ballot.
     address public ballotCreator;

    constructor () public { 
        ballotCreator = msg.sender;    
        addCandidate(1,"Muhammed Buhari","All Progressive Party",0);
        addCandidate(2,"Atiku Abubakar","Peoples Democratic Party",0);
       //auctionEnd = now + (durationMins + 1 minutes);
    }
    
    //event AddedVoters(address indexed _sender, uint numVoters,bytes32 fullname,bytes32 nin,bytes32 addr,uint candidateIDVote,bool hasVoted);
    //Candidate[] public candidates;

    // Is voting finished? The ballot creator determines when to set this flag.
    bool public votingEnded;

    //event to add voters
    event AddedVoters (bytes32 nin);
    event votedEvent (uint indexed _candidateId);

    //mapping each candidate to their respective id
    mapping(uint => Candidate) public candidates;
    //mapping each voter to the Voter struct
    mapping(uint => Voter) public voters;
    //mapping that connects a voter to an address
    mapping(address => bool) public voted;
 
// The total number of votes cast so far. Revealed before voting has ended.
    uint256 public totalVotes;

    uint  candidatesCount;
    uint  numVoters;
    bytes32 voterList;
    address account;
    
    
    //uint durationMins= 60;    
 
    struct Candidate {
        uint id;
        string name;
        string party;
        uint voteCount;
    }

    struct Voter{
        uint id;
        bytes32 fullname; // bytes32 type are basically strings
        bytes32 nin;
        bytes32 addr;
        bytes32 phoneno;
        uint candidateIDVote;
        bool hasVoted;    
    }    

    function addVoter(bytes32 fullname,bytes32 phoneno, bytes32 nin,bytes32 addr) public {//returns(uint) {
        //if(validVoter(nin) == true) {
        numVoters++;
        emit AddedVoters(nin);
        voters[numVoters] = Voter(numVoters,fullname,nin,phoneno, addr,0,false);
    }

    function addCandidate (uint id, string memory _name, string memory party,uint voteCount) private {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, party, 0);
    }

    function vote (uint _candidateId) public {
        //require that they havent voted
        require(!voted[msg.sender]);
        // can only vote during voting period
        require(!votingEnded);
         // candidate must be part of the ballot
        require(validCandidate(_candidateId));

        require(_candidateId > 0 && _candidateId <= candidatesCount);

        require(totalVotes < ~uint256(0));

        require(candidates[_candidateId].voteCount < ~uint256(0));
        voted[msg.sender] = true;
        candidates[_candidateId].voteCount++;
        totalVotes += 1;

        emit votedEvent(_candidateId);

    }
    
     function endVoting() public returns (bool) {
         // Only ballot creator can end the vote.
         require(msg.sender == ballotCreator);
        votingEnded = true;
        return true;
    }

     function totalVotesFor(uint _candidateId) view public returns (uint256) {
        require(validCandidate(_candidateId));
         // Don't reveal votes until voting has ended
         require(votingEnded); 
        return candidates[_candidateId].voteCount;
    }

    
    //  function getCandidates() public view returns(bytes32) {
    //     return candidates;
    // }

     function getNumOfCandidates() public view returns(uint) {
        return candidatesCount;
    }

    function validCandidate(uint _candidateId) view public returns (bool) {
        for(uint i = 0; i <candidatesCount; i++) {
            if (candidates[_candidateId].id == _candidateId) {
                return true;
            }
        }
        return false;
    }


    function getAccount()public view returns(address){
    return account;}


    function compare (string memory oldnin, string memory newnin) public pure returns (bool){
      
       return keccak256(abi.encodePacked(oldnin)) == keccak256(abi.encodePacked(newnin));
   }
}
