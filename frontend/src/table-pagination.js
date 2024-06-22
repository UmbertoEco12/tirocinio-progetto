function createDataRow(title, answers, fix, onTitleClick) {
    // create row
    const row = document.createElement("tr");
    // create title name
    const titleData = document.createElement("td");
    titleData.textContent = title;
    titleData.addEventListener("click", onTitleClick);
    titleData.classList.add("results-title-data");
    const dataData = document.createElement("td");
    dataData.classList.add("results-data-row");
    const dataTable = document.createElement("table");
    dataTable.setAttribute("style", "width: 100%");
    dataData.appendChild(dataTable);
    // create fix row if not null
    if (fix) {
        const row = document.createElement("tr");
        row.classList.add("fix-container");
        const labelData = document.createElement("td");
        labelData.classList.add("label-data-fix");
        labelData.textContent = `fix: ${fix}`;
        row.appendChild(labelData);
        dataTable.appendChild(row);
    }
    else {
        if (answers.length > 1) {
            // there are conflicts
            const row = document.createElement("tr");
            row.classList.add("fix-container");
            const labelData = document.createElement("td");
            labelData.classList.add("label-data-conflict");
            labelData.textContent = `conflict`;
            row.appendChild(labelData);
            dataTable.appendChild(row);
        }
    }
    // add answers
    answers.forEach(answer => {

        const row = document.createElement("tr");
        // create label
        const labelData = document.createElement("td");
        labelData.classList.add("label-data");
        labelData.textContent = answer.label;
        // create percentage bar
        const precentageBar = document.createElement("td");
        precentageBar.classList.add("percentage-bar-data");
        const percentageDiv = document.createElement("div");
        percentageDiv.classList.add("percentage-bar");
        // set correct width
        percentageDiv.setAttribute("style", `width: ${answer.percentage}%`);
        precentageBar.appendChild(percentageDiv);

        // create percentage text
        const percentageText = document.createElement("td");
        percentageText.classList.add("percentage-text-data");
        percentageText.textContent = `${answer.percentage}%`;

        row.appendChild(labelData);
        row.appendChild(precentageBar);
        row.appendChild(percentageText);

        dataTable.appendChild(row);
    })
    row.appendChild(titleData);
    row.appendChild(dataData);
    return row;
}

class Table {
    constructor(elementsPerPage, table) {
        this.elementsPerPage = elementsPerPage;
        this.table = table;
        this.currentPage = 1;
        this.currentTableChildren = 0;
        this.rows = [];
        this.tableChildrenRows = [];
    }

    addRow(row) {
        this.rows.push(row);
        if (this.currentTableChildren < this.elementsPerPage) {
            this.table.appendChild(row);
            this.tableChildrenRows.push(row);
            this.currentTableChildren++;
        }
    }
    clear() {
        this.#clearTable();
        this.currentPage = 1;
        this.currentTableChildren = 0;
        this.rows.length = 0;
        this.tableChildrenRows.length = 0;
    }
    getPageCount() {
        return Math.ceil(this.rows.length / this.elementsPerPage);
    }

    #clearTable() {
        this.tableChildrenRows.forEach(row => {
            this.table.removeChild(row);
        })
        this.tableChildrenRows.length = 0;
        this.currentTableChildren = 0;
    }

    showPage(pageNumber) {
        if (pageNumber > this.getPageCount() || pageNumber < 1) {
            return;
        }
        this.#clearTable();
        const startingIndex = (pageNumber * this.elementsPerPage) - this.elementsPerPage;
        const endIndex = startingIndex + this.elementsPerPage > this.rows.length ? this.rows.length : startingIndex + this.elementsPerPage;
        for (let index = startingIndex; index < endIndex; index++) {
            const row = this.rows[index];
            this.table.appendChild(row);
            this.tableChildrenRows.push(row);
            this.currentTableChildren++;
        }
        this.currentPage = pageNumber;
    }
}

class TablePaginationControls {
    constructor(maxPageBtnsCount, onNext, onPrev, onSelect, container) {
        // create next and prev buttons
        this.prevBtn = document.createElement("button");
        this.nextBtn = document.createElement("button");
        this.container = container;
        this.pageBtns = [];
        this.containerBtns = [];
        this.maxPageBtnsCount = maxPageBtnsCount;
        this.onSelect = onSelect;
        this.pageCount = 0;
        // setup control btns
        this.prevBtn.classList.add("pagination-control-btn");
        this.nextBtn.classList.add("pagination-control-btn");
        this.prevBtn.textContent = "<";
        this.prevBtn.addEventListener("click", onPrev);
        this.nextBtn.textContent = ">";
        this.nextBtn.addEventListener("click", onNext);
    }
    clear() {
        this.#clearContainer();
        this.pageBtns.length = 0;
        this.pageCount = 0;
    }
    setup(pageCount, currentPage = 1) {
        this.pageCount = pageCount;
        // create pages buttons
        for (let index = 0; index < pageCount; index++) {
            const pageBtn = document.createElement("button");
            pageBtn.textContent = index + 1;
            pageBtn.classList.add("pagination-btn");
            if (currentPage == index + 1) {
                pageBtn.classList.add("selected");
            }
            pageBtn.addEventListener("click", () => {
                this.onSelect(index + 1);
            });
            this.pageBtns.push(pageBtn);
        };
        this.container.appendChild(this.prevBtn);
        this.container.appendChild(this.nextBtn);
        this.show(currentPage);
    }

