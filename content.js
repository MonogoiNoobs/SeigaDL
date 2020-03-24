const Constants = {
  DLBUTTON_TEXT_DEFAULT: "Click to Download",
  DLBUTTON_TEXT_PENDING: "Just a Moment...",
  DLBUTTON_TEXT_DONE: "Done!",
  DLBUTTON_ELEMENT: "button",
  DLBUTTON_ID: "seigadl-button-for-downloading",
  SITE_TYPE: {
    SEIGA: 0,
    NIJIE: 1
  }
};

const dataForButton = {
  textContent: Constants.DLBUTTON_TEXT_DEFAULT,
  id: Constants.DLBUTTON_ID
};

const styleForButton = {
  position: "absolute",
  left: "0"
};

const setStyleTo = (element, style) => Object.assign(element.style, style);

const getSeigaId = () =>
  document.querySelector(`link[rel="canonical"]`).href.split("/im")[1];

const callbackToDownload = event => {
  event.target.toggleAttribute("disabled");
  event.target.textContent = Constants.DLBUTTON_TEXT_PENDING;
  chrome.runtime.sendMessage({
    siteType: Constants.SITE_TYPE.SEIGA,
    href: document.querySelector("#illust_link").href,
    id: getSeigaId(),
    protocol: window.location.protocol
  });
  event.target.removeEventListener("click", callbackToDownload, false);
};

const imageWrapperOfSeigaPage = document.querySelector("#illust_link")
  .parentNode;

const buttonForDownloading = Object.assign(
  document.createElement(Constants.DLBUTTON_ELEMENT),
  dataForButton
);

setStyleTo(buttonForDownloading, styleForButton);

buttonForDownloading.addEventListener("click", callbackToDownload, false);

imageWrapperOfSeigaPage.appendChild(buttonForDownloading);
