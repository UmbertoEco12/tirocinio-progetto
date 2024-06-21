const datasetName = document.getElementById("dataset-title");

const annotatePage = new AnnotateContent()
const labels = new Labels(onSetLabel);

const resultsTable = new Table(5, document.getElementById("results-table"));
let tabelPaginationControl = new TablePaginationControls(5, () => {
    if (resultsTable.currentPage < resultsTable.getPageCount()) {
        goToTablePage(resultsTable.currentPage + 1);
    }

},
    () => {
        if (resultsTable.currentPage > 1) {
            goToTablePage(resultsTable.currentPage - 1);
        }
    },
    (i) => {
        goToTablePage(i);
    },
    document.getElementById("pagination-container"));
let currentPage = Number(getArg("page")) ? Number(getArg("page")) : 1;

// Add the event listener for the popstate event
window.addEventListener('popstate', handleUrlChange);

fetchResults();

class AnswerPercentage {
    constructor(label, percentage) {
        this.label = label;
        this.percentage = percentage;
    }
};

function goToTablePage(page, updatePath = true) {
    resultsTable.showPage(page);
    tabelPaginationControl.show(page);
    if (updatePath)
        updateUrl(`/compare?page=${page}`);
}

function fetchResults() {
    fetch('/dataset/results')
        .then(response => response.json())
        .then(res => {
            const usersCount = res.answers.length;
            let index = 1;
            resultsTable.clear();
            res.data.forEach(element => {

                // create labels map
                const labelsMap = new Map();
                element.labels.forEach(label => {
                    labelsMap.set(label, 0);
                });
                datasetName.textContent = res.dataset;
                // gather results
                res.answers.forEach(userAnswer => {
                    // try and find the answer with this title
                    userAnswer.answers.forEach(answer => {
                        if (answer.title == element.title) {
                            labelsMap.set(answer.label, labelsMap.get(answer.label) + 1);
                        }
                    })
                })
                // write answers
                let answers = [];
                let totalAnswers = 0;
                labelsMap.forEach((value, key) => {
                    if (value != 0) {
                        answers.push(new AnswerPercentage(key, (value / usersCount) * 100));
                    }
                    totalAnswers += value;
                });
                if (totalAnswers < usersCount) {
                    answers.push(new AnswerPercentage("no answer", ((usersCount - totalAnswers) / usersCount) * 100));
                }
                if (answers.length == 0) {
                    answers.push(new AnswerPercentage("No answers", 0));
                }
                const i = index;
                let fix = null;
                res.fixes.forEach(elem => {
                    if (elem[0] == element.title) {
                        fix = elem[1];
                        return;
                    }
                })
                // add all rows
                resultsTable.addRow(createDataRow(element.title, answers, fix, () => {
                    fetchCompareAt(i);
                }));
                index++;
            });
            tabelPaginationControl.setup(resultsTable.getPageCount(), currentPage);
            goToTablePage(currentPage);
        });
}

function onSetLabel(label) {
    console.log(`${label} selected`);
}

function fetchCompareAt(index) {
    redirect(`/compare/${index}`);
}

function handleUrlChange(event) {
    const path = event.state ? event.state.path : window.location.pathname;
    console.log("moving to ", path);
    if (Number(getArg("page"))) {
        currentIndex = Number(getArg("page")) ? Number(getArg("page")) : 1;
        goToTablePage(currentIndex, false);
    }
    else {
        redirect("/home");
    }
}
function onReload(event) {
    // Fetch updated values if needed
    fetchResults();
}

window.addEventListener('pageshow', onReload);
