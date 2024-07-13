
class LabelGroup {
    constructor(onSetLabel) {
        this.currentLabelGroup = null;
        this.onSetLabel = onSetLabel;
        this.textLabels = new TextLabels(onSetLabel);
        this.numberLabels = new NumberLabels(onSetLabel);
        this.imageLabels = new ImageLabels(onSetLabel);
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

class ImageLabels {
    constructor(onSetLabel) {
        this.onSetLabel = onSetLabel;
        this.labelsContainer = document.getElementById("labels");
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext('2d');
        this.added = false;
        this.imageId = null;
        this.isDrawnig = false;
        this.startX = null;
        this.startY = null;
        this.endX = null;
        this.endY = null;
        // add canvas draw events
        this.canvas.addEventListener("mousedown", (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.startX = e.clientX - rect.left;
            this.startY = e.clientY - rect.top;

            this.endX = this.startX;
            this.endY = this.startY;
            this.#drawRect()
            this.isDrawing = true;
            console.log("start drawing");
        })
        this.canvas.addEventListener("mousemove", (e) => {
            if (!this.isDrawing) return;
            const rect = this.canvas.getBoundingClientRect();
            this.endX = e.clientX - rect.left;
            this.endY = e.clientY - rect.top;
            this.#drawRect()
            console.log("drawing");

        })
        window.addEventListener("mouseup", (e) => {
            this.isDrawing = false;
            console.log("end drawing");

        })
        // inputs for precise movements
        this.inputs = [];
        for (let index = 0; index < 4; index++) {
            const input = document.createElement("input");
            input.setAttribute("class", "label-input");
            input.setAttribute("type", "number");
            input.setAttribute("step", "1");
            // when changed
            this.inputs.push(input);
        }
    }
    #drawRect() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.beginPath();
        this.ctx.rect(this.startX, this.startY, this.endX - this.startX, this.endY - this.startY);
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = 'red';
        this.ctx.stroke();
        this.#updateInputs();
        //coords.textContent = `(${startX}, ${startY}); (${endX}, ${endY}).`
    }
    #updateInputs() {
        // null
        if (this.startX == this.endX && this.startY == this.endY) {
            this.inputs.forEach(i => {
                i.value = null;
            })
        }
        else {
            this.inputs[0].value = this.startX;
            this.inputs[1].value = this.startY;
            this.inputs[2].value = this.endX;
            this.inputs[3].value = this.endY;
        }
    }
    #clear() {
        // set drawing to false
        this.isDrawing = false;
        if (this.added) {
            this.labelsContainer.removeChild(this.canvas);
            this.inputs.forEach(i => {
                this.labelsContainer.removeChild(i);
            })
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
        img.onload = () => {
            this.#setCanvasFromImage(img);
        };
        this.labelsContainer.append(this.canvas);
        this.inputs.forEach(i => {
            this.labelsContainer.append(i);
        })
        this.added = true;
        // If the image is already loaded (cached), trigger the onload handler manually
        if (img.complete) {
            img.onload();
        }

    }
}