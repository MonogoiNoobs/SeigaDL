let data = {
  userId: null,
  title: null,
  nickname: null,
  siteType: null,
};

const urlForSeigaAPIWithoutProtocol = "//seiga.nicovideo.jp/api/";

const replacementMap = new Map([
  ["<", "＜"],
  [">", "＞"],
  ["\\\\", "￥"],
  ["/", "／"],
  ["|", "｜"],
  [":", "："],
  ["?", "？"],
  ["*", "＊"],
  ['"', "”"],
]);

const folderName = {
  seiga: "SeigaDL",
  nijie: "NijieDL",
  horne: "HorneDL",
  YJSNPI: "191919191919191919191919",
};

const encodeFilename = origin => {
  let result = origin;
  for (const [forbidden, escaped] of replacementMap) {
    if (!result.includes(forbidden)) continue;
    let regex = new RegExp(forbidden, "ug");
    result = result.replace(regex, escaped);
  }
  return result;
};

const fetchAs = async (mime, url) => {
  const response = await fetch(url, { credentials: "include" });
  const text = await response.text();
  return new DOMParser().parseFromString(text, mime);
};

const downloadFrom = href => {
  const a = Object.assign(document.createElement("a"), {
    href,
  });
  a.toggleAttribute("download");
  console.log(href, data, a);
  a.click();
};

const determiningCallback = (downloadItem, suggest) => {
  suggest({
    filename: `${folderName[data.siteType]}/${encodeFilename(
      data.nickname
    )}_${data.userId}/${encodeFilename(data.title)}_${downloadItem.filename
      }`,
  });
  chrome.downloads.onDeterminingFilename.removeListener(determiningCallback);
};

chrome.runtime.onMessage.addListener(async message => {
  data.siteType = message.siteType;
  switch (message.siteType) {
    case "seiga": {
      const xml = await fetchAs(
        "text/xml",
        `${message.protocol}${urlForSeigaAPIWithoutProtocol}illust/info?id=${message.id}`
      );
      data = Object.assign(data, {
        userId: xml.querySelector("user_id").textContent,
        title: xml.querySelector("title").textContent,
      });
      const userInfoXml = await fetchAs(
        "text/xml",
        `${message.protocol}${urlForSeigaAPIWithoutProtocol}user/info?id=${data.userId}`
      );
      data = Object.assign(data, {
        nickname: userInfoXml.querySelector("nickname").textContent,
      });

      const largerPictureHtml = await fetchAs("text/html", message.href);
      chrome.downloads.onDeterminingFilename.addListener(determiningCallback);
      downloadFrom(
        largerPictureHtml.querySelector("#content .illust_view_big")
          .dataset
          .src
      );
    } return;

    case "nijie":
    case "horne": {
      const html = await fetchAs(
        "text/html",
        `${message.protocol}//${message.hostname}/view_popup.php?id=${message.id}`
      );
      console.log(html);
      const pictureDivs = html.querySelector("#img_window").children;
      if (pictureDivs.length > 1) {
        for (const [i, div] of Array.from(pictureDivs).entries()) {
          chrome.downloads.download({
            url: div.querySelector("img").src.replace(/^.+:/, message.protocol),
            filename: `${folderName[message.siteType]
              }/${encodeFilename(message.nickname)}_${message.userId
              }/${encodeFilename(message.title)}_${message.id
              }/${new String(i).padStart(2, "0")}${div
                .querySelector("img")
                .src
                .replace(/^.*(\..+)/gu, "$1")}`,
          });
        }
      } else {
        const div = pictureDivs[0];
        chrome.downloads.download({
          url: div.querySelector("img").src.replace(/^.+:/, message.protocol),
          filename: `${folderName[message.siteType]
            }/${encodeFilename(message.nickname)}_${message.userId
            }/${encodeFilename(message.title)}_${message.id
            }${div.querySelector("img").src.replace(/^.*(\..+)/gu, "$1")}`,
        });
      }
    } return;

    default:
      return;
  }
});
