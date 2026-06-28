class Interest < ApplicationRecord
  belongs_to :user

  validates :keyword, presence: true, length: { maximum: 20 }
  validates :keyword, uniqueness: { scope: :user_id, message: "は既に登録されています" }
end
