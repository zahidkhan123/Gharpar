# config valid only for current version of Capistrano
lock '3.11.0'

set :format, :airbrussh

set :log_level, :debug

set :pty, true

set :branch, ask('Git Branch:', 'master')

set :keep_releases, 10

# Default value for :linked_files is []
set :linked_files, fetch(:linked_files, []).push(
  'src/constants/defaultValues.js'
)

# Default value for linked_dirs is []
set :linked_dirs, fetch(:linked_dirs, []).push(
  # 'node_modules'
)

# set :npm_target_path, -> { release_path.join('current') }
set :npm_flags, ''
set :npm_roles, :all
set :npm_env_variables, {}
set :nvm_map_bins, %w{node npm yarn}
set :npm_method, 'install'

namespace :deploy do
  desc 'Building application'
  task :restart do
    invoke 'react:build'
  end

  after :finished, :restart
end
