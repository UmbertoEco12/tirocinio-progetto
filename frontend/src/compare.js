const datasetName = document.getElementById("dataset-title");

const annotatePage = new AnnotateContent()

const rowsPerPage = 10;
const resultsTable = new Table(rowsPerPage, document.getElementById("results-table"));

function onFilterButtonClick(filter) {
    if (currentActiveFilter == filter) {
        showDatasetInTable(currentDatasetResult, TABLE_ACTIVE_FILTER.NONE);
    }
    else
        showDatasetInTable(currentDatasetResult, filter);
}
const filterButtons = new FilterButtons(
    document.getElementById("show-fixes"),
    document.getElementById("show-conflicts"),
    document.getElementById("show-unanswered"),
    onFilterButtonClick);
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
let currentActiveFilter = getArg("filter") ? getArg("filter") : TABLE_ACTIVE_FILTER.NONE;
// Add the event listener for the popstate event
window.addEventListener('popstate', handleUrlChange);

fetchResults();

function goToTablePage(page, updatePath = true) {
    resultsTable.showPage(page);
    tabelPaginationControl.show(page);
    currentPage = page;
    if (updatePath)
        updateUrl(`/compare?page=${page}&filter=${currentActiveFilter}`);
}

function filterData(filter, data) {
    if (filter == TABLE_ACTIVE_FILTER.NONE)
        return true;
    else if (filter == TABLE_ACTIVE_FILTER.CONFLICT) {
        return data.isConflict();
    }
    else if (filter == TABLE_ACTIVE_FILTER.FIX) {
        return data.isFixed();
    }
    else if (filter == TABLE_ACTIVE_FILTER.UNANSWERED) {
        return data.isUnanswered();
    }
    return false;
}

function showDatasetInTable(dataset, filter) {
    // set current filter
    currentActiveFilter = filter;
    // clear the table
    resultsTable.clear();

    // filter buttons
    filterButtons.show(dataset, currentActiveFilter);

    // add the table data
    for (let index = 0; index < dataset.dataResults.length; index++) {
        const data = dataset.dataResults[index];
        const i = index + 1;
        if (filterData(currentActiveFilter, data)) {
            resultsTable.addRow(createDataRow(data.title, data.answers, data.fix, () => {
                fetchCompareAt(i);
            }));
        }
    }
    if (resultsTable.getPageCount() < currentPage) {
        currentPage = 1;
    }
    // show the table
    tabelPaginationControl.setup(resultsTable.getPageCount(), currentPage);
    goToTablePage(currentPage);
}

const currentDatasetResult = new DatasetResults();
function fetchResults() {
    fetch('/dataset/results')
        .then(response => response.json())
        .then(res => {
            console.log("answers", res.answers);
            // create current dataset results object
            currentDatasetResult.init(res.dataset, res.answers, res.data, res.fixes);
            // set dataset name
            datasetName.textContent = currentDatasetResult.datasetName;
            // show data in table
            showDatasetInTable(currentDatasetResult, currentActiveFilter);
        });
}

function onSetLabel(label) {
    console.log(`${label} selected`);
}

function fetchCompareAt(index) {
    window.history.pushState({}, '', `/compare?page=${currentPage}&filter=${currentActiveFilter}`);
    redirect(`/compare/${index}`);
}

function handleUrlChange(event) {
    const path = event.state ? event.state.path : window.location.pathname;
    console.log("moving to ", path);
    if (getArg("filter") != currentActiveFilter) {
        // set page to first when changing filter view
        currentPage = 1;
        showDatasetInTable(currentDatasetResult, getArg("filter"));
        return;
    }
    if (Number(getArg("page"))) {
        let currentIndex = Number(getArg("page")) ? Number(getArg("page")) : 1;
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
    fetch('/dataset/download')
        .then(response => response.json())
        .then(res => {
            if (res == null) {
                alert("fix all data first");
            }
            else {
                if (res.path) {
                    alert(`Results downloaded in ${res.path}`);
                }
                else {
                    alert("Something went wrong");
                }
            }
            // if (res == null) {
            //     alert("fix all data first");
            // }
            // else if (res.filename && res.data) {
            //     download(res.data, res.filename)
            // }
        });
}

downloadBtn.addEventListener("click", downloadFixedResults);

const agreementText = document.getElementById("agreement-text");

function setAgreementText() {
    fetch("dataset/agreement").then(res => res.json()).then(r => {
        agreementText.textContent = r.agreement;
    })
}

setAgreementText();