class Dataset {
    constructor(title, htmlContent, labels, answer) {
        this.title = title;
        this.htmlContent = htmlContent;
        this.labels = labels;
        this.answer = answer;
    }
}
let annotatePage;
let stepBar = null;
const username = getPathParameterAt(1);
//let currentIndex = Number(getPathParameterAt(2)) ? Number(getPathParameterAt(2)) : 1;
let currentIndex = Number(getArg("index")) ? Number(getArg("index")) : 1;
let currentDataset;
function fetchDatasetAt(index) {
    fetch(`/dataset/${username}/${index}`)
        .then(response => response.json())
        .then(res => {
            console.log(`Dataset ${index}`, res);
            if (res != null && res != "null") {
                // update current index
                currentIndex = index;
                // parse dataset
                console.log(`Dataset ${index}`, res);
                currentDataset = new Dataset(res.data.title, res.data.content, res.labels, res.data.answer);
                // show page
                annotatePage.show(currentDataset, res.count, currentIndex);
                stepBar.show(res.count, currentIndex, res.answers);
                // update url
                updateUrl(`/review/${username}?index=${currentIndex}`);
            }
        })
        .catch(error => console.error('Error:', error));
}

function setLabelOf(label) {
    fetch(`/dataset/${username}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: currentDataset.title,
            label: label
        })
    });
}

if (username) {

    annotatePage = new AnnotatePage(username,
        () => {
            fetchDatasetAt(currentIndex + 1);
        },
        () => {
            fetchDatasetAt(currentIndex - 1);
        },
        setLabelOf);
    stepBar = new StepBar(fetchDatasetAt);
    fetchDatasetAt(currentIndex);
}
else
    redirect('/username')

window.addEventListener("resize", () => {
    if (stepBar)
        stepBar.onResize();
})

document.getElementById("download-button").addEventListener("click", () => {
    fetch(`/download/dataset/${username}`)
        .then((response) => response.json()).then(res => downloadJSON(res, `${username}-results.json`));
})