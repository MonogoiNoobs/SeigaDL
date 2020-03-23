let data = {
  userId: null,
  title: null,
  nickname: null
};

const setStyleTo = (element, style) => Object.assign(element.style, style);
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
const getSeigaInfo = id => {
  let result;
  fetchAs("text/xml", `https://seiga.nicovideo.jp/api/illust/info?id=${id}`)
    .then(v => { result = v; });
  return result;
};

const determiningCallback = (downloadItem, suggest) => {
  suggest({
    filename: `SeigaDL/${data.nickname}_${data.userId}/${data.title}_${downloadItem.filename}`
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
      console.log(v.querySelector("#content .illust_view_big").dataset.src);
      chrome.downloads.onDeterminingFilename.addListener(determiningCallback);
      downloadFrom(`https://lohas.nicoseiga.jp/${v.querySelector("#content .illust_view_big").dataset.src}`);
    });
});