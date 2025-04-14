"use strict";
// public/ts/createAccount.ts
document.addEventListener('DOMContentLoaded', function () {
    const accountForm = document.getElementById('accountForm');
    const emailInput = document.getElementById('txtEmail');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const successMessage = document.getElementById('successMessage');
    const failureMessage = document.getElementById('failureMessage');
    if (accountForm) {
        accountForm.addEventListener('submit', function (event) {
            event.preventDefault();
            successMessage.hidden = true;
            failureMessage.hidden = true;
            const email = emailInput.value;
            const emailRegex = /^[^\s@]+@miamioh.edu$/;
            if (!emailRegex.test(email)) {
                failureMessage.textContent = 'Please enter a valid Miami (miamioh.edu) email address.';
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
    function showVerificationPopup() {
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
        const meaningInput = document.getElementById('gcName');
        const meaningError = document.getElementById('meaningError');
        const submitButton = document.getElementById('submitVerification');
        const cancelButton = document.getElementById('cancelVerification');
        submitButton.onclick = function () {
            const answer = meaningInput.value.trim();
            if (!answer) {
                meaningError.textContent = 'Please provide an answer.';
                return;
            }
            modal.style.display = 'none';
            submitToAPI(answer);
        };
        cancelButton.onclick = function () {
            modal.style.display = 'none';
        };
        window.onclick = function (event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };
    }
    function submitToAPI(verificationAnswer) {
        const data = {
            email: emailInput.value,
            password: password.value,
            confirmPassword: confirmPassword.value,
            gcName: verificationAnswer
        };
        // Normal
        let url = "https://us-central1-thetataumiamiuniversity.cloudfunctions.net/create_account";
        // LOCALHOST CHANGES
        // let urlRoot = "http://localhost:5001/thetataumiamiuniversity/us-central1/create_account";
        let apiUrl = `${url}`;
        $.ajax({
            url: `${apiUrl}`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (response) {
                successMessage.hidden = false;
                accountForm.reset();
            },
            error: function (xhr, status, error) {
                var _a;
                failureMessage.hidden = false;
                failureMessage.textContent = ((_a = xhr.responseJSON) === null || _a === void 0 ? void 0 : _a.message) || 'An error occurred during account creation.';
            }
        });
    }
});
//# sourceMappingURL=createAccount.js.map