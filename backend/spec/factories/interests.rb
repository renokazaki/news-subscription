FactoryBot.define do
  factory :interest do
    user
    keyword { Faker::ProgrammingLanguage.name }
  end
end
