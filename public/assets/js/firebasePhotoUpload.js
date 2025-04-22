
import { auth, db, storage } from "/config/firebaseConfig.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-storage.js";
import { query, collection, where, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";

const photoInput = document.getElementById("photoInput");
const previewImage = document.getElementById("previewImage");
const uploadBtn = document.getElementById("uploadPhotoBtn");
const uploadStatus = document.getElementById("uploadStatus");
const uidField = document.getElementById("uidField");

if (photoInput && uploadBtn && previewImage && uploadStatus && uidField) {
  photoInput.addEventListener("change", () => {
    const file = photoInput.files[0];
    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setStatus("Only JPG and PNG formats are allowed.", "red");
      photoInput.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setStatus("File size exceeds 2MB limit.", "red");
      photoInput.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      previewImage.src = e.target.result;
      previewImage.hidden = false;
    };
    reader.readAsDataURL(file);
  });

  onAuthStateChanged(auth, (user) => {
    if (!user) return;
    uidField.value = user.uid;
  });

  uploadBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const file = photoInput.files[0];
    const uid = uidField.value;
    if (!file || !uid) {
      setStatus("Please upload a photo!", "red");
      return;
    }

    const formData = new FormData();
    formData.append("photo", file);
    formData.append("uid", uid);

    try {
      const res = await fetch("https://us-central1-thetataumiamiuniversity.cloudfunctions.net/upload_profile_photo_function", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      setStatus(data.message || (data.success ? "Upload successful!" : "Upload failed."), data.success ? "green" : "red");
      console.log(data);
    } catch (err) {
      setStatus("An error occurred during upload.", "red");
    }
  });
}

function setStatus(msg, color) {
  uploadStatus.textContent = msg;
  uploadStatus.style.color = color;
  uploadStatus.hidden = false;
}
