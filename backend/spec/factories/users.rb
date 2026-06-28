FactoryBot.define do
  factory :user do
    email { Faker::Internet.email }
    password { 'password123' }
    display_name { Faker::Name.name }
  end
end