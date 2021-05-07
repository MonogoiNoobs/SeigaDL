const Constants = {
  DLBUTTON_TEXT_DEFAULT: "Click to Download",
  DLBUTTON_TEXT_PENDING: "Just a Moment...",
  DLBUTTON_ELEMENT: "button",
  DLBUTTON_ID: "seigadl-button-for-downloading",
};

const dataForButton = {
  textContent: Constants.DLBUTTON_TEXT_DEFAULT,
  id: Constants.DLBUTTON_ID,
};

const styleForButton = {
  position: "absolute",
  left: "0",
};

const siteType = (() => {
  switch (window.location.hostname) {
    case "seiga.nicovideo.jp":
    case "lohas.nicoseiga.jp":
      return "seiga";

    case "nijie.info":
    case "pic.nijie.net":
      return "nijie";

    case "horne.red":
    case "pic.horne.red":
      return "horne";

    default:
      return "YJSNPI";
  }
})();

const setStyleTo = (element, style) => Object.assign(element.style, style);

const pictureId = {
  seiga: window.location.pathname.split("/im")[1],
  nijie: new Map(
    window.location.search
      .substring(1)
      .split("&")
      .flatMap(v => [v.split("=")])
  ).get("id"),
  horne: new Map(
    window.location.search
      .substring(1)
      .split("&")
      .flatMap(v => [v.split("=")])
  ).get("id"),
  YJSNPI: "イクイクイクイクイクイクイクイクイクイクイクイク",
};

const createMessage = siteType => {
  switch (siteType) {
    case "seiga":
      return {
        href: document.querySelector("#illust_link").href,
      };
    case "nijie":
    case "horne":
      return {
        href: null,
        nickname: document.querySelector("#pro img").alt,
        userId: document
          .querySelector("img[illust_id]")
          .getAttribute("user_id"),
        title: document.querySelector("#view-header .illust_title")
          .textContent
          .replace(/^\s+$/, ""),
        hostname: window.location.hostname,
      };
  }
};

const callbackToDownload = event => {
  if (siteType === "YJSNPI") {
    alert("イキスギィ！！！！！！！！！！！！！！！！！！！！！！！！！！！！");
    throw new Error("イキスギ両成敗");
  }
  event.target.toggleAttribute("disabled");
  event.target.textContent = Constants.DLBUTTON_TEXT_PENDING;
  const message = createMessage(siteType);
  console.log(message);
  chrome.runtime.sendMessage({
    siteType,
    ...message,
    id: pictureId[siteType],
    protocol: window.location.protocol,
  });
  event.target.removeEventListener("click", callbackToDownload, false);
};

const getPictureWrapper = () => {
  switch (siteType) {
    case "seiga":
      return document.querySelector("#illust_link").parentNode;
    case "nijie":
    case "horne":
      return document.querySelector("#gallery");
    default:
      return document.body;
  }
};

const buttonForDownloading = Object.assign(
  document.createElement(Constants.DLBUTTON_ELEMENT),
  dataForButton
);

setStyleTo(buttonForDownloading, styleForButton);

buttonForDownloading.addEventListener("click", callbackToDownload, false);

getPictureWrapper().append(buttonForDownloading);

console.log("unti")
