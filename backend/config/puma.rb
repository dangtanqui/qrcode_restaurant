max_threads_count = ENV.fetch("RAILS_MAX_THREADS") { 5 }
min_threads_count = ENV.fetch("RAILS_MIN_THREADS") { max_threads_count }
threads min_threads_count, max_threads_count

worker_timeout 3600 if ENV.fetch("RAILS_ENV", "development") == "development"

port ENV.fetch("PORT") { 3000 }

environment ENV.fetch("RAILS_ENV") { "development" }

pidfile ENV.fetch("PIDFILE") { "tmp/pids/server.pid" }

# Windows doesn't support worker mode, so only use workers on Unix-like systems
workers_count = ENV.fetch("WEB_CONCURRENCY") { 0 }
if workers_count > 0 && !Gem.win_platform?
  workers workers_count
  preload_app!
end

# Disable plugin-based restart on Windows (not supported)
plugin :tmp_restart unless Gem.win_platform?



