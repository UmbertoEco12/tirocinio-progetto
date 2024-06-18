
class Labels {
    constructor(onSetLabel) {
        this.labelsContainer = document.getElementById("labels");
        this.labelButtons = [];
        this.selectedButton = null;
        this.divChildren = [];
        this.onSetLabel = onSetLabel;
        this.lastShow = null;
        this.onResize();
    }
    #update() {
        this.labelButtons.forEach(button => {
            if (button == this.selectedButton) {
                button.classList.add("selected");
            }
            else
                button.classList.remove("selected");
        });
    }
    #clear() {
        this.divChildren.forEach(elem => {
            this.labelsContainer.removeChild(elem);
        })
        this.divChildren.length = 0;
    }
    static maxButtonInRow = 4;
    onResize() {
        const desktopSize = 750;
        const bigDesktop = 1000;
        if (window.innerWidth >= bigDesktop)
            Labels.maxButtonInRow = 4;
        else if (window.innerWidth >= desktopSize)
            Labels.maxButtonInRow = 3;
        else if (window.innerWidth < desktopSize) {
            Labels.maxButtonInRow = 2;
        }
        if (this.lastShow)
            this.show(this.lastShow.labels, this.lastShow.answer);
    }

    show(labels, answer = null) {
        this.#clear();
        this.lastShow = {
            labels: labels, answer: answer
        }
        const maxButtonInRow = Labels.maxButtonInRow;
        function createButtonRowDiv(children) {
            const div = document.createElement("div");
            div.setAttribute("class", "label-row");
            children.forEach(element => {
                div.appendChild(element);
            });
            return div;
        }
        let buttonList = [];
        for (let index = 0; index < labels.length; index++) {
            const element = labels[index];
            // create button
            const button = document.createElement("button");
            button.setAttribute("class", "label-button");
            button.textContent = element;
            // set selected button
            if (element == answer) this.selectedButton = button;
            // listener
            button.addEventListener("click", () => {
                if (this.selectedButton == button)
                    this.selectedButton = null
                else
                    this.selectedButton = button;
                const selectedLabel = this.selectedButton ? this.selectedButton.textContent : null;
                // update saved label
                this.onSetLabel(selectedLabel);
                // update buttons class list
                this.#update();
            })
            // add to button row list
            buttonList.push(button);
            // add to this list
            this.labelButtons.push(button);
            if (buttonList.length >= maxButtonInRow) {
                const div = createButtonRowDiv(buttonList);
                this.labelsContainer.appendChild(div);
                this.divChildren.push(div);
                buttonList.length = 0;
            }
        }
        // add if buttons were less then max buttons in row
        if (buttonList.length > 0) {
            const div = createButtonRowDiv(buttonList);
            this.labelsContainer.appendChild(div);
            this.divChildren.push(div);
            buttonList.length = 0;
        }
        // update if there was an answer selected
        this.#update();
    }
}

class MoveButtons {
    constructor(goNext, goPrev) {

        this.nextButton = document.getElementById("next-button");
        this.prevButton = document.getElementById("prev-button");

        this.nextButton.addEventListener("click", () => {
            goNext();
        });
        this.prevButton.addEventListener("click", () => {
            goPrev();
        });
    }

    show(max, currentIndex) {
        this.nextButton.classList.remove("hidden");
        this.prevButton.classList.remove("hidden");
        if (currentIndex <= 1) {
            // hide prev
            this.prevButton.classList.add("hidden");
        }
        if (currentIndex >= max) {
            // hide next
            this.nextButton.classList.add("hidden");
        }
    }
}

class AnnotateContent {
    constructor() {
        this.title = document.getElementById("dataset-title");
        this.contentContainer = document.getElementById("content-container");
        this.reviewContent = document.getElementById("review-content");

    }

    show(dataset) {
        this.title.textContent = dataset.title;
        this.contentContainer.innerHTML = dataset.htmlContent;
    }
}

function clamp(x, min = 0, max = Number.MAX_VALUE) {
    if (x < min) {
        return min;
    }
    else if (x > max) {
        return max;
    }
    else return x;
}

class StepBar {
    constructor(onStepClicked) {
        this.stepBar = document.getElementById("step-bar-wrapper");
        this.steps = [];
        this.onStepClicked = onStepClicked;
        this.lastShow = null;
        this.onResize();
    }
    #clear() {
        this.steps.forEach((step) => {
            this.stepBar.removeChild(step);
        });
        this.steps.length = 0;
    }
    static maxSteps = 5;

    onResize() {
        const desktopSize = 640;
        const bigDesktop = 1280;
        if (window.innerWidth >= bigDesktop)
            StepBar.maxSteps = 7;
        else if (window.innerWidth >= desktopSize)
            StepBar.maxSteps = 5;
        else if (window.innerWidth < desktopSize) {
            StepBar.maxSteps = 3;
        }
        if (this.lastShow)
            this.show(this.lastShow.steps, this.lastShow.currentIndex, this.lastShow.answers);
    }

    show(steps, currentIndex, answers) {
        this.lastShow = {
            steps: steps,
            currentIndex: currentIndex,
            answers: answers
        };
        this.#clear();
        const maxSteps = StepBar.maxSteps;
        const half = Math.floor(maxSteps / 2);
        let firstIndex = clamp(currentIndex - half, 1, steps);
        let secondIndex = Math.min(maxSteps + 1, steps + 1);
        if (currentIndex > half) {
            secondIndex = clamp(currentIndex + half + 1, 1, steps + 1);
        }

        if (currentIndex > steps - half) {
            firstIndex = clamp(steps - maxSteps + 1, 1);
            secondIndex = steps + 1;
        }
        // console.log({
        //     half: half,
        //     fI: firstIndex,
        //     sI: secondIndex,
        //     cI: currentIndex,
        //     steps: steps
        // });
        for (let index = firstIndex; index < secondIndex; index++) {
            const c = document.createElement("div");
            c.setAttribute("class", "step-bar-item");
            const number = document.createElement("div");
            number.setAttribute("class", "step-counter");
            number.textContent = index;
            if (index == currentIndex)
                c.classList.add("active");
            if (answers.includes(index)) {
                c.classList.add("completed");
                number.textContent = "✓";
            }

            number.addEventListener("click", () => {
                this.onStepClicked(index)
            })

            c.appendChild(number);

            this.stepBar.appendChild(c);
            this.steps.push(c);
        }
    }
}

