class CreateNews < ActiveRecord::Migration[8.1]
  def change
    create_table :news do |t|
      t.references :user, null: false, foreign_key: true
      t.string :title
      t.text :text
      t.string :url
      t.string :tag
      t.datetime :published_at

      t.timestamps
    end
  end
end
