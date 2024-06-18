const index = getPathParameterAt(1);

if (index) {
    start();
}
else
    redirect('/compare');

function onSetLabel(label) {
    console.log(`${label} selected`);
}

const annotatePage = new AnnotateContent()
const labels = new Labels(onSetLabel);
function fetchCompareAt(index) {
    console.log("index ", index);
    fetch(`/compare/${index}/json`).then(res => res.json()).then(res => {
        console.log(res);

        annotatePage.show({
            title: res.data.title,
            htmlContent: res.data.content
        })
        labels.show(res.labels, null);
    })
}

function start() {
    fetchCompareAt(index);
}