// Global Variables
var winningWord = '';
var currentRow = 1;
var guess = '';
var gamesPlayed = [];

// Query Selectors
var inputs = document.querySelectorAll('input');
var guessButton = document.querySelector('#guess-button');
var keyLetters = document.querySelectorAll('span');
var errorMessage = document.querySelector('#error-message');
var viewRulesButton = document.querySelector('#rules-button');
var viewGameButton = document.querySelector('#play-button');
var viewStatsButton = document.querySelector('#stats-button');
var gameBoard = document.querySelector('#game-section');
var letterKey = document.querySelector('#key-section');
var rules = document.querySelector('#rules-section');
var stats = document.querySelector('#stats-section');
var gameOverBox = document.querySelector('#game-over-section');
var gameOverGuessCount = document.querySelector('#game-over-guesses-count');
var gameOverGuessGrammar = document.querySelector('#game-over-guesses-plural');

// Additions
var winSection = document.querySelector('#game-win-message');
var lossSection = document.querySelector('#game-loss-message');
var winMsg = document.querySelector('.result-win');
var lossMsg = document.querySelector('.result-loss');

// Event Listeners
window.addEventListener('load', fetchWordsAPI);

for (var i = 0; i < inputs.length; i++) {
  inputs[i].addEventListener('keyup', function(event) { 
    if (event.key === 'Enter') { // Check if the Enter key is pressed
      event.preventDefault(); // To prevent "Enter" from "submitting the form" and call submitGuess and moveToNextInput instead
      submitGuess();
      moveToNextInput(event) 
    } else {
    moveToNextInput(event) 
    }
  });
}

for (var i = 0; i < keyLetters.length; i++) {
  keyLetters[i].addEventListener('click', function() { clickLetter(event) });
}

guessButton.addEventListener('click', submitGuess);

viewRulesButton.addEventListener('click', viewRules);

viewGameButton.addEventListener('click', viewGame);

viewStatsButton.addEventListener('click', viewStats);

// Additions
let words = []
var guesses = [];

// Fetch
function fetchWordsAPI(){
  fetch('http://localhost:3001/api/v1/words')
    .then(response => response.json())
    .then(data => {
      words = data
      setGame(words)
    })
    .catch(error => {
      console.error("Error: ", error)
    })
}

// Functions
function setGame(words) {
  currentRow = 1;
  winningWord = getRandomWord(words);
  updateInputPermissions();
}

function getRandomWord(words) {
  var randomIndex = Math.floor(Math.random() * words.length);
  return words[randomIndex];
}

function updateInputPermissions() {
  for(var i = 0; i < inputs.length; i++) {
    if(!inputs[i].id.includes(`-${currentRow}-`)) {
      inputs[i].disabled = true;
    } else {
      inputs[i].disabled = false;
    }
  }

  inputs[0].focus();
}

function moveToNextInput(e) {
  var key = e.keyCode || e.charCode;
  // 8: backspace, 46: delete, 9: tab, 16: shift
  if( key !== 8 && key !== 46 && key !== 9 && key !== 16 && !e.target.id.includes('29')) {
    var indexOfNext = parseInt(e.target.id.split('-')[2]) + 1;
    inputs[indexOfNext].focus();
  }
}

function clickLetter(e) {
  var activeInput = null;
  var activeIndex = null;

  for (var i = 0; i < inputs.length; i++) {
    if(inputs[i].id.includes(`-${currentRow}-`) && !inputs[i].value && !activeInput) {
      activeInput = inputs[i];
      activeIndex = i;
    }
  }

  activeInput.value = e.target.innerText;
  inputs[activeIndex + 1].focus();
}

function submitGuess() {
  if (checkIsWord()) {
    errorMessage.innerText = '';
    guesses.push(guess)
    compareGuess();
    if (checkForWin()) {
      setTimeout(declareWinner, 1000);
    } else if (guesses.length >= 6) {
      setTimeout(declareLoser, 1000);
    } else {
      changeRow();
    }
  } else {
    errorMessage.innerText = 'Not a valid word. Try again!';
  }
}

function checkIsWord() {
  guess = '';

  for(var i = 0; i < inputs.length; i++) {
    if(inputs[i].id.includes(`-${currentRow}-`)) {
      guess += inputs[i].value;
    }
  }

  return words.includes(guess);
}

