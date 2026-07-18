# Street View Contributor Blocker for Google Maps

> **このスクリプトは、Googleマップ上の投稿を削除・通報するものではありません。** 指定した投稿者のストリートビュー／360度画像を、このブラウザ内でのみ非表示にします。投稿者への通知や外部へのブロックリスト送信はありません。

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

Contributor detection and automatic blocking run only while a panorama URL is open. Store pages, review panels, photo galleries, and contributor profile pages do not trigger blocking by themselves.

Google Maps is a single-page application and its internal HTML can change. If Google changes its UI, contributor detection may need an update. When a panorama contains multiple contributor profile links, the script currently uses the first valid contributor link because Google Maps does not expose a stable selector for the panorama title card.

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

## NOTE：使い方

### 開いている360度画像からブロックする

1. Googleマップで対象投稿者の360度画像をパノラマ表示で開きます。
2. 画面左下に表示される「この投稿者をブロック」を押します。

投稿者のプロフィールページ、写真一覧、店舗ページではこのボタンは表示されません。写真一覧ではなく、対象の360度画像そのものを開いてください。

### 投稿者のプロフィールURLから追加する

1. Googleマップで対象投稿者のプロフィールページを開き、ブラウザのアドレスバーからURLをコピーします。
2. 画面左下の「SV投稿者ブロッカー」を押します。
3. 「投稿者ID またはプロフィールURL」欄へコピーしたURLを貼り付けます。
4. 必要なら「表示名（省略可）」へ投稿者名を入力し、「追加」を押します。

赤字で「投稿者IDまたはプロフィールURLを入力してください」と表示される場合は、上段が空か、入力内容から投稿者IDを取得できていません。表示名だけでは登録できません。

ブロックを解除するときは「SV投稿者ブロッカー」を開き、登録済み投稿者の横にある「解除」を押します。

1. TampermonkeyまたはViolentmonkeyをインストールします。
2. [Greasy Forkからスクリプトをインストールします](https://greasyfork.org/ja/scripts/587491-street-view-contributor-blocker-for-google-maps)。
3. Googleマップで対象投稿者の360度画像を開きます。
4. 左下の「この投稿者をブロック」を押します。

ブラックリストはブラウザ内だけに保存され、外部へ送信されません。

投稿者の検出と自動ブロックは、パノラマURLを開いている間だけ動作します。店舗ページ、クチコミ欄、写真ギャラリー、投稿者プロフィールページだけでは発動しません。

パノラマ内に複数の投稿者プロフィールリンクがある場合、Googleマップにはタイトルカード用の安定したセレクタがないため、最初に見つかった有効な投稿者リンクを使用します。
