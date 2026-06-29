# ADR-001: 定期ジョブ実行エンジンの選定

- **日付**: 2026-06-29
- **ステータス**: 採用
- **決定者**: ren

## コンテキスト

登録済みの Interest キーワードについて、定期的に Tavily API でニュースを検索し、AI 要約して DB に保存する仕組みが必要。実行頻度は 6 時間ごと程度。

要件:
- 定期実行（cron 的なスケジューリング）ができること
- ジョブの失敗時にリトライできること
- 追加インフラは最小限にしたい
- Windows のローカル開発環境でも動作すること

## 検討した選択肢

### 1. Solid Queue + recurring_tasks（採用）

Rails 8 で標準採用されたジョブキューバックエンド。既存の PostgreSQL をキューとして使う。

| 項目 | 評価 |
|------|------|
| 追加インフラ | なし（既存 PostgreSQL） |
| 追加 Gem | なし（Rails 8.1 組み込み） |
| 定期実行 | recurring.yml で宣言的に定義 |
| リトライ | ActiveJob の retry_on で制御 |
| 管理 UI | mission_control-jobs で追加可能 |
| Windows 対応 | ○ |
| 本番運用 | `bin/jobs` プロセスを 1 つ起動するだけ |

### 2. Sidekiq + sidekiq-scheduler（不採用）

Ruby エコシステムで最も実績のあるジョブキュー。Redis をバックエンドに使う。

| 項目 | 評価 |
|------|------|
| 追加インフラ | **Redis 必須** |
| 追加 Gem | sidekiq, sidekiq-scheduler |
| 定期実行 | sidekiq.yml に cron 式 |
| リトライ | Sidekiq 独自 + ActiveJob 両方可 |
| 管理 UI | Sidekiq Web UI（組み込み、優秀） |
| Windows 対応 | ○ |
| 本番運用 | Redis + Sidekiq プロセスが必要 |

**不採用理由**: Redis の運用が追加される。docker-compose.yml に Redis サービスを追加し、本番でも ElastiCache 等を用意する必要がある。このプロジェクトの規模（数十キーワードを 6 時間ごと）には明らかにオーバースペック。Rails 8 が Solid Queue を公式推奨している現在、新規プロジェクトで Sidekiq を選ぶ積極的理由がない。

### 3. whenever（OS cron ラッパー）（不採用）

`config/schedule.rb` に Ruby DSL でスケジュールを書き、`crontab` に変換する Gem。

| 項目 | 評価 |
|------|------|
| 追加インフラ | なし |
| 追加 Gem | whenever |
| 定期実行 | OS の cron に依存 |
| リトライ | 自前で実装が必要 |
| 管理 UI | なし（`crontab -l` で確認） |
| Windows 対応 | **× （cron がない）** |
| 本番運用 | crontab の管理が必要 |

**不採用理由**: Windows で cron が使えないため、ローカル開発環境で動作しない。コンテナ環境（ECS）とも相性が悪い（コンテナ 1 プロセス原則に反する）。リトライやジョブの状態管理を全て自前で実装する必要がある。

### 4. rufus-scheduler（プロセス内スケジューラー）（不採用）

Rails プロセス内でスケジューラーを動かす Gem。initializer に Ruby コードで定義。

| 項目 | 評価 |
|------|------|
| 追加インフラ | なし |
| 追加 Gem | rufus-scheduler |
| 定期実行 | initializer に Ruby コード |
| リトライ | 自前で実装が必要 |
| 管理 UI | なし |
| Windows 対応 | ○ |
| 本番運用 | △（プロセス障害で停止） |

**不採用理由**: Rails プロセスに同居するため、プロセスが落ちるとスケジュールも止まる。Puma の複数ワーカー構成で同じジョブが重複実行される危険がある。リトライ機構もない。手軽だが本番運用には不向き。

### 5. AWS EventBridge + Lambda（不採用）

AWS のマネージドサービスで定期実行をトリガーし、Lambda から Rails の API や rake タスクを叩く。

| 項目 | 評価 |
|------|------|
| 追加インフラ | EventBridge + Lambda |
| 追加 Gem | なし |
| 定期実行 | EventBridge のスケジュールルール |
| リトライ | Lambda 側で設定 |
| 管理 UI | AWS コンソール |
| Windows 対応 | −（ローカルでは動かない） |
| 本番運用 | AWS が管理（信頼性高い） |

**不採用理由**: ローカル開発で動作確認できない（LocalStack 等でのモックが必要）。Rails 側にジョブの仕組みがなくなるため、ジョブ単体のテストやデバッグがしにくい。AWS に強く依存する。Step 7（AWS CDK）で ECS にデプロイする際に `bin/jobs` を別タスクで動かす方がシンプル。

## 決定

**Solid Queue + recurring_tasks** を採用する。

## 決定理由まとめ

1. **追加インフラゼロ**: 既存の PostgreSQL だけで動く。Redis やその他のサービスを追加する必要がない
2. **Rails 8 公式推奨**: 今後のバージョンアップでも互換性が維持される可能性が高い
3. **定期実行が組み込み**: `recurring.yml` に書くだけ。追加 Gem 不要
4. **Windows 対応**: ローカル開発環境（Windows）で問題なく動作する
5. **本番デプロイが簡単**: ECS で `bin/jobs` を別タスク定義として動かすだけ
6. **プロジェクト規模に適合**: 数十キーワード × 6 時間ごとの処理には十分すぎる性能
