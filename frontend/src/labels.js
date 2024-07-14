
class LabelGroup {
    constructor(onSetLabel) {
        this.currentLabelGroup = null;
        this.onSetLabel = onSetLabel;
        this.textLabels = new TextLabels(onSetLabel);
        this.numberLabels = new NumberLabels(onSetLabel);
        this.imageLabels = new ImageLabels(onSetLabel);
        this.timestampLabels = new TimestampLabels(onSetLabel);
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
                this.numberLabels.setStep(labels.step);
                this.numberLabels.show(labels.min, labels.max, answer);
                this.currentLabelGroup = this.numberLabels;
                break;
            case 'image':
                this.imageLabels.show(labels.imgId, answer);
                this.currentLabelGroup = this.imageLabels;
                break;
            case 'timestamp':
                this.timestampLabels.show(labels.mediaId, answer);
                this.currentLabelGroup = this.timestampLabels;
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
        this.slider = document.createElement("input");
        this.input.setAttribute("type", "number");
        this.slider.setAttribute("type", "range");
        this.input.setAttribute("step", "0.01"); // int o float
        this.slider.setAttribute("step", "0.01"); // int o float
        this.input.setAttribute("class", "label-button label-input");
        this.slider.setAttribute("class", "label-range");
        this.input.addEventListener("input", (event) => {
            this.#onInputValueChange(event);
        })
        this.slider.addEventListener("input", (event) => {
            this.input.value = event.target.value;
        })
        this.slider.addEventListener("change", (event) => {
            this.#onInputValueChange(event);
        })
        this.added = false;
        this.min = this.max = 0;
        this.currentValue = null;
        this.onResize();
    }
    #onInputValueChange(event) {
        if (event.target.value == "" || event.target.value == null || event.target.value == undefined) {
            this.currentValue = null;
            this.input.value = this.currentValue;
            this.slider.value = this.currentValue;
            this.onSetLabel(this.currentValue);
            return;
        }
        // const numberValue = event.target.value.replace(".", "");
        const n = Number(event.target.value);
        const value = event.target.value;
        console.log("changed to ", value);
        console.log("n", n);
        if (n != null) {
            //this.#onValueChanged(n, event.target.value);
            if (n < this.min || n > this.max) {
                // set previous value
                this.input.value = this.currentValue;
                this.slider.value = this.currentValue;
            }
            else {
                this.currentValue = value;
                this.onSetLabel(this.currentValue);
                this.input.value = this.currentValue;
                this.slider.value = this.currentValue;
            }
        }
        else {
            this.currentValue = null;
            this.input.value = this.currentValue;
            this.slider.value = this.currentValue;
            this.onSetLabel(this.currentValue);
        }
    }
    #clear() {
        if (this.added) {

            this.labelsContainer.removeChild(this.input);
            this.labelsContainer.removeChild(this.slider);
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

    setStep(step) {
        this.input.setAttribute("step", step);
        this.slider.setAttribute("step", step);
    }

    show(min, max, answer = null) {
        this.#clear();
        this.labelsContainer.classList.add("label-input-container");

        this.min = min;
        this.max = max;
        this.input.placeholder = `Number between ${min} and ${max}`;
        this.input.setAttribute("min", min);
        this.input.setAttribute("max", max);
        this.slider.setAttribute("min", min);
        this.slider.setAttribute("max", max);
        this.currentValue = answer;
        this.input.value = this.currentValue;
        this.slider.value = this.currentValue;
        this.labelsContainer.appendChild(this.input);
        this.labelsContainer.appendChild(this.slider);
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


class ImageLabelValue {
    constructor(startX = 0, startY = 0, endX = 0, endY = 0) {
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
    }

    setValue(strAnswer) {
        let answer = null;
        try {
            answer = JSON.parse(strAnswer);

        }
        catch {
            answer = null;
        }
        finally {
            if (answer) {
                this.startX = answer.startX;
                this.startY = answer.startY;
                this.endX = answer.endX;
                this.endY = answer.endY;
            }
            else {
                this.startX = 0;
                this.startY = 0;
                this.endX = 0;
                this.endY = 0;
            }
        }

    }

    getStringValue() {
        if (this.startX == this.endX && this.startY == this.endY) {
            return null;
        }
        else {
            return JSON.stringify({
                'startX': this.startX,
                'startY': this.startY,
                'endX': this.endX,
                'endY': this.endY
            });
        }
    }
}

class ImageHelperContainer {
    constructor(onResetClick, onSetColor) {
        this.container = document.createElement("div");
        this.container.classList.add("helper-container");
        // add style
        this.helpText = document.createElement("h4");
        this.helpText.classList.add("helper-text");
        this.helpText.textContent = "Draw a rect on the image";
        this.resetBtn = document.createElement("button");
        this.resetBtn.addEventListener("click", onResetClick);
        this.resetBtn.classList.add("reset-button")
        this.resetBtn.textContent = "Reset";
        this.selectColorInput = document.createElement("input");
        this.selectColorInput.setAttribute("type", "color");
        this.selectColorInput.setAttribute("value", "#ff0000");
        this.selectColorInput.addEventListener("change", (e) => {
            onSetColor(e.target.value);
        })
        this.container.appendChild(this.selectColorInput);
        this.container.appendChild(this.helpText);
        this.container.appendChild(this.resetBtn);
    }

    getContainer() {
        return this.container;
    }

    updateValue(strValue) {
        const value = JSON.parse(strValue);
        if (value != null) {
            this.helpText.textContent = `rect coords: (${value.startX}, ${value.startY}), (${value.endX}, ${value.endY})`;
            this.resetBtn.classList.remove("hidden");

        }
        else {
            this.helpText.textContent = "Draw a rect on the image";
            this.resetBtn.classList.add("hidden");
        }
    }
}

class ImageLabels {
    constructor(onSetLabel) {
        this.onSetLabel = onSetLabel;
        this.labelsContainer = document.getElementById("labels");
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext('2d');
        this.added = false;
        this.imageId = null;
        this.isDrawnig = false;
        this.currentValue = new ImageLabelValue();
        this.currentColor = "#ff0000";
        // add canvas draw events
        this.canvas.addEventListener("mousedown", (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.currentValue.startX = e.clientX - rect.left;
            this.currentValue.startY = e.clientY - rect.top;

            this.currentValue.endX = this.currentValue.startX;
            this.currentValue.endY = this.currentValue.startY;
            this.#drawRect()
            this.isDrawing = true;
            console.log("start drawing");
        })
        this.canvas.addEventListener("mousemove", (e) => {
            if (!this.isDrawing) return;
            const rect = this.canvas.getBoundingClientRect();
            this.currentValue.endX = e.clientX - rect.left;
            this.currentValue.endY = e.clientY - rect.top;
            this.#drawRect()
            console.log("drawing");

        })
        window.addEventListener("mouseup", (e) => {
            if (this.isDrawing) {
                onSetLabel(this.currentValue.getStringValue());
            }
            this.isDrawing = false;
        })
        this.helperContainer = new ImageHelperContainer(() => {
            this.#resetRect()
        }, (color) => {
            this.currentColor = color;
            // redraw
            this.#drawRect();
        });
    }
    #resetRect() {
        this.currentValue.setValue(null);
        this.onSetLabel(null);
        this.helperContainer.updateValue(null);
        this.#drawRect();
    }
    #drawRect() {
        console.log("current value", this.currentValue);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.beginPath();
        this.ctx.rect(this.currentValue.startX, this.currentValue.startY,
            this.currentValue.endX - this.currentValue.startX,
            this.currentValue.endY - this.currentValue.startY);
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.stroke();
        this.helperContainer.updateValue(this.currentValue.getStringValue());
    }
    #clear() {
        // set drawing to false
        this.isDrawing = false;
        if (this.added) {
            this.labelsContainer.removeChild(this.canvas);
            this.labelsContainer.removeChild(this.helperContainer.getContainer());
            this.added = false;
        }
    }
    delete() {
        this.#clear();
    }
    onResize() {
        if (this.imageId != null) {
            this.#setCanvasFromImage(document.getElementById(this.imageId));

        }
    }
    #setCanvasFromImage(img) {
        const rect = img.getBoundingClientRect();

        this.canvas.width = img.width;
        this.canvas.height = img.height;
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = `${rect.top + window.scrollY}px`;
        this.canvas.style.left = `${rect.left + window.scrollX}px`;
    }
    show(imageId, answer = null) {
        this.#clear();
        this.imageId = imageId;
        const img = document.getElementById(imageId);
        img.classList.add("label-target-image");
        // Ensure the image is loaded before getting its dimensions
        this.currentValue.setValue(answer);
        img.onload = () => {
            this.#setCanvasFromImage(img);
            this.#drawRect();
        };
        this.labelsContainer.append(this.canvas);
        this.labelsContainer.append(this.helperContainer.getContainer());
        this.added = true;
        // If the image is already loaded (cached), trigger the onload handler manually
        if (img.complete) {
            img.onload();
        }

    }
}

