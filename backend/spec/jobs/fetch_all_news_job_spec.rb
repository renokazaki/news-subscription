require 'rails_helper'

RSpec.describe FetchAllNewsJob, type: :job do
  let(:user) { create(:user) }

  before do
    create(:interest, user: user, keyword: 'React')
    create(:interest, user: user, keyword: 'Rails')
  end

  it 'enqueues a FetchNewsJob for each interest' do
    expect {
      described_class.perform_now
    }.to have_enqueued_job(FetchNewsJob).exactly(2).times
  end
end
