class AiSummaryService
  ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent'

  class ApiError < StandardError; end

  def self.summarize(articles, keyword)
    return [] if articles.empty?

    conn = Faraday.new do |f|
      f.request :json
      f.response :json
      f.adapter Faraday.default_adapter
    end

    prompt = build_prompt(articles, keyword)

    response = conn.post("#{ENDPOINT}?key=#{ENV.fetch('GOOGLE_AI_API_KEY')}", {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048
      }
    })

    parse_response(response.body, articles)
  rescue Faraday::Error => e
    raise ApiError, "Google AI API error: #{e.message}"
  end

  private_class_method

  def self.build_prompt(articles, keyword)
    articles_text = articles.map.with_index(1) do |article, i|
      "#{i}. #{article[:title]}\n#{article[:content]&.slice(0, 500)}"
    end.join("\n\n")

    <<~PROMPT
      以下のニュース記事一覧から「#{keyword}」に関連する記事を選び、
      各記事を日本語で2-3文に要約してください。
      関連性の低い記事は除外してください。

      出力形式（JSON配列）:
      [{"index": 1, "summary": "要約テキスト"}, ...]

      記事一覧:
      #{articles_text}
    PROMPT
  end

  def self.parse_response(body, articles)
    text = body.dig('candidates', 0, 'content', 'parts', 0, 'text')
    return [] unless text

    json_match = text.match(/\[.*\]/m)
    return [] unless json_match

    summaries = JSON.parse(json_match[0])
    summaries.filter_map do |summary|
      article = articles[summary['index'] - 1]
      next unless article

      {
        title: article[:title],
        summary: summary['summary'],
        url: article[:url],
        published_at: article[:published_date]
      }
    end
  rescue JSON::ParserError
    []
  end
end