class TimestampLabelValue {
    constructor() {
        this.start = null;
        this.end = null;
    }

    setStartValue(value) {
        this.start = Number(value.toFixed(2));
        if (this.end == null || this.start > this.end) {
            this.end = this.start
        }
    }

    setEndValue(value) {
        this.end = Number(value.toFixed(2));
        if (this.start == null || this.start > this.end) {
            this.start = 0.0;
        }
    }

    setAnswer(strAnswer) {
        let answer = null;
        try {
            answer = JSON.parse(strAnswer);
        }
        catch {
            answer = null;
        }
        if (answer) {
            this.start = answer.start.toFixed(2);
            this.end = answer.end.toFixed(2);
        }
        else {
            this.reset();
        }
    }

    reset() {
        this.start = this.end = null;
    }

    getStringValue() {
        if (this.start == null || this.end == null) {
            return null;
        }
        else {
            return JSON.stringify(
                {
                    'start': Number(this.start),
                    'end': Number(this.end)
                }
            );
        }
    }
}
class TimestampLabels {
    constructor(onSetLabel) {
        this.onSetLabel = onSetLabel;
        this.labelsContainer = document.getElementById("labels");
        this.currentValue = new TimestampLabelValue();
        this.added = false;
        this.currentMedia = null;
        // 
        this.startButton = document.createElement("button");
        this.helpText = document.createElement("h3");
        this.helpText.classList.add("helper-text");
        this.helpText.textContent = "Click buttons to take the current time";
        this.endButton = document.createElement("button");
        this.startButton.classList.add("label-button");
        this.endButton.classList.add("label-button");

        this.resetBtn = document.createElement("button");
        this.resetBtn.textContent = "Reset";
        this.resetBtn.classList.add("reset-button")
        this.resetBtn.addEventListener("click", () => {
            this.currentValue.reset();
            this.#updateButtons();
            const label = this.currentValue.getStringValue();
            onSetLabel(label);
        });
        this.container = document.createElement("div");

        this.container.appendChild(this.helpText);
        this.container.appendChild(this.startButton);
        this.container.appendChild(this.endButton);
        this.container.appendChild(this.resetBtn);
        this.container.classList.add("helper-container")
        this.startButton.addEventListener("click", () => {
            if (this.currentMedia) {
                this.currentValue.setStartValue(this.currentMedia.currentTime);
            }
            this.#updateButtons();
            const label = this.currentValue.getStringValue();
            onSetLabel(label);

        })
        this.endButton.addEventListener("click", () => {
            if (this.currentMedia) {
                this.currentValue.setEndValue(this.currentMedia.currentTime);
            }
            this.#updateButtons();
            const label = this.currentValue.getStringValue();
            onSetLabel(label);

        })
        this.#updateButtons();
    }
    onResize() {

    }

    #clear() {
        if (this.added) {
            this.labelsContainer.removeChild(this.container);
            this.added = false;
        }
    }

    #updateButtons() {
        if (this.currentValue.start != null) {
            this.startButton.textContent = `Starting time ${this.currentValue.start}`;
        }
        else {
            this.startButton.textContent = `Click to set Starting time`;
        }
        if (this.currentValue.end != null) {
            this.endButton.textContent = `Ending time ${this.currentValue.end}`;
        }
        else {
            this.endButton.textContent = `Click to set Ending time`;
        }
    }

    delete() {
        this.#clear();
    }

    show(mediaId, answer = null) {
        this.#clear();
        console.log("answer,", answer);
        this.currentValue.setAnswer(answer);
        this.#updateButtons();
        this.currentMedia = document.getElementById(mediaId);
        this.labelsContainer.appendChild(this.container);
        this.added = true;
    }
}