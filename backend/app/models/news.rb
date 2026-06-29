class News < ApplicationRecord
  belongs_to :user

  validates :title, :url, presence: true

  scope :by_date, ->(date) { where('DATE(published_at) = ?', date) if date.present? }
  scope :by_tag, ->(tag) { where(tag: tag) if tag.present? }
  scope :recent, -> { order(published_at: :desc) }
end