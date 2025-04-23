
import { auth } from "/config/firebaseConfig.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";
import Cropper from "https://cdn.jsdelivr.net/npm/cropperjs@1.5.13/dist/cropper.esm.js";

let currentUID = null;
let cropper = null;

const photoInput = document.getElementById("photoInput");
const cropperImage = document.getElementById("cropperImage");
const cropperContainer = document.getElementById("cropperContainer");
const confirmCropBtn = document.getElementById("confirmCropBtn");
const uploadStatus = document.getElementById("uploadStatus");

onAuthStateChanged(auth, (user) => {
  if (user) currentUID = user.uid;
});

photoInput.addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    cropperImage.src = e.target.result;
    cropperContainer.style.display = "block";

    if (cropper) cropper.destroy();
    cropper = new Cropper(cropperImage, {
      aspectRatio: 1, // force square crop box
      viewMode: 1,
      autoCropArea: 1, // use entire image if possible
    });    
  };
  reader.readAsDataURL(file);
});

confirmCropBtn.addEventListener("click", async function () {
  if (!cropper || !currentUID) return;

  const canvas = cropper.getCroppedCanvas(); // no size override
  console.log("Canvas dimensions:", canvas.width, canvas.height);


  canvas.toBlob(async function (blob) {
    const formData = new FormData();
    formData.append("photo", blob, "cropped.jpg");
    formData.append("uid", currentUID);

    uploadStatus.textContent = "Uploading...";
    uploadStatus.style.color = "blue";
    uploadStatus.hidden = false;

    try {
      const response = await fetch("https://us-central1-thetataumiamiuniversity.cloudfunctions.net/upload_profile_photo_function", {
        method: "POST",
        body: formData
      });
      const result = await response.json();
      uploadStatus.textContent = result.success ? "Upload successful!" : result.message;
      uploadStatus.style.color = result.success ? "green" : "red";
    } catch (error) {
      uploadStatus.textContent = "Upload failed.";
      uploadStatus.style.color = "red";
    }
  }, "image/jpeg", 0.9);
});
