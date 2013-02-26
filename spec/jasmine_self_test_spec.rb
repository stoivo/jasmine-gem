require 'spec_helper'

Jasmine.configure do |config|
  root = File.expand_path(File.join(File.dirname(__FILE__), ".."))
  config.src_dir = File.join(root, 'src')
  config.spec_dir = Jasmine::Core.path
  config.spec_files = lambda { (Jasmine::Core.html_spec_files + Jasmine::Core.core_spec_files).map {|f| File.join(config.spec_dir, f) } }
end

config = Jasmine.config

server = Jasmine::Server.new(config.port, Jasmine::Application.app(config))
driver = Jasmine::SeleniumDriver.new(config.browser, "#{config.host}:#{config.port}/")

t = Thread.new do
  begin
    server.start
  rescue ChildProcess::TimeoutError
  end
  # # ignore bad exits
end
t.abort_on_exception = true
Jasmine::wait_for_listener(config.port, "jasmine server")
puts "jasmine server started."

reporter = Jasmine::Runners::ApiReporter.new(driver, config.result_batch_size)
raw_results = Jasmine::Runners::HTTP.new(driver, reporter).run
results = Jasmine::Results.new(raw_results)

formatter = Jasmine::Formatters::Console.new(results)
p formatter.failures
p formatter.summary

exit results.failures.size