let data = {
  userId: null,
  title: null,
  nickname: null,
  siteType: null
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
  ['"', "”"]
]);

const folderName = {
  seiga: "SeigaDL",
  nijie: "NijieDL",
  YJSNPI: "191919191919191919191919"
};

const escapeForbiddenCharactersFrom = origin => {
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
  const a = Object.assign(
    document.createElementNS("http://www.w3.org/1999/xhtml", "a"),
    {
      href
    }
  );
  a.toggleAttribute("download");
  console.log(href, data, a);
  a.click();
};

const determiningCallback = (downloadItem, suggest) => {
  suggest({
    filename: `${folderName[data.siteType]}/${escapeForbiddenCharactersFrom(
      data.nickname
    )}_${data.userId}/${escapeForbiddenCharactersFrom(data.title)}_${
      downloadItem.filename
    }`
  });
  chrome.downloads.onDeterminingFilename.removeListener(determiningCallback);
};

chrome.runtime.onMessage.addListener(async message => {
  data.siteType = message.siteType;
  switch (message.siteType) {
    case "seiga":
      const xml = await fetchAs(
        "text/xml",
        `${message.protocol}${urlForSeigaAPIWithoutProtocol}illust/info?id=${message.id}`
      );
      data = Object.assign(data, {
        userId: xml.querySelector("user_id").textContent,
        title: xml.querySelector("title").textContent
      });
      const userInfoXml = await fetchAs(
        "text/xml",
        `${message.protocol}${urlForSeigaAPIWithoutProtocol}user/info?id=${data.userId}`
      );
      data = Object.assign(data, {
        nickname: userInfoXml.querySelector("nickname").textContent
      });

      const largerPictureHtml = await fetchAs("text/html", message.href);
      chrome.downloads.onDeterminingFilename.addListener(determiningCallback);
      downloadFrom(
        `${message.protocol}//lohas.nicoseiga.jp/${
          largerPictureHtml.querySelector("#content .illust_view_big").dataset
            .src
        }`
      );
      return;

    case "nijie":
      /**
       * @todo 単数画像の時はそのままで、複数画像の時はファイルにまとめるようにする
       */
      console.log("I'm getting nijie");
      const html = await fetchAs(
        "text/html",
        `${message.protocol}//nijie.info/view_popup.php?id=${message.id}`
      );
      console.log(html);
      data.title = message.title;
      data.userId = message.userId;
      data.nickname = message.nickname;
      for (const [i, div] of Array.from(
        html.querySelector("#img_window").children
      ).entries()) {
        chrome.downloads.download({
          url: div.querySelector("img").src.replace(/^.+:/, message.protocol),
          filename: `NijieDL/${message.nickname}_${message.userId}/${
            message.title
          }_${message.id}_${i}${div
            .querySelector("img")
            .src.replace(/^.*(\..+)/gu, "$1")}`
        });
      }
      return;

    default:
      return;
  }
});
