namespace :react do
  def build_app
    within current_path do
      execute :npm, :run, :build
    end
  end

  desc 'Build app'
  task :build do
    on roles(:app) do
      build_app
    end
  end
end
