class Dataset {
    constructor(title, htmlContent, labels, answer) {
        this.title = title;
        this.htmlContent = htmlContent;
        this.labels = labels;
        this.answer = answer;
    }
}
let annotatePage;
let moveBtns;
let stepBar = null;
let labels = null;
const username = getPathParameterAt(1);
//let currentIndex = Number(getPathParameterAt(2)) ? Number(getPathParameterAt(2)) : 1;
let currentIndex = Number(getArg("index")) ? Number(getArg("index")) : 1;
let currentDataset;
let datasetName = "";
const prevUnansweredBtn = document.getElementById("prev-unanswered-btn")
const nextUnansweredBtn = document.getElementById("next-unanswered-btn")
const percentageText = document.getElementById("percentage-text");
let nextUnanswered = null;
let prevUnanswered = null;


nextUnansweredBtn.addEventListener("click", () => {
    if (nextUnanswered != null)
        fetchDatasetAt(nextUnanswered);
})
prevUnansweredBtn.addEventListener("click", () => {
    if (prevUnanswered != null)
        fetchDatasetAt(prevUnanswered);
})

function updateUnansweredBtnsVisibility() {
    nextUnansweredBtn.classList.remove("hidden");
    prevUnansweredBtn.classList.remove("hidden");

    if (nextUnanswered == null) {
        nextUnansweredBtn.classList.add("hidden");
    }
    if (prevUnanswered == null) {
        prevUnansweredBtn.classList.add("hidden");
    }
}

function findPreviousNextIncompleteIndices(completedIndices, totalCount, currentIndex) {
    // Create a set for quick lookup of completed indices
    const completedSet = new Set(completedIndices);

    let previousIncomplete = null;
    let nextIncomplete = null;

    // Find previous incomplete index
    for (let i = currentIndex - 1; i > 0; i--) {
        if (!completedSet.has(i)) {
            previousIncomplete = i;
            break;
        }
    }

    // Find next incomplete index
    for (let i = currentIndex + 1; i <= totalCount; i++) {
        if (!completedSet.has(i)) {
            nextIncomplete = i;
            break;
        }
    }

    return {
        previousIncomplete,
        nextIncomplete
    };
}

function fetchDatasetAt(index, updatePath = true) {
    RequestGetDatasetAt(username, index)
        .then(res => {
            console.log(`Dataset ${index}`, res);
            if (res != null && res != "null") {
                // update current index
                currentIndex = index;
                // parse dataset
                console.log(`Dataset ${index}`, res);
                datasetName = res.dataset;
                currentDataset = new Dataset(res.data.title, res.data.content, res.labels, res.data.answer);
                // show page
                annotatePage.show(currentDataset);
                moveBtns.show(res.count, currentIndex)
                stepBar.show(res.count, currentIndex, res.answers);
                labels.show(currentDataset.labels, currentDataset.answer);
                //labels = LabelGroup.create(currentDataset.labels, onSetLabel, currentDataset.answer);

                const indices = findPreviousNextIncompleteIndices(res.answers, res.count, currentIndex);
                prevUnanswered = indices.previousIncomplete;
                nextUnanswered = indices.nextIncomplete;
                console.log(indices);
                updateUnansweredBtnsVisibility();
                percentageText.textContent = `${res.percentage.toFixed(1)}%`;
                // update url
                if (updatePath)
                    updateUrl(`/review/${username}?index=${currentIndex}`);
            }
        })
        .catch(error => console.error('Error:', error));
}

function onSetLabel(label) {
    RequestSetLabel(label);
}

function downloadResults() {
    requestDatasetDownload(username).then(res => {
        if (res == null) {
            alert("Answer all the questions first");
        }
        else {
            downloadJSON(res, `${datasetName}-${username}-results.json`);
        }
    });
}

function start() {
    const navUsername = document.getElementById("nav-username");
    navUsername.textContent = username;
    moveBtns = new MoveButtons(() => {
        fetchDatasetAt(currentIndex + 1);
    },
        () => {
            fetchDatasetAt(currentIndex - 1);
        })
    annotatePage = new AnnotateContent();
    stepBar = new StepBar(fetchDatasetAt);
    labels = new LabelGroup(onSetLabel)
    updateUnansweredBtnsVisibility();
    fetchDatasetAt(currentIndex);
    // other stuff
    window.addEventListener("resize", () => {
        if (stepBar)
            stepBar.onResize();
        if (labels)
            labels.onResize();
    })

    document.getElementById("download-button").addEventListener("click", downloadResults);
    function handleUrlChange(event) {
        const path = event.state ? event.state.path : window.location.pathname;
        // Call your function to handle the URL change
        console.log("Path changed to:", path);
        // You can call your custom function here to handle the path change
        //myFunctionToHandlePathChange(path);
        if (!Number(getArg("index"))) {
            redirect(`/username/${username}`);
        }
        else {
            currentIndex = Number(getArg("index")) ? Number(getArg("index")) : 1;
            fetchDatasetAt(currentIndex, false);
        }
    }
    // Add the event listener for the popstate event
    window.addEventListener('popstate', handleUrlChange);

    const userNav = document.getElementById("nav-username");
    userNav.setAttribute("href", `/username/${username}`);

}

if (username) {
    start();
}
else
    redirect('/username')


