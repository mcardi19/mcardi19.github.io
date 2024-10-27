// Global variables to manage quiz state
let quizData = [];
let currentQuestionIndex = 0;
let correctCount = 0;
let incorrectCount = 0;
let questionsAnswered = {};

// DOM element references
const elements = {
    question: document.getElementById('question'),
    options: document.getElementById('options'),
    feedback: document.getElementById('feedback'),
    correctCount: document.getElementById('correct-count'),
    incorrectCount: document.getElementById('incorrect-count'),
    ratio: document.getElementById('ratio'),
    submitBtn: document.getElementById('submit-btn'),
    nextBtn: document.getElementById('next-btn'),
    questionCounter: {
        correctCount: document.querySelector('#question-counter .correct-count'),
        totalQuestions: document.querySelector('#question-counter .total-questions'),
        percentage: document.querySelector('#question-counter .percentage')
    }
};

// Event listener for when the DOM content is fully loaded
document.addEventListener('DOMContentLoaded', initializeQuiz);

function initializeQuiz() {
    fetchQuizData()
        .then(data => {
            quizData = shuffleArray(data);
            resetQuizState();
            updateScoreboard();
            loadQuestion();
        })
        .catch(handleQuizDataError);
}

function fetchQuizData() {
    return fetch('quiz-data.json').then(response => response.json());
}

function resetQuizState() {
    currentQuestionIndex = 0;
    correctCount = 0;
    incorrectCount = 0;
    questionsAnswered = {};
}

function handleQuizDataError() {
    elements.feedback.textContent = 'Failed to load quiz data.';
    elements.feedback.style.color = 'red';
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function loadQuestion() {
    resetUIElements();
    const currentQuestion = quizData[currentQuestionIndex];
    displayQuestion(currentQuestion);
    generateOptions(currentQuestion);
    checkPreviousAnswer();
}

function resetUIElements() {
    elements.feedback.textContent = '';
    elements.feedback.style.color = '';
    elements.submitBtn.disabled = false;
    elements.nextBtn.disabled = true;
}

function displayQuestion(question) {
    elements.question.innerHTML = `
        <span class="question-number">Question ${currentQuestionIndex + 1}</span>
        <span class="question-content">${question.question}</span>
    `;
}

function generateOptions(question) {
    elements.options.innerHTML = '';
    Object.entries(question.options).forEach(([key, value]) => {
        const optionElement = createOptionElement(key, value);
        elements.options.appendChild(optionElement);
    });
}

function createOptionElement(key, value) {
    const optionDiv = document.createElement('div');
    optionDiv.classList.add('form-check');
    
    const radioInput = createRadioInput(key);
    const label = createLabel(key, value);
    
    optionDiv.appendChild(radioInput);
    optionDiv.appendChild(label);
    return optionDiv;
}

function createRadioInput(key) {
    const radioInput = document.createElement('input');
    radioInput.type = 'radio';
    radioInput.name = 'option';
    radioInput.value = key;
    radioInput.id = `option-${key}`;
    radioInput.classList.add('form-check-input');
    
    if (questionsAnswered[currentQuestionIndex]?.selectedOption === key) {
        radioInput.checked = true;
    }
    
    return radioInput;
}

function createLabel(key, value) {
    const label = document.createElement('label');
    label.htmlFor = `option-${key}`;
    label.innerHTML = `<span class="choice-letter">${key}</span> <span class="choice-text">${value}</span>`;
    label.classList.add('form-check-label');
    return label;
}

function checkPreviousAnswer() {
    const answeredQuestion = questionsAnswered[currentQuestionIndex];
    if (answeredQuestion?.isCorrect) {
        showCorrectAnswerFeedback();
    }
}

function showCorrectAnswerFeedback() {
    const currentQuestion = quizData[currentQuestionIndex];
    elements.feedback.textContent = `Correct! ${currentQuestion.explanation}`;
    elements.feedback.style.color = 'green';
    elements.submitBtn.disabled = true;
    elements.nextBtn.disabled = false;
}

function updateScoreboard() {
    elements.correctCount.textContent = correctCount;
    elements.incorrectCount.textContent = incorrectCount;
    elements.ratio.textContent = `${correctCount}:${incorrectCount}`;
    updateQuestionCounter();
}

function updateQuestionCounter() {
    const totalQuestions = quizData.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);

    elements.questionCounter.correctCount.textContent = correctCount;
    elements.questionCounter.totalQuestions.textContent = totalQuestions;
    elements.questionCounter.percentage.textContent = `${percentage}%`;
}

elements.submitBtn.addEventListener('click', handleSubmit);
elements.nextBtn.addEventListener('click', handleNext);

function handleSubmit() {
    if (!quizData.length) {
        showFeedback('Please upload a quiz JSON file.', 'red');
        return;
    }

    const selectedOption = document.querySelector('input[name="option"]:checked');
    if (!selectedOption) {
        showFeedback('Please select an option.', 'red');
        return;
    }

    const currentQuestion = quizData[currentQuestionIndex];
    const isCorrect = selectedOption.value === currentQuestion.answer;

    questionsAnswered[currentQuestionIndex] = { selectedOption: selectedOption.value, isCorrect };

    if (isCorrect) {
        handleCorrectAnswer(currentQuestion);
    } else {
        handleIncorrectAnswer();
    }

    updateScoreboard();
}

function showFeedback(message, color) {
    elements.feedback.textContent = message;
    elements.feedback.style.color = color;
}

function handleCorrectAnswer(question) {
    if (!questionsAnswered[currentQuestionIndex].alreadyCounted) {
        correctCount++;
        questionsAnswered[currentQuestionIndex].alreadyCounted = true;
    }
    showFeedback(`Correct! ${question.explanation}`, 'green');
    elements.submitBtn.disabled = true;
    elements.nextBtn.disabled = false;
}

function handleIncorrectAnswer() {
    incorrectCount++;
    showFeedback('Incorrect. Please try again.', 'red');
}

function handleNext() {
    if (currentQuestionIndex < quizData.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
    } else {
        showFeedback('You have reached the end of the quiz.', 'blue');
        elements.nextBtn.disabled = true;
    }
}

// Initialize the scoreboard on page load
updateScoreboard();
