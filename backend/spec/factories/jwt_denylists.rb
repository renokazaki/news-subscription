FactoryBot.define do
  factory :jwt_denylist do
    jti { "MyString" }
    exp { "2026-06-28 19:52:21" }
  end
end
