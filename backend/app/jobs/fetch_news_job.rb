class FetchNewsJob < ApplicationJob
  queue_as :default

  retry_on TavilyService::ApiError, wait: :polynomially_longer, attempts: 3
  retry_on AiSummaryService::ApiError, wait: 30.seconds, attempts: 2
  discard_on ActiveRecord::RecordNotFound

  def perform(interest_id)
    interest = Interest.find(interest_id)
    user = interest.user

    articles = TavilyService.search(interest.keyword)
    Rails.logger.info "[FetchNewsJob] Found #{articles.size} articles for '#{interest.keyword}'"

    summarized = AiSummaryService.summarize(articles, interest.keyword)
    Rails.logger.info "[FetchNewsJob] AI summarized #{summarized.size} articles"

    saved_count = 0
    summarized.each do |article|
      next if user.news.exists?(url: article[:url])

      user.news.create!(
        title: article[:title],
        text: article[:summary],
        url: article[:url],
        tag: interest.keyword,
        published_at: article[:published_at]
      )
      saved_count += 1
    end

    Rails.logger.info "[FetchNewsJob] Saved #{saved_count} new articles for '#{interest.keyword}'"
  end
end