function compareGuess() {
  var guessLetters = guess.split('');

  for (var i = 0; i < guessLetters.length; i++) {

    if (winningWord.includes(guessLetters[i]) && winningWord.split('')[i] !== guessLetters[i]) {
      updateBoxColor(i, 'wrong-location');
      updateKeyColor(guessLetters[i], 'wrong-location-key');
    } else if (winningWord.split('')[i] === guessLetters[i]) {
      updateBoxColor(i, 'correct-location');
      updateKeyColor(guessLetters[i], 'correct-location-key');
    } else {
      updateBoxColor(i, 'wrong');
      updateKeyColor(guessLetters[i], 'wrong-key');
    }
  }

}

function updateBoxColor(letterLocation, className) {
  var row = [];

  for (var i = 0; i < inputs.length; i++) {
    if(inputs[i].id.includes(`-${currentRow}-`)) {
      row.push(inputs[i]);
    }
  }

  row[letterLocation].classList.add(className);
}

function updateKeyColor(letter, className) {
  var keyLetter = null;

  for (var i = 0; i < keyLetters.length; i++) {
    if (keyLetters[i].innerText === letter) {
      keyLetter = keyLetters[i];
    }
  }

  keyLetter.classList.add(className);
}

function checkForWin() {
  return guess === winningWord;
}

function changeRow() {
  currentRow++;
  updateInputPermissions();
}

function declareWinner() {
  recordGameStats('win');
  changeGameOverText();
  viewGameOverMessage('win');
  setTimeout(startNewGame, 4000);
}

function declareLoser() {
  recordGameStats('loss');
  changeGameOverText();
  viewGameOverMessage('loss');
  setTimeout(startNewGame, 4000);
}

function recordGameStats(result) {
  if (result === 'win') {
  gamesPlayed.push({ solved: true, guesses: currentRow });
  } else {
  gamesPlayed.push({ solved: false, guesses: 6 });
  }
}

function changeGameOverText() {
  gameOverGuessCount.innerText = currentRow;
  if (currentRow < 2) {
    gameOverGuessGrammar.classList.add('collapsed');
  } else {
    gameOverGuessGrammar.classList.remove('collapsed');
  }
}

function startNewGame() {
  clearGameBoard();
  clearKey();
  clearGuesses();
  setGame(words);
  viewGame();
  inputs[0].focus();
}

function clearGameBoard() {
  for (var i = 0; i < inputs.length; i++) {
    inputs[i].value = '';
    inputs[i].classList.remove('correct-location', 'wrong-location', 'wrong');
  }
}

function clearKey() {
  for (var i = 0; i < keyLetters.length; i++) {
    keyLetters[i].classList.remove('correct-location-key', 'wrong-location-key', 'wrong-key');
  }
}

// Change Page View Functions

function viewRules() {
  letterKey.classList.add('hidden');
  gameBoard.classList.add('collapsed');
  rules.classList.remove('collapsed');
  stats.classList.add('collapsed');
  viewGameButton.classList.remove('active');
  viewRulesButton.classList.add('active');
  viewStatsButton.classList.remove('active');
}

function viewGame() {
  letterKey.classList.remove('hidden');
  gameBoard.classList.remove('collapsed');
  rules.classList.add('collapsed');
  stats.classList.add('collapsed');
  gameOverBox.classList.add('collapsed')
  viewGameButton.classList.add('active');
  viewRulesButton.classList.remove('active');
  viewStatsButton.classList.remove('active');
}

function viewStats() {
  letterKey.classList.add('hidden');
  gameBoard.classList.add('collapsed');
  rules.classList.add('collapsed');
  stats.classList.remove('collapsed');
  viewGameButton.classList.remove('active');
  viewRulesButton.classList.remove('active');
  viewStatsButton.classList.add('active');
}

function viewGameOverMessage(result) {
  if (result === 'win') {
    gameOverBox.classList.remove('collapsed')
    letterKey.classList.add('hidden');
    gameBoard.classList.add('collapsed');
    lossSection.classList.add('collapsed')
    lossMsg.classList.add('collapsed')
    winSection.classList.remove('collapsed');
    winMsg.classList.remove('collapsed')
  } else if (result === 'loss') {
    gameOverBox.classList.remove('collapsed')
    letterKey.classList.add('hidden');
    gameBoard.classList.add('collapsed');
    winSection.classList.add('collapsed');
    winMsg.classList.add('collapsed')
    lossSection.classList.remove('collapsed')
    lossMsg.classList.remove('collapsed')
  }
}

function clearGuesses() {
  guesses = [];
}