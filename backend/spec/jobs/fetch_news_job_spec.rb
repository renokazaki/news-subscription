require 'rails_helper'

RSpec.describe FetchNewsJob, type: :job do
  let(:user) { create(:user) }
  let(:interest) { create(:interest, user: user, keyword: 'React') }

  let(:tavily_results) do
    [
      { title: 'React 19 Released', url: 'https://example.com/react-19', content: 'React 19...', published_date: '2024-06-15' }
    ]
  end

  let(:ai_results) do
    [
      { title: 'React 19 Released', summary: 'React 19がリリースされました。', url: 'https://example.com/react-19', published_at: '2024-06-15' }
    ]
  end

  before do
    allow(TavilyService).to receive(:search).and_return(tavily_results)
    allow(AiSummaryService).to receive(:summarize).and_return(ai_results)
  end

  it 'creates news records' do
    expect { described_class.perform_now(interest.id) }.to change(News, :count).by(1)
  end

  it 'saves news with correct attributes' do
    described_class.perform_now(interest.id)
    news = user.news.last

    expect(news.title).to eq('React 19 Released')
    expect(news.tag).to eq('React')
    expect(news.url).to eq('https://example.com/react-19')
  end

  it 'skips duplicate URLs' do
    create(:news, user: user, url: 'https://example.com/react-19')

    expect { described_class.perform_now(interest.id) }.not_to change(News, :count)
  end

  it 'discards job when interest is deleted' do
    interest.destroy!

    expect { described_class.perform_now(interest.id) }.not_to raise_error
  end
end
