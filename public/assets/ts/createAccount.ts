// public/ts/createAccount.ts

interface AccountFormData {
    email: string;
    password: string;
    confirmPassword: string;
    gcName: string;
}

interface ServerResponse {
    success: boolean;
    message?: string;
}

document.addEventListener('DOMContentLoaded', function() {
    const accountForm = document.getElementById('accountForm') as HTMLFormElement;
    const emailInput = document.getElementById('txtEmail') as HTMLInputElement;
    const password = document.getElementById('password') as HTMLInputElement;
    const confirmPassword = document.getElementById('confirmPassword') as HTMLInputElement;
    const successMessage = document.getElementById('successMessage') as HTMLElement;
    const failureMessage = document.getElementById('failureMessage') as HTMLElement;

    if (accountForm) {
        accountForm.addEventListener('submit', function(event: Event) {
            event.preventDefault();

            successMessage.hidden = true;
            failureMessage.hidden = true;

            const email = emailInput.value;
            const emailRegex: RegExp = /^[^\s@]+@miamioh.edu$/;
            if (!emailRegex.test(email)) {
                failureMessage.textContent = 'Please enter a valid miami email address.';
                failureMessage.hidden = false;
                return;
            }

            if (password.value !== confirmPassword.value) {
                failureMessage.textContent = 'Passwords do not match.';
                failureMessage.hidden = false;
                return;
            }

            if (password.value.length < 8) {
                failureMessage.textContent = 'Password must be at least 8 characters long.';
                failureMessage.hidden = false;
                return;
            }

            showVerificationPopup();
        });
    }

    function showVerificationPopup(): void {
        let modal = document.getElementById('verificationModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'verificationModal';
            modal.className = 'modal';
            modal.innerHTML = `
        <div class="modal-content">
          <div class="modal-header">
            <h2>Verification Question</h2>
          </div>
          <div class="modal-body">
            <p>What is the name of the non-formal groupchat (without emojis)</p>
            <input type="text" id="gcName" class="form-control" placeholder="Enter your answer">
            <div id="meaningError" style="color: red; margin-top: 5px;"></div>
          </div>
          <div class="modal-footer">
            <button id="cancelVerification" class="btn btn-secondary">Cancel</button>
            <button id="submitVerification" class="btn btn-primary">Submit</button>
          </div>
        </div>
      `;
            document.body.appendChild(modal);

            const style = document.createElement('style');
            style.textContent = `
        .modal {
          display: none;
          position: fixed;
          z-index: 1000;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0,0,0,0.5);
        }
        .modal-content {
          background-color: white;
          margin: 15% auto;
          padding: 20px;
          width: 50%;
          border-radius: 5px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        .modal-header {
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        .modal-footer {
          margin-top: 20px;
          text-align: right;
        }
        .modal-footer button {
          margin-left: 10px;
        }
      `;
            document.head.appendChild(style);
        }

        modal.style.display = 'block';

        const meaningInput = document.getElementById('gcName') as HTMLInputElement;
        const meaningError = document.getElementById('meaningError') as HTMLElement;
        const submitButton = document.getElementById('submitVerification') as HTMLElement;
        const cancelButton = document.getElementById('cancelVerification') as HTMLElement;

        submitButton.onclick = function() {
            const answer = meaningInput.value.trim();
            if (!answer) {
                meaningError.textContent = 'Please provide an answer.';
                return;
            }

            modal.style.display = 'none';
            submitToAPI(answer);
        };

        cancelButton.onclick = function() {
            modal.style.display = 'none';
        };

        window.onclick = function(event: MouseEvent) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };
    }

    function submitToAPI(verificationAnswer: string): void {
        const data: AccountFormData = {
            email: emailInput.value,
            password: password.value,
            confirmPassword: confirmPassword.value,
            gcName: verificationAnswer
        };


        // Normal
        let url = "https://us-central1-thetataumiamiuniversity.cloudfunctions.net/create_account"

        // LOCALHOST CHANGES
        // let urlRoot = "http://localhost:5001/thetataumiamiuniversity/us-central1/create_account";


        let apiUrl = `${url}`;

        $.ajax({
            url: `${apiUrl}`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function(response) {
                successMessage.hidden = false;
                accountForm.reset();
            },
            error: function(xhr, status, error) {
                failureMessage.hidden = false;
                failureMessage.textContent = xhr.responseJSON?.message || 'An error occurred during account creation.';
            }
        });
    }
});