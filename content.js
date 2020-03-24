const setStyleTo = (element, style) => Object.assign(element.style, style);

const getSeigaId = () => document.querySelector(`link[rel="canonical"]`).href.split("/im")[1];

const callbackToDownload = event => {
  event.target.toggleAttribute("disabled");
  chrome.runtime.sendMessage({
    href: document.querySelector("#illust_link").href,
    id: getSeigaId(),
  });
  event.target.removeEventListener("click", callbackToDownload, false);
}

const imageWrapperOfSeigaPage = document.querySelector("#illust_link").parentNode;

const buttonForDownloading = Object.assign(document.createElement("button"), {
  textContent: "Click to Download",
  id: "seigadl-button-for-downloading",
});

setStyleTo(buttonForDownloading, {
  position: "absolute",
  left: "0"
});

buttonForDownloading.addEventListener("click", callbackToDownload, false);

imageWrapperOfSeigaPage.appendChild(buttonForDownloading);
