

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