    #clearContainer() {
        this.container.removeChild(this.prevBtn);
        this.container.removeChild(this.nextBtn);
        this.containerBtns.forEach(btn => {
            this.container.removeChild(btn);
        })
        this.containerBtns.length = 0;
    }

    #getIndices(currentPage) {
        const max = this.maxPageBtnsCount;
        const half = Math.floor(max / 2);
        const currentIndex = currentPage;
        let firstIndex = clamp(currentIndex - half, 1, this.pageCount);
        let secondIndex = Math.min(max + 1, this.pageCount + 1);
        if (currentIndex > half) {
            secondIndex = clamp(currentIndex + half + 1, 1, this.pageCount + 1);
        }

        if (currentIndex > this.pageCount - half) {
            firstIndex = clamp(this.pageCount - max + 1, 1);
            secondIndex = this.pageCount + 1;
        }

        return {
            start: firstIndex, end: secondIndex
        };
    }

    #updateGfx(currentPage) {
        let i = 1;
        this.pageBtns.forEach(page => {
            page.classList.remove("selected");
            if (i == currentPage) {
                page.classList.add("selected");
            }
            i++;
        })
        this.prevBtn.classList.remove("hidden");
        this.nextBtn.classList.remove("hidden");
        if (currentPage == 1) {
            this.prevBtn.classList.add("hidden");
        }
        if (currentPage == this.pageCount) {
            this.nextBtn.classList.add("hidden");
        }
    }

    show(currentPage) {
        this.#clearContainer();
        this.container.appendChild(this.prevBtn);
        const indices = this.#getIndices(currentPage);
        for (let index = indices.start; index < indices.end; index++) {
            const pageBtn = this.pageBtns[index - 1];

            this.container.appendChild(pageBtn);
            this.containerBtns.push(pageBtn);
        }

        this.container.appendChild(this.nextBtn);
        this.#updateGfx(currentPage);
    }
}

class AnswerPercentage {
    constructor(label, percentage) {
        this.label = label;
        this.percentage = percentage;
    }
};

class DatasetDataResult {
    constructor(title, labels, userAnswers, fixes) {
        this.title = title;
        this.answers = [];
        this.fix = null;
        this.hasConflict = false;
        const labelsMap = new Map();
        const usersCount = userAnswers.length;

        // name and count
        labels.forEach(label => {
            labelsMap.set(label, 0);
        });
        // assign value
        userAnswers.forEach(userAnswer => {
            userAnswer.answers.forEach(answer => {
                if (answer.title == title) {
                    labelsMap.set(answer.label, labelsMap.get(answer.label) + 1);
                }

            })
        })
        let totalAnswers = 0;
        labelsMap.forEach((answersCount, label) => {
            const percentage = (answersCount / usersCount) * 100;
            if (answersCount != 0)
                this.answers.push(new AnswerPercentage(label, percentage));
            totalAnswers += answersCount;
        })
        // some users didn t answer this
        if (totalAnswers < usersCount) {
            this.answers.push(new AnswerPercentage("no answer", ((usersCount - (totalAnswers)) / usersCount) * 100));
        }
        // no user answered this
        else if (this.answers.length == 0) {
            this.answers.push(new AnswerPercentage("No answers", 0));
        }
        // check if there is a fix for this data
        for (let index = 0; index < fixes.length; index++) {
            const elem = fixes[index];
            if (elem.title == title) {
                this.fix = elem.label;
                break;
            }
        }
        // check if it has conflicts
        this.hasConflict = this.fix == null && this.answers.length > 1;
    }

    getResult() {
        if (this.hasConflict) return null;

        const res = {
            title: this.title,
            label: null
        };
        if (this.fix)
            res.label = this.fix;
        else {
            res.label = this.answers[0].label;
        }
        return res;
    }
}

class DatasetResults {
    constructor() {
        this.datasetName = "";
        this.dataResults = [];
    }

    init(datasetName, answers, data, fixes) {
        // clear 
        this.dataResults.length = 0;
        this.datasetName = datasetName;
        data.forEach(element => {
            this.dataResults.push(new DatasetDataResult(element.title, element.labels, answers, fixes));
        })
    }

    isFixed() {
        for (let index = 0; index < this.dataResults.length; index++) {
            const element = this.dataResults[index];
            if (element.hasConflict) {
                return false;
            }
        }
        return true;
    }

    getFixedResults() {
        if (!this.isFixed()) return null;
        const res = {
            dataset: this.datasetName,
            answers: []
        };
        this.dataResults.forEach(r => {
            res.answers.push(r.getResult());
        })
        return res;
    }
}