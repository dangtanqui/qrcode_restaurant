require_relative "boot"

require "rails/all"

Bundler.require(*Rails.groups)

module MenuApi
  class Application < Rails::Application
    config.load_defaults 7.1
    config.api_only = true
    
    config.middleware.use Rack::Cors do
      allow do
        origins '*'
        resource '*',
          headers: :any,
          methods: [:get, :post, :put, :patch, :delete, :options, :head]
      end
    end
    
    config.active_storage.variant_processor = :mini_magick
  end
end
