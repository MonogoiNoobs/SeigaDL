let data = {
  userId: null,
  title: null,
  nickname: null
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

const downloadFrom = url => {
  const a = document.createElement("a");
  a.href = url;
  a.download = "download";
  a.click();
};

const determiningCallback = (downloadItem, suggest) => {
  suggest({
    filename: `SeigaDL/${escapeForbiddenCharactersFrom(data.nickname)}_${
      data.userId
    }/${escapeForbiddenCharactersFrom(data.title)}_${downloadItem.filename}`
  });
  chrome.downloads.onDeterminingFilename.removeListener(determiningCallback);
};

chrome.runtime.onMessage.addListener(async message => {
  const xml = await fetchAs(
    "text/xml",
    `${message.protocol}${urlForSeigaAPIWithoutProtocol}illust/info?id=${message.id}`
  );
  data.userId = xml.querySelector("user_id").textContent;
  data.title = xml.querySelector("title").textContent;
  const userInfoXml = await fetchAs(
    "text/xml",
    `${message.protocol}${urlForSeigaAPIWithoutProtocol}user/info?id=${data.userId}`
  );
  data.nickname = userInfoXml.querySelector("nickname").textContent;

  const largerPictureHtml = await fetchAs("text/html", message.href);
  chrome.downloads.onDeterminingFilename.addListener(determiningCallback);
  downloadFrom(
    `${message.protocol}//lohas.nicoseiga.jp/${
      largerPictureHtml.querySelector("#content .illust_view_big").dataset.src
    }`
  );
});
