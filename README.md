# SeigaDL (alpha)

Firefox にはあったけど Chrome にはなかった静画(とニジエとホルネ)ワンクリックダウンローダー

## 使い方 (新 Edge)

1. Clone or download から ZIP をダウンロードして解凍する
1. `edge://extensions/`の開発者モードをオンにする
1. 「展開して読み込み」から解凍したフォルダを選ぶ

### 注意

Px Downloader と同じく保存先フォルダは変えられないので、ジャンクションを張るなりして対処してください。

```powershell
New-Item -Path $env:USERPROFILE\Downloads\SeigaDL\ -Target YourHopingDestination -ItemType Junction
```
