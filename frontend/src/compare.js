const chartsContainer = document.getElementById("charts-container");

google.charts.load('current', { 'packages': ['corechart'] });

function drawChart(title, answers, element) {

    const answerArray = [['Answers', 'Count']];

    answers.forEach(answer => {
        let ans = answer.label;
        if (ans == null) {
            ans = "no answer";
        }
        answerArray.push([ans, answer.count]);
    });
    const data = google.visualization.arrayToDataTable(answerArray);
    const options = {
        title: title,
        titleTextStyle: {
            color: '#4d77f5'
        },
        legend: {
            textStyle: {
                color: '#4d77f5'
            }
        }
    };
    let chart = new google.visualization.PieChart(element);
    chart.draw(data, options);
}

function fetchData() {
    fetch('/compare-res')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error:', data.error);
            } else {
                console.log('Output:', data);
                // parse stuff and add to dom
                data.results.forEach((res) => {
                    let node = document.createElement("div");
                    node.setAttribute("class", "piechart");
                    chartsContainer.appendChild(node);
                    drawChart(res.title, res.answers, node);
                })
            }
        })
        .catch(error => console.error('Error:', error));
}

// fetch results when packages are loaded
google.charts.setOnLoadCallback(fetchData);
