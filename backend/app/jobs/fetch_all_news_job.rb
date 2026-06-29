class FetchAllNewsJob < ApplicationJob
  queue_as :default

  def perform
    Interest.find_each do |interest|
      FetchNewsJob.perform_later(interest.id)
    end
  end
end
