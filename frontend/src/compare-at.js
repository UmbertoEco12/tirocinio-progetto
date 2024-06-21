const index = getPathParameterAt(1);

if (index) {
    start();
}
else
    redirect('/compare');


const annotatePage = new AnnotateContent()
const labels = new Labels(onSetLabel);
let currentTitle = null;
class UserAnswer {
    constructor(label, percentage, users) {
        this.label = label;
        this.percentage = percentage;
        this.users = users;
    }
}
const resultsContainer = document.getElementById("results");
function showLabelAnswers(answers) {
    answers.forEach(a => {
        const answerDiv = document.createElement("div");
        answerDiv.classList.add("answer-info-container");

        usersText = "(";
        a.users.forEach(user => {
            usersText += `${user},`;
        })
        usersText = usersText.slice(0, -1);
        usersText += ")";
        let label = a.label;
        if (label == null)
            label = "Unanswered";

        const labelNode = document.createElement("h3");
        labelNode.classList.add("answer-info-label");
        labelNode.textContent = label;

        const answerInfo = document.createElement("span");
        answerInfo.classList.add("answer-info-text");
        answerInfo.textContent = `: ${a.percentage * 100}% ${usersText}`;
        answerDiv.appendChild(labelNode);
        answerDiv.appendChild(answerInfo);
        // add to dom
        resultsContainer.appendChild(answerDiv);
    })

}

function fetchCompareAt(index) {
    console.log("index ", index);
    fetch(`/compare/${index}/json`).then(res => res.json()).then(res => {
        console.log(res);
        currentTitle = res.data.title;
        annotatePage.show({
            title: res.data.title,
            htmlContent: res.data.content
        })
        labels.show(res.labels, res.fix);

        console.log(res.answers);
        const answerMap = new Map();
        // init map
        res.labels.forEach(element => {
            answerMap.set(element, []);
        });
        answerMap.set(null, []);
        let answersCount = 0;
        for (const prop in res.answers) {
            //console.log(`${prop}: ${res.answers[prop]}`)
            const key = res.answers[prop];
            let val = answerMap.get(key);
            val.push(prop)
            answerMap.set(key, val);
            answersCount++;
        }
        console.log(answerMap);
        // create answers
        const answers = [];
        answerMap.forEach((value, key) => {
            const percentage = (value.length / answersCount);
            if (percentage > 0)
                answers.push(new UserAnswer(key, percentage, value));
        });
        answers.sort((a, b) => {
            if (a.percentage > b.percentage)
                return -1;
            else if (a.percentage < b.percentage)
                return 1;
            else
                return 0;
        });
        showLabelAnswers(answers);
    })
}
function onSetLabel(label) {
    fetch(`/dataset/fix`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: currentTitle,
            label: label
        })
    });
}

function start() {
    fetchCompareAt(index);
    window.addEventListener("resize", () => {

        if (labels)
            labels.onResize();
    })
}