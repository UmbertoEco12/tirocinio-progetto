function downloadJSON(jsonData, fileName) {
    // Create a Blob object from the JSON data
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });

    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create an anchor element
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName; // Set the download attribute to the desired file name

    // Append the anchor element to the document body
    document.body.appendChild(a);

    // Trigger a click event on the anchor element to initiate the download
    a.click();

    // Remove the anchor element from the document body
    document.body.removeChild(a);

    // Revoke the URL to release the resources associated with it
    URL.revokeObjectURL(url);
}

function getPathParameterAt(index) {
    const path = window.location.pathname;
    const segments = path.split('/');
    segments.splice(0, 1); // remove host
    if (index > segments.length - 1)
        return null;
    else
        return segments[index];
}

function getArg(name) {
    // Get the query string from the URL
    const queryString = window.location.search;

    // Create a URLSearchParams object
    const urlParams = new URLSearchParams(queryString);

    // Get the value of the 'name' query parameter
    return urlParams.get(name);
}

function redirect(path) {
    window.location.href = path;
}

function updateUrl(path) {
    history.pushState({ path: path }, '', path);
}