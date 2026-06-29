require 'rails_helper'

RSpec.describe TavilyService do
  describe '.search' do
    let(:api_response) do
      {
        'results' => [
          {
            'title' => 'React 19 Released',
            'url' => 'https://example.com/react-19',
            'content' => 'React 19 has been released with new features...',
            'published_date' => '2024-06-15'
          },
          {
            'title' => 'React Server Components Guide',
            'url' => 'https://example.com/rsc-guide',
            'content' => 'A comprehensive guide to React Server Components...',
            'published_date' => '2024-06-14'
          }
        ]
      }
    end

    before do
      ENV['TAVILY_API_KEY'] = 'test-key'
      stub_request(:post, TavilyService::ENDPOINT)
        .to_return(status: 200, body: api_response.to_json, headers: { 'Content-Type' => 'application/json' })
    end

    it 'returns parsed articles' do
      results = TavilyService.search('React')

      expect(results.size).to eq(2)
      expect(results.first[:title]).to eq('React 19 Released')
      expect(results.first[:url]).to eq('https://example.com/react-19')
    end

    context 'when API returns an error' do
      before do
        stub_request(:post, TavilyService::ENDPOINT)
          .to_return(status: 500, body: 'Internal Server Error')
      end

      it 'raises ApiError' do
        expect { TavilyService.search('React') }.to raise_error(TavilyService::ApiError)
      end
    end
  end
end
