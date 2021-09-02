document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById("test-files-uploader");

  // SFU emits fileUploadSuccess every time a file has completed loading
  el.addEventListener("fileUploadSuccess", function (e) {
    const snippet = document.getElementById("snippet");
    snippet.classList.remove('hide');
   console.log ("Your file uploaded successfully and can be see at this URL: " + this.value)
  });
});
