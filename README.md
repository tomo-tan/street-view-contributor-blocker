# Street View Contributor Blocker for Google Maps

Block Street View and Photo Sphere imagery from selected Google Maps contributors without affecting Google-owned Street View imagery.

Google Maps currently has no native per-contributor blocklist for imagery. This userscript adds one locally in your browser.

## Features

- Block the contributor of the currently open panorama with one click.
- Add a contributor using a numeric contributor ID or Google Maps profile URL.
- Remove contributors from the blocklist at any time.
- Identify contributors by their stable numeric ID rather than display name.
- Always allow Google-owned Street View imagery (`!2e0!`).
- Work with Tampermonkey, Violentmonkey, and compatible userscript managers.
- Japanese and English interface.
- Desktop and extension-capable mobile browsers.

## Install

1. Install Tampermonkey or Violentmonkey.
2. [Install the script from Greasy Fork](https://greasyfork.org/scripts/587491-street-view-contributor-blocker-for-google-maps).
3. Open Google Maps in the browser.
4. Open user-contributed Street View/360 imagery.
5. Choose **Block this contributor** in the lower-left corner.

On Android, Firefox + Violentmonkey or Edge Canary + Violentmonkey can be used. The Google Maps native app cannot run userscripts.

## How blocking works

When imagery belongs to a blocked contributor, the script exits Street View and returns to the normal map at the same coordinates. It does not delete or report anyone's content, and the blocklist never leaves the browser/userscript manager.

Google Maps is a single-page application and its internal HTML can change. If Google changes its UI, contributor detection may need an update.

## Privacy

- No analytics.
- No network requests added by this script.
- No blocklist upload.
- No Google account access.

## License

MIT

---

## 日本語

Googleマップで指定した投稿者のストリートビュー／360度画像だけをローカルにブロックします。Google撮影の公式ストリートビューには影響しません。

1. TampermonkeyまたはViolentmonkeyをインストールします。
2. [Greasy Forkからスクリプトをインストールします](https://greasyfork.org/ja/scripts/587491-street-view-contributor-blocker-for-google-maps)。
3. Googleマップで対象投稿者の360度画像を開きます。
4. 左下の「この投稿者をブロック」を押します。

ブラックリストはブラウザ内だけに保存され、外部へ送信されません。
