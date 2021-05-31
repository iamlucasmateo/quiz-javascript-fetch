class UI {
    constructor(game) {
        this.game = game;
        this.init();
    }

    init() {
        this.createUIElements();
        this.addGoButtonListener();
        this.printStoredResults();
        this.addCategories();
    }

    createUIElements() {
        const app = document.getElementById('app');
        const elements = {
            question: {
                id: 'question-div',
                type: 'div',
                children: [],
            },
            options: {
                id: 'options-div',
                type: 'div',
                children: [],
            }, 
            sendNext: {
                id: 'send-next',
                type: 'button',
                children: [],
                textContent: 'Next Question',
                disabled: false,
            },
            selectCategory: {
                id: 'select-category',
                type: 'select',
                children: ['<option value="None" disabled active>Select Category</option>'],
            },
            showResult: {
                id: 'show-result',
                type: 'div',
                children: [], 
            },
            score: {
                id: 'score',
                type: 'div',
                children: ['<div id="wins">Wins</div>', '<div id="losses">Losses</div>'], 

            },
            clearScore: {
                id: 'new-game',
                type: 'button',
                children: [],
                textContent: 'New Game',
            },
        }

        Object.entries(elements).forEach(item => {
            let values = item[1];
            let element = document.createElement(values.type);
            element.id = values.id;
            if (values['textContent']) element.textContent = item[1]['textContent'];
            if (values['disabled']) element.disabled = values['disabled'];
            values.children.forEach(child => {
                element.innerHTML += child;
            });
            app.appendChild(element);
        });

        document.querySelector('#new-game').addEventListener('click', () => {
            newGame();
        })
    }

    async addCategories() {
        const fetchCats = await fetch('https://opentdb.com/api_category.php')
            .then(res => res.json())
            .then(res => {
                const categories = res.trivia_categories;
                const catSelector = document.querySelector('#select-category');
                categories.forEach(cat => {
                    let option = document.createElement('option');
                    option.textContent = cat.name;
                    option.value = cat.id;
                    catSelector.appendChild(option);
                });
            })
        return fetchCats;
    };

    initializeValues() {
        document.querySelector('#send-next').innerHTML = 'Next Question';
        document.querySelector('#send-next').disabled = false;
    }

    printNewQuiz(quiz) {
        const questionDiv = document.querySelector('#question-div');
        questionDiv.innerHTML = `<p>${quiz}</p>`;
        const optionsDiv = document.querySelector('#options-div');
        optionsDiv.innerHTML = '';
        for (let ans of this.game.sortAnswersRandomly()) {
            let p = document.createElement('p');
            p.innerHTML = ans;
            p.classList.add('answer');
            optionsDiv.appendChild(p);
        };
    }

    async updateQuizUI(category) {
        document.querySelector('#question-div').innerHTML = '';
        document.querySelector('#options-div').innerHTML = 'New Question Loading...';
        this.game.updateQuiz(category)
            .then(() => {
                this.game.state = 'select';
                this.printNewQuiz(this.game.quiz.question);
                this.addSelectAnswerListener();
                const goButton = document.querySelector('#send-next'); 
                goButton.innerHTML = 'Send Answer';
                goButton.disabled = true;
                document.querySelector('#show-result').innerHTML = 'Result';
            })
    }

    checkAnswer() {
        const checkAnswer = this.game.checkAnswer(this.game.quiz);
        const showResult = document.querySelector('#show-result');
        let yourAnswer = 'correct';
        if (checkAnswer) {
            this.game.results.wins += 1;
        } else {
            this.game.results.losses += 1;
            yourAnswer = 'incorrect';
        }

        showResult.innerHTML = `Your answer is ${yourAnswer}.<br> 
                                  Correct Answer: ${this.game.quiz.correct_answer}.`
    }

    moveToNextQuestion() {
        localStorage['results'] = JSON.stringify(this.game.results);
        this.game.state = 'next';
        document.querySelector('#send-next').textContent = 'Next Question';
        this.game.selectedAnswer = '';
        document.querySelector('#wins').innerHTML =  `Wins: ${this.game.results.wins}`;
        document.querySelector('#losses').innerHTML =  `Losses: ${this.game.results.losses}`;
    }

    addGoButtonListener() {
        const listenerCallback = () => {
            if (this.game.state === 'next') {
                const category = document.querySelector('#select-category').value;
                this.updateQuizUI(category);
            } else if (this.game.state === 'select') {
                this.checkAnswer();
                this.moveToNextQuestion();
                console.log('select');
                console.log(this.game);
            }
        }

        document.querySelector('#send-next').addEventListener('click', listenerCallback);
    }

    addSelectAnswerListener() {
        const answerDivs = document.querySelectorAll('.answer');
        for (let div of answerDivs) {
            div.addEventListener('click', () => {
                document.querySelector('#send-next').disabled = false;
                for (let div2 of answerDivs) {
                    div2.classList.remove('answer-selected');
                };
                this.game.selectedAnswer = div.innerHTML;
                div.classList.add('answer-selected');
                for (let div2 of answerDivs) {
                    if (div !== div2) div2.classList.remove('.answer-selected');
                };
            })
        }
    }

    printStoredResults() {
        const results = this.game.results;
        document.querySelector('#wins').textContent = `Wins: ${results['wins']}`;
        document.querySelector('#losses').textContent = `Losses: ${results['losses']}`;
    }
}



