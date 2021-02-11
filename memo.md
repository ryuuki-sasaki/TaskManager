* tododetailはhtml,cssは固定でデータだけサーバーから取得してデータ埋め込む。編集中のデータは自動保存かローカルストレージに保存するというのもあり。


* mongoengine使えばORM的にモデル定義できるから更新日時記録忘れとかなくなっていいかも


* SSL暗号化しないと認証時パスワード盗聴されちゃう(パスワードを送信時に暗号化するなどして回避してもいいかも)
(https://medium.com/@pentacent/nginx-and-lets-encrypt-with-docker-in-less-than-5-minutes-b4b8a60d3a71)

* subproject, 期限(期限はMDに書けばいいかも)

* ロードマップ

* 
---

* プロジェクト分け　OK

* account重複無し　OK

* status　OK

* accountに紐づくTODO　OK

* projectに紐づくTODO　OK

* MD表示　OK

* 作成日時の新しいものから取得　OK

* スクロールして取得　OK

* TODO追加したら一番上へ　OK

* logout　OK

* 選択中のTODOは色付け　OK

* detail todo変えるたびにstatus, project取得してセット　OK

* 未ログインの時ログインがめんへ　　OK

* パスワード暗号化　　OK

* 更新日時記録　　OK

* スタイル修正　　OK

* 例外処理　　OK

* SQLInjection等セキュリティ対策　　OK

* ログとる

* 期限と進捗　　OK

* (できれば)MD初期選択をプレビューにする