/**
 * @license SPDX-License-Identifier: AGPL-3.0-or-later
 */

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

const folderName = new Map([
	["seiga", "SeigaDL"],
	["nijie", "NijieDL"],
	["horne", "HorneDL"]
]);

/**
 * @param {string} origin
 * */
const encodeFilename = origin => {
	let result = origin;
	for (const [forbidden, escaped] of replacementMap) {
		if (!result.includes(forbidden)) continue;
		result = result.replaceAll(new RegExp(forbidden, "vg"), escaped);
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
		filename: `${folderName.get(data.siteType)}/${encodeFilename(
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
			html.querySelectorAll("#img_window div[data-index] a > :is(img, video)").forEach((artwork, i) => {
				console.log(artwork.src);
				chrome.downloads.download({
					url: artwork.src.replace(/^.+:/, message.protocol),
					filename: `${folderName[message.siteType]
						}/${encodeFilename(message.nickname)}_${message.userId
						}/${encodeFilename(message.title)}_${message.id
						}/${new String(i).padStart(2, "0")}${artwork
							.src
							.replace(/^.*(\..+)/gu, "$1")}`,
				});
			});
		} return;

		default:
			return;
	}
});
