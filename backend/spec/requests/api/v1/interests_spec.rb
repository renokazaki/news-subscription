require 'rails_helper'

RSpec.describe 'Api::V1::Interests', type: :request do
  let(:user) { create(:user) }
  let(:token) { Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first }
  let(:auth_headers) { { 'Authorization' => "Bearer #{token}" } }

  describe 'GET /api/v1/interests' do
    before do
      create(:interest, user: user, keyword: 'React')
      create(:interest, user: user, keyword: 'Rails')
    end

    it 'returns all interests for the current user' do
      get '/api/v1/interests', headers: auth_headers, as: :json

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json.length).to eq(2)
    end
  end

  describe 'POST /api/v1/interests' do
    it 'creates a new interest' do
      post '/api/v1/interests',
           params: { interest: { keyword: 'TypeScript' } },
           headers: auth_headers,
           as: :json

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json['keyword']).to eq('TypeScript')
    end
  end

  describe 'PATCH /api/v1/interests/:id' do
    let!(:interest) { create(:interest, user: user, keyword: 'React') }

    it 'updates the interest' do
      patch "/api/v1/interests/#{interest.id}",
            params: { interest: { keyword: 'Vue' } },
            headers: auth_headers,
            as: :json

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['keyword']).to eq('Vue')
    end
  end

  describe 'DELETE /api/v1/interests/:id' do
    let!(:interest) { create(:interest, user: user, keyword: 'React') }

    it 'deletes the interest' do
      delete "/api/v1/interests/#{interest.id}",
             headers: auth_headers

      expect(response).to have_http_status(:no_content)
    end
  end
end