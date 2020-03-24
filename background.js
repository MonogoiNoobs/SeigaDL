let data = {
  userId: null,
  title: null,
  nickname: null
};

const replacementMap = new Map([
  ["<", "＜"],
  [">", "＞"],
  ["\\", "￥"],
  ["/", "／"],
  ["|", "｜"],
  [":", "："],
  ["?", "？"],
  ["*", "＊"],
  ['"', '”']
]);

const escapeForbiddenCharactersFrom = origin => {
  let result = origin;
  for (const [forbidden, escaped] of replacementMap) {
    if (!result.includes(forbidden)) continue;
    let regex = new RegExp(`${forbidden}`, "ug");
    result = result.replace(regex, escaped);
  }
  return result;
}

const fetchAs = async (mime, url) => {
  const response = await fetch(url, {credentials: "include"});
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
    filename: `SeigaDL/${escapeForbiddenCharactersFrom(data.nickname)}_${data.userId}/${escapeForbiddenCharactersFrom(data.title)}_${downloadItem.filename}`
  });
  chrome.downloads.onDeterminingFilename.removeListener(determiningCallback);
};

chrome.runtime.onMessage.addListener(message => {
  fetchAs("text/xml", `https://seiga.nicovideo.jp/api/illust/info?id=${message.id}`)
    .then(xml => {
      data.userId = xml.querySelector("user_id").textContent;
      data.title = xml.querySelector("title").textContent;
      fetchAs("text/xml", `https://seiga.nicovideo.jp/api/user/info?id=${data.userId}`)
        .then(userInfoXml => {
          data.nickname = userInfoXml.querySelector("nickname").textContent;
        });
    });
  fetchAs("text/html", message.href)
    .then(v => {
      chrome.downloads.onDeterminingFilename.addListener(determiningCallback);
      downloadFrom(`https://lohas.nicoseiga.jp/${v.querySelector("#content .illust_view_big").dataset.src}`);
    });
});
