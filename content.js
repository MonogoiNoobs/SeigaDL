const Constants = {
  DLBUTTON_TEXT_DEFAULT: "Click to Download",
  DLBUTTON_TEXT_PENDING: "Just a Moment...",
  DLBUTTON_ELEMENT: "button",
  DLBUTTON_ID: "seigadl-button-for-downloading",
  SITE_TYPE: {
    SEIGA: 0,
    NIJIE: 1,
    YJSNPI: 114514
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

const getSiteType = () => {
  switch (window.location.hostname) {
    case "seiga.nicovideo.jp":
    case "lohas.nicoseiga.jp":
      return "seiga";

    case "nijie.info":
    case "pic.nijie.net":
      return "nijie";

    default:
      return "YJSNPI";
  }
};

const setStyleTo = (element, style) => Object.assign(element.style, style);

const pictureId = {
  seiga: window.location.pathname.split("/im")[1],
  nijie: null,
  YJSNPI: "イクイクイクイクイクイクイクイクイクイクイクイク"
};

const callbackToDownload = event => {
  const siteType = getSiteType();
  if (siteType === "YJSNPI") {
    alert("イキスギィ！！！！！！！！！！！！！！！！！！！！！！！！！！！！");
    throw new Error("イキスギ両成敗");
  }
  event.target.toggleAttribute("disabled");
  event.target.textContent = Constants.DLBUTTON_TEXT_PENDING;
  chrome.runtime.sendMessage({
    siteType,
    href: document.querySelector("#illust_link").href,
    id: pictureId[siteType],
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
