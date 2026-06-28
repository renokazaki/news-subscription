require 'rails_helper'

RSpec.describe 'Api::V1::Auth::Sessions', type: :request do
  let!(:user) { create(:user, email: 'test@example.com', password: 'password123') }

  describe 'POST /api/v1/auth/sign_in' do
    it 'returns JWT token on successful login' do
      post '/api/v1/auth/sign_in',
           params: { user: { email: 'test@example.com', password: 'password123' } },
           as: :json

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['token']).to be_present
      expect(json['user']['email']).to eq('test@example.com')
    end

    it 'returns 401 on invalid credentials' do
      post '/api/v1/auth/sign_in',
           params: { user: { email: 'test@example.com', password: 'wrong' } },
           as: :json

      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'DELETE /api/v1/auth/sign_out' do
    it 'invalidates the JWT token' do
      # まずログインしてトークン取得
      post '/api/v1/auth/sign_in',
           params: { user: { email: 'test@example.com', password: 'password123' } },
           as: :json
      token = JSON.parse(response.body)['token']

      # ログアウト
      delete '/api/v1/auth/sign_out',
             headers: { 'Authorization' => "Bearer #{token}" }

      expect(response).to have_http_status(:ok)

      # 同じトークンでアクセス → 401
      get '/api/v1/user',
          headers: { 'Authorization' => "Bearer #{token}" }
      expect(response).to have_http_status(:unauthorized)
    end
  end
end