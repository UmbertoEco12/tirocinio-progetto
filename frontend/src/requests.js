
async function requestDatasetDownload(username) {
    return fetch(`/download/dataset/${username}`).then((r) => r.json());
}

function RequestSetLabel(label) {
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

async function RequestGetDatasetAt(username, index) {
    return fetch(`/dataset/${username}/${index}`)
        .then(response => response.json());
}