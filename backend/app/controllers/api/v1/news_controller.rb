module Api
  module V1
    class NewsController < ApplicationController
      before_action :authenticate_user!

      def index
        news = current_user.news
                  .recent
                  .by_date(params[:date])
                  .by_tag(params[:tag])

        render json: news.map { |n| news_summary(n) }
      end

      def show
        news_item = current_user.news.find(params[:id])
        render json: news_detail(news_item)
      end

      private

      def news_summary(news)
        {
          id: news.id,
          title: news.title,
          tag: news.tag,
          published_at: news.published_at,
          url: news.url
        }
      end

      def news_detail(news)
        {
          id: news.id,
          title: news.title,
          text: news.text,
          tag: news.tag,
          url: news.url,
          published_at: news.published_at
        }
      end
    end
  end
end