
const labelsContainer = document.getElementById("labels");
const title = document.getElementById("dataset-title");
const contentContainer = document.getElementById("content-container");

let dataset = [];
let labels = [];
let allLabels = [];
let currentLabelsContainers = [];
let currentStep = 0;

let steps = [];
let answers = [];

function updateLables() {
    // update with selected or not
    let index = 0;
    allLabels.forEach(elem => {
        elem.classList.remove("selected");
        if (answers[currentStep] != null &&
            answers[currentStep].index == index) {
            elem.classList.add("selected");
        }
        index++;
    })
}

function updateMoveBtns() {
    const nextBtn = document.getElementById("nextButton");
    const prevBtn = document.getElementById("prevButton");
    nextBtn.classList.remove("btn-disabled");
    prevBtn.classList.remove("btn-disabled");

    if (currentStep == 0) {
        prevBtn.classList.add("btn-disabled");
    }
    if (currentStep == steps.length - 1) {
        nextBtn.classList.add("btn-disabled");
    }
}

function moveToStep(step) {
    currentStep = step;
    if (step == steps.length - 1) {
        // last step
        document.getElementById("review-content").setAttribute("class", "hidden");
        document.getElementById("download-content").setAttribute("class", "");
        setTitle("Download");
    }
    else {
        document.getElementById("review-content").setAttribute("class", "");
        document.getElementById("download-content").setAttribute("class", "hidden");
        setTitle(dataset[currentStep].title);
        setContent(dataset[currentStep].content);
        // create since we moved
        createLabels();
        updateLables();
    }

    // common to both steps
    updateStepBar(currentStep, answers);
    updateMoveBtns();
}

function onLabelClicked(index, label) {
    if (answers[currentStep] != null && answers[currentStep].index == index) {
        answers[currentStep] = null;
    }
    else {
        answers[currentStep] = {
            index: index, label: label
        };
    }

    // update labels
    updateLables();
}

function createLabels() {
    // delete all labels
    currentLabelsContainers.forEach(label => {
        labelsContainer.removeChild(label);
    });
    // clear labels
    currentLabelsContainers.length = 0;
    allLabels.length = 0;
    // create all labels from current step
    let labelName = dataset[currentStep].label;
    let currentLabels = [];
    labels.forEach((elem) => {
        if (elem.name == labelName) {
            currentLabels = elem.labels;
            return;
        }
    });
    // create labels 
    const maxButtonInRow = 3;
    function createButtonRowDiv(children) {
        const div = document.createElement("div");
        div.setAttribute("class", "label-row");
        children.forEach(element => {
            div.appendChild(element);
        });
        // add to dom
        labelsContainer.appendChild(div);
        currentLabelsContainers.push(div);
    }
    let buttonList = [];
    for (let index = 0; index < currentLabels.length; index++) {
        const element = currentLabels[index];
        // create button
        const button = document.createElement("button");
        button.setAttribute("class", "label-button");
        button.textContent = element;
        // listener
        button.addEventListener("click", () => {
            onLabelClicked(index, element);
        })
        // add to list manager
        allLabels.push(button);
        // add to button row list
        buttonList.push(button);
        if (buttonList.length >= maxButtonInRow) {
            createButtonRowDiv(buttonList);
            buttonList.length = 0;
        }
    }
    // add if buttons were less then max buttons in row
    if (buttonList.length > 0) {
        createButtonRowDiv(buttonList);
        buttonList.length = 0;
    }
}

function createStepBar(dataset) {
    const wrapper = document.getElementById("step-bar-wrapper")
    for (let index = 0; index < dataset.length; index++) {
        const element = dataset[index].title;
        // create step bar item
        const container = document.createElement("div");
        container.setAttribute("class", "step-bar-item");
        const number = document.createElement("div");
        number.setAttribute("class", "step-counter");
        number.textContent = index + 1;

        const label = document.createElement("div");
        label.setAttribute("class", "step-name");
        label.textContent = element;

        container.appendChild(number);
        container.appendChild(label);
        container.addEventListener("click", () => {
            moveToStep(index);
        })
        wrapper.appendChild(container);
        steps.push(container);
    }

    // create download step
    const container = document.createElement("div");
    container.setAttribute("class", "step-bar-item");
    const number = document.createElement("div");
    number.setAttribute("class", "step-counter");
    number.textContent = "⭳";

    const label = document.createElement("div");
    label.setAttribute("class", "step-name");
    label.textContent = "download";

    container.appendChild(number);
    container.appendChild(label);
    container.addEventListener("click", () => {
        moveToStep(dataset.length);
    })
    wrapper.appendChild(container);
    steps.push(container);
}

function updateStepBar() {
    console.log(`updating step bar ${answers}`);
    for (let index = 0; index < steps.length; index++) {
        const element = steps[index];
        const answer = answers[index];
        element.classList.remove("active");
        element.classList.remove("completed");
        if (index == currentStep) {
            element.classList.add("active");
            if (index != steps.length - 1) // do not set the download step
                element.querySelector(".step-counter").textContent = index + 1;

        }
        if (answer != null) {
            element.classList.add("completed");
            element.querySelector(".step-counter").textContent = "✓";
        }
    }
}

function setContent(htmlContent) {
    contentContainer.innerHTML = htmlContent;
}

function setTitle(text) {
    title.textContent = text;
}


function fetchData() {
    fetch('/dataset')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error:', data.error);
            } else {
                console.log('Output:', data.output);
                // parse stuff and add to dom
                const res = JSON.parse(data.output);

                dataset = res.dataset;
                labels = res.labels;
                currentStep = 0;
                dataset.forEach(_ => {
                    answers.push(null);
                });

                createLabels();
                createStepBar(res.dataset);
                // move to step
                moveToStep(0);
            }
        })
        .catch(error => console.error('Error:', error));
}

fetchData();

const downloadForm = document.getElementById("download-form")

downloadForm.addEventListener("submit", (event) => {
    event.preventDefault();

    let choices = [];
    for (let index = 0; index < answers.length; index++) {
        const answer = answers[index];
        const title = dataset[index].title;

        choices.push({
            title: title,
            answer: answer ? answer.label : null
        });
    }
    const user = document.getElementById("user-input").value;
    // gather results
    let results = {
        user: user,
        choices: choices
    }
    // download 
    downloadJSON(results, `${user}-result.json`);
})


const nextBtn = document.getElementById("nextButton");
nextBtn.addEventListener("click", () => {
    if (currentStep < steps.length - 1) {
        moveToStep(currentStep + 1);
    }
})

const prevBtn = document.getElementById("prevButton");
prevBtn.addEventListener("click", () => {
    if (currentStep > 0) {
        moveToStep(currentStep - 1);
    }
})