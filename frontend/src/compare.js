const datasetName = document.getElementById("dataset-title");

const annotatePage = new AnnotateContent()
const labels = new Labels(onSetLabel);

const rowsPerPage = 10;
const resultsTable = new Table(rowsPerPage, document.getElementById("results-table"));
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

// class AnswerPercentage {
//     constructor(label, percentage) {
//         this.label = label;
//         this.percentage = percentage;
//     }
// };

function goToTablePage(page, updatePath = true) {
    resultsTable.showPage(page);
    tabelPaginationControl.show(page);
    currentPage = page;
    if (updatePath)
        updateUrl(`/compare?page=${page}`);
}
const currentDatasetResult = new DatasetResults();
function fetchResults() {
    fetch('/dataset/results')
        .then(response => response.json())
        .then(res => {
            // clear the table
            resultsTable.clear();
            // create current dataset results object
            currentDatasetResult.init(res.dataset, res.answers, res.data, res.fixes);
            // set dataset name
            datasetName.textContent = currentDatasetResult.datasetName;
            // add the table data
            for (let index = 0; index < currentDatasetResult.dataResults.length; index++) {
                const data = currentDatasetResult.dataResults[index];
                const i = index + 1;
                resultsTable.addRow(createDataRow(data.title, data.answers, data.fix, () => {
                    fetchCompareAt(i);
                }));
            }
            // show the table
            tabelPaginationControl.setup(resultsTable.getPageCount(), currentPage);
            goToTablePage(currentPage);
        });
}

function onSetLabel(label) {
    console.log(`${label} selected`);
}

function fetchCompareAt(index) {
    window.history.pushState({}, '', `/compare?page=${currentPage}`);
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

const downloadBtn = document.getElementById("download-button");

function downloadFixedResults() {
    fetch('/dataset/results')
        .then(response => response.json())
        .then(res => {
            // create current dataset results object
            const dataset = new DatasetResults();
            dataset.init(res.dataset, res.answers, res.data, res.fixes);
            if (dataset.isFixed()) {
                downloadJSON(dataset.getFixedResults(), `${dataset.datasetName}_results.json`);
            }
            else {
                alert("fix all data first");
            }
        });
}

downloadBtn.addEventListener("click", downloadFixedResults);
