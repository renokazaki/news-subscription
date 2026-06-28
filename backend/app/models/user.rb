class User < ApplicationRecord
  devise :database_authenticatable, :registerable, :validatable,
         :jwt_authenticatable, jwt_revocation_strategy: JwtDenylist

  has_many :interests, dependent: :destroy
  has_many :news, dependent: :destroy

  validates :display_name, presence: true
end