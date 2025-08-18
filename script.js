//Bismillah

import { cardsData } from './data.js';

let currentSet = []; // This will hold the 7 cards for the current game
const definitionsColumn = document.getElementById('definitions-column');
const wordsColumn = document.getElementById('words-column');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const resetButton = document.getElementById('reset-button');
const toggleTimerButton = document.getElementById('toggle-timer');

let score = 0;
let timer = null; // Variable to hold our timer
let timeRemaining = 60; // Start with 60 seconds

// A copy of the full card data to draw from for new cards
const fullCardsData = [...cardsData];

// Function to shuffle an array
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// The main function to populate the game board
function createCards() {
    definitionsColumn.innerHTML = '';
    wordsColumn.innerHTML = '';

    // If we've run out of cards in our main data set, start over
    if (cardsData.length === 0) {
        console.log("All words exhausted! Starting over with the full set.");
        cardsData.push(...fullCardsData);
    }

    // Get 7 unique words for the current set
    currentSet = [];
    const availableCards = [...cardsData];
    for (let i = 0; i < 7 && availableCards.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * availableCards.length);
        const randomCard = availableCards.splice(randomIndex, 1)[0];
        currentSet.push(randomCard);
    }

    // Update the main data set by removing the cards we just used
    //manage the source of the cards directly
    // Step 1: Get the definitions and words into separate arrays
    const definitionSet = currentSet.map(item => ({
        definition: item.definition,
        word: item.word
    }));
    const wordSet = currentSet.map(item => item.word);

    // Step 2: Shuffle both sets independently
    const shuffledDefinitions = shuffle(definitionSet);
    const shuffledWords = shuffle(wordSet);

    // Step 3: Create the cards using the separate, shuffled arrays
    shuffledDefinitions.forEach(item => {
        const definitionCard = document.createElement('div');
        definitionCard.classList.add('card');
        definitionCard.textContent = item.definition;
        definitionCard.dataset.word = item.word; // This link is crucial!
        definitionCard.draggable = true;
        definitionsColumn.appendChild(definitionCard);
    });

    shuffledWords.forEach(wordText => {
        const wordCard = document.createElement('div');
        wordCard.classList.add('word-card');
        wordCard.textContent = wordText;
        wordsColumn.appendChild(wordCard);
    });
}

// Function to run the timer
function startTimer() {
    if (timer) return; // Prevent multiple timers from running
    timeRemaining = 60;
    timerDisplay.textContent = timeRemaining;
    timer = setInterval(() => {
        timeRemaining--;
        timerDisplay.textContent = timeRemaining;
        if (timeRemaining <= 0) {
            endRound();
        }
    }, 1000);
}

// Function to end the round when the timer runs out
function endRound() {
    clearInterval(timer);
    timer = null;
    alert(`Time's up! Your score for this round is ${score}.`);
    resetGame();
}

// Function to reset the game
function resetGame() {
    score = 0;
    scoreDisplay.textContent = score;
    clearInterval(timer);
    timer = null;
    timeRemaining = 60;
    timerDisplay.textContent = "Off";
    createCards();
}

// Event listeners
let draggedCard = null;

document.addEventListener('dragstart', (e) => {
    if (e.target.classList.contains('card')) {
        draggedCard = e.target;
        setTimeout(() => {
            draggedCard.classList.add('dragging');
        }, 0);
    }
});

document.addEventListener('dragend', (e) => {
    if (draggedCard) {
        draggedCard.classList.remove('dragging');
        draggedCard = null;
    }
});

wordsColumn.addEventListener('dragover', (e) => {
    e.preventDefault();
});

wordsColumn.addEventListener('drop', (e) => {
    e.preventDefault();
    if (!draggedCard) return;

    const target = e.target.closest('.word-card');
    if (target) {
        if (draggedCard.dataset.word === target.textContent) {
            // Correct match
            navigator.vibrate(200);
            confetti({
                particleCount: 100,
                spread: 70
            });

            // Remove the matched cards
            draggedCard.remove();
            target.remove();

            // Update score
            score += 10;
            scoreDisplay.textContent = score;

            // Check if all cards in the current set are matched
            if (definitionsColumn.children.length === 0) {
                alert('You matched all the words! Loading a new set.');
                createCards();
            }

        } else {
            // No match
            navigator.vibrate(500);
            // The card automatically slides back to its original spot
        }
    }
});

resetButton.addEventListener('click', resetGame);
toggleTimerButton.addEventListener('click', () => {
    if (timer) {
        clearInterval(timer);
        timer = null;
        timerDisplay.textContent = "Off";
    } else {
        startTimer();
    }
});

createCards();
