class TavilyService
  ENDPOINT = 'https://api.tavily.com/search'

  class ApiError < StandardError; end

  def self.search(query, max_results: 10)
    conn = Faraday.new do |f|
      f.request :json
      f.response :json
      f.response :raise_error
      f.adapter Faraday.default_adapter
    end

    response = conn.post(ENDPOINT, {
      api_key: ENV.fetch('TAVILY_API_KEY'),
      query: query,
      search_depth: 'basic',
      include_answer: false,
      max_results: max_results
    })

    response.body['results'].map do |result|
      {
        title: result['title'],
        url: result['url'],
        content: result['content'],
        published_date: result['published_date']
      }
    end
  rescue Faraday::Error => e
    raise ApiError, "Tavily API error: #{e.message}"
  end
end
