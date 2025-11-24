const preG = document.querySelector('.pregame');
const gameBox = document.querySelector('.game');
const text = document.querySelector('.game .text');
const author = document.querySelector('.game .author');
const inputText = document.querySelector('.textInput');
const timer = document.querySelector('.gameStats .time span');
const wpm = document.querySelector('.gameStats .wpm span');
const acc = document.querySelector('.gameStats .acc span');
const scoreSpan = document.querySelector('.gameStats .score span');
const scoreDiv = document.querySelector('.gameStats .score');
const tryAgainBtn = document.querySelector('.game .tryAgain');
const saveGameBtn = document.querySelector('.game .saveGame');
let currentLetter = 0;
let mistakes = 0;
let currentTime = 0;
let quoteLength = 0;
let gameEnded = false;
let typedLetter = "";

function preGame(){
    preG.style.opacity = "0";
    setTimeout(()=>{preG.style.display = "none";
        gameBox.style.display = "flex";
    }, 500);
    game();
}

function game(){
    currentLetter = 0;
    mistakes = 0;
    currentTime = 0;
    quoteLength = 0;
    gameEnded = false;
    tryAgainBtn.style.display = "none";
    saveGameBtn.style.display = "none";
    scoreDiv.style.display = "none";
    inputText.value = "";
    getRandomQuote();
    document.addEventListener("keydown", () => {inputText.focus();});
    inputText.addEventListener("input", checkLetter);
    countdown();
    const timeInterval = setInterval(()=>{
        if(gameEnded == false){
            wpm.innerHTML = Math.floor(countWpm())
            acc.innerHTML = accuracy();
        }
        else {
            clearInterval(timeInterval);
        }
    }, 2000);
}

const RANDOM_QUOTE_API_URL = "https://dummyjson.com/quotes/random";

async function getRandomQuote() {
    const response = await fetch(RANDOM_QUOTE_API_URL);
    const quote = await response.json();

    text.innerHTML = "";
    splitQuote(quote.quote);
    author.innerHTML = quote.author;
}


function splitQuote(quote){
    quote.split("").forEach(span => {
        let line = `<span>${span}</span>`;
        text.innerHTML += line;
        quoteLength++;
    });
    
    text.innerHTML += "<span> </span>";
}

function checkLetter(){
    if (gameEnded){
        return 0;
    }

    let characters = text.querySelectorAll("span");
    typedLetter = inputText.value.split("")[currentLetter];
    if(typedLetter == null){
        characters[currentLetter].classList.remove("active");
        currentLetter--;
        if(characters[currentLetter].classList.contains("incorrect"))
            mistakes--;
        characters[currentLetter].classList.remove("correct", "incorrect");
    }
    else {
        if(characters[currentLetter].innerText == typedLetter)
            characters[currentLetter].classList.add("correct");
        else{
            mistakes++;
            characters[currentLetter].classList.add("incorrect");
        }  
        characters[currentLetter].classList.remove("active");
        currentLetter++;
    }
    characters[currentLetter].classList.add("active");
    
    
    if (currentLetter == (quoteLength)){
        gameEnded = true;

    }
    if (gameEnded){
        tryAgainBtn.style.display = "block";
        saveGameBtn.style.display = "block";
        scoreDiv.style.display = "flex";
        scoreSpan.innerHTML = score();

        return 0;
    }
}

function countWpm() {
    return (((currentLetter - mistakes) / 5) / currentTime) * 60;
}

function countdown() {
    let timeLeft = 60;
    const timeInterval = setInterval(() => {
        if(gameEnded == true){
            clearInterval(timeInterval);
            return 0;
        }
            
        timer.textContent = timeLeft;
        if (timeLeft<=0){
            gameEnded = true;
            clearInterval(timeInterval);
        } 
        else{
            timeLeft--;
            currentTime++;
        }
    }, 1000);
}

function accuracy(){
    return 100-(Math.round((mistakes / (quoteLength + 1)) * 10000) / 100);
}

function score(){
    return Math.round((accuracy()*countWpm()*100)*100) / 100;
}




$('.tryAgain').on("click", function(){
    game();
})

$('.saveGame').on("click", function(){
    $.ajax({
        url: "update_score.php",
        method: "POST",
        data: {score: score(), wpm: Math.round(countWpm()*100)/100, acc: Math.round(accuracy()*100)/100, sess: "access"}
    }).done(function(res){
        console.log(res);
    });
    saveGameBtn.style.display = "none";
})

