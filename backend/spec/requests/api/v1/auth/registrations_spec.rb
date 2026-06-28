require 'rails_helper'

RSpec.describe 'Api::V1::Auth::Registrations', type: :request do
  describe 'POST /api/v1/auth/sign_up' do
    let(:valid_params) do
      {
        user: {
          email: 'new@example.com',
          password: 'password123',
          password_confirmation: 'password123',
          display_name: 'New User'
        }
      }
    end

    context 'with valid parameters' do
      it 'creates a new user and returns JWT token' do
        post '/api/v1/auth/sign_up', params: valid_params, as: :json

        expect(response).to have_http_status(:created)
        json = JSON.parse(response.body)
        expect(json['user']['email']).to eq('new@example.com')
        expect(json['token']).to be_present
      end
    end

    context 'with invalid parameters' do
      it 'returns validation errors' do
        post '/api/v1/auth/sign_up',
             params: { user: { email: '', password: '' } },
             as: :json

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end
end