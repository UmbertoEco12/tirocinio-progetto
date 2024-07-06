
class LabelGroup {
    constructor(onSetLabel) {
        this.currentLabelGroup = null;
        this.onSetLabel = onSetLabel;
        this.textLabels = new TextLabels(onSetLabel);
        this.numberLabels = new NumberLabels(onSetLabel);
    }

    show(labels, answer = null) {
        if (this.currentLabelGroup) {
            this.currentLabelGroup.delete();
        }
        const labelType = labels.type;
        switch (labelType) {
            case 'text':
                this.textLabels.show(labels.data, answer)
                this.currentLabelGroup = this.textLabels;
                break;
            case 'number':
                this.numberLabels.show(labels.min, labels.max, answer);
                this.currentLabelGroup = this.numberLabels;
                break;
        }
    }

    onResize() {
        if (this.currentLabelGroup) {
            this.currentLabelGroup.onResize();
        }
    }

}

class NumberLabels {
    constructor(onSetLabel) {
        this.labelsContainer = document.getElementById("labels");
        this.onSetLabel = onSetLabel;
        this.input = document.createElement("input");
        this.input.setAttribute("type", "number");
        this.input.setAttribute("class", "label-button label-input");
        this.input.addEventListener("input", (event) => {
            if (event.target.value == "" || event.target.value == null) {
                this.#onValueChanged(null);
                return;
            }
            const n = Number(event.target.value);
            if (n != null) {
                this.#onValueChanged(n);
            }
            else {
                this.#onValueChanged(null);
            }
        })
        this.added = false;
        this.min = this.max = 0;
        this.currentValue = null;
        this.onResize();
    }
    #onValueChanged(value) {
        if (value >= this.min && value <= this.max) {
            this.currentValue = value;
            this.onSetLabel(this.currentValue);
        }
        this.input.value = this.currentValue;
    }
    #clear() {
        if (this.added) {

            this.labelsContainer.removeChild(this.input);
            this.added = false;
        }
    }
    delete() {
        this.labelsContainer.classList.remove("label-input-container");
        this.#clear();
    }
    static maxButtonInRow = 4;
    onResize() {
    }

    show(min, max, answer = null) {
        this.#clear();
        this.labelsContainer.classList.add("label-input-container");

        this.min = min;
        this.max = max;
        this.input.setAttribute("min", min);
        this.input.setAttribute("max", max);
        this.currentValue = answer;
        this.input.value = this.currentValue;
        this.labelsContainer.appendChild(this.input);
        this.added = true;
    }
}

class TextLabels {
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
    delete() {
        this.#clear();
    }
    static maxButtonInRow = 4;
    onResize() {
        const desktopSize = 750;
        const bigDesktop = 1000;
        if (window.innerWidth >= bigDesktop)
            TextLabels.maxButtonInRow = 4;
        else if (window.innerWidth >= desktopSize)
            TextLabels.maxButtonInRow = 3;
        else if (window.innerWidth < desktopSize) {
            TextLabels.maxButtonInRow = 2;
        }
        if (this.lastShow)
            this.show(this.lastShow.labels, this.lastShow.answer);
    }

    show(labels, answer = null) {
        this.#clear();
        this.lastShow = {
            labels: labels, answer: answer
        }
        const maxButtonInRow = TextLabels.maxButtonInRow;
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
