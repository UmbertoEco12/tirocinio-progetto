// const chartsContainer = document.getElementById("charts-container");

// google.charts.load('current', { 'packages': ['corechart'] });

// function drawChart(title, answers, element) {

//     const answerArray = [['Answers', 'Count']];

//     answers.forEach(answer => {
//         let ans = answer.label;
//         if (ans == null) {
//             ans = "no answer";
//         }
//         answerArray.push([ans, answer.count]);
//     });
//     const data = google.visualization.arrayToDataTable(answerArray);
//     const options = {
//         title: title,
//         titleTextStyle: {
//             color: '#4d77f5'
//         },
//         legend: {
//             textStyle: {
//                 color: '#4d77f5'
//             }
//         }
//     };
//     let chart = new google.visualization.PieChart(element);
//     chart.draw(data, options);
// }

// function fetchData() {
//     fetch('/compare-res')
//         .then(response => response.json())
//         .then(data => {
//             if (data.error) {
//                 console.error('Error:', data.error);
//             } else {
//                 console.log('Output:', data);
//                 // parse stuff and add to dom
//                 data.results.forEach((res) => {
//                     let node = document.createElement("div");
//                     node.setAttribute("class", "piechart");
//                     chartsContainer.appendChild(node);
//                     drawChart(res.title, res.answers, node);
//                 })
//             }
//         })
//         .catch(error => console.error('Error:', error));
// }

// // fetch results when packages are loaded
// google.charts.setOnLoadCallback(fetchData);

const resultsTable = document.getElementById("results-table");

function fetchResults() {
    fetch('/dataset/results')
        .then(response => response.json())
        .then(res => {
            console.log("results", res);
            const usersCount = res.answers.length;
            console.log(usersCount);
            let index = 1;
            res.data.forEach(element => {
                // create table row
                const row = document.createElement("tr");
                // create title name
                const title = document.createElement("td");
                title.textContent = element.title;
                row.appendChild(title);
                //const answerMap = new Map();
                // create labels map
                const labelsMap = new Map();
                element.labels.forEach(label => {
                    labelsMap.set(label, 0);
                });

                // gather results
                res.answers.forEach(userAnswer => {
                    // try and find the answer with this title
                    userAnswer.answers.forEach(answer => {
                        if (answer.title == element.title) {
                            labelsMap.set(answer.label, labelsMap.get(answer.label) + 1);
                        }
                    })
                })
                //answerMap.set(element.title, labelsMap);

                // write answers
                const resData = document.createElement("td");
                let answerOverall = "";
                let totalAnswers = 0;
                labelsMap.forEach((value, key) => {
                    if (value != 0) {
                        answerOverall += `${key}: ${(value / usersCount) * 100}%`;

                    }
                    totalAnswers += value;
                });
                if (totalAnswers < usersCount) {
                    answerOverall += `no answer: ${((usersCount - totalAnswers) / usersCount) * 100}%`;
                }
                if (answerOverall == "") {
                    answerOverall = "No answers";
                }
                resData.textContent = answerOverall;
                row.appendChild(resData);
                const i = index;
                row.addEventListener("click", () => {
                    fetchCompareAt(i);
                });
                resultsTable.appendChild(row);
                index++;
            });

        });
}

fetchResults();

function onSetLabel(label) {
    console.log(`${label} selected`);
}

const annotatePage = new AnnotateContent()
const labels = new Labels(onSetLabel);
function fetchCompareAt(index) {
    redirect(`/compare/${index}`);
}