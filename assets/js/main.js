document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById("test-files-uploader");

  // SFU emits fileUploadSuccess every time a file has completed loading
  el.addEventListener("fileUploadSuccess", function (e) {
    // The snippet that shows up on file success to allow user to copy URL
    const snippet = document.getElementById("snippet");
    const copyButton = document.getElementById("file-url");
    copyButton.setAttribute('data-clipboard-text', this.value)
    snippet.classList.remove('hidden');
  });
});
/////////////////////////////////////////////////////////////////////////////////
// Popper.js for tooltips
  function togglePopover(event, tooltipID) {
    let element = event.target;
    while (element.nodeName !== "BUTTON") {
      element = element.parentNode;
    }
    let tooltipElement = document.getElementById(tooltipID);
    var popper = Popper.createPopper(element, tooltipElement, {
      placement: 'bottom'
    });
    // Show the tooltip
    tooltipElement.classList.remove("hidden");
    // Close the tooltip
    setTimeout(function() {
      tooltipElement.classList.add("hidden")
    }, 2000);
  }

//////////////////////////////////////////////////////////////////////////////////
// ClipboardJS
document.addEventListener('DOMContentLoaded', () => {

  const clipboard = new ClipboardJS('#file-url');

  clipboard.on('success', function(e) {
    togglePopover(event,'tooltip-copied')
  });

  clipboard.on('error', function(e) {
    const copyTooltip = document.getElementById("copy-tooltip")
    copyTooltip.innerHTML = "Failed to Copy"
    togglePopover(event,'tooltip-copied')
  });
});


