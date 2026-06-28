module Api
  module V1
    module Auth
      class SessionsController < ApplicationController
        skip_before_action :authenticate_user!, only: [:create, :destroy]

        def create
          user = User.find_by(email: params[:user][:email])

          if user&.valid_password?(params[:user][:password])
            token = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first

            render json: {
              user: user_response(user),
              token: token
            }
          else
            render json: { error: 'Invalid email or password' }, status: :unauthorized
          end
        end

        def destroy
          # Authorization ヘッダーのトークンをdenylistに追加
          token = request.headers['Authorization']&.split(' ')&.last
          if token
            begin
              payload = Warden::JWTAuth::TokenDecoder.new.call(token)
              JwtDenylist.create!(jti: payload['jti'], exp: Time.at(payload['exp']))
            rescue JWT::DecodeError
              # 既に無効なトークンなら何もしない
            end
          end

          render json: { message: 'Logged out successfully' }
        end

        private

        def user_response(user)
          {
            id: user.id,
            email: user.email,
            display_name: user.display_name,
            profile_image: user.profile_image
          }
        end
      end
    end
  end
end