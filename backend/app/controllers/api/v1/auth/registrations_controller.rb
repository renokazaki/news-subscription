module Api
  module V1
    module Auth
      class RegistrationsController < ApplicationController
        skip_before_action :authenticate_user!, only: [:create]

        def create
          user = User.new(sign_up_params)

          if user.save
            token = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first

            render json: {
              user: user_response(user),
              token: token
            }, status: :created
          else
            render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
          end
        end

        private

        def sign_up_params
          params.require(:user).permit(:email, :password, :password_confirmation, :display_name)
        end

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