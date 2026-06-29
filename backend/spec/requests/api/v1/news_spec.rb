require 'rails_helper'

RSpec.describe 'Api::V1::News', type: :request do
  let(:user) { create(:user) }
  let(:token) { Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first }
  let(:auth_headers) { { 'Authorization' => "Bearer #{token}" } }

  describe 'GET /api/v1/news' do
    before do
      create(:news, user: user, title: 'React 19 Released', tag: 'React',
             published_at: Date.new(2024, 6, 15))
      create(:news, user: user, title: 'Rails 8 Preview', tag: 'Rails',
             published_at: Date.new(2024, 6, 14))
    end

    it 'returns all news for the current user' do
      get '/api/v1/news', headers: auth_headers, as: :json

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json.length).to eq(2)
    end

    it 'filters by tag' do
      get '/api/v1/news', params: { tag: 'React' },
          headers: auth_headers

      json = JSON.parse(response.body)
      expect(json.length).to eq(1)
      expect(json.first['tag']).to eq('React')
    end

    it 'filters by date' do
      get '/api/v1/news', params: { date: '2024-06-15' },
          headers: auth_headers

      json = JSON.parse(response.body)
      expect(json.length).to eq(1)
    end
  end

  describe 'GET /api/v1/news/:id' do
    let!(:news_item) { create(:news, user: user, title: 'Detail Test', text: 'Full text here') }

    it 'returns news detail including text' do
      get "/api/v1/news/#{news_item.id}",
          headers: auth_headers, as: :json

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['title']).to eq('Detail Test')
      expect(json['text']).to eq('Full text here')
    end
  end
end