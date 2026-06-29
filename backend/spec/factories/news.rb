FactoryBot.define do
  factory :news do
    user
    title { Faker::Lorem.sentence }
    text { Faker::Lorem.paragraph }
    url { Faker::Internet.url }
    tag { %w[React Rails AWS TypeScript].sample }
    published_at { Faker::Time.backward(days: 30) }
  end
end