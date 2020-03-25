const Constants = {
  DLBUTTON_TEXT_DEFAULT: "Click to Download",
  DLBUTTON_TEXT_PENDING: "Just a Moment...",
  DLBUTTON_ELEMENT: "button",
  DLBUTTON_ID: "seigadl-button-for-downloading"
};

const dataForButton = {
  textContent: Constants.DLBUTTON_TEXT_DEFAULT,
  id: Constants.DLBUTTON_ID
};

const styleForButton = {
  position: "absolute",
  left: "0"
};

const siteType = (() => {
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
})();

const setStyleTo = (element, style) => Object.assign(element.style, style);

const pictureId = {
  seiga: window.location.pathname.split("/im")[1],
  nijie: new Map(
    window.location.search
      .substring(1)
      .split("&")
      .map(v => v.split("="))
  ).get("id"),
  YJSNPI: "イクイクイクイクイクイクイクイクイクイクイクイク"
};

const callbackToDownload = event => {
  if (siteType === "YJSNPI") {
    alert("イキスギィ！！！！！！！！！！！！！！！！！！！！！！！！！！！！");
    throw new Error("イキスギ両成敗");
  }
  event.target.toggleAttribute("disabled");
  event.target.textContent = Constants.DLBUTTON_TEXT_PENDING;
  const getHref = () => {
    switch (siteType) {
      case "seiga":
        return document.querySelector("#illust_link").href;
      case "nijie":
        return null;
      default:
        throw new Error();
    }
  };
  const makeMessage = siteType => {
    switch (siteType) {
      case "seiga":
        return {
          href: document.querySelector("#illust_link").href
        };
      case "nijie":
        return {
          href: null,
          nickname: document.querySelector("#pro img").alt,
          userId: document
            .querySelector("img[illust_id]")
            .getAttribute("user_id"),
          title: document.querySelector("#view-header .illust_title")
            .textContent
        };
    }
  };
  chrome.runtime.sendMessage({
    siteType,
    ...makeMessage(siteType),
    id: pictureId[siteType],
    protocol: window.location.protocol
  });
  event.target.removeEventListener("click", callbackToDownload, false);
};

const getPictureWrapper = () => {
  switch (siteType) {
    case "seiga":
      return document.querySelector("#illust_link").parentNode;
    case "nijie":
      return document.querySelector("#gallery");
    default:
      throw new Error();
  }
};

const buttonForDownloading = Object.assign(
  document.createElement(Constants.DLBUTTON_ELEMENT),
  dataForButton
);

setStyleTo(buttonForDownloading, styleForButton);

buttonForDownloading.addEventListener("click", callbackToDownload, false);

getPictureWrapper().appendChild(buttonForDownloading);
