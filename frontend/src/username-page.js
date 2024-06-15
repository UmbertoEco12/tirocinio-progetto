class UsernamePage {
    constructor() {
        this.userContentFormContainer = document.getElementById("set-user-content");
        const username = getPathParameterAt(1);

        this.currentUsername = username ? username : "";
        this.usernameForm = document.getElementById("set-username-form");
        this.usernameInput = document.getElementById("username");

        this.usernameForm.addEventListener("submit", (event) => {
            this.setUsername(event)
        })


        this.usernameInput.value = this.currentUsername;
    }


    setUsername(formEvent) {
        formEvent.preventDefault();
        this.currentUsername = this.usernameInput.value;

        redirect(`/review/${this.currentUsername}`);
    }
}

const usernamePage = new UsernamePage();