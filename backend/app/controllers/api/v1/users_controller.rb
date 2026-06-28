module Api
  module V1
    class UsersController < ApplicationController

      def show
        render json: {
          id: current_user.id,
          email: current_user.email,
          display_name: current_user.display_name,
          profile_image: current_user.profile_image
        }
      end
    end
  end
end