if Gem.win_platform?
  Rails.application.config.after_initialize do
    SolidQueue::Supervisor::Signals.module_eval do
      remove_const(:SIGNALS) if const_defined?(:SIGNALS)
      SIGNALS = %i[ INT TERM ]
    end

    SolidQueue::Processes::Supervised.module_eval do
      private

      define_method(:register_signal_handlers) do
        %w[ INT TERM ].each do |signal|
          trap(signal) { stop }
        end
      end
    end
  end
end
