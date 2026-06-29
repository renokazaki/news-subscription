require 'rails_helper'

RSpec.describe AiSummaryService do
  describe '.summarize' do
    let(:articles) do
      [
        { title: 'React 19 Released', content: 'React 19 has been released...', url: 'https://example.com/1', published_date: '2024-06-15' },
        { title: 'Rails 8 Preview', content: 'Rails 8 preview is out...', url: 'https://example.com/2', published_date: '2024-06-14' }
      ]
    end

    let(:ai_response) do
      {
        'candidates' => [{
          'content' => {
            'parts' => [{
              'text' => '[{"index": 1, "summary": "React 19がリリースされました。新機能が追加されています。"}]'
            }]
          }
        }]
      }
    end

    before do
      ENV['GOOGLE_AI_API_KEY'] = 'test-key'
      stub_request(:post, /generativelanguage\.googleapis\.com/)
        .to_return(status: 200, body: ai_response.to_json, headers: { 'Content-Type' => 'application/json' })
    end

    it 'returns summarized articles' do
      results = AiSummaryService.summarize(articles, 'React')

      expect(results.size).to eq(1)
      expect(results.first[:title]).to eq('React 19 Released')
      expect(results.first[:summary]).to include('React 19')
    end

    it 'returns empty array for empty articles' do
      expect(AiSummaryService.summarize([], 'React')).to eq([])
    end

    context 'when AI returns invalid JSON' do
      let(:ai_response) do
        {
          'candidates' => [{
            'content' => {
              'parts' => [{
                'text' => 'This is not JSON at all'
              }]
            }
          }]
        }
      end

      it 'returns empty array' do
        expect(AiSummaryService.summarize(articles, 'React')).to eq([])
      end
    end
  end
end
