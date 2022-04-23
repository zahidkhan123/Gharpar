namespace :config do

  desc 'Check local configuration files for each stage'
  task :check do
    run_locally do
      fetch(:config_files).each do |config|
        local_path = get_local_config_name(config)
        if File.exists?(local_path)
          info "Found: #{local_path}"
        else
          warn "Not found: #{local_path}"
        end
      end
    end
  end

  desc 'Push configuration to the remote server'
  task :push do
    on release_roles :all do
      within shared_path do
        fetch(:config_files).each do |config|
          unless File.basename(config).include? ".env"
            local_path = get_local_config_name(config)
            if File.exists?(local_path)
              info "Uploading config #{local_path} as #{config}"
              upload! StringIO.new(IO.read(local_path)), File.join(shared_path, config), mode: '0664'
            else
              fail "#{local_path} doesn't exist"
            end
          end
        end
      end
    end
  end
  before 'config:push', 'config:check'

  before :push, :ensure_remote_dirs do
    on roles(:app) do
      fetch(:config_files).each do |config|
        execute :mkdir, "-p #{shared_path}/#{get_path(config)}"
      end
    end
  end

  desc 'Push configuration to the remote server'
  task :push_env do
    on release_roles :all do
      within shared_path do
        fetch(:config_files).each do |config|
          if File.basename(config).include? ".env"
            local_path = get_local_config_name(config)
            if File.exists?(local_path)
              info "Uploading config #{local_path} as #{config}"
              upload! StringIO.new(IO.read(local_path)), File.join(shared_path, config), mode: '0664'
            else
              fail "#{local_path} doesn't exist"
            end
          end
        end
      end
    end
  end
  before 'config:push_env', 'config:check'

  desc 'Pull configuration from the remote server'
  task :pull do
    on release_roles :all do
      within shared_path do
        fetch(:config_files).each do |config|
          local_path = get_local_config_name(config)
          info "Downloading config #{config} as #{local_path} "
          download! File.join(shared_path, config), local_path
        end
      end
    end
  end


  def get_path(config)
    File.dirname(config)
  end

  def get_local_config_name(config)
    path       = File.dirname(config)
    extension  = File.extname(config)
    filename   = File.basename(config, extension)

    if extension.empty? 
      local_file = filename
    else
      local_file = [filename, extension].join() unless extension.empty?  
    end

    local_file = [local_file, fetch(:config_example_suffix)].join()
    local_path = File.join(path, local_file)
  end

end

namespace :load do
  task :defaults do
    set :config_files, -> { fetch(:linked_files) }
    set :config_example_suffix, '.copy'
  end
end