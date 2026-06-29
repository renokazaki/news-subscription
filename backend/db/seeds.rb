user = User.find_or_create_by!(email: 'dev@example.com') do |u|
  u.password = 'password123'
  u.display_name = 'Dev User'
end

['React', 'Rails', 'AWS'].each do |keyword|
  interest = user.interests.find_or_create_by!(keyword: keyword)

  5.times do |i|
    user.news.create!(
      title: "#{keyword}に関するニュース #{i + 1}",
      text: "#{keyword}の最新動向について。これはテスト用の要約テキストです。",
      url: "https://example.com/#{keyword.downcase}/#{i + 1}",
      tag: keyword,
      published_at: i.days.ago
    )
  end
end

puts "Seed data created: #{User.count} users, #{Interest.count} interests, #{News.count} news"