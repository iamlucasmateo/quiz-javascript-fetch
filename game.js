class Game {
    constructor() {
        this.init();
    }

    init() {
        this.results = {};
        this.selectedAnswer = '';
        this.state = 'next';
        this.retrieveResults();
        this.quiz = {};
        this.updates = 0;
    }

    retrieveResults() {
        const lsResults = localStorage['results'];
        if (lsResults) {
            const parsedResults = JSON.parse(lsResults);
            this.results.wins = parsedResults['wins'];
            this.results.losses = parsedResults['losses'];
        } else {
            this.results.wins = 0;
            this.results.losses = 0;
        }
    }

    async updateQuiz(category) {
        this.updates += 1;
        const data = await fetch(`https://opentdb.com/api.php?amount=1&category=${category}`)
                              .then(res => res.json())
                              .then(res => res.results[0])
                              .then(res => {this.quiz = res})
        return data;
    }

    checkAnswer() {
        return this.selectedAnswer === this.quiz.correct_answer;
    }

    sortAnswersRandomly() {
        const random_sort = (a, b) => {
            return Math.random() - 0.5;
        }
        let answers = Array.from(this.quiz.incorrect_answers)
        answers.push(this.quiz.correct_answer);
        answers = answers.sort(random_sort);
        return answers;
    }
}