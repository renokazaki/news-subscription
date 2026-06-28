module Api
  module V1
    class InterestsController < ApplicationController
      before_action :authenticate_user!
      before_action :set_interest, only: [:update, :destroy]

      def index
        interests = current_user.interests.order(created_at: :desc)
        render json: interests.map { |i| interest_response(i) }
      end

      def create
        interest = current_user.interests.build(interest_params)

        if interest.save
          render json: interest_response(interest), status: :created
        else
          render json: { errors: interest.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @interest.update(interest_params)
          render json: interest_response(@interest)
        else
          render json: { errors: @interest.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @interest.destroy!
        head :no_content
      end

      private

      def set_interest
        @interest = current_user.interests.find(params[:id])
      end

      def interest_params
        params.require(:interest).permit(:keyword)
      end

      def interest_response(interest)
        {
          id: interest.id,
          keyword: interest.keyword,
          created_at: interest.created_at
        }
      end
    end
  end
end